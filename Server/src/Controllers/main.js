const { exec } = require('child_process');
const { request } = require('http');

const droneDispatcher = (req,res)=>{
    try {
        // const requestData = JSON.stringify(req.body);
        
        const requestData = {
            "drone": {
                "id": 1,
                "battery": 80,
                "capacity": 5.0,
                "energy_cofficient": 0.1,
                "location": {
                    "latitude": 40.7128,
                    "longitude": -74.0060
                }
            },
            "packages":[
                {
                    "id": 101,
                    "weight": 2.5,
                    "priority": 1,
                    "destination": {
                        "latitude": 40.730610,
                        "longitude": -73.935242
                    }
                },
                {
                    "id": 102,
                    "weight": 1.0,
                    "priority": 2,
                    "destination": {
                        "latitude": 40.650002,
                        "longitude": -73.949997
                    }
                },
                {
                    "id": 103,
                    "weight": 3.0,
                    "priority": 3,
                    "destination": {
                        "latitude": 40.7291,
                        "longitude": -73.9965
                    }
                }
            ]}


            const stringigied_data = JSON.stringify(requestData);
        // 2. Escape the JSON string so the command line doesn't break
    const escapedData = stringigied_data.replace(/"/g, '\\"');
        // 3. Run the compiled C++ executable (assuming it's named 'algo')
    // Note: Use './algo' on Mac/Linux, or 'algo.exe' on Windows

            const executablePath = './Algorithm/algo';

    exec(`${executablePath} "${escapedData}"`, (error, stdout, stderr) => {
        
        if (stderr) {
            console.error(`Algorithm Error: ${stderr}`);
            return res.status(500).json({ error: "Algorithm execution error" });
        }
        if (error) {
            console.error(`Execution Error: ${error}`);
            return res.status(500).json({ error: "Algorithm failed to run" });
        }

        try {
            // 4. Parse the C++ printed output back into JavaScript
            const flightResult = JSON.parse(stdout);
            
            // 5. Send it back to React!
            res.json(flightResult);
            
        } catch (parseError) {
            console.error("Failed to parse C++ output:", stdout);
            res.status(500).json({ error: "Invalid algorithm output" });
        }
    });

    }
    catch (error) {
        console.error('Error dispatching drone:', error);
        res.status(500).send('Failed to dispatch drone.');
    }

}

module.exports = {droneDispatcher};