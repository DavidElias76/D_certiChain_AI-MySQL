import { CustomError } from "../types/error.types";
import {
  RecommendationsRepository,
  type RecommendationRecord,
} from "../repositories/recommendations.repository";

// google gemini 
// import {
//   generateCareerRecommendations,
//   type CareerProfile
// } from "../agent/generateRecommendations";

//   openAi 

import { generateCareerRecommendations, CareerProfile } from "../agent/OpenAI_carrerRecommendations";
// export interface CareerProfile {
//   course: string;
//   degree: string;
//   classification?: string | null;
//   gpa?: string | null;
//   graduation_year?: number | null;
//   skills?: string[];
// }

export interface GenerateResult {
  recommendation: RecommendationRecord;
  cached: boolean;
}

const httpError = (message: string, statusCode: number): CustomError => {
  const err = new Error(message) as CustomError;
  err.statusCode = statusCode;
  return err;
};

// A second request for the same user + certificate while the first is still
// running shares the first one's result instead of calling Gemini again.
const inFlight = new Map<string, Promise<unknown>>();

const runOnce = <T>(key: string, task: () => Promise<T>): Promise<T> => {
  const running = inFlight.get(key) as Promise<T> | undefined;
  if (running) return running;

  const promise = task().finally(() => inFlight.delete(key));
  inFlight.set(key, promise);
  return promise;
};

const generate = async (
  certificateId: number,
  userId: number
): Promise<GenerateResult> => {
  const certificate = await RecommendationsRepository.findOwnedCertificate(
    certificateId,
    userId
  );
  if (!certificate) throw httpError("Certificate not found", 404);

  if (certificate.status !== "issued") {
    throw httpError("Recommendations are not available for a revoked certificate", 409);
  }

  const existing = await RecommendationsRepository.findByCertificateAndUser(
    certificateId,
    userId
  );
  if (existing) return { recommendation: existing, cached: true };

  const profile: CareerProfile = {
    course: certificate.course,
    degree: certificate.degree,
    classification: certificate.classification,
    gpa: certificate.gpa,
    graduation_year: certificate.graduation_year,
    skills: certificate.skills,
  };

  const result = await generateCareerRecommendations(profile);

  const saved = await RecommendationsRepository.create({
    certificate_id: certificateId,
    user_id: userId,
    source_profile: { ...profile },
    ...result,
  });

  const recommendation = await RecommendationsRepository.findByCertificateAndUser(
    certificateId,
    userId
  );
  if (!recommendation) throw httpError("Could not save the recommendation", 500);

  // saved === false means another request saved one first; we return that one
  return { recommendation, cached: !saved };
};

export const getRecommendation = async (
  certificateId: number,
  userId: number
): Promise<RecommendationRecord> => {
  const saved = await RecommendationsRepository.findByCertificateAndUser(
    certificateId,
    userId
  );
  if (!saved) {
    throw httpError("No recommendations have been generated for this certificate yet", 404);
  }
  return saved;
};

export const generateRecommendation = (
  certificateId: number,
  userId: number
): Promise<GenerateResult> =>
  runOnce(`${userId}:${certificateId}`, () => generate(certificateId, userId));