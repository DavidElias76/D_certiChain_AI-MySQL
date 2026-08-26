import { Pool } from 'pg'
import dotnev from "dotenv"

dotnev.config()

const pool = new Pool ({
    user: process.env.DB_POSTGRES_USER as string,
    host: process.env.DB_POSTGRES_HOSTNAME as string,
    port: Number(process.env.DB_POSTGRES_PORT),
    database: process.env.DB_POSTGRES_DATABASE as string,
    password: process.env.DB_POSTGRES_PASSWORD
})

export default pool;