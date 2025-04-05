require("dotenv").config();
const { ethers } = require("ethers");

// Load contract ABI
const contractABI = require("../artifacts/contracts/SecureFIRSystem.sol/SecureFIRSystem.json").abi;

// Connect to Filecoin RPC
const provider = new ethers.JsonRpcProvider(process.env.FILECOIN_RPC);

// Wallet signer from private key
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Your deployed contract address (replace this)
const contractAddress = "0x61604bBC1D27D8C2a3646A6B11bd7E82a78dA5f0";

const contract = new ethers.Contract(contractAddress, contractABI, signer);

module.exports = contract;