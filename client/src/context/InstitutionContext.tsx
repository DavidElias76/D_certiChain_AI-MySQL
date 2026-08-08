import api from "../services/api";
import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";

type InstitutionInput = {
  name: string;
  short_code: string;
  domain: string;
  wallet_address?: string;
  description?: string | null;
  is_active?: boolean | null;
};

interface InstitutionContextType {
    institutions: InstitutionInput[]
    institution: InstitutionInput | null
    loading: boolean
    error: string
    message: string
    getInstitutions: () => Promise<void>
    getInstitutionById: (institutionId: string) => Promise<void>
    registerInstitution: (data: InstitutionInput) => Promise<void>
    updateInstitution: (institutionId: string, data: Partial<InstitutionInput>) => Promise<void>
    deleteInstitution: (institutionId: string) => Promise<void>
}

interface Props {
    children: ReactNode
}

const InstitutionContext = createContext<InstitutionContextType | null>(null)

export function InstitutionProvider({ children } : Props) {
    const [institutions, setInstitutions] = useState<InstitutionInput[]>([]);
    const [institution, setInstitution] = useState<InstitutionInput | null>(null)
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [message, setMessage] = useState<string>('')

    const getInstitutions = async () => {
        try {
            setLoading(true)
            const response = await api.get('/institution/', { withCredentials: true });
            setInstitutions(response.data);
            setError('');
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to fetch institutions");
            console.error(err)
            throw err;
        } finally {
            setLoading(false);
        }
    }

    // not needed - if needed update the backedn code as well -
    const getInstitutionById = async (institutionId: string) => {
        try {
            setLoading(true)
            const response = await api.get(`/institution/${institutionId}`, 
                { withCredentials: true }
            );
            setInstitution(response.data)
            setError('');
            return response.data
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to fetch institution");
            console.error(err)
            throw err;
        } finally {
            setLoading(false);
        }
    }

    const registerInstitution = async (data: InstitutionInput) => {
        try {
            setLoading(true)
            setError('');
            const response = await api.post('/institution/add', 
                data, 
                { withCredentials: true }
            );
            setMessage(response.data.message || "Institution registered successfully");
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to register institution");
            console.error(err)
            throw err;
        } finally {
            setLoading(false);
        }
    }

    const updateInstitution = async (institutionId: string, data: Partial<InstitutionInput>) => {
        try {
            setLoading(true)
            setError('');
            const response = await api.put(`/institution/${institutionId}`, 
                data, 
                { withCredentials: true }
            );
            setMessage(response.data.message || "Institution updated successfully");
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to update institution");
            console.error(err)
            throw err;
        } finally {
            setLoading(false);
        }
    }

    const deleteInstitution = async (institutionId: string) => {
        try {
            setLoading(true)
            setError('');
            const response = await api.delete(`/institution/${institutionId}`, 
                { withCredentials: true }
            );
            setMessage(response.data.message || "Institution deleted successfully");
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to delete institution");
            console.error(err)
            throw err;
        } finally {
            setLoading(false);
        }
    }

    // we can implement the is_active property
    // set the property to true when the verfication is done
    // the institution get eth

    return (
        <InstitutionContext.Provider value={{
            institutions,
            institution,
            loading,
            error,
            message,
            getInstitutions,
            getInstitutionById,
            registerInstitution,
            updateInstitution,
            deleteInstitution
        }}>
            {children}
        </InstitutionContext.Provider>
    )
}

export const useInstitution = () => {
    const ctx = useContext(InstitutionContext)
    if (!ctx) {
        throw new Error("useInstitution must be used within InstitutionProvider")
    }
    return ctx;
}
