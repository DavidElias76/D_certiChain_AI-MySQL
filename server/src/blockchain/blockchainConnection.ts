// Used to connect to the blockchain platform
import { ethers } from "ethers";
// import { abi } from "../contracts/CertificateRegistry.json"; // you can use this importataion closest to the contracts folder
// const abi = artifact.abi;
import { abi } from "../../../blockchain/artifacts/contracts/CertificateRegistry.sol/CertificateRegistry.json"
import dotenv from "dotenv";

dotenv.config();

const rpcUrl = process.env.RPC_URL;
const contractAddress = process.env.CONTRACT_ADDRESS;
const privateKey = process.env.PLATFORM_PRIVATE_KEY;

if (!rpcUrl) throw new Error("RPC_URL not set in .env");

const normalizePrivateKey = (raw: string): string => {
    const cleaned = raw.trim().replace(/^["']|["']$/g, "");
    const prefixed = cleaned.startsWith("0x") ? cleaned : `0x${cleaned}`;
    if (!/^0x[a-fA-F0-9]{64}$/.test(prefixed)) {
        throw new Error(
            "PLATFORM_PRIVATE_KEY must be a 32-byte hex key (64 hex characters, with or without the 0x prefix)"
        );
    }
    return prefixed;
};

// The connection to the blockchain
const provider: ethers.JsonRpcProvider = new ethers.JsonRpcProvider(rpcUrl);

const getPlatformWallet = (key: string | undefined, rpc: ethers.JsonRpcProvider) => {
    if (!key) throw new Error("PLATFORM_PRIVATE_KEY not set in .env");
    return new ethers.Wallet(normalizePrivateKey(key), rpc);
};

const getContract = (address: string | undefined, rpc: ethers.JsonRpcProvider) => {
    if (!address) throw new Error("CONTRACT_ADDRESS not set. Run the deployment script first.");
    if (!ethers.isAddress(address)) throw new Error(`CONTRACT_ADDRESS is not a valid address: ${address}`);
    // Read-only instance. For writes, use contract.connect(signer)
    return new ethers.Contract(address, abi, rpc);
};

const platformWallet = getPlatformWallet(privateKey as string, provider);
const contract = getContract(contractAddress as string, provider);

export { contract, platformWallet, provider };