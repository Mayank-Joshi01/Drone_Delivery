#include<iostream>
#include<vector>
#include<queue>
#include <string>
#include "json.hpp" // The nlohmann library

using json = nlohmann::json;
using namespace std;

int main(int argc, char* argv[]){

    if (argc != 2) {
        cerr << "Usage: " << argv[0] << " <input_file.json>" << endl;
        return 1;
    }

    
    // 2. Parse the JSON string from Node.js
    string inputData = argv[1];
    json request = json::parse(inputData);



    // 3. Extract your data
    auto maxPayload = request["drone"]["capacity"];
    auto parcels = request["packages"];

    // 4. Create a response JSON object
    json response;
    response["status"] = "success";
    response["flightPlan"] = parcels; // Just echoing back the parcels for now

    cout << response.dump() << endl;

    return 0;
}