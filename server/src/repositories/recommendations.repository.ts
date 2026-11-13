import type { ResultSetHeader } from "mysql2/promise";
import { pool } from "../config/db";
import type { DbRow } from "../config/db";
import type { CareerRecommendation } from "../agent/generateRecommendations";

export interface OwnedCertificate {
  id: number;
  course: string;
  degree: string;
  classification: string | null;
  gpa: string | null;
  skills: string[];
  graduation_year: number | null;
  status: "issued" | "revoked";
}

export interface RecommendationRecord extends CareerRecommendation {
  id: number;
  certificate_id: number;
  user_id: number;
  source_profile: Record<string, unknown>;
  generated_at: Date;
}

export interface NewRecommendation extends CareerRecommendation {
  certificate_id: number;
  user_id: number;
  source_profile: Record<string, unknown>;
}

// mysql2 returns JSON columns already parsed; MariaDB returns text. Handle both.
const parseJson = <T>(value: unknown, fallback: T): T => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value as T;
};

const toRecord = (row: DbRow): RecommendationRecord => ({
  id: row.id,
  certificate_id: row.certificate_id,
  user_id: row.user_id,
  source_profile: parseJson(row.source_profile, {}),
  recommended_roles: parseJson(row.recommended_roles, []),
  suggested_skills: parseJson(row.suggested_skills, []),
  market_insights: parseJson(row.market_insights, []),
  job_matches: parseJson(row.job_matches, []),
  generated_at: row.generated_at,
});

export const RecommendationsRepository = {
  // the certificate, only if it belongs to this user
  async findOwnedCertificate(
    certificateId: number,
    userId: number
  ): Promise<OwnedCertificate | null> {
    const [rows] = await pool.execute<DbRow[]>(
      `SELECT c.id, c.course, c.degree, c.classification, c.gpa, c.skills, c.status,
              YEAR(c.graduation_date) AS graduation_year
         FROM certificates c
         JOIN users u ON u.email = c.student_email
        WHERE c.id = ? AND u.id = ?
        LIMIT 1`,
      [certificateId, userId]
    );
    if (!rows.length) return null;

    const row = rows[0];
    const skills = parseJson<unknown[]>(row.skills, []);
    return {
      id: row.id,
      course: row.course,
      degree: row.degree,
      classification: row.classification ?? null,
      gpa: row.gpa ?? null,
      skills: skills.filter((s): s is string => typeof s === "string"),
      graduation_year: row.graduation_year ?? null,
      status: row.status,
    };
  },

  // the saved recommendation for this certificate, if any
  async findByCertificateAndUser(
    certificateId: number,
    userId: number
  ): Promise<RecommendationRecord | null> {
    const [rows] = await pool.execute<DbRow[]>(
      `SELECT id, certificate_id, user_id, source_profile, recommended_roles,
              suggested_skills, market_insights, job_matches, generated_at
         FROM recommendations
        WHERE certificate_id = ? AND user_id = ?
        LIMIT 1`,
      [certificateId, userId]
    );
    return rows.length ? toRecord(rows[0]) : null;
  },

  // true = saved, false = one already existed (nothing changed)
  async create(data: NewRecommendation): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO recommendations
         (certificate_id, user_id, source_profile, recommended_roles,
          suggested_skills, market_insights, job_matches)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE id = id`,
      [
        data.certificate_id,
        data.user_id,
        JSON.stringify(data.source_profile),
        JSON.stringify(data.recommended_roles),
        JSON.stringify(data.suggested_skills),
        JSON.stringify(data.market_insights),
        JSON.stringify(data.job_matches),
      ]
    );
    return result.affectedRows === 1;
  },
};