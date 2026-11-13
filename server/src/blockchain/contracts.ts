import { ethers } from "ethers";
import { contract, platformWallet, provider } from "./blockchainConnection";

// Single place to convert a name/short code into the on-chain bytes32 id.
export const toInstitutionId = (shortCode: string): string =>
    ethers.id(shortCode.toLowerCase().trim());

const assertBytes32 = (value: string, label: string) => {
    if (!ethers.isHexString(value, 32)) {
        throw new Error(`${label} must be a 32-byte hex string (0x + 64 hex chars)`);
    }
};

// Returns a contract instance that signs with the given signer
const withSigner = (signer: ethers.Signer) => contract.connect(signer) as typeof contract;

// Reads the certificateId out of the CertificateIssued event
const parseCertificateId = (receipt: ethers.ContractTransactionReceipt | null): string => {
    if (!receipt) return "";
    for (const log of receipt.logs) {
        try {
            const parsed = contract.interface.parseLog(log);
            if (parsed?.name === "CertificateIssued") {
                return parsed.args.certificateId.toString();
            }
        } catch {
            // log from another contract/event, ignore
        }
    }
    return "";
};

// Accepts a DB id (7, "7", a UUID...) or an id that is already bytes32
export const toInstitutionBytes32 = (institutionId: string | number | bigint): string => {
    const value = String(institutionId).trim();
    if (ethers.isHexString(value, 32)) return value; // already 0x + 64 hex chars
    return ethers.id(value);                         // hash anything else
};

export const registerInstitutionOnChain = async (
    institutionId: string | number | bigint,
    walletAddress: string
) => {
    if (!ethers.isAddress(walletAddress)) {
        throw new Error(`Invalid wallet address: ${walletAddress}`);
    }
    if (walletAddress.toLowerCase() === platformWallet.address.toLowerCase()) {
        throw new Error("Issuer wallet must be different from the platform wallet");
    }

    const institution_Id = toInstitutionBytes32(institutionId);
    const registry = contract.connect(platformWallet) as typeof contract;

    const owner: string = await registry.owner();
    if (owner.toLowerCase() !== platformWallet.address.toLowerCase()) {
        throw new Error(`Platform wallet ${platformWallet.address} is not the contract owner (${owner})`);
    }

    const tx = await registry.registerInstitution(institution_Id, walletAddress);
    const receipt = await tx.wait();

    return { institution_Id, txHash: receipt?.hash ?? "" };
};

type InstitutionRef = string | number | bigint;

// ── Issue certificate (must be signed by the institution's issuer wallet) ──
export const issueCertificateOnChain = async (
    certificateHash: string,
    institutionId: InstitutionRef,
    issuerSigner: ethers.Signer // private key is being passed 
) => {
    assertBytes32(certificateHash, "certificateHash");
    const institutionKey = toInstitutionBytes32(institutionId);

    const issuerAddress = await issuerSigner.getAddress(); // get the wallet address from the signer - pass the private key and thsi function gets the wallet address from the private key
    const isAuthorized: boolean = await contract.isAuthorizedIssuer(institutionKey, issuerAddress);
    if (!isAuthorized) throw new Error("Issuer wallet is not authorized for this institution");

    const tx = await withSigner(issuerSigner).issueCertificate(certificateHash, institutionKey);
    const receipt = await tx.wait();
    return { txHash: receipt?.hash ?? "", certificateId: parseCertificateId(receipt) };
};

// ── Revoke certificate (issuer wallet signs) 
export const revokeCertificateOnChain = async (
    certificateHash: string,
    institutionId: InstitutionRef,
    issuerSigner: ethers.Signer
) => {
    assertBytes32(certificateHash, "certificateHash");
    const institutionKey = toInstitutionBytes32(institutionId);

    const issuerAddress = await issuerSigner.getAddress();
    const isAuthorized: boolean = await contract.isAuthorizedIssuer(institutionKey, issuerAddress);
    if (!isAuthorized) throw new Error("Issuer wallet is not authorized for this institution");

    const tx = await withSigner(issuerSigner).revokeCertificate(certificateHash, institutionKey);
    const receipt = await tx.wait();
    return { txHash: receipt?.hash ?? "" };
};

// ── Verify (read-only, anyone) 
export const verifyCertificateOnChain = async (
    certificateHash: string,
    institutionId: InstitutionRef
) => {
    assertBytes32(certificateHash, "certificateHash");
    const institutionKey = toInstitutionBytes32(institutionId);

    const [valid, record] = await contract.verifyCertificate(certificateHash, institutionKey);
    return {
        valid: Boolean(valid),
        record: {
            certificateHash: record.certificateHash,
            institutionId: record.institutionId,
            issuer: record.issuer,
            issuedAt: Number(record.issuedAt),
            revokedAt: record.revoked ? Number(record.revokedAt) : null,
            revoked: record.revoked,
            exists: record.exists,
        },
    };
};

// ── Get certificate (reverts on-chain if it doesn't exist)
export const getCertificateFromChain = async (
    certificateHash: string,
    institutionId: InstitutionRef
) => {
    assertBytes32(certificateHash, "certificateHash");
    const institutionKey = toInstitutionBytes32(institutionId);

    try {
        const record = await contract.getCertificate(certificateHash, institutionKey);
        return {
            certificateHash: record.certificateHash,
            institutionId: record.institutionId,
            issuer: record.issuer,
            issuedAt: Number(record.issuedAt),
            revokedAt: record.revoked ? Number(record.revokedAt) : null,
            revoked: record.revoked,
            exists: record.exists,
        };
    } catch {
        throw new Error("Certificate not found");
    }
};