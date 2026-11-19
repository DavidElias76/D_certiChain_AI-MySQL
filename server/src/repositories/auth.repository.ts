import { pool, DbRow, DbResult } from "../config/db";
import { User, UserCreateInput, UserRole, OmitPasswordUser, QueryResponse } from "../types/index.types";
import { findUserByIdOtpType } from "../types/auth.types";

export const AuthRepository = {

    async signIn(email: string): Promise<QueryResponse | null> {
        const [rows] = await pool.execute<DbRow[]>(
                `SELECT 
                    id, 
                    username, 
                    email,
                    password, 
                    role, 
                    institution_id, 
                    institution_name 
                FROM users WHERE email = ?`,
                [email.toLowerCase()]
        );
        return rows.length ? (rows[0] as QueryResponse) : null;
    },

    async findByEmailOrUsername(email: string, username: string): Promise<QueryResponse | null> {
        const [rows] = await pool.execute<DbRow[]>(
            `SELECT 
                id, 
                username,
                password,
                role, 
                institution_id, 
                institution_name 
            FROM users WHERE email = ? OR username = ?`,
            [email.toLowerCase(), username]
        );
        return rows.length ? (rows[0] as QueryResponse) : null;
  },

  async findByEmail(email: string): Promise<findUserByIdOtpType | null> {
        const [rows] = await pool.execute<DbRow[]>(
                `SELECT * FROM users WHERE email = ?`,
                [email.toLowerCase()]
        );
        return rows.length ? (rows[0] as findUserByIdOtpType) : null;
  },

    async findUserByIdOtp (email: string): Promise<findUserByIdOtpType | null> {
        const [rows] = await pool.execute<DbRow[]>(`
            SELECT 
                username,
                email, 
                role , 
                verifyOtp,
                verifyOtpExpiryAt 
                FROM users WHERE id = ?
            `, [email])

            return rows.length ? (rows[0] as findUserByIdOtpType) : null;
    },

    async updateOtp (
        // is_verified: boolean, 
        verifyOtp: number, 
        verifyOtpExpiryAt: Date, 
        email: string 
    ) {
        const [result] = await pool.execute<DbResult>(`
            UPDATE users
            SET
                verifyOtp = ?,
                verifyOtpExpiryAt = ?
            WHERE email = ?
            `,
            [verifyOtp, verifyOtpExpiryAt, email]
        );
        return result.affectedRows > 0;
    },

    async UpdatePassword(hashedPassword: string, email: string) {
        const [result] = await pool.execute<DbResult>(`
            UPDATE users SET password = ? WHERE email = ?    
        `, [hashedPassword, email])

         return result.affectedRows > 0;
    },

    async findPasswordByUserId(id: number): Promise<string | null> {
        const [rows] = await pool.execute<DbRow[]>(
            "SELECT password FROM users WHERE id = ?",
            [id]
        );
        return rows.length ? String(rows[0].password) : null;
    },

    async updatePasswordByUserId(id: number, hashedPassword: string): Promise<boolean> {
        const [result] = await pool.execute<DbResult>(
            "UPDATE users SET password = ? WHERE id = ?",
            [hashedPassword, id]
        );
        return result.affectedRows > 0;
    },

     async updateWalletAddress(id: number, wallet_address: string): Promise<boolean> {
        const [result] = await pool.execute<DbResult>(
            "UPDATE users SET wallet_address = ? WHERE id = ?",
            [wallet_address.toLowerCase().trim(), id]
        );
        return result.affectedRows > 0;
  },
}