const { exec } = require('child_process');
const { request } = require('http');

const droneDispatcher = (req, res) => {
    try {
        const requestData = JSON.stringify(req.body);


        const stringigied_data = JSON.stringify(requestData);
        // 2. Escape the JSON string so the command line doesn't break
        // const escapedData = stringigied_data.replace(/"/g, '\\"');
        // 3. Run the compiled C++ executable (assuming it's named 'algo')
        // Note: Use './algo' on Mac/Linux, or 'algo.exe' on Windows

        console.log("Received request data:", requestData);
        console.log("Stringified data for C++:", stringigied_data);

        const executablePath = './Algorithm/algo';
        // Increase maxBuffer to 50 MB (1024 * 1024 * 50)
        const options = {
            maxBuffer: 1024 * 1024 * 50
        }

        exec(`${executablePath} '${requestData}'`,options, (error, stdout, stderr) => {

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

module.exports = { droneDispatcher };