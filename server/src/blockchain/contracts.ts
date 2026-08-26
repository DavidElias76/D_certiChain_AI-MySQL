import { ethers } from "ethers";
import { contract } from "./blockchainConnection";

// register institution
export const registerInstitutionOnChain = async (
    name: string,
    walletAddress: string
) => {
    const institutionId = ethers.id(name);
    const tx = await contract.registerInstitution(institutionId, walletAddress);
    const receipt = await tx.wait();
    
    return {
        institutionId,
        txHash: receipt?.hash ?? "",
  };
}

// issue certificate
// revoke certificate
// getCertificateById