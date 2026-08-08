import axios from "axios";
import type { AxiosError, AxiosInstance, AxiosResponse } from "axios";

let inMemoryToken: string | null = null;

export const setApiToken = (newToken: string | null) => {
  inMemoryToken = newToken;
};

export const getApiToken = () => inMemoryToken;

const api: AxiosInstance = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: { "Content-Type": "application/json" }
});

// Global response interceptor
api.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Request interceptor to attach in-memory JWT token - This runs and check if the token is available and being sent to the server
// This runs every time there is a request that is being sent to the server so that the auth middleware gets to know the user

api.interceptors.request.use((config) => {
  if ( !(config as any)._retry && inMemoryToken && config.headers) {
    config.headers.Authorization = `Bearer ${inMemoryToken}`;
  }else {
    config.headers.Authorization
  }
  return config;
});




export default api;
