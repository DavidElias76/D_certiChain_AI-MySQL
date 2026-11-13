import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import axios from "axios";
import toast from "react-hot-toast";

import api from "../services/api";         // adjust: your configured axios instance
import { useAuth } from "./AuthContext"; // adjust: hook that exposes the logged-in user

export interface CareerRole {
  title: string;
  why: string;
  next_steps: string[];
}

export interface SuggestedSkill {
  skill: string;
  reason: string;
}

export interface JobMatch {
  title: string;
  search_keywords: string[];
}

export interface Recommendation {
  id: number;
  certificate_id: number;
  recommended_roles: CareerRole[];
  suggested_skills: SuggestedSkill[];
  market_insights: string[];
  job_matches: JobMatch[];
  generated_at: string;
}

export type RecommendationStatus =
  | "idle"
  | "loading"
  | "empty"
  | "ready"
  | "generating"
  | "error";

export interface RecommendationEntry {
  status: RecommendationStatus;
  data?: Recommendation;
  error?: string;
}

interface RecommendationsContextType {
  getEntry: (certificateId: number) => RecommendationEntry;
  fetchRecommendation: (certificateId: number) => Promise<void>;
  generateRecommendation: (certificateId: number) => Promise<Recommendation | null>;
}

const IDLE: RecommendationEntry = { status: "idle" };

const RecommendationsContext = createContext<RecommendationsContextType | null>(null);

const errorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    if (error.code === "ECONNABORTED") return "This is taking too long. Please try again.";
    const data = error.response?.data as { message?: string; error?: string } | undefined;
    return data?.message ?? data?.error ?? fallback;
  }
  return fallback;
};

export const RecommendationsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [entries, setEntries] = useState<Record<number, RecommendationEntry>>({});

  const entriesRef = useRef(entries);
  entriesRef.current = entries;

  // Bumped whenever the signed-in user changes, so a response that arrives
  // after sign-out (or for a different user) is thrown away.
  const sessionRef = useRef(0);
  const busyRef = useRef(new Set<string>());

  useEffect(() => {
    sessionRef.current += 1;
    busyRef.current.clear();
    setEntries({});
  }, [userId]);

  const setEntry = useCallback((certificateId: number, entry: RecommendationEntry) => {
    setEntries((prev) => ({ ...prev, [certificateId]: entry }));
  }, []);

  const getEntry = useCallback(
    (certificateId: number): RecommendationEntry => entries[certificateId] ?? IDLE,
    [entries]
  );

  const fetchRecommendation = useCallback(
    async (certificateId: number) => {
      const current = entriesRef.current[certificateId]?.status;
      if (current === "ready" || current === "empty" || current === "loading" || current === "generating") {
        return; // already known or in progress: no request
      }

      const key = `get:${certificateId}`;
      if (busyRef.current.has(key)) return;
      busyRef.current.add(key);

      const session = sessionRef.current;
      setEntry(certificateId, { status: "loading" });

      try {
        const { data } = await api.get(`/recommendations/certificate/${certificateId}`);
        if (session !== sessionRef.current) return;
        setEntry(certificateId, { status: "ready", data: data.recommendation });
      } catch (error) {
        if (session !== sessionRef.current) return;
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          setEntry(certificateId, { status: "empty" }); // nothing generated yet
        } else {
          setEntry(certificateId, {
            status: "error",
            error: errorMessage(error, "Could not load your recommendations."),
          });
        }
      } finally {
        busyRef.current.delete(key);
      }
    },
    [setEntry]
  );

  const generateRecommendation = useCallback(
    async (certificateId: number): Promise<Recommendation | null> => {
      const existing = entriesRef.current[certificateId];
      if (existing?.status === "ready" && existing.data) return existing.data; // never ask twice
      if (existing?.status === "generating") return null;

      const key = `gen:${certificateId}`;
      if (busyRef.current.has(key)) return null;
      busyRef.current.add(key);

      const session = sessionRef.current;
      setEntry(certificateId, { status: "generating" });

      try {
        const { data } = await api.post(
          `/recommendations/certificate/${certificateId}`,
          {},
          { timeout: 120_000 }
        );
        if (session !== sessionRef.current) return null;

        setEntry(certificateId, { status: "ready", data: data.recommendation });
        toast.success(data.message ?? "Career recommendations ready.");
        return data.recommendation as Recommendation;
      } catch (error) {
        if (session !== sessionRef.current) return null;

        const message = errorMessage(error, "Could not generate recommendations.");
        setEntry(certificateId, { status: "error", error: message });
        toast.error(message);
        return null;
      } finally {
        busyRef.current.delete(key);
      }
    },
    [setEntry]
  );

  const value = useMemo(
    () => ({ getEntry, fetchRecommendation, generateRecommendation }),
    [getEntry, fetchRecommendation, generateRecommendation]
  );

  return (
    <RecommendationsContext.Provider value={value}>
      {children}
    </RecommendationsContext.Provider>
  );
};

export const useRecommendations = (): RecommendationsContextType => {
  const context = useContext(RecommendationsContext);
  if (!context) {
    throw new Error("useRecommendations must be used inside RecommendationsProvider");
  }
  return context;
};