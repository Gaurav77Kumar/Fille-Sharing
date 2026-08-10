import axios from "axios";

const API = axios.create({
  baseURL: 'https://fille-sharing-43kp.onrender.com/api',
  withCCredentials: true,
});

export default API;