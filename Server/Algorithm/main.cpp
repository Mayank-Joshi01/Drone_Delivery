#include <iostream>
#include <string>
#include <vector>
#include <cmath>
#include <queue>
#include <algorithm>
#include <tuple>
#include <numeric>
#include <map>
#include "json.hpp" // The nlohmann library

// -- DEFINING THE JSON LIBRARY NAMESPACE AND ALIASES ---
using json = nlohmann::json;
using namespace std;


// --- FORWARD DECLARATIONS OF FUNCTIONS ---
float calculateDistance(float lat1, float lon1, float lat2, float lon2);
float Value_Of_Parcel(int priority, float weight, float distance);

/// --- CLASSES ---
class Drone
{
public:
    int PayloadCapacity;  // grams
    float Speed;          // m/s
    int NumberOfDrones;   // Number of drones available
    int DroneWeight;      // grams
    float BatteryVoltage; // Volts
    int BatteryCapacity;  // mAh
    float AreaFront;      // m²
    float TotalRotorArea; // m²
    Drone(int payload, float spd, int numDrones, int DroneW, int BatteryC, float BatteryV, float AreaF, float TotalRA)
    {
        this->PayloadCapacity = payload;
        this->Speed = spd;
        this->NumberOfDrones = numDrones;
        this->DroneWeight = DroneW;       // Initialize to the provided value
        this->BatteryVoltage = BatteryV;  // Initialize to the provided value
        this->BatteryCapacity = BatteryC; // Initialize to the provided value
        this->AreaFront = AreaF;          // Initialize to the provided value
        this->TotalRotorArea = TotalRA;   // Initialize to the provided value
    }
};

class Parcel
{
public:
    string id;
    int weight; // grams
    int priority;
    float lat;
    float lon;
    float value;
    Parcel(string i, int w, int p, float latitude, float longitude, float depo_lat, float depo_lon)
    {
        this->id = i;
        this->weight = w;
        this->priority = p;
        this->lat = latitude;
        this->lon = longitude;
        this->value = Value_Of_Parcel(p, w, calculateDistance(latitude, longitude, depo_lat, depo_lon));
    }
};

class Depo
{
public:
    float lat;
    float lon;
    Depo(float latitude, float longitude)
    {
        this->lat = latitude;
        this->lon = longitude;
    }
};

class Path
{
public:
    int Time;                                   // Time in seconds
    float Energy;                               // Energy in %
    float Parcles;                              // Number of parcels delivered
    float Distance;                             // Distance in meters
    vector<string> ParcelIDs;                   // IDs of parcels delivered
    vector<pair<float, float>> PathCoordinates; // List of (lat, lon) coordinates for the path
};

// A simple struct for our search area
struct BoundingBox
{
    float minLat, maxLat, minLon, maxLon;
};

/// --- CLASSES END --- 


/// --- FUNCTIONS ---

// Function to check if two line segments (p1-p2 and q1-q2) intersect
// It uses the cross product to determine the relative orientation of the points and check if they are on opposite sides of each other
float cross(pair<float,float> O, pair<float,float> A, pair<float,float> B) {
    return (A.first - O.first) * (B.second - O.second)
         - (A.second - O.second) * (B.first - O.first);
}

bool isIntersect(pair<float,float> p1, pair<float,float> p2,
                 pair<float,float> q1, pair<float,float> q2) {
    float d1 = cross(q1, q2, p1);
    float d2 = cross(q1, q2, p2);
    float d3 = cross(p1, p2, q1);
    float d4 = cross(p1, p2, q2);
    return (d1 * d2 < 0) && (d3 * d4 < 0);
}

// Function to check if the line segment from p1 to p2 intersects with any of the no-fly zones
bool isIntersectNoFlyZone(pair<float, float> p1, pair<float, float> p2, vector<vector<pair<float, float>>> noFlyZones)
{
    for (auto noFlyZone : noFlyZones)
    {
       for (int i = 0; i < noFlyZone.size(); i++)  // full loop
{
    // use modulo to wrap last vertex back to first
    int next = (i + 1) % noFlyZone.size();
    if (isIntersect(p1, p2, noFlyZone[i], noFlyZone[next]))
        return true;
    else if ( p1 == noFlyZone[i] && p2 == noFlyZone[(next +1 )%noFlyZone.size()] ) // If the path exactly matches an diagonal of the no-fly zone, we consider it as invalid path
        return true;
}
    
    }
    return false;
}

