import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { ethers } from "ethers";
import dotenv from 'dotenv'

dotenv.config()

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;      
const AUTH_TAG_LENGTH = 16; 

const getMasterKey = (): Buffer => {
    const raw = process.env.MASTER_ENCRYPTION_KEY;
    if (!raw) throw new Error("MASTER_ENCRYPTION_KEY not set in .env");
    const clean = raw.startsWith("0x") ? raw.slice(2) : raw;
    if (!/^[a-fA-F0-9]{64}$/.test(clean)) {
        throw new Error("MASTER_ENCRYPTION_KEY must be 64 hex characters (32 bytes)");
    }
    return Buffer.from(clean, "hex");
};

const encryptPrivateKey = (plaintextPrivateKey: string): string => {
    const masterKey = getMasterKey()
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, masterKey, iv, { authTagLength: AUTH_TAG_LENGTH }); // encrypt the key

    const encrypted = Buffer.concat([
        cipher.update(plaintextPrivateKey, "utf8"),
        cipher.final(),
    ])

    const authTag = cipher.getAuthTag(); 
    return [
        iv.toString("hex"),
        authTag.toString("hex"),
        encrypted.toString("hex"),
    ].join(":");
}

const decryptPrivateKey = (encryptedBlob: string) => {
    const masterKey = getMasterKey()
    const parts = encryptedBlob.split(":");

    if (parts.length !== 3) {
        throw new Error("Invalid encrypted blob format");
    }

    const [ivHex, authTagHex, ciphertextHex] = parts;
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const ciphertext = Buffer.from(ciphertextHex, "hex");

    const decipher = createDecipheriv(ALGORITHM, masterKey, iv, { authTagLength: AUTH_TAG_LENGTH });
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
        decipher.update(ciphertext),
        decipher.final(),
    ]);

    return decrypted.toString("utf8");
}

const generateInstitutionWallet = (): {
    privateKey: string;
    address: string;
} => {
    const wallet = ethers.Wallet.createRandom();
    return {
        privateKey: wallet.privateKey,
        address: wallet.address,      
    };
}


export { encryptPrivateKey, decryptPrivateKey, generateInstitutionWallet }