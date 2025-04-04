const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
require("dotenv").config();

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;

// 🔹 Upload JSON Data
async function uploadJSONToPinata(jsonData) {
  try {
    const res = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", jsonData, {
      headers: {
        "Content-Type": "application/json",
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_API_KEY
      }
    });
    console.log("[✅] JSON uploaded:", res.data.IpfsHash);
    return res.data.IpfsHash;
  } catch (error) {
    console.error("[❌] Failed to upload JSON:", error.response?.data || error.message);
    return null;
  }
}

// 🔹 Upload File (e.g., .wav)
async function uploadFileToPinata(filePath) {
  try {
    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath));

    const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      headers: {
        ...formData.getHeaders(),
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_API_KEY
      }
    });

    console.log("[✅] File uploaded:", res.data.IpfsHash);
    return res.data.IpfsHash;
  } catch (error) {
    console.error("[❌] Failed to upload file:", error.response?.data || error.message);
    return null;
  }
}

module.exports = { uploadJSONToPinata, uploadFileToPinata };