// Create a box with dynamic padding
BoundingBox createPaddedBox(pair<float, float> start, pair<float, float> target, float padding_km)
{
    BoundingBox box;
    box.minLat = min(start.first, target.first) - padding_km;
    box.maxLat = max(start.first, target.first) + padding_km;
    box.minLon = min(start.second, target.second) - padding_km;
    box.maxLon = max(start.second, target.second) + padding_km;
    return box;
}

// Fuction to calculate the path from start to end while avoiding no-fly zones using A* algorithm on a visibility graph
pair<float, vector<pair<float, float>>> CalculatePath(pair<float, float> start, pair<float, float> end, vector<vector<pair<float, float>>> noFlyZones)
{
    /// Checking wether the direct path from start to end intersects with any no-fly zone
    if (isIntersectNoFlyZone(start, end, noFlyZones))
    {

        int attempts = 3; // Number of attempts to find a path with increasing padding
        float distance = calculateDistance(start.first, start.second, end.first, end.second);
        float padding = distance / 100000.0; // adding a padding of nearly .01 degrees which is around 1 km to the bounding box to ensure we capture all relevant no-fly zones and vertices for path planning

        for (int i = 0; i < attempts; i++)
        {
            BoundingBox searchArea = createPaddedBox(start, end, padding);

            // Filter no-fly zones to include only those that intersect with the search area

            vector<vector<pair<float, float>>> filteredNoFlyZones;

            for (const auto &noFlyZonePolygon : noFlyZones)
            {
                if (noFlyZonePolygon.empty())
                    continue; // Skip empty polygons
                else
                {
                    for (const auto &vertex : noFlyZonePolygon)
                    {
                        if ((vertex.first < searchArea.maxLat && vertex.first > searchArea.minLat) && (vertex.second < searchArea.maxLon && vertex.second > searchArea.minLon))
                        {
                            filteredNoFlyZones.push_back(noFlyZonePolygon); // Add the no-fly zone to the filtered list if any of its vertices are within the search area
                            break;                                          // No need to check other vertices of the same no-fly zone
                        }
                    }
                }
            }

            // Creating a giant graph of all the nodes (start, end, and vertices of no-fly zones)
            vector<pair<float, float>> all_nodes; // Vector to store all nodes (start, end, and no-fly zone vertices)
            all_nodes.push_back(start);           // Add start node
            all_nodes.push_back(end);             // Add end node
            for (const auto &noFlyZone : filteredNoFlyZones)
            {
                for (const auto &vertex : noFlyZone)
                {
                    all_nodes.push_back(vertex); // Add vertices of no-fly zones as nodes
                }
            }

            // Removing the edges that intersect with no-fly zones and creating an adjacency list for the graph
            vector<pair<pair<float, float>, pair<float, float>>> visiblityGraph; // Vector to store the visibility graph (edges that do not intersect with no-fly zones)
            for (int i = 0; i < all_nodes.size(); i++)
            {
                for (int j = 0; j < all_nodes.size(); j++)
                {
                    if (i != j && !isIntersectNoFlyZone(all_nodes[i], all_nodes[j], filteredNoFlyZones))
                    {
                        visiblityGraph.push_back({all_nodes[i], all_nodes[j]}); // Add edge to the visibility graph if it does not intersect with any no-fly zone
                    }
                }
            }

            // Applyign A* algorithm on the visibility graph to find the shortest path from start to end

            /// Creating a map to store the parent of each node and the g(n) score of each node for A* algorithm
            map<pair<float, float>, pair<float, float>> cameFrom;
            map<pair<float, float>, float> gScore;

            /// Initializing g(n) scores to infinity for all nodes except the start node, which is initialized to 0
            for (const auto &node : all_nodes)
            {
                gScore[node] = 1e9;
            }
            gScore[start] = 0;

            /// Priority queue to store the nodes whose f(n) are evlautaed and arranged in min-heap based on their f(n) values
            using Element = pair<float, pair<float, float>>;
            priority_queue<Element, vector<Element>, greater<Element>> pq;

            // Push the start node into the priority queue with its f(n) value (which is just the heuristic distance to the end node since g(n) is 0 for the start node)
            pq.push({calculateDistance(start.first, start.second, end.first, end.second), start});

            // Vector to store the final path from start to end
            vector<pair<float, float>> finalPath;
            float totalDistance = 0; // Variable to store the total distance of the path from start to end

            // A* algorithm loop to find the shortest path from start to end , until the priority queue is empty( which menans we have run out of options to explore)
            while (!pq.empty())
            {
                // Settign current node as the node with the lowest f(n) value in the priority queue
                pair<float, float> currentNode = pq.top().second;
                pq.pop(); // Remove the current node from the priority queue , so that we do not explore it again

                // If the current node is the end node or we have reached the end node
                // Recnostruct the path from start to end by backtracking and calculating the total distance of the path
                if (currentNode == end)
                {
                    pair<float, float> step = end;

                    finalPath.push_back(step);
                    while (cameFrom.find(step) != cameFrom.end())
                    {
                        step = cameFrom[step];
                        totalDistance = totalDistance + calculateDistance(step.first, step.second, finalPath.back().first, finalPath.back().second);
                        finalPath.push_back(step);
                    }

                    reverse(finalPath.begin(), finalPath.end());
                    return {totalDistance, finalPath}; // Return the total distance and the path coordinates
                }

                // I we have not reached to the end node

                // Explore the neighbors of the current node in the visibility graph

                for (const auto &edge : visiblityGraph)
                {
                    pair<float, float> neighborNode;
                    if (edge.first == currentNode)
                        neighborNode = edge.second;
                    else if (edge.second == currentNode)
                        neighborNode = edge.first;
                    else
                        continue;

                    float tentative_gScore = gScore[currentNode] + calculateDistance(currentNode.first, currentNode.second, neighborNode.first, neighborNode.second);

                    if (tentative_gScore < gScore[neighborNode])
                    {
                        cameFrom[neighborNode] = currentNode;
                        gScore[neighborNode] = tentative_gScore;

                        float hScore = calculateDistance(neighborNode.first, neighborNode.second, end.first, end.second);
                        float fScore = tentative_gScore + hScore;

                        pq.push({fScore, neighborNode});
                    }
                }
            }
            // THE SAFETY NET: If the while loop finishes and we end up here,
            // it means the priority queue emptied out and we never hit the target.
            // The parcel is completely surrounded by No-Fly Zones!
            // so we increase the padding and try again

            padding = padding * 2; // Increase the padding for the next attempt to capture more no-fly zones and vertices in the visibility graph
        }
        return {1e9, {}};
    }
    else
    {
        return {calculateDistance(start.first, start.second, end.first, end.second), {start, end}}; // Return the distance from start to end and the path coordinates
    }
}

// Function to calculate the distance between two lat/lon points using the Haversine formula
float calculateDistance(float lat1, float lon1, float lat2, float lon2)
{
    // Haversine formula to calculate distance between two lat/lon points
    const float R = 6371; // Earth radius in km
    float dLat = (lat2 - lat1) * M_PI / 180.0;
    float dLon = (lon2 - lon1) * M_PI / 180.0;
    float a = sin(dLat / 2) * sin(dLat / 2) + cos(lat1 * M_PI / 180.0) * cos(lat2 * M_PI / 180.0) * sin(dLon / 2) * sin(dLon / 2);
    float c = 2 * atan2(sqrt(a), sqrt(1 - a));
    return R * c * 1000; // Distance in meters
}

// Function to calculate the total energy available in the drone's battery in joules
float Drone_Energy_Calculator(Drone *drone)
{
    float BatteryCapacity = drone->BatteryCapacity / 1000.0; // Energy in mAh -> Ah
    float BatteryVoltage = drone->BatteryVoltage;            // Voltage in V

    float Energy = BatteryCapacity * BatteryVoltage * 3600; // Energy in joules (Wh = Ah * V, then convert to joules)
    return Energy;                                          // Return energy in joules
}

// Function to calculate the energy required for a drone to deliver a parcel over a certain distance with a given payload weight
float Energy_Required(float distance, float payload_weight, Drone *drone)
{
    // Energy = Power * Time
    // Power = P(hover) + P(drag)
    float g = 9.81;                                                                                                         // Acceleration due to gravity in m/s²
    float rho = 1.225;                                                                                                      // Air density at sea level in kg/m³
    float Cd = 1.0;                                                                                                         // Drag coefficient (assumed)
    float P_hover = sqrt(pow(((drone->DroneWeight + payload_weight) / 1000.0) * g, 3) / (2 * rho * drone->TotalRotorArea)); // P_hover = √[ (m_total · g)³ / (2 · ρ · A_rotor) ]
    float P_drag = 0.5 * rho * Cd * pow(drone->Speed, 3) * drone->AreaFront;                                                // P_drag = 0.5 · ρ · Cd · A_front · v_flight³
    float Power = P_hover + P_drag;

    float Time = distance / drone->Speed; // Time = distance / speed
    float EnergyRequired = Power * Time;  // Energy required in joules

    return EnergyRequired; // Return energy required in joules
}

