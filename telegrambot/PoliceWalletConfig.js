require("dotenv").config();
const { ethers } = require("ethers");

// Load contract ABI
const contractABI = require("../artifacts/contracts/PoliceWalletManager.sol/PoliceWalletManager.json").abi;

// Connect to Filecoin RPC
const provider = new ethers.JsonRpcProvider(process.env.FILECOIN_RPC);

// Wallet signer from private key
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Your deployed contract address (replace this)
const contractAddress = "0x583757fc9bE96c150F63C6AbdE0E9328531e54Ec";

const contract = new ethers.Contract(contractAddress, contractABI, signer);

module.exports = contract;