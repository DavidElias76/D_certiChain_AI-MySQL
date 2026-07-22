import api from "../services/api";
import { useContext, useState, createContext, useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";

export interface User {
  id: number;
  username: string;
  role: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role: string;
  institution_name?: string;
}

interface VerifyResponse {
  user: User;
}

interface SendOtpCodeType {
    message: string,
    error: string
    success?: boolean
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  register: (data: RegisterData) => Promise<void>;
  logIn: (data: LoginData) => Promise<any>;
  logOut: () => Promise<void>;
  error: string
  message: string,
  sendOtpCode: (email: string) => Promise<SendOtpCodeType>
  verfiyOtpCode: (OtpCode: number, email: string) => Promise<SendOtpCodeType>
  resetPassword: (password: string, email: string) => Promise<SendOtpCodeType>
}

interface Props {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [ error, setError] = useState<string>('')
  const [ message, setMessage ] = useState<string>('')

  const navigate = useNavigate();

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const response = await api.get<VerifyResponse>("/auth/verify", {
          withCredentials: true,
        });
        if (response?.data?.user) {
          setUser(response.data.user);
        } else {
          setLoading(false);
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, []);

  const register = async (data: RegisterData): Promise<void> => {
    try {
      const response = await api.post("/auth/register", data, {
        withCredentials: true,
      });
      setUser(response.data.user);
      setError(response.data.error)
    } catch (error) {
      console.error("Registration error", error);
      throw error;
    }
  };

  const logIn = async (data: LoginData): Promise<any> => {
    try {
      const response = await api.post("/auth/login", data, {
        withCredentials: true,
      });
      setError(error)
      const userData = response?.data?.user || null;
      console.log(userData);
      setUser(userData);

      // Redirect based on role after login
      if (userData?.role === "systemAdmin") {
        navigate("/system/admin/dashboard", { replace: true });
      } else if (userData?.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }

      return response.data;
    } catch (error: any) {
      console.error("Login error", error);
      setUser(null);
      throw error;
    }
  };

  const logOut = async (): Promise<void> => {
    try {
      await api.post("/auth/logout", {}, { withCredentials: true });
      setUser(null);
      setError(error)
    } catch {
      setUser(null); // Force logout even if API fails
    }
  };

  // send the otp code
  const sendOtpCode = async (email: string) => {
    try {
      const response = await api.post("/auth/forgot-password", { email: email.trim().toLowerCase() }, { withCredentials: true });
      setMessage(response.data.message)
      setError(response.data.error)
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // send the verify email and set the value of is_verifed to true

  const verfiyOtpCode = async(otp: number, email: string) => {
    try {
      const response = await api.post("/verfiy-forgot-password-otp",
        { OptCode: Number(otp), email: email.trim().toLowerCase()},
        { withCredentials: true })
      if(response.data.success === true){
          setMessage(response.data.message)
      } else {
        setMessage(response.data.message)
        setError(response.data.error)
      }
      return response.data;
    } catch (error) {
      throw error
    }
  }

  // reset the password
  const resetPassword = async (password: string, email: string): Promise<SendOtpCodeType> => {
    try {
      const response = await api.post(
        "/auth/reset-password",
        { password, email: email.trim().toLowerCase() },
        { withCredentials: true }
      );
      setMessage(response.data?.message);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, register, logIn, logOut, error, message, sendOtpCode, verfiyOtpCode, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export default useAuth;