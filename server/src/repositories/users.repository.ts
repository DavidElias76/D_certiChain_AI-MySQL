import { pool, DbRow, DbResult } from "../config/db";
import { User, UserCreateInput, UserRole, OmitPasswordUser } from "../types/index.types";

export const UsersRepository = {
    async findAllUsers(): Promise<OmitPasswordUser[]> {
        const [rows] = await pool.execute<DbRow[]>(`
        SELECT
                id,
                username,
                email,
                role,
                wallet_address,
                institution_id,
                institution_name,
                is_verified,
                created_at,
                updated_at
        FROM users
        ORDER BY created_at DESC`);

        return rows as OmitPasswordUser[];
    },

    async findUserById(id: number): Promise<OmitPasswordUser | null> {
      // this need to be rediced to prevent overfetching of data
        const [rows] = await pool.execute<DbRow[]>(
        `SELECT id, 
                username, 
                email, 
                role, 
                wallet_address, 
                institution_id, 
                institution_name, 
                is_verified, 
                created_at, 
                updated_at 
        FROM users WHERE id = ?`, [id]
    );
    return rows.length ? (rows[0] as OmitPasswordUser) : null;
  },
  
  async findByEmail(email: string): Promise<User | null> {
        const [rows] = await pool.execute<DbRow[]>(
                `SELECT * FROM users WHERE email = ?`,
                [email.toLowerCase()]
        );
        return rows.length ? (rows[0] as User) : null;
  },

  async createUser(data: UserCreateInput): Promise<OmitPasswordUser> {
        const [result] = await pool.execute<DbResult>(
        `INSERT INTO users
        (username, email, password, role, institution_id, institution_name, wallet_address, is_verified)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
                data.username.trim(),
                data.email.toLowerCase().trim(),
                data.password,
                data.role,
                data.institution_id ?? null,
                data.institution_name?.trim() ?? null,
                data.wallet_address?.toLowerCase().trim() ?? null,
                data.is_verified ?? false
        ]
        );
        const insertId = Number(result.insertId);
        return {
            id: insertId,
            username: data.username.trim(),
            email: data.email.toLowerCase().trim(),
            role: data.role,
            institution_id: data.institution_id ?? null,
            institution_name: data.institution_name?.trim() ?? null,
            wallet_address: data.wallet_address?.toLowerCase().trim() ?? null,
            is_verified: data.is_verified ?? false,
            created_at: new Date(),
            updated_at: new Date(),
        };
  },

  async updateUser(id: number, data: Partial<UserCreateInput>): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.username !== undefined) { fields.push("username = ?"); values.push(data.username.trim()); }
    if (data.email !== undefined) { fields.push("email = ?"); values.push(data.email.toLowerCase().trim()); }
    if (data.password !== undefined) { fields.push("password = ?"); values.push(data.password); }
    if (data.role !== undefined) { fields.push("role = ?"); values.push(data.role); }
    if (data.institution_id !== undefined) { fields.push("institution_id = ?"); values.push(data.institution_id); }
    if (data.institution_name !== undefined) { fields.push("institution_name = ?"); values.push(data.institution_name?.trim() ?? null); }
    if (data.wallet_address !== undefined) { fields.push("wallet_address = ?"); values.push(data.wallet_address?.toLowerCase().trim() ?? null); }
    if (data.is_verified !== undefined) { fields.push("is_verified = ?"); values.push(data.is_verified); }

    if (fields.length === 0) return false;
    values.push(id);

    const [result] = await pool.execute<DbResult>(
      `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  },

  async deleteUser(id: number): Promise<boolean> {
    const [result] = await pool.execute<DbResult>(
      "DELETE FROM users WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  },

  /** Find user by email OR username (for signup uniqueness check) - This will be added if needed by the user */
  async findByEmailOrUsername(email: string, username: string): Promise<User | null> {
    const [rows] = await pool.execute<DbRow[]>(
      "SELECT * FROM users WHERE email = ? OR username = ?",
      [email.toLowerCase(), username]
    );
    return rows.length ? (rows[0] as User) : null;
  },


};