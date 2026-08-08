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
  const certificateRegistry = await ethers.deployContract("CertificateRegistry") 
  await certificateRegistry.waitForDeployment()

  const contractAddress = await certificateRegistry.getAddress()
  console.log(`CertificateRegistry deployed to: ${contractAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});