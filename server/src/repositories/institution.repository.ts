import { pool, DbRow, DbResult } from "../config/db";
import { InstitutionCreateInput, Institution } from "../types/index.types";

export interface InstitutionWithMainAdmin extends InstitutionCreateInput {
    id: number;
    main_admin_name: string | null;
}

interface InstitutionIdRow extends DbRow {
    id: number;
}

const toInstitution = (row: DbRow) => ({
  ...row,
  is_active: Boolean(row.is_active),
});

// Never includes wallet_private_key_encrypted.
// Compare with your table and remove any column that doesn't exist (e.g. created_at).
const INSTITUTION_COLUMNS = `
    institutions.id,
    institutions.name,
    institutions.domain,
    institutions.short_code,
    institutions.description,
    institutions.is_active,
    institutions.wallet_address,
    institutions.blockchain_inst_tx_hash,
    institutions.institution_chain_id,
    institutions.wallet_registered_at,
    institutions.created_at
`;

export const InstitutionRepository = {

   async findAll(): Promise<InstitutionWithMainAdmin[]> {
    const [rows] = await pool.execute<DbRow[]>(
        `SELECT
            ${INSTITUTION_COLUMNS},
            (
                SELECT users.username
                FROM users
                WHERE users.role = 'main_admin'
                  AND (
                      users.institution_id = institutions.id
                      OR users.institution_name = institutions.name
                  )
                ORDER BY users.id DESC
                LIMIT 1
            ) AS main_admin_name
        FROM institutions`
    );

    // MySQL returns TINYINT(1) as 1/0, so convert is_active to a real boolean.
    return rows.map((row) => ({
        ...row,
        is_active: Boolean(row.is_active),
    })) as InstitutionWithMainAdmin[];
},

    async findById(id: number): Promise<Institution | null> {
        const [rows] = await pool.execute<DbRow[]>(
            `SELECT ${INSTITUTION_COLUMNS} FROM institutions WHERE id = ?`,
            [id]
        );
        return rows.length ? (rows[0] as Institution) : null;
    },

    // this is used by the wallet setup
    async updateStatus(institutionId: number, is_active: boolean): Promise<boolean> {
        const [result] = await pool.execute<DbResult>(
            `UPDATE institutions SET is_active = ? WHERE id = ?`,
            [is_active, institutionId]
        );
        return result.affectedRows > 0;
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

    // change the name to findwalletaddressbyid
    async findByShortCodeWalletAddress(id: number): Promise<string | null> {
        const [rows] = await pool.execute<DbRow[]>(
            `SELECT wallet_private_key_encrypted FROM institutions WHERE id = ?`,
            [id]
        );
        return rows[0].wallet_address ?? null;
    },

    async findInstitutionIdByShortCode(shortCode: string): Promise<number | null> {
        const [rows] = await pool.execute<InstitutionIdRow[]>(
            `SELECT id FROM institutions WHERE short_code = ? LIMIT 1`,
            [shortCode]
        );
        return rows[0]?.id ?? null;
    },

    async findByInstitutionName(name: string): Promise<(InstitutionCreateInput & { id: number }) | null> {
        const [rows] = await pool.execute<DbRow[]>(
            `SELECT ${INSTITUTION_COLUMNS} FROM institutions WHERE name = ?`,
            [name]
        );
        return rows.length ? (rows[0] as InstitutionCreateInput & { id: number }) : null;
    },
    

    // Only for the certificate issuing flow. Never send this to the client.
    async findWalletById(id: number): Promise<{ wallet_address: string | null; wallet_private_key_encrypted: string | null } | null> {
        const [rows] = await pool.execute<DbRow[]>(
            `SELECT wallet_address, wallet_private_key_encrypted FROM institutions WHERE id = ?`,
            [id]
        );
        return rows.length
            ? (rows[0] as { wallet_address: string | null; wallet_private_key_encrypted: string | null })
            : null;
    },

    async findByWalletAddress(address: string): Promise<{ id: number } | null> {
        const [rows] = await pool.execute<DbRow[]>(
            `SELECT id FROM institutions WHERE wallet_address = ? LIMIT 1`,
            [address.toLowerCase()]
        );
        return rows.length > 0 ? (rows[0] as { id: number }) : null;
    },

    async saveWalletSetup(
        id: number,
        data: { walletAddress: string; encryptedKey: string; txHash: string; chainId: string, is_active: boolean }
    ): Promise<boolean> {
        const [result] = await pool.execute<DbResult>(
            `UPDATE institutions
                SET wallet_address = ?,
                    wallet_private_key_encrypted = ?,
                    blockchain_inst_tx_hash = ?,
                    institution_chain_id = ?,
                    wallet_registered_at = CURRENT_TIMESTAMP,
                    is_active = ?
            WHERE id = ? AND wallet_address IS NULL`,
            [data.walletAddress.toLowerCase(), data.encryptedKey, data.txHash, data.chainId, data.is_active, id]
        );
        return result.affectedRows > 0;
    },

    async create(data: InstitutionCreateInput): Promise<number> {
        const [result] = await pool.execute<DbResult>(
            `INSERT INTO institutions
            (name, domain, short_code, wallet_address, description, is_active)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                data.name.trim(),
                data.domain,
                data.short_code,
                data.wallet_address ?? null,
                data.description ?? null,
                data.is_active ?? false,
            ]
        );
        
        return result.insertId;
    },

    // Profile fields only. Wallet fields are written by saveWalletSetup.
    async update(
        id: number,
        updates: Partial<Pick<InstitutionCreateInput, "name" | "domain" | "short_code" | "description" | "is_active">>
    ): Promise<boolean> {
        const fields: string[] = [];
        const values: (string | number | boolean | null)[] = [];

        if (updates.name !== undefined) { fields.push("name = ?"); values.push(updates.name.trim()); }
        if (updates.domain !== undefined) { fields.push("domain = ?"); values.push(updates.domain.trim()); }
        if (updates.short_code !== undefined) { fields.push("short_code = ?"); values.push(updates.short_code.trim()); }
        if (updates.description !== undefined) { fields.push("description = ?"); values.push(updates.description?.trim() ?? null); }
        if (updates.is_active !== undefined) { fields.push("is_active = ?"); values.push(updates.is_active); }

        if (fields.length === 0) return false;
        values.push(id);

        const [result] = await pool.execute<DbResult>(
            `UPDATE institutions SET ${fields.join(", ")} WHERE id = ?`,
            values
        );
        return result.affectedRows > 0;
    },

    async softDelete(id: number): Promise<boolean> {
        const [result] = await pool.execute<DbResult>(
            `UPDATE institutions SET is_active = FALSE WHERE id = ?`,
            [id]
        );
        return result.affectedRows > 0;
    },

     async deleteInstitution(id: number): Promise<boolean> {
        const [result] = await pool.execute<DbResult>(
            "DELETE FROM institutions WHERE id = ?",
            [id]
         );
        return result.affectedRows > 0;
  },
};