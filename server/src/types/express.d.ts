import type { Jwt, JwtPayload } from "jsonwebtoken"
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: number;
                username: string
                email: string
                role: string;
                institution_name: string
                institution_id: number | null
            };
        }
    }
}

export {};