// Function to calculate the value of a parcel based on its priority, weight, and distance from the depot
float Value_Of_Parcel(int priority, float weight, float distance)
{
    // Value = Priority *10 / ( distance * weight )
    float value = (priority * 10000.0) / (distance * weight);
    return value;
}

/// Efficient Path Algorithm
vector<Path> Efficient_Path_Algo(vector<Parcel> parcels, Depo *depo, Drone *drone, vector<vector<pair<float, float>>> noFlyZones)
{
    vector<Path> paths; // Create a vector of paths for each drone

    // Sorting Parcels based on value (priority and weight) and distance from the depot
    sort(parcels.begin(), parcels.end(), [](const Parcel &a, const Parcel &b)
         {
             return a.value < b.value; // Sort it in ascending orderof value , since it will make indexing parcels easy
         });

    int droneIndex = 0; // Start with the first drone

    while (!parcels.empty() && droneIndex < drone->NumberOfDrones)
    {
        float availableEnergy = Drone_Energy_Calculator(drone); // Get the total energy available in the drone's battery
        float currentLat = depo->lat;                           // Start from the depot's latitude
        float currentLon = depo->lon;                           // Start from the depot's longitude
        float Totaltime = 0;                                    // Initialize time
        float Totaldistance = 0;                                // Initialize distance
        int parcelsDelivered = 0;                               // Initialize parcels delivered
        vector<string> parcelIDs;                               // Vector to store IDs of delivered parcels
        vector<pair<float, float>> pathCoordinates;             // Vector to store path coordinates

        vector<Parcel>::reverse_iterator rit;

        int payload = 0;
        int TotalParcels = 0;
        int totalEnergyRequired = 0;
        vector<pair<float, float>> temp_pathCoordinates;
        vector<float> temp_distance;
        int parcelsSize = parcels.size() - 1;

        for (rit = parcels.rbegin(); rit != parcels.rend(); rit++)
        { // Iterate through parcels in reverse order (highest value first)

            payload = payload + rit->weight; // Update payload weight
            TotalParcels++;

            int temp_payload = payload;
            int temp_totalEnergyRequired = 0;

            float dist;
            vector<pair<float, float>> wavPt;
            vector<pair<float,float>> returnPt;


            tie(dist, wavPt) = CalculatePath( {currentLat , currentLon} , {rit->lat, rit->lon}, noFlyZones); // Calculate the path from the current location to the parcel's location
            temp_distance.push_back(dist);
            temp_pathCoordinates.insert(temp_pathCoordinates.end(), wavPt.begin(), wavPt.end());

            // Calculate the total energy required to deliver the current set of parcels and return to the depot
            for (int i = 0; i < TotalParcels; i++)
            {
                float EdgeEnergy = Energy_Required(temp_distance[i], temp_payload, drone); // Calculate energy required to deliver the parcel
                temp_totalEnergyRequired += EdgeEnergy;
                temp_payload -= parcels[parcelsSize - i].weight; // Update payload weight after delivering the parcel
            }

            tie(dist, returnPt) = CalculatePath({parcels[parcelsSize - TotalParcels + 1].lat, parcels[parcelsSize - TotalParcels + 1].lon}, {depo->lat, depo->lon}, noFlyZones); // Calculate the path from the current location to the parcel's location
            temp_distance.push_back(dist);

            temp_totalEnergyRequired += Energy_Required(temp_distance[TotalParcels], 0, drone); // Calculate energy required to return to the depot

            // Check if the total energy required is within the available energy and if the payload is within the drone's capacity
            if (temp_totalEnergyRequired <= availableEnergy && payload <= drone->PayloadCapacity )
            {
                totalEnergyRequired = temp_totalEnergyRequired;                                                          // Update total energy required
                parcelsDelivered = TotalParcels;                                                                         // Update parcels delivered
                Totaldistance = accumulate(temp_distance.begin(), temp_distance.end(), 0.0);                             // Update total distance
                pathCoordinates = temp_pathCoordinates ;
                pathCoordinates.insert(pathCoordinates.end(), returnPt.begin(), returnPt.end());                                                              // Update path coordinates
                
                if(rit == parcels.rend() - 1){
                    for (int i = 0; i < parcelsDelivered; i++)
                {
                    parcelIDs.push_back(parcels[parcelsSize - i].id); // Add parcel coordinates to the path
                }
                Totaltime = Totaldistance / drone->Speed;                                                                                                                           // Update time for returning to the depot
                paths.push_back({(int)Totaltime, (float)(totalEnergyRequired * 100 / availableEnergy), (float)parcelsDelivered, (float)Totaldistance, parcelIDs, pathCoordinates}); // Add the path for the current drone;
                break;
                }
                else {
                    currentLat = rit->lat; // Update current location to the parcel's location
                    currentLon = rit->lon;
                    continue; }
            }

            else
            {
                for (int i = 0; i < parcelsDelivered; i++)
                {
                    parcelIDs.push_back(parcels[parcelsSize - i].id); // Add parcel coordinates to the path
                }
                Totaltime = Totaldistance / drone->Speed;                                                                                                                           // Update time for returning to the depot
                paths.push_back({(int)Totaltime, (float)(totalEnergyRequired * 100 / availableEnergy), (float)parcelsDelivered, (float)Totaldistance, parcelIDs, pathCoordinates}); // Add the path for the current drone;
                break;
            }
        }
        for (int i = 0; i < parcelsDelivered; i++)
        {
            parcels.pop_back(); // Remove delivered parcels from the list
        }

        droneIndex++; // Move to the next drone
    }
    return paths;
}

// A helper function to truncate a float to 5 decimal places
float Tranculate (float value) {
float truncated = trunc(value * 100000.0) / 100000.0;
return truncated;
}

int main(int argc , char* argv[]){
       if (argc != 2) {
        cerr << "Usage: " << argv[0] << " <input_file.json>" << endl;
        return 1;
    } 

    // 2. Parse the JSON string from Node.js
    string inputData = argv[1];
    json request = json::parse(inputData);

    // 3. Extract your data
    auto droneData = request["Drone"];
    auto depoData = request["Depo"];
    auto parcelsData = request["Parcels"];
    auto noFlyZonesData = request["noFlyZones"];

    // Create some drones
// CORRECT in C++
Drone* drone = new Drone(
    droneData["Max_Payload"],      // payload
    droneData["Speed"],            // ✅ spd
    droneData["NumberOfDrone"],    // ✅ numDrones
    droneData["Drone_Weight"],     // ✅ DroneW
    droneData["Battery_Capacity"], // ✅ BatteryC
    droneData["Battery_Voltage"],  // ✅ BatteryV
    droneData["Front_Area"],       // ✅ AreaF
    droneData["Total_Rotor_Area"]  // ✅ TotalRA
);

    // Create a depot
Depo* depo = new Depo(depoData["lat"], depoData["lon"]); // San Francisco (Market St area)

// Create some parcels nearby (within a few kilometers)
vector<Parcel> parcels;

for (const auto& parcelData : parcelsData) {
    parcels.emplace_back(
        parcelData["id"],
        parcelData["weight"],
        parcelData["priority"],
        parcelData["lat"],
        parcelData["lon"],
        depo->lat,
        depo->lon
    );
}

vector<vector<pair<float, float>>> noFlyZones;
for (const auto& zone : noFlyZonesData) {
    vector<pair<float, float>> zoneVertices;
    for (const auto& vertex : zone) {
        zoneVertices.emplace_back(Tranculate(vertex[0]), Tranculate(vertex[1]));
    }
    noFlyZones.push_back(zoneVertices);
}

vector<Path> Deliver_Routes = Efficient_Path_Algo(parcels, depo, drone, noFlyZones);

// 4. Create a response JSON object
    json response;
    
    // Initialize the "paths" key as an empty JSON array
    response["paths"] = json::array(); 

    // Loop through your calculated routes and build the JSON objects
    for (const auto& route : Deliver_Routes) {
        json pathObj;
        
        pathObj["Time"] = route.Time;
        pathObj["Energy"] = route.Energy;
        pathObj["Distance"] = route.Distance;
        pathObj["Parcels"] = route.Parcles; // Using your class's exact spelling
        
        // nlohmann::json automatically converts vector<string> to a JSON array
        pathObj["Parcels_Delivered"] = route.ParcelIDs; 
        
        // nlohmann::json automatically converts vector<pair> to JSON [[lat, lon], ...]
        pathObj["Waypoints"] = route.PathCoordinates; 

        // Add this completed path object into our main paths array
        response["paths"].push_back(pathObj);
    }

    // Output the final JSON string to the console so Node.js can read it!
    // Passing '4' to dump() makes it "pretty print" with spaces for easier debugging. 
    // You can remove the '4' later for a minified, faster string.
    cout << response.dump(4) << endl; 

    return 0;
}
