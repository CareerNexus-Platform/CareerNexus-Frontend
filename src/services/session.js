import { jwtDecode } from "jwt-decode";

export function getSession(storage = localStorage, now = Date.now()) {
  try {
    const token = storage.getItem("token");
    const claims = jwtDecode(token);
    const role = String(claims.role || "").toLowerCase();
    const userId = String(claims.sub || "");
    if (
      !["student", "recruiter", "tpo", "admin"].includes(role) ||
      !userId ||
      !claims.exp ||
      claims.exp * 1000 <= now
    )
      return null;
    if (
      storage.getItem("userId") !== userId ||
      storage.getItem("role")?.toLowerCase() !== role
    )
      return null;
    return { token, role, userId, expiresAt: claims.exp * 1000 };
  } catch {
    return null;
  }
}

export function workspaceHome(session) {
  return session?.role === "admin"
    ? "/admin"
    : session
      ? `/${session.role}/${encodeURIComponent(session.userId)}/home`
      : "/student/login";
}

export function safeReturnPath(path, session) {
  if (
    !path ||
    !session ||
    !path.startsWith("/") ||
    path.startsWith("//") ||
    path.includes("\\")
  )
    return null;
  let pathname;
  try {
    pathname = new URL(path, "https://careernexus.local").pathname;
    if (
      decodeURIComponent(path.split("?")[0])
        .split("/")
        .some((part) => part === ".." || part === ".")
    )
      return null;
  } catch {
    return null;
  }
  if (session.role === "admin")
    return /^\/admin(?:\/|$)/.test(pathname) ? path : null;
  const base = `/${session.role}/${encodeURIComponent(session.userId)}`;
  const shared =
    session.role === "student"
      ? ["/student/resources", "/student/practice"]
      : [];
  return pathname === base ||
    pathname.startsWith(base + "/") ||
    shared.includes(pathname)
    ? path
    : null;
}

export function clearSession(storage = localStorage) {
  ["token", "userId", "role"].forEach((key) => storage.removeItem(key));
}
