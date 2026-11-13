// import { network } from "hardhat";

// This deplaoys the old code and need to be removed from the project
// async function main(): Promise<void> {
//   const { ethers } = await network.connect(); // The network.connect will not be available in future versions
//   const certificateRegistry = await ethers.deployContract("CertificateRegistry");
//   await certificateRegistry.waitForDeployment();

//   const contractAddress = await certificateRegistry.getAddress();
//   console.log(`CertificateRegistry deployed to: ${contractAddress}`);
// }

// main().catch((error) => {
//   console.error(error);
//   process.exitCode = 1;
// });

import { network } from "hardhat";

async function main(): Promise<void> {
  const { ethers } = await network.create();

  // index 0 = account #0, 1 = #1, 2 = #2, 3 = #3
  const signers = await ethers.getSigners();
  const deployer = signers[3];
  if (!deployer) throw new Error("Hardhat has fewer than 4 accounts configured");

  console.log(`Deploying with: ${deployer.address}`);

  const certificateRegistry = await ethers.deployContract("CertificateRegistry", [], deployer);
  await certificateRegistry.waitForDeployment();

  const contractAddress = await certificateRegistry.getAddress();
  console.log(`CertificateRegistry deployed to: ${contractAddress}`);
  console.log(`Owner is: ${await certificateRegistry.owner()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});