import { Navigate, useLocation } from "react-router-dom";
import { getSession, workspaceHome } from "../services/session";
export default function WorkspaceRedirect({ role, page = "home" }) {
  const session = getSession();
  const location = useLocation();
  if (!session) return <Navigate to={`/${role}/login`} replace />;
  if (session.role !== role)
    return <Navigate to={workspaceHome(session)} replace />;
  return (
    <Navigate
      to={`/${role}/${encodeURIComponent(session.userId)}/${page}${location.search}`}
      replace
    />
  );
}
