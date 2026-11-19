import api from "../services/api";
import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";

type InstitutionInput = {
    id?: number
    name: string;
    short_code: string;
    domain: string;
    wallet_address?: string | null;
    description?: string | null;
    is_active?: boolean | null;
    main_admin_name?: string | null; 
};

interface InstitutionContextType { 
    institutions: InstitutionInput[]
    institution: InstitutionInput | null
    loading: boolean
    error: string
    message: string
    getInstitutions: () => Promise<void>
    getInstitutionById: (institutionId: string, silent?: boolean) => Promise<void>
    getMyInstitution: (silent?: boolean) => Promise<void>
    registerInstitution: (data: InstitutionInput) => Promise<void>
    updateInstitution: (institution_id: string, data: Partial<InstitutionInput>) => Promise<void>
    toggleInstitutionStatus: (institution_id: string, is_active: boolean) => Promise<void>
    deleteInstitution: (institution_id: string) => Promise<void>
    setUpWallet: (private_key: string) => Promise<void>
}

interface Props {
    children: ReactNode
}

const InstitutionContext = createContext<InstitutionContextType | null>(null)

export function InstitutionProvider({ children }: Props) {
    const { user } = useAuth();
    const [institutions, setInstitutions] = useState<InstitutionInput[]>([]);
    const [institution, setInstitution] = useState<InstitutionInput | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [refresh, setRefresh] = useState<number>(0);
    
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
        if (user?.role === "systemAdmin") {
            void getInstitutions().catch((error) => {
                console.error("Failed to refresh institutions after login", error);
            });
        }
    }, [refresh, getInstitutions, user?.id, user?.role]);

    useEffect(() => {
        setInstitution(null);
    }, [user?.id]);

    const getInstitutionById = useCallback(async (institution_id: string, silent = false) => {
        try {
            if (!silent) setLoading(true);
            const response = await api.get(`/institution/${institution_id}`, { withCredentials: true });
            setInstitution(response.data);
            if (!silent) setError('');
            return response.data;
        } catch (err: any) {
            if (!silent) setError(err.response?.data?.error || "Failed to fetch institution");
            console.error(err);
            throw err;
        } finally {
            if (!silent) setLoading(false);
        }
    }, []);

    const getMyInstitution = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const response = await api.get('/institution/me', { withCredentials: true });
            setInstitution(response.data);
            if (!silent) setError('');
            return response.data;
        } catch (err: any) {
            if (!silent) setError(err.response?.data?.error || "Failed to fetch institution");
            throw err;
        } finally {
            if (!silent) setLoading(false);
        }
    }, []);

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

    const updateInstitution = async (institution_id: string, data: Partial<InstitutionInput>) => {
        try {
            setLoading(true);
            setError('');
            const response = await api.put(`/institution/${institution_id}`,
                data,
                { withCredentials: true }
            );
            setMessage(response.data.message || "Institution updated successfully");
            setRefresh(prev => prev + 1);
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to update institution");
            console.error(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const toggleInstitutionStatus = async (institution_id: string, is_active: boolean) => {
        try {
            setLoading(true)
            setError('')
            const response = await api.patch(`institution/${institution_id}`, 
                { is_active },
                { withCredentials: true})
                setMessage(response.data.message || " Institution status updated successfully")
                setRefresh(prev => prev + 1);
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to update institution status");
            console.error(err);
            throw err;
        }finally {
            setLoading(false)
        }
    }

    const deleteInstitution = async (institution_id: string) => {
        try {
            setLoading(true);
            setError('');
            const response = await api.delete(`/institution/${institution_id}`,
                { withCredentials: true }
            );
            setMessage(response.data.message || "Institution deleted successfully");
            setRefresh(prev => prev + 1); 
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to delete institution");
            console.error(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const setUpWallet = async (private_key: string) => {
        try {
            setError("");
            const response = await api.patch('/institution/wallet',
                { private_key },
                { withCredentials: true }
            );
            setMessage(response.data.message || "Wallet set up and institution registered on the blockchain");
        } catch (err: any) {
            const msg = err.response?.data?.error || "Failed to set up the institution wallet";
            setError(msg);
            throw new Error(msg); 
        }

        try {
            await getMyInstitution(true);
        } catch(err: any) {
           const msg = err.response?.data?.error || "Failed to get the institution by id";
            setError(msg);
            throw new Error(msg);
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
            getMyInstitution,
            registerInstitution,
            updateInstitution,
            toggleInstitutionStatus,
            deleteInstitution,
            setUpWallet
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