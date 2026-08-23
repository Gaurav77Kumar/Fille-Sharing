import axios from "axios";

const baseURL =  import.meta.env.VITE_BACKEND_URL 

if(!baseURL){
  throw new Error("VITE_BACKEND_URL is not defined in the environment variables.");
}

const API = axios.create({
  baseURL,
  withCredentials: true,
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.startsWith("/login")) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default API;