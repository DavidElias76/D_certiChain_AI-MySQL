import mysql, { 
  Pool, 
  PoolConnection, 
  RowDataPacket, 
  ResultSetHeader 
} from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool: Pool = mysql.createPool({
  host: process.env.DB_HOST as string,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER as string,
  password: process.env.DB_PASSWORD as string,
  database: process.env.DB_DATABASE as string,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

export type DbRow = RowDataPacket;
export type DbResult = ResultSetHeader;

export { pool, PoolConnection };
