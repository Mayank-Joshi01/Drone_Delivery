#include<iostream>
#include<vector>
#include<queue>
#include <string>
#include <cmath>
#include <algorithm>
#include "json.hpp" // The nlohmann library

using json = nlohmann::json;
using namespace std;


// --- FORWARD DECLARATIONS ---
float calculateDistance(float lat1, float lon1, float lat2, float lon2);
float Value_Of_Parcel(int priority, float weight , float distance);


class Drone {
public:
    float PayloadCapacity; // grams
    float BatteryVoltage;  // Volts
    float BatteryCapacity; // mAh
    int NumberOfDrones;    // Number of drones available
    float Speed;           // m/s
    float AreaFront;       // m²
    float TotalRotorArea;  // m²
    float DroneWeight;     // grams
    Drone(float payload, float BatteryV, float BatteryC, int numDrones, float spd, float AreaF, float TotalRA, float DroneW) {
        this->PayloadCapacity = payload;
        this->BatteryVoltage = BatteryV;
        this->BatteryCapacity = BatteryC;
        this->NumberOfDrones = numDrones;
        this->Speed = spd;
        this->AreaFront = AreaF;
        this->TotalRotorArea = TotalRA;
        this->DroneWeight = DroneW;
    }
};

class Parcel {
public:
    string id;
    int weight; // grams
    int priority;
    float lat;
    float lon;
    float value;
    Parcel(string i, int w, int p , float latitude, float longitude,float depo_lat, float depo_lon) {
        this->id = i;
        this->weight = w;
        this->priority = p;
        this->lat = latitude;
        this->lon = longitude;
        this->value = Value_Of_Parcel(p, w, calculateDistance(latitude, longitude, depo_lat, depo_lon));

    }
};

class Depo{
public:
    float lat;
    float lon;
    Depo(float latitude, float longitude) {
        this->lat = latitude;
        this->lon = longitude;
    }
};

class Path {
    public: 
        int Time; // Time in seconds
        float Energy; // Energy in % 
        float Parcles ; // Number of parcels delivered
        float Distance; // Distance in meters
        vector<string> ParcelIDs; // IDs of parcels delivered
        vector<pair<float, float>> PathCoordinates; // List of (lat, lon) coordinates for the path
};

// Function to calculate the distance between two lat/lon points using the Haversine formula 
float calculateDistance(float lat1, float lon1, float lat2, float lon2) {
    // Haversine formula to calculate distance between two lat/lon points
    const float R = 6371; // Earth radius in km
    float dLat = (lat2 - lat1) * M_PI / 180.0;
    float dLon = (lon2 - lon1) * M_PI / 180.0;
    float a = sin(dLat/2) * sin(dLat/2) + cos(lat1 * M_PI / 180.0) * cos(lat2 * M_PI / 180.0) * sin(dLon/2) * sin(dLon/2);
    float c = 2 * atan2(sqrt(a), sqrt(1-a));
    return R * c * 1000; // Distance in meters
}

// Function to calculate the total energy available in the drone's battery in joules
float Drone_Energy_Calculator(Drone* drone){
    float BatteryCapacity = drone->BatteryCapacity /1000.0; // Energy in mAh -> Ah
    float BatteryVoltage = drone->BatteryVoltage; // Voltage in V

    float Energy =  BatteryCapacity * BatteryVoltage * 3600; // Energy in joules (Wh = Ah * V, then convert to joules)
    return Energy; // Return energy in joules
}

// Function to calculate the energy required for a drone to deliver a parcel over a certain distance with a given payload weight
float Energy_Required(float distance, float payload_weight, Drone* drone ){ 
    // Energy = Power * Time
    // Power = P(hover) + P(drag)
    float g = 9.81; // Acceleration due to gravity in m/s²
    float rho = 1.225; // Air density at sea level in kg/m³
    float Cd = 1.0; // Drag coefficient (assumed)
    float P_hover = sqrt(pow(((drone->DroneWeight + payload_weight)/1000.0)*g, 3) / (2 * rho * drone->TotalRotorArea)); // P_hover = √[ (m_total · g)³ / (2 · ρ · A_rotor) ]
    float P_drag = 0.5 * rho * Cd * pow(drone->Speed, 3) * drone->AreaFront; // P_drag = 0.5 · ρ · Cd · A_front · v_flight³
    float Power = P_hover + P_drag; 

    float Time = distance / drone->Speed; // Time = distance / speed
    float EnergyRequired = Power * Time; // Energy required in joules

    return EnergyRequired; // Return energy required in joules
}


// Function to calculate the value of a parcel based on its priority, weight, and distance from the depot
float Value_Of_Parcel(int priority, float weight , float distance){
    // Value = Priority *10 / ( distance * weight )
    float value = (priority * 10000.0) / (distance * weight);
    return value;
}


/// Efficient Path Algorithm
vector<Path> Efficient_Path_Algo(vector<Parcel> parcels , Depo* depo , Drone* drone){

    vector<Path> paths; // Create a vector of paths for each drone

    // Sorting Parcels based on value (priority and weight) and distance from the depot
    sort(parcels.begin(),parcels.end(),[](const Parcel &a, const Parcel &b){

        return a.value < b.value; // Sort it in ascending orderof value , since it will make indexing parcels easy
    });
    
    int droneIndex = 0; // Start with the first drone

    while (!parcels.empty() && droneIndex < drone->NumberOfDrones){
        float availableEnergy = Drone_Energy_Calculator(drone); // Get the total energy available in the drone's battery
        float currentLat = depo->lat; // Start from the depot's latitude
        float currentLon = depo->lon; // Start from the depot's longitude
        float time = 0; // Initialize time
        float distance = 0; // Initialize distance
        int parcelsDelivered = 0; // Initialize parcels delivered
        vector<string> parcelIDs; // Vector to store IDs of delivered parcels
        vector<pair<float, float>> pathCoordinates; // Vector to store path coordinates

        vector<Parcel> :: reverse_iterator rit;

        int payload = 0;
        int TotalParcels =0 ;
        int totalEnergyRequired = 0;
        for( rit = parcels.rbegin() ; rit != parcels.rend() ; rit++){ // Iterate through parcels in reverse order (highest value first)    

            payload = payload + rit->weight; // Update payload weight
            TotalParcels++;
            int parcelsSize = parcels.size() -1 ;

            int temp = TotalParcels;
            int temp_payload = payload;
            int temp_totalEnergyRequired = 0;
            
            /// Calculate the total energy required to deliver the current set of parcels and return to the depot
            for (int i = 0; i < temp; i++){
                int EdgeEnergy = Energy_Required(calculateDistance(i == 0 ? currentLat : parcels[parcelsSize - i + 1 ].lat, i == 0 ? currentLon : parcels[parcelsSize - i+1].lon, parcels[parcelsSize - i ].lat, parcels[parcelsSize - i ].lon), temp_payload, drone); // Calculate energy required to deliver the parcel
                temp_totalEnergyRequired += EdgeEnergy;
                temp_payload -= parcels[parcelsSize - i].weight; // Update payload weight after delivering the parcel
            }
            temp_totalEnergyRequired += Energy_Required(calculateDistance(parcels[parcelsSize- temp + 1 ].lat, parcels[parcelsSize - temp + 1 ].lon, depo->lat, depo->lon), 0, drone); // Calculate energy required to return to the depot
            
            // Check if the total energy required is within the available energy and if the payload is within the drone's capacity
         if (temp_totalEnergyRequired <= availableEnergy && payload <= drone->PayloadCapacity && rit != parcels.rend() - 1){
                totalEnergyRequired = temp_totalEnergyRequired; // Update total energy required
            continue;
            }
            
        else {
            TotalParcels--; // Decrement total parcels as the last one cannot be delivered
            if( rit == parcels.rend() - 1){
                TotalParcels++;
                totalEnergyRequired = temp_totalEnergyRequired;
            }
                for (int i = 0; i < TotalParcels ; i++){
                    distance += calculateDistance(i == 0 ? currentLat : parcels[parcelsSize - i +1].lat, i == 0 ? currentLon : parcels[parcelsSize - i+1].lon, parcels[parcelsSize - i ].lat, parcels[parcelsSize - i ].lon); // Update distance
                    parcelIDs.push_back(parcels[parcelsSize - i ].id); // Add parcel ID to the list of delivered parcels
                    pathCoordinates.push_back({parcels[parcelsSize - i ].lat, parcels[parcelsSize - i ].lon}); // Add parcel coordinates to the path

                }
                distance += calculateDistance(parcels[parcelsSize  - (TotalParcels-1)   ].lat, parcels[parcelsSize  - (TotalParcels-1)  ].lon, depo->lat, depo->lon); // Update distance for returning to the depot
                time = distance / drone->Speed ; // Update time for returning to the depot
                paths.push_back({(int)time , (float)(totalEnergyRequired*100/availableEnergy), (float)TotalParcels , (float)distance, parcelIDs, pathCoordinates}); // Add the path for the current drone;
                break;
        }
    }
    for(int i = 0 ; i < TotalParcels ; i++){
                    parcels.pop_back(); // Remove delivered parcels from the list
                }

    droneIndex++; // Move to the next drone
}
return paths ;
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

    // Create some drones
// CORRECT in C++
Drone* drone = new Drone(
    droneData["Max_Payload"],
    droneData["Battery_Voltage"], 
    droneData["Battery_Capacity"],
    droneData["NumberOfDrone"],
    droneData["Speed"],
    droneData["Front_Area"],
    droneData["Total_Rotor_Area"],
    droneData["Drone_Weight"]
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

vector<Path> Deliver_Routes = Efficient_Path_Algo(parcels, depo, drone);

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
