import { RowDataPacket, ResultSetHeader } from "mysql2";
import { pool } from "./db";

export type DbRow = RowDataPacket;

export type DbResult = ResultSetHeader; 

const connectDB = async (): Promise<void> => {
    try {
        const connect = await pool.getConnection(); 
        console.log("✅ MySQL connected — host:", process.env.DB_HOST);
        connect.release();
    } catch (error) {
        console.error("❌ MySQL connection failed:", error);
        process.exit(1);
    }
}

export default connectDB;

