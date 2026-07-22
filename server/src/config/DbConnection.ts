import { RowDataPacket, ResultSetHeader } from "mysql2";
import { pool } from "./db";
import * as fs from "fs";
import * as path from "path";

export type DbRow = RowDataPacket;// This will be used for the select

export type DbResult = ResultSetHeader;// Thus will be used for the insert, update and delete 

const connectDB = async (): Promise<void> => {
    try {
        const connect = await pool.getConnection(); // get the connection from the pool
        console.log("✅ MySQL connected — host:", process.env.DB_HOST);
        connect.release();

        // This code wil be runned when executing a schema file - runned debugging on the schema file 

        // const schemaPath: string = path.join(__dirname, "..", "database", "schema.sql");
        // const schema = fs.readFileSync(schemaPath, "utf8");
        // const statements = schema.
        //                     split(";").map(statement => statement.trim())
        //                     .filter(statement => statement.length > 0);

        // for (const stmt of statements) {
        //     try {
        //         await pool.execute(stmt);
        //     } catch (err: any) {
        //         // Ignore "table already exists" and "database already exists" errors
        //         if (err.code !== "ER_TABLE_EXISTS_ERROR" && err.code !== "ER_DB_CREATE_EXISTS") {
        //         console.warn("Schema statement warning:", err.message);
        //         }
        //     }
        // }
        // console.log("✅ Database schema initialised");
    } catch (error) {
        console.error("❌ MySQL connection failed:", error);
        process.exit(1);
    }
}

export default connectDB;

// NOTE: Remove the comment before running this code - the schema as already be created and this will be changed o prevent re-runs