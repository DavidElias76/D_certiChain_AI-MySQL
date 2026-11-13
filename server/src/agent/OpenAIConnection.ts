
import OpenAI from "openai";
import dotenv from 'dotenv'

dotenv.config()

const apikey = process.env.OPEN_AI_API_KEY

if(!apikey) {
    throw new Error('Open ai key not loaded')
}

export const Openai = new OpenAI({
    apiKey: apikey
})