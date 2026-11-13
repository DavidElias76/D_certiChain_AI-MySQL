
// import { InstitutionRepository } from "../repositories/institution.repository"

// export const resolveUserInstitutionId = async ( user: NonNullable<Request["user"]>): Promise<number | null> => {
//   if (user.institution_id) return Number(user.institution_id);
//   if (user.institution_name) {
//     const found = await InstitutionRepository.findByInstitutionName(user.institution_name);
//     return found && "id" in found ? Number(found.id) : null;
//   }
//   return null;
// };