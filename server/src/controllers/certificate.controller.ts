// import type { Request, Response } from "express";
// import type { CustomError } from "../types/error.types";

// // needs to be completed to log in the system 
// export const createCertificateHash = async (
//     req: Request, 
//     res: Response
// ) => {
//     try {
        
//     } catch (error) {
//         const err = error as CustomError
//         res.status(err.statusCode || 500).json({ error: err.message})
//     }
// }


// when adding the cetificate create an empty array as the skills

// const skills = [];
// await pool.execute(
//   `INSERT INTO certificates (
//       student_name,
//       skills
//   ) VALUES (?, ?)`,
//   [
//     studentName,
//     JSON.stringify(skills)
//   ]
// );

//  - store them in array - get the array from the front-end 
// const skills = [
//   "JavaScript",
//   "React",
//   "Blockchain"
// ];