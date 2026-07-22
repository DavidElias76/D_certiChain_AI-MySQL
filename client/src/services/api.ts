import axios from "axios"
import type { AxiosError, AxiosInstance, AxiosResponse } from "axios";

const api: AxiosInstance = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: { "Content-Type": "application/json" }
});

// Global response interceptor - using the cookies - The browser handles the cookies removal
api.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
        // This causes the login page to loop - let the authcontext handle the error
        // if (error.response?.status === 401) {
        //     window.location.href = "/login"; // this can be set to the landing page or the login page
        // }
        return Promise.reject(error);
    }
);

export default api;

// This get the interception when the request sends the token to be saved on the localstorage
// api.interceptors.request.use((config) => {
//   let token = localStorage.getItem('token')
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config; 
// })

// // This is used for the bearer token authorization
// // Handle 401 globally
// api.interceptors.response.use(
//   (res) => res, 
//   (err) => {
// The status is causing an error and causing the log in page to reload
//   if(err.response?.status === 401) {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     window.location.href = "/login";
//   }
//  return promise.reject(error) - let the authcontext handle the error
// })