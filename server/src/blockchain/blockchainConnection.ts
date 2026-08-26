import { ethers } from "ethers";
import { abi } from "../contracts/ICertificateRegistry.json"
import dotenv from "dotenv"

dotenv.config();

const rpcUrl = process.env.RPC_URL;
const contractAddress = process.env.CONTRACT_ADDRESS;
const privateKey = process.env.PLATFORM_PRIVATE_KEY;

// The connection to the blockchain
const provider = new ethers.JsonRpcProvider(rpcUrl as string);

const getPlatformWallet = (privateKey: string, provider:ethers.JsonRpcProvider) => {
    if(!privateKey) throw Error("Paltform key not loaded in env")
    if(!provider) throw Error("Provider is not declared in env")
    return new ethers.Wallet(privateKey, provider)
}

const getContract = (address: string) => {
    if (!address) throw new Error("Contract not deployed. Run deployment script first.")
    return new ethers.Contract(process.env.CONTRACT_ADDRESS as string, abi, provider);
};

const contract = getContract(contractAddress as string);
const platformWallet = getPlatformWallet(privateKey as string, provider)

export { contract, platformWallet, provider }


// const platformWallet = new ethers.Wallet(
//   process.env.PLATFORM_PRIVATE_KEY!,
//   provider
// );

// This can be used directly
// const contract = new ethers.Contract(
//     process.env.CONTRACT_ADDRESS as string,
//     abi,
//     platformWallet
// );