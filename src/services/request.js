import axios from "axios";
import { apiBaseUrl } from "./apiConfig";
import { getSession } from "./session";
const requestApi = axios.create({ baseURL: apiBaseUrl, timeout: 30000 });
requestApi.interceptors.request.use((config) => {
  const session = getSession();
  if (session) config.headers.Authorization = `Bearer ${session.token}`;
  else if (localStorage.getItem("token"))
    window.dispatchEvent(new Event("careernexus:session-expired"));
  if (config.data instanceof FormData) delete config.headers["Content-Type"];
  return config;
});
requestApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem("token"))
      window.dispatchEvent(new Event("careernexus:session-expired"));
    return Promise.reject(error);
  },
);
export default requestApi;
