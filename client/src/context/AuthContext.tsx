import api, { setApiToken } from "../services/api";
import { useContext, useState, createContext, useEffect, type ReactNode, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import  type { AxiosRequestConfig, AxiosError } from "axios"

export interface User {
  id: number;
  username: string;
  role: string;
  email?: string;
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

// interface VerifyResponse {
//   user: User;
// }

interface SendOtpCodeType {
  message: string;
  error: string;
  success?: boolean;
}

interface authResponse {
  message?: string;
  user: User;
  accessToken: string;
}

interface VerifyResponseType {
  authenticated: boolean,
  message: string,
  user: User
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  register: (data: RegisterData) => Promise<authResponse>;
  logIn: (data: LoginData) => Promise<authResponse>;
  logOut: () => Promise<void>;
  error: string;
  message: string;
  token: string | null;
  sendOtpCode: (email: string) => Promise<SendOtpCodeType>;
  verfiyOtpCode: (OtpCode: number, email: string) => Promise<SendOtpCodeType>;
  resetPassword: (password: string, email: string) => Promise<SendOtpCodeType>;
  updateWalletAddress: (wallet_address: string) => Promise<void>;
}

interface Props {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [token, setToken] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const bootstrapAuth = async () => {
      try {
        setLoading(true);
        let currentToken = token;

        if (!currentToken) {
          const refreshResponse = await api.post(
            "/auth/refresh",
            {},
            { withCredentials: true }
          );
          currentToken = refreshResponse.data.accessToken;
          if (!isMounted) return;
          setToken(currentToken);
          setApiToken(currentToken);
        }

        const verifyResponse = await api.get<VerifyResponseType>("/auth/verify", {
          withCredentials: true,
          headers: { Authorization: `Bearer ${currentToken}` },
        });

        if (!isMounted) return;

        if (verifyResponse.data?.user) {
          setUser(verifyResponse.data.user);
        } else {
          setUser(null);
          setToken(null);
          setApiToken(null);
        }
      } catch (err: any) {
        if (!isMounted) return;
        const msg =
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to authenticate the user";
        setError(msg);
        setUser(null);
        setToken(null);
        setApiToken(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    bootstrapAuth();
    return () => { isMounted = false; };
}, []);

  useLayoutEffect(() => {
    let isRefreshing = false;
    let failedQueue: {
      resolve: (token: string) => void;
      reject: (err: unknown) => void;
    }[] = [];

    const processQueue = (error: unknown, newToken: string | null = null) => {
      failedQueue.forEach(({ resolve, reject }) => {
        if (error || !newToken) reject(error);
        else resolve(newToken);
      });
      failedQueue = [];
    };

    const refreshInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        const status = error.response?.status; 
        const isAuthEndpoint = originalRequest.url?.includes("/auth/refresh");

        if (status !== 401 || originalRequest._retry || isAuthEndpoint) {  
          return Promise.reject(error);
        }

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({
              resolve: (newToken: string) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${newToken}`;
                }
                resolve(api(originalRequest));
              },
              reject,
            });
          });
        }
        
        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshResponse = await api.post(
            "/auth/refresh",
            {},
            { withCredentials: true }
          );
          const newToken = refreshResponse.data.accessToken;

          setToken(newToken);
          setApiToken(newToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }

          processQueue(null, newToken);
          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          setUser(null);
          setToken(null);
          setApiToken(null);
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
    );
    return () => {
      api.interceptors.response.eject(refreshInterceptor);
    };
  }, []);


  const logIn = async (data: LoginData): Promise<authResponse> => {
    try {
      setError("");
      const response = await api.post("/auth/login", 
        data, 
        { withCredentials: true }
      );

      if (response?.data?.accessToken) {
        setToken(response.data.accessToken); 
        setApiToken(response.data.accessToken);
      }
      const userData = response?.data?.user || null;
      setUser(userData);
      
      if (userData?.role === "systemAdmin") {
        navigate("/system/admin/dashboard", { replace: true });
      } else if (userData?.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
      
      return response.data;
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.message || "Login failed";
      setError(msg);
      setUser(null);
      throw err;
    }
  };

  const register = async (data: RegisterData): Promise<authResponse> => {
    try {
      setError("");
      const response = await api.post("/auth/register", data, {
        withCredentials: true,
      });
      if (response?.data?.accessToken) {
        setToken(response.data.accessToken);
        setApiToken(response.data.accessToken);
      }
      setUser(response.data.user);
      return response.data;
    } catch (err: any) {
      const msg = err.response?.data?.error || "Registration failed";
      setError(msg);
      throw err;
    }
  };

  const logOut = async (): Promise<void> => {
    try {
      await api.post("/auth/logout", {}, { withCredentials: true });
    } catch {
      setUser(null);
    } finally {
      setToken(null);
      setApiToken(null);
      setUser(null);
      setError("");
      setMessage("");
      navigate("/login", { replace: true });
    }
  };

  const sendOtpCode = async (email: string): Promise<SendOtpCodeType> => {
    try {
      const response = await api.post(
        "/auth/forgot-password",
        { email: email.trim().toLowerCase() },
        { withCredentials: true }
      );
      setMessage(response.data.message || "");
      return response.data;
    } catch (err: any) {
      const msg = err.response?.data?.error || "Failed to send OTP";
      throw { error: msg } as SendOtpCodeType;
    }
  };

  const verfiyOtpCode = async (
    otp: number,
    email: string
  ): Promise<SendOtpCodeType> => {
    try {
      const response = await api.post(
        "/auth/verfiy-forgot-password-otp",
        { OptCode: Number(otp), email: email.trim().toLowerCase() },
        { withCredentials: true }
      );
      if (response.data.success === true) {
        setMessage(response.data.message || "");
      } else {
        setMessage(response.data.message || "");
      }
      return response.data;
    } catch (err: any) {
      const msg = err.response?.data?.error || "Verification failed";
      throw { error: msg } as SendOtpCodeType;
    }
  };

  const resetPassword = async (
    email: string,
    password: string
  ): Promise<SendOtpCodeType> => {
    try {
      const response = await api.post(
        "/auth/reset-password",
        { password, email: email.trim().toLowerCase() },
        { withCredentials: true }
      );
      setMessage(response.data?.message || "");
      return response.data;
    } catch (err: any) {
      const msg = err.response?.data?.error || "Reset failed";
      throw { error: msg } as SendOtpCodeType;
    }
  };

  // This need to be institituon in the instituion and not the users - user do not get the wallet address
  const updateWalletAddress = async (wallet_address: string): Promise<void> => {
    if (!user) {
      throw new Error("User is not authenticated");
    }
    try {
      const response = await api.put(
        `/auth/wallet/${user.id}`,
        { wallet_address },
        { withCredentials: true, headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      setMessage(response.data.message || "Wallet updated");
    } catch (err: any) {
      const msg = err.response?.data?.error || "Failed to update wallet";
      throw new Error(msg);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        register,
        logIn,
        logOut,
        error,
        message,
        sendOtpCode,
        verfiyOtpCode,
        resetPassword,
        updateWalletAddress,
      }}
    >
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
