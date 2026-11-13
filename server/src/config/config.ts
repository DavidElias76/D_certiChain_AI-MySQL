import dotenv from 'dotenv'

dotenv.config()

export interface Config {
    PORT: number
    CLIENT_URL: string
    DB_HOST: string
    DB_USER: string
    DB_PASSWORD: string
    DB_PORT: number
    DB_DATABASE: string

    TOKEN_EXPIRY_SECONDS: number
    REFRESH_TOKEN_EXPIRY_SECONDS: number

    NODE_ENV: string

    JWT_SECRET_KEY: string
    ACCESS_TOKEN_SECRET: string
    REFRESH_TOKEN_SECRET: string

    NETWORK_NAME: string
    RPC_URL: string
    CHAIN_ID: number
    CURRENCY_SYMBOL: string

    CONTRACT_ADDRESS: string
    MASTER_ENCRYPTION_KEY: string
    PLATFORM_PRIVATE_KEY: string

    GOOGLE_GEMINI_API_KEY: string
    GEMINI_MODEL: string

    SEPOLIA_RPC_URL: string
    SEPOLIA_PRIVATE_KEY: string
}

const config: Config = {
    PORT: Number(process.env.PORT),
    CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_USER: process.env.DB_USER || 'root',
    DB_PASSWORD: process.env.DB_PASSWORD || 'you db password',
    DB_PORT: Number(process.env.DB_PORT),
    DB_DATABASE: process.env.DB_DATABASE || 'your database name',

    TOKEN_EXPIRY_SECONDS: Number(process.env.TOKEN_EXPIRY_SECONDS),
    REFRESH_TOKEN_EXPIRY_SECONDS: Number(process.env.REFRESH_TOKEN_EXPIRY_SECONDS),

    NODE_ENV: process.env.NODE_ENV || 'development',

    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY || 'your jwt secret key',
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || 'your access token secret',
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || 'your refresh token secret',

    NETWORK_NAME: process.env.NETWORK_NAME || 'blockchain network name',
    RPC_URL: process.env.RPC_URL || 'rpc string connection',
    CHAIN_ID: Number(process.env.CHAIN_ID),
    CURRENCY_SYMBOL: process.env.CURRENCY_SYMBOL || 'ETH',

    CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS || 'your contract addres',
    MASTER_ENCRYPTION_KEY: process.env.MASTER_ENCRYPTION_KEY || 'your master key encryption',
    PLATFORM_PRIVATE_KEY:  process.env.PLATFORM_PRIVATE_KEY || 'your platform private key encryption',

    GOOGLE_GEMINI_API_KEY: process.env.GOOGLE_GEMINI_API_KEY || "you google gemini api key",
    GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini model",

    SEPOLIA_RPC_URL: process.env.SEPOLIA_RPC_URL || 'you sepolia rpc url',
    SEPOLIA_PRIVATE_KEY: process.env.SEPOLIA_PRIVATE_KEY || 'your sepolia private key'
}

export default config