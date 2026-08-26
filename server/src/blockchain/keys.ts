import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { ethers } from "ethers";
import dotenv from 'dotenv'

dotenv.config()

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;       // bytes (recommended for GCM)
const AUTH_TAG_LENGTH = 16; // bytes

// get the key from the env file
const getMasterKey = (): Buffer => {
    const raw = process.env.MASTER_ENCRYPTION_KEY;
    if(!raw) throw Error("MASTER_ENCRYPTION_KEY not set in .env")
    const clean = raw.startsWith("0x") ? raw.slice(2) : raw;
    if (clean.length !== 64) {
        throw new Error("MASTER_ENCRYPTION_KEY must be 64 hex characters (32 bytes)");
    }
    return Buffer.from(clean, "hex");
}

// Encrypt the master key
const encryptPrivateKey = (plaintextPrivateKey: string): string => {
    const masterKey = getMasterKey()
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, masterKey, iv); // encrypt the key

    // take the cipler text and combine them with thr privatekey
    const encrypted = Buffer.concat([
        cipher.update(plaintextPrivateKey, "utf8"),
        cipher.final(),
    ])

    const authTag = cipher.getAuthTag(); // produces the authentication tag after the encryption - The figerprint of the encrypted data and prevents tampering
    return [
        iv.toString("hex"),
        authTag.toString("hex"),
        encrypted.toString("hex"),
    ].join(":"); // joins them together to prevent tampering
}

// DECRYPT: takes the encrypted blob, returns the plaintext private key
const decryptPrivateKey = (encryptedBlob: string) => {
    const masterKey = getMasterKey()
    const parts = encryptedBlob.split(":"); // this return an array of three values

    if (parts.length !== 3) {
        throw new Error("Invalid encrypted blob format");
    }

    // get the seperate parts of the string
    const [ivHex, authTagHex, ciphertextHex] = parts; // array destructuring of the parts
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const ciphertext = Buffer.from(ciphertextHex, "hex");

    const decipher = createDecipheriv(ALGORITHM, masterKey, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
        decipher.update(ciphertext),
        decipher.final(), // throws if auth tag doesn't match (tampered)
    ]);

    return decrypted.toString("utf8");
}

// GENERATE A NEW WALLET: takes no inputs, returns a fresh private key + address
const generateInstitutionWallet = (): {
    privateKey: string;
    address: string;
} => {
    const wallet = ethers.Wallet.createRandom();
    return {
        privateKey: wallet.privateKey, // hex string starting with "0x"
        address: wallet.address,        // hex string starting with "0x"
    };
}


export { encryptPrivateKey, decryptPrivateKey, generateInstitutionWallet }