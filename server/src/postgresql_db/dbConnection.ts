import pool from "./dbConfig";
import dotenv from "dotenv"

dotenv.config()

const connectDB_Postgresql = async (): Promise<void> => {
    try {
        const connect = await pool.connect()
        console.log(`Connected to the daatabase successfully -h ${process.env.DB_POSTGRES_HOSTNAME}`)
        connect.release();
    } catch (error) {
        console.error("Error connecting to te database", error)
        process.exit(1)
    }
}

export default connectDB_Postgresql;