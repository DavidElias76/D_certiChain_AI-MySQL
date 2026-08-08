import api from "../services/api";
import { useContext, useState, createContext, useEffect, type ReactNode } from "react";

export type UserRole = 'admin' | "student" | "employer";

export type IUser = {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  institutionName?: string;
  wallet_address?: string;
  isVerified?: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type AddUserData = {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  institutionName?: string;
  wallet_address?: string;
};

export interface UsersContextType {
  users: IUser[];
  loading: boolean;
  message: string;
  getUsers: () => Promise<void>;
  getUserById: (userId: string) => Promise<IUser | null>;
  addUsers: (data: AddUserData) => Promise<void>;
  updateUsersById: (userId: string, data: Partial<AddUserData>) => Promise<void>;
  deleteUsersById: (userId: string) => Promise<void>;
}

interface Props {
  children: ReactNode;
}

const UsersContext = createContext<UsersContextType | null>(null);

export function UsersProvider({ children }: Props) {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  // Fetch all users on mount - caching will be implemented to prevent the users request being sent to the database
  useEffect(() => {
    getUsers();
  }, []);

  const getUsers = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await api.get("/users/", { withCredentials: true });
      const data = response.data
      const userList = Array.isArray(data) ? data : (data?.user || data?.users || []);
      setUsers(userList);
      setUsers(response.data)
    } catch (error) {
      setUsers([]);
      console.error("Error fetching users", error);
    } finally {
      setLoading(false);
    }
  };

  const getUserById = async (userId: string): Promise<IUser | null> => {
    try {
      const response = await api.get(`/users/${userId}`, { withCredentials: true });
      return response.data?.user || null;
    } catch (error) {
      console.error("Error fetching user by ID", error);
      return null;
    }
  };

  const addUsers = async (data: AddUserData): Promise<void> => {
    try {
      setLoading(true);
      const response = await api.post("/users/add", data, { withCredentials: true });
      setMessage(response.data?.message || "User added successfully");
      await getUsers();
    } catch (error: any) {
      console.error("Error adding user", error);
      setMessage(error.response?.data?.message || "Failed to add user");
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
    } catch (error) {
      console.error("Error updating user", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteUsersById = async (userId: string): Promise<void> => {
    try {
      setLoading(true);
      await api.delete(`/users/${userId}`, { withCredentials: true });
      setMessage("User deleted successfully");
      await getUsers(); 
    } catch (error) {
      console.error("Error deleting user", error);
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
      getUsers,
      getUserById,
      addUsers,
      updateUsersById,
      deleteUsersById,
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