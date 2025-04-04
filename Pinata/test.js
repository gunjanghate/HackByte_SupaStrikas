const { uploadJSONToPinata, uploadFileToPinata } = require("./pinata");

// Upload JSON
// uploadJSONToPinata({
//   name: "Shayan",
//   emergency: "High",
//   location: "Nagpur",
//   timestamp: new Date().toISOString()
// });

// Upload a .wav file
uploadFileToPinata("./file_example_WAV_1MG.wav");