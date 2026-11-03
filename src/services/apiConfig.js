import { resolveFileUrl } from "./fileUrls";
const host = import.meta.env.VITE_APP_BACKEND_HOST || "http://localhost";
const port = import.meta.env.VITE_APP_BACKEND_PORT;
const configured = import.meta.env.VITE_API_URL;
const url = new URL(configured || host, window.location.origin);
if (!configured && port && !url.port) url.port = port;
export const backendOrigin = url.origin;
export const apiBaseUrl = configured
  ? url.href.replace(/\/$/, "")
  : `${url.origin}/api`;
export const assetUrl = (value, folder) =>
  resolveFileUrl(value, backendOrigin, folder);
export function apiErrorMessage(
  error,
  fallback = "Something went wrong. Please try again.",
) {
  const data = error?.response?.data;
  if (typeof data === "string" && data.length < 250 && !data.startsWith("<"))
    return data;
  const message = data?.message || data?.error;
  return typeof message === "string"
    ? message
    : !error?.response
      ? "The server is unreachable. Check your connection and try again."
      : fallback;
}
