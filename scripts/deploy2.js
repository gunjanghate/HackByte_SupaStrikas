const hre = require("hardhat");

async function main() {
    const Fir = await hre.ethers.getContractFactory("SecureFIRSystem"); // Make sure this matches your contract
    const fir = await Fir.deploy(); // Deploy the contract

    await fir.waitForDeployment(); // Corrected function name (formerly `.deployed()`)

    console.log("Contract deployed to:", fir.target); // Use `.target` instead of `.address`
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
