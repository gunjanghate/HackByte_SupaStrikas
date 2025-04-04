require("dotenv").config();
const { ethers } = require("ethers");

// Load contract ABI
const contractABI = require("../artifacts/contracts/SecureFIRSystem.sol/SecureFIRSystem.json").abi;

// Connect to Filecoin RPC
const provider = new ethers.JsonRpcProvider(process.env.FILECOIN_RPC);

// Wallet signer from private key
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Your deployed contract address (replace this)
const contractAddress = "0x35AE00B5C43FC613Cc731Db09483447010bcd9bd";

const contract = new ethers.Contract(contractAddress, contractABI, signer);

module.exports = contract;