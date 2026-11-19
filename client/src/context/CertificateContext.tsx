import api from "../services/api";
import { useCallback, useContext, useState, createContext, useRef, type ReactNode } from "react";

export type CertificateStatus = "issued" | "revoked";

export type VerifyOutcome = {
  verified: boolean;
  result: "verified" | "revoked" | "invalid";
  match?: "number" | "exact_file" | "pdf_text" | "qr_code";
  reason?: "document_mismatch";
  certificate?: ICertificate;  
};

export interface ICertificate {
  id: number;
  student_name: string;
  registration_number: string;
  student_email: string;
  institution_id: number;
  institution_name: string;
  course: string;
  degree: string;
  graduation_date: Date | string | null;          
  gpa: string | null;
  classification: string | null;
  skills?: string | null;
  certificate_number: string;
  certificate_hash: string;
  blockchain_tx_hash: string | null;
  blockchain_certificate_id: string | null;
  certificate_pdf_url: string | null;
  status: CertificateStatus;
  issued_by: number;
  issued_at: string;
  revoked_at: string | null;
  revocation_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface IssueCertificateData {
  student_name: string;
  registration_number: string;
  student_email: string;
  course: string;
  degree: string;
  graduation_date: Date | string | null;
  gpa?: string;
  classification?: string;
}

export interface RevokeCertificateData {
  reason?: string;
}

export interface CertificateContextType {
  certificates: ICertificate[];
  loading: boolean;
  message: string;
  error: string;
  totalCount: number | null
  countLoading: boolean

  getCertificates: () => Promise<void>;     
  getMyCertificates: () => Promise<void>;   
  getAllCertificatesCount: () => Promise<void> 
  getCertificatePdfBlob: (certId: string | number) => Promise<Blob>;
  downloadCertificatePdf: (certId: string | number, fileName?: string) => Promise<void>;
  verifyCertificate: (certificateNumber: string) => Promise<VerifyOutcome | null>;
  issueCertificate: (data: IssueCertificateData) => Promise<string>;
  revokeCertificate: (certId: string, data?: RevokeCertificateData) => Promise<void>;
}

interface Props {
  children: ReactNode;
}

const CertificateContext = createContext<CertificateContextType | null>(null);

const extractError = async (err: any, fallback: string): Promise<string> => {
  const data = err?.response?.data;
  try {
    if (typeof Blob !== "undefined" && data instanceof Blob) {
      const parsed = JSON.parse(await data.text());
      return parsed?.error || parsed?.message || fallback;
    }
  } catch {
    return fallback;
  }
  return data?.error || data?.message || fallback;
};

export function CertificateProvider({ children }: Props) {
  const [certificates, setCertificates] = useState<ICertificate[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [countLoading, setCountLoading] = useState<boolean>(false);
  const listRequestRef = useRef(0);

  const loadList = useCallback(async (url: string) => {
    const requestId = ++listRequestRef.current;
      try {
        setLoading(true);
        setError("");
        const response = await api.get(url);
        if (requestId !== listRequestRef.current) return;
        const data = response.data;
        setCertificates(Array.isArray(data) ? data : data?.certificates || []);
      } catch (err) {
        if (requestId !== listRequestRef.current) return;
        setCertificates([]);
        setError(await extractError(err, "Failed to load certificates"));
      } finally {
        if (requestId === listRequestRef.current) setLoading(false);
      }
}, []);

  const getCertificates = useCallback(() => loadList("/certificate"), [loadList]);
  const getMyCertificates = useCallback(() => loadList("/certificate/my"), [loadList]);

  const getCertificatePdfBlob = useCallback(async (certId: string | number): Promise<Blob> => {
    try {
      const response = await api.get(`/certificate/${certId}/pdf`, { responseType: "blob" });
      return response.data as Blob;
    } catch (err) {
      throw new Error(await extractError(err, "Could not load the PDF"));
    }
  }, []);

  
  const downloadCertificatePdf = useCallback(
    async (certId: string | number, fileName?: string): Promise<void> => {
      const blob = await getCertificatePdfBlob(certId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || `certificate-${certId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    },
    [getCertificatePdfBlob]
  );

  const getAllCertificatesCount = useCallback(async (): Promise<void> => {
    try {
      setCountLoading(true);
      const response = await api.get<{ count: number }>("/certificate/count");
      setTotalCount(response.data.count);
    } catch (err :any) {
      setTotalCount(null);
      console.error("Failed to load the certificate count", err);
      console.error(
        "Failed to load the certificate count",
        err.response?.status,
        err.response?.data
  );
    } finally {
      setCountLoading(false);
    }
  }, []);

  const verifyCertificate = useCallback(
    async (certificateNumber: string): Promise<VerifyOutcome | null> => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get<VerifyOutcome>(
          `/certificate/verify/${encodeURIComponent(certificateNumber)}`
        );
        return response.data;
      } catch (err) {
        setError(await extractError(err, "Verification failed"));
        return null
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const issueCertificate = useCallback(
    async (data: IssueCertificateData): Promise<string> => {
      try {
        setLoading(true);
        setError("");
        setMessage("");

        const response = await api.post<{
          message?: string;
          certificate?: {
            certificate_number?: string;
          };
        }>("/certificate/issue", data,);

        const certificateNumber =
          response.data?.certificate?.certificate_number;

        if (!certificateNumber) {
          throw new Error(
            "The server did not return the generated certificate number."
          );
        }

        setMessage(
          response.data.message || "Certificate issued successfully"
        );
        void getCertificates();
        return certificateNumber;

      } catch (err) {
        const msg = await extractError(
          err,
          "Failed to issue certificate"
        );

        setError(msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    [getCertificates]
  );

  const revokeCertificate = useCallback(
    async (certId: string | number, data?: RevokeCertificateData): Promise<void> => {
      try {
        setLoading(true);
        setError("");
        setMessage("");
        const response = await api.delete(`/certificate/${certId}`, { data: data || {} });
        setMessage(response.data?.message || "Certificate revoked successfully");
        void getCertificates();
        return
      } catch (err) {
        const msg = await extractError(err, "Failed to revoke certificate");
        setError(msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    [getCertificates]
  );

  return (
    <CertificateContext.Provider
      value={{
        certificates,
        loading,
        message,
        error,
        countLoading,
        totalCount,
        getCertificates,
        getMyCertificates,
        getAllCertificatesCount,
        getCertificatePdfBlob,
        downloadCertificatePdf,
        verifyCertificate,
        issueCertificate,
        revokeCertificate,
      }}
    >
      {children}
    </CertificateContext.Provider>
  );
}

export const useCertificates = (): CertificateContextType => {
  const context = useContext(CertificateContext);
  if (!context) throw new Error("useCertificates must be used within CertificateProvider");
  return context;
};

export default useCertificates;