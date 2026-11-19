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

api.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

api.interceptors.request.use((config) => {
  if ( !(config as any)._retry && inMemoryToken && config.headers) {
    config.headers.Authorization = `Bearer ${inMemoryToken}`;
  }else {
    config.headers.Authorization
  }
  return config;
});

export default api;
