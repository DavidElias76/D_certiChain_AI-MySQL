import { pool, DbRow, DbResult } from "../config/db";
import { InstitutionCreateInput } from "../types/index.types";

export const InstitutionRepository = {

    async findAll(): Promise<InstitutionCreateInput[]> {
        const [rows] = await pool.execute<DbRow[]>(
            `SELECT * FROM institutions`
        );
        return rows as InstitutionCreateInput[];
    },

    async findById(id: number): Promise<InstitutionCreateInput | null> {
        const [rows] = await pool.execute<DbRow[]>(
            `SELECT * FROM institutions WHERE id = ?`,
            [id]
        );
        return rows.length ? rows[0] as InstitutionCreateInput : null;
    },

   async findByDomain(domain: string): Promise<boolean> {
        const [rows] = await pool.execute<DbRow[]>(
            `SELECT id FROM institutions WHERE domain = ?`,
            [domain]
        );
        return rows.length > 0;
    },

    async findByShortCode(shortCode: string): Promise<boolean> {
        const [rows] = await pool.execute<DbRow[]>(
            `SELECT id FROM institutions WHERE short_code = ?`,
            [shortCode]
        );
        return rows.length > 0;
    },

    async create(data: InstitutionCreateInput): Promise<number> {
        const [result] = await pool.execute<DbResult>(
            `INSERT INTO institutions
            (
                name,
                domain,
                short_code,
                wallet_address,
                description,
                is_active
            )
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                data.name.trim(),
                data.domain,
                data.short_code,
                data.wallet_address,
                data.description ?? null,
                data.is_active ?? true,
            ]
        );
        return result.insertId;
    },

    async update(id: number, updates: Partial<InstitutionCreateInput>): Promise<boolean> {
        const fields: string[] = [];
        const values: (string | number | boolean | null)[] = [];

        if (updates.name !== undefined) { fields.push("name = ?"); values.push(updates.name.trim()); }
        if (updates.domain !== undefined) { fields.push("domain = ?"); values.push(updates.domain.trim()); }
        if (updates.short_code !== undefined) { fields.push("short_code = ?"); values.push(updates.short_code.trim()); }
        if (updates.wallet_address !== undefined) { fields.push("wallet_address = ?"); values.push(updates.wallet_address.trim()); }
        if (updates.description !== undefined) { fields.push("description = ?"); values.push(updates.description.trim()); }
        if (updates.is_active !== undefined) { fields.push("is_active = ?"); values.push(updates.is_active); }

        if (fields.length === 0) return false;
        values.push(id);

        const [result] = await pool.execute<DbResult>(
            `UPDATE institutions SET ${fields.join(', ')} WHERE id = ?`, values
        )
        return result.affectedRows > 0;
    },

    async softDelete(id: number): Promise<boolean> {
        const [result] = await pool.execute<DbResult>(
            `UPDATE institutions SET is_active = FALSE WHERE id = ?`,
            [id]
        );

        return result.affectedRows > 0;
    }
}