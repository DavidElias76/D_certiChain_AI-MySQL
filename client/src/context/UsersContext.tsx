import api from "../services/api";
import { useCallback, useContext, useState, createContext, useRef, useEffect, type ReactNode } from "react";
import useAuth from "./AuthContext";
import toast from "react-hot-toast";
import { useInstitution } from "./InstitutionContext";

export type UserRole = 'admin' | "student" | "employer" | "main_admin" | "alumni";

export type IUser = {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  registration_number?: string,
  institution_name?: string;
  institution_id?: number
  wallet_address?: string;
  is_verified?: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type AddUserData = {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  registration_number?: string
  institution_name?: string;
  // wallet_address?: string;
};

export interface UsersContextType {
  users: IUser[];
  loading: boolean;
  message: string;
  institutionUsers: IUser[]
  getUsers: () => Promise<void>;
  getUsersById: (institutionId: number, roles: string[]) => Promise<IUser[] | null>;
  addUsers: (data: AddUserData) => Promise<void>;
  updateUsersById: (userId: string, data: Partial<AddUserData>) => Promise<void>;
  updateAdminStatus: (userId: number, is_verified: boolean) => Promise<void>;
  deleteUsersById: (userId: number) => Promise<void>;
  runMutation: <T>(action: () => Promise<T>, successMessage?: string) => Promise<T | undefined>;
}

interface Props {
  children: ReactNode;
}

const UsersContext = createContext<UsersContextType | null>(null);

export function UsersProvider({ children }: Props) {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [institutionUsers, setInstitutionUsers] = useState<IUser[]>([])
   const requestRef = useRef(0);
   const { user} = useAuth()
   const { getInstitutions } = useInstitution()

  const refreshInstitutions = () => {
     if (user?.role === "systemAdmin") void getInstitutions();
   };


   const getUsers = useCallback(async (): Promise<void> => {
    const requestId = ++requestRef.current;
    try {
      setLoading(true);
      const response = await api.get("/users/", { withCredentials: true });
      if (requestId !== requestRef.current) return; // a newer request replaced this one

      const data = response.data;
      setUsers(Array.isArray(data) ? data : data?.users ?? []);
    } catch (error: any) {
      if (requestId !== requestRef.current) return;
      setUsers([]);
      setMessage(error.response?.data?.error || error.response?.data?.message || "Error fetching users");
      console.error("Error fetching users", error);
    } finally {
      if (requestId === requestRef.current) setLoading(false);
    }
  }, []);

   useEffect(() => {
    if (!user) {
      requestRef.current++; // cancel any in-flight response
      setUsers([]);
      setLoading(false);
      return;
    }
    void getUsers();
  }, [user?.id, getUsers]);

  const runMutation = useCallback(
    async <T,>(action: () => Promise<T>, successMessage?: string): Promise<T | undefined> => {
      try {
        const result = await action();
        if (successMessage) toast.success(successMessage);
        await getUsers();
        return result;
      } catch (error: any) {
        toast.error(error.response?.data?.error || "Something went wrong");
        return undefined;
      }
    },
    [getUsers]
  );

  // this is not needed at the moment
    const getUsersById = async (institutionId: number, roles: string[]): Promise<IUser[] | null> => {
      try {
        const response = await api.get(`/users/${institutionId}`,
          {
            params: { roles },
            withCredentials: true,
          }
        );

        setInstitutionUsers(response.data.user);
        return response.data.user ?? null;
      } catch (error: any) {
        setMessage(error.response?.data?.error || error.response?.data?.message || "Error fetching institution users");
        console.error("Error fetching institution users", error);
        return null;
      }
    };


  const addUsers = async (data: AddUserData): Promise<void> => {
    try {
      setLoading(true);
      const response = await api.post("/users/add", data, { withCredentials: true });
      setMessage(response.data?.message || "User registered successfully");
      await getUsers();
      refreshInstitutions()
    } catch (error: any) {
      setMessage(error.response?.data?.error || error.response?.data?.message || "Failed to add user");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUsersById = async (userId: string, data: Partial<AddUserData>): Promise<void> => {
    try {
      setLoading(true);
      await api.put(`/users/${userId}`, data, { withCredentials: true });
      setMessage("User updated successfully");
      await getUsers();
    } catch (error: any) {
      setMessage(error.response?.data?.error || error.response?.data?.message || "Failed to update the user");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateAdminStatus = async (userId: number, is_verified: boolean) => {
    try {
      await api.patch(`/users/${userId}/status`, { is_verified }, { withCredentials: true });
      await getUsers();
    } catch (error: any) {
      setMessage(error.response?.data?.error || error.response?.data?.message || "Failed to update the admin status");
      throw error;
    }
  }

  const deleteUsersById = async (userId: number): Promise<void> => {
    try {
      setLoading(true);
      await api.delete(`/users/${userId}`, { withCredentials: true });
      setMessage("User deleted successfully");
      await getUsers(); 
    } catch (error: any) {
      setMessage(error.response?.data?.error || error.response?.data?.message || "Failed to delete the user");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <UsersContext.Provider value={{
      users,
      loading,
      message,
      institutionUsers,
      getUsers,
      getUsersById,
      addUsers,
      updateUsersById,
      updateAdminStatus,
      deleteUsersById,
      runMutation
    }}>
      {children}
    </UsersContext.Provider>
  );
}

export const useUsers = () => {
  const context = useContext(UsersContext);
  if (!context) throw new Error("useUsers must be used within UsersProvider");
  return context;
};

export default useUsers;