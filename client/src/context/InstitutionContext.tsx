import api from "../services/api";
import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState, useCallback } from "react";

type InstitutionInput = {
    id?: number
    name: string;
    short_code: string;
    domain: string;
    wallet_address: string;
    description: string | null;
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
    updateInstitutionWalletAddress: (institutionId: string, wallet_address:string) => Promise<void>
    toggleInstitutionStatus: (institutionId: string, is_active: boolean) => Promise<void>
    deleteInstitution: (institutionId: string) => Promise<void>
}

interface Props {
    children: ReactNode
}

const InstitutionContext = createContext<InstitutionContextType | null>(null)

export function InstitutionProvider({ children }: Props) {
    const [institutions, setInstitutions] = useState<InstitutionInput[]>([]);
    const [institution, setInstitution] = useState<InstitutionInput | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [refresh, setRefresh] = useState<number>(0);

    // Fetch all institutions — re-runs when refresh counter changes
    const getInstitutions = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/institution/', { withCredentials: true });
            setInstitutions(response.data);
            setError('');
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to fetch institutions");
            console.error(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        getInstitutions();
    }, [refresh, getInstitutions]);

    const getInstitutionById = async (institutionId: string) => {
        try {
            setLoading(true);
            const response = await api.get(`/institution/${institutionId}`,
                { withCredentials: true }
            );
            setInstitution(response.data);
            setError('');
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to fetch institution");
            console.error(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const registerInstitution = async (data: InstitutionInput) => {
        try {
            setLoading(true);
            setError('');
            const response = await api.post('/institution/add',
                data,
                { withCredentials: true }
            );
            setMessage(response.data.message || "Institution registered successfully");
            setRefresh(prev => prev + 1);
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to register institution");
            console.error(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateInstitution = async (institutionId: string, data: Partial<InstitutionInput>) => {
        try {
            setLoading(true);
            setError('');
            const response = await api.put(`/institution/${institutionId}`,
                data,
                { withCredentials: true }
            );
            setMessage(response.data.message || "Institution updated successfully");
            setRefresh(prev => prev + 1); // triggers re-fetch after updating
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to update institution");
            console.error(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // to be determined if needed - update the wallet address - the register institution does this automatically
    const updateInstitutionWalletAddress = async (institutionId: string, wallet_address:string) => {
        try {
            setLoading(true)
            setError('')
            const response = await api.put(`institution/${institutionId}`,
                { wallet_address },
                { withCredentials: true }
            )
            setMessage(response.data.message || "Insttituion's wallet address updated successfully")
            setRefresh(prev => prev + 1)
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to update institution");
            console.error(err);
            throw err;
        }finally {
            setLoading(false)
        }
    }

    const toggleInstitutionStatus = async (institutionId: string, is_active: boolean) => {
        try {
            setLoading(true)
            setError('')
            const response = await api.put(`institution/${institutionId}`, 
                { is_active },
                { withCredentials: true})
                setMessage(response.data.message || " Institution status updated successfully")
                setRefresh(prev => prev + 1); // triggers re-fetch after updating
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to update institution status");
            console.error(err);
            throw err;
        }finally {
            setLoading(false)
        }
    }

    const deleteInstitution = async (institutionId: string) => {
        try {
            setLoading(true);
            setError('');
            const response = await api.delete(`/institution/${institutionId}`,
                { withCredentials: true }
            );
            setMessage(response.data.message || "Institution deleted successfully");
            setRefresh(prev => prev + 1); // triggers re-fetch after deleting
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to delete institution");
            console.error(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

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
            updateInstitutionWalletAddress,
            toggleInstitutionStatus,
            deleteInstitution
        }}>
            {children}
        </InstitutionContext.Provider>
    );
}

export const useInstitution = () => {
    const ctx = useContext(InstitutionContext);
    if (!ctx) {
        throw new Error("useInstitution must be used within InstitutionProvider");
    }
    return ctx;
};