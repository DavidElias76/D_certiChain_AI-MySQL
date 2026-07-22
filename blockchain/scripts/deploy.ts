import { network } from "hardhat";

async function main(): Promise<void> {
  const { ethers } = await network.connect();
  const certificateRegistry = await ethers.deployContract("CertificateRegistry");
  await certificateRegistry.waitForDeployment();

  const contractAddress = await certificateRegistry.getAddress();
  console.log(`CertificateRegistry deployed to: ${contractAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
