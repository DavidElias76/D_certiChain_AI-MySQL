import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const key = process.env.GOOGLE_GEMINI_API_KEY;

if (!key) {
  throw new Error("GOOGLE_GEMINI_API_KEY is not set");
}

const ai = new GoogleGenAI({ apiKey: key });

export default ai;