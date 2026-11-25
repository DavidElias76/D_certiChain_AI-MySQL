import { pool, DbRow, DbResult } from "../config/db";
import { User, UserCreateInput, UserRole, OmitPasswordUser } from "../types/index.types";

const COLUMNS =
  "id, username, email, role, institution_id, institution_name, registration_number, is_verified, created_at";

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
      )
      return rows.length ? (rows[0] as OmitPasswordUser) : null 
    },

    async findUsersById(id: number): Promise<OmitPasswordUser[] | null> {
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
        FROM users WHERE institution_id = ?`, [id]
    );
    return rows.length ? (rows as OmitPasswordUser[]) : null;
  },

  async findMainAdmins(): Promise<OmitPasswordUser[] | null> {
    const [rows] = await pool.query<DbRow[]>(
      `SELECT ${COLUMNS} FROM users WHERE role = 'main_admin' ORDER BY created_at DESC`
    );
    return rows.length ? (rows as OmitPasswordUser[]): null;
  },

  async findByInstitutionAndRoles(institutionId: number, roles: string[]) {
    const [rows] = await pool.query<DbRow[]>(
      `SELECT ${COLUMNS} FROM users
       WHERE institution_id = ? AND role IN (?)
       ORDER BY created_at DESC`,
      [institutionId, roles]
    );
    return rows;
  },

  async findUsersByInstitutionAndRoles(institutionId: number, roles: string[]): Promise<OmitPasswordUser[] | null> {
      const placeholders = roles.map(() => "?").join(", ");

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
        FROM users
        WHERE institution_id = ?
          AND role IN (${placeholders})`,
        [institutionId, ...roles]
      );

      return rows.length ? rows as OmitPasswordUser[] : null
  },
  
  async findByEmail(email: string): Promise<User | null> {
        const [rows] = await pool.execute<DbRow[]>(
                `SELECT * FROM users WHERE email = ?`,
                [email.toLowerCase()]
        );
        return rows.length ? (rows[0] as User) : null;
  },

  async findUserIdByEmail(email: string): Promise<number | null> {
    const [rows] = await pool.execute<DbRow[]>(
      `SELECT id FROM users WHERE email = ? LIMIT 1`,
      [email]
    );
    return rows.length ? rows[0].id : null;
},

  async findUserIdByInstitutionName(institutionName: string): Promise<number | null> {
    const [rows] = await pool.execute<DbRow[]>(
      `SELECT u.id
        FROM users u
        JOIN institutions i ON i.id = u.institution_id
        WHERE i.name = ? AND u.role = 'main_admin'
        ORDER BY u.id ASC
        LIMIT 1`,
      [institutionName]
    );
    return rows.length ? rows[0].id : null;
  },

  async findByName(name: string): Promise<{ id: number; name: string } | null> {
      const [rows] = await pool.execute<DbRow[]>(
          "SELECT id, name FROM institutions WHERE name = ? LIMIT 1",
          [name]
      );
      return (rows[0] as { id: number; name: string }) ?? null;
  },

  async findInstitutionNameById(id: number): Promise<string> {
    const [rows] = await pool.execute<DbRow[]>(
      `SELECT institution_name FROM users WHERE id = ?`, [id]
    )
    return rows[0].institution_name
  },

  async updateUserStatus(institutionId: number, is_active: boolean) {
    const [result] = await pool.execute<DbResult>(
            `UPDATE users SET is_verified = ? WHERE id = ?`,
            [is_active, institutionId]
        );
        return result.affectedRows > 0;
  },
  
  async isVerified(id: number): Promise<boolean> {
        const [rows] = await pool.execute<DbRow[]>(
            "SELECT is_verified FROM users WHERE id = ? LIMIT 1",
            [id]
        );
        return Boolean(rows[0]?.is_verified);
    },

  async createUser(data: UserCreateInput): Promise<OmitPasswordUser> {
        const [result] = await pool.execute<DbResult>(
        `INSERT INTO users
        (username, email, password, role, registration_number, institution_id, institution_name, is_verified)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
                data.username.trim(),
                data.email.toLowerCase().trim(),
                data.password,
                data.role,
                data.registration_number ?? null,
                data.institution_id ?? null,
                data.institution_name?.trim() ?? null,
                data.is_verified ?? true
        ]
        );
        const insertId = Number(result.insertId);
        return {
            id: insertId,
            username: data.username.trim(),
            email: data.email.toLowerCase().trim(),
            role: data.role,
            institution_name: data.institution_name?.trim() ?? null,
            institution_id: data.institution_id ?? null,
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
    if (data.institution_name !== undefined) { fields.push("institution_name = ?"); values.push(data.institution_name?.trim() ?? null); }
    if (data.institution_id !== undefined) { fields.push("institution_id = ?"); values.push(data.institution_id ?? null); }
    if (data.is_verified !== undefined) { fields.push("is_verified = ?"); values.push(data.is_verified); }

    if (fields.length === 0) return false;
    values.push(id);

    const [result] = await pool.execute<DbResult>(
      `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
      values
    );
    if (result.affectedRows > 0) return true;

    const [rows] = await pool.execute<DbRow[]>(
      "SELECT id FROM users WHERE id = ?",
      [id]
    );
    return rows.length > 0;
  },

  async deleteUser(id: number): Promise<boolean> {
    const [result] = await pool.execute<DbResult>(
      "DELETE FROM users WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  },

  async findByEmailOrUsername(email: string, username: string): Promise<User | null> {
    const [rows] = await pool.execute<DbRow[]>(
      "SELECT * FROM users WHERE email = ? OR username = ?",
      [email.toLowerCase(), username]
    );
    return rows.length ? (rows[0] as User) : null;
  },


};