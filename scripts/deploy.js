const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying PushLend contract to Push Network Testnet...");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Get balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "PC");

  // Deploy the contract
  const PushLend = await hre.ethers.getContractFactory("PushLend");
  const pushLend = await PushLend.deploy();

  await pushLend.waitForDeployment();

  const contractAddress = await pushLend.getAddress();
  console.log("PushLend deployed to:", contractAddress);

  // Save deployment info
  const deploymentInfo = {
    network: "pushTestnet",
    contractAddress: contractAddress,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber(),
  };

  const deploymentPath = path.join(__dirname, "..", "deployment-info.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("Deployment info saved to deployment-info.json");

  // Wait for a few blocks before verification
  console.log("Waiting for blocks to be mined...");
  await new Promise((resolve) => setTimeout(resolve, 30000)); // Wait 30 seconds

  // Verify contract
  console.log("Verifying contract on Push Network explorer...");
  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [],
    });
    console.log("Contract verified successfully!");
  } catch (error) {
    console.log("Verification error:", error.message);
    console.log("You can verify manually later using:");
    console.log(`npx hardhat verify --network pushTestnet ${contractAddress}`);
  }

  console.log("\n=== Deployment Summary ===");
  console.log("Contract Address:", contractAddress);
  console.log("Network: Push Network Testnet (Donut)");
  console.log("Chain ID: 42101");
  console.log("Explorer:", `https://donut.push.network/address/${contractAddress}`);
  console.log("========================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
