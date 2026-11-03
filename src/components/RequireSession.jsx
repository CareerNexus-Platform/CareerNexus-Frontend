import { Navigate, useLocation, useParams } from "react-router-dom";
import { getSession, workspaceHome } from "../services/session";

export default function RequireSession({ role, children }) {
  const location = useLocation();
  const params = useParams();
  const session = getSession();
  if (!session)
    return (
      <Navigate
        to={role === "admin" ? "/tpo/login" : `/${role}/login`}
        replace
        state={{
          from: location.pathname + location.search,
          expired: Boolean(localStorage.getItem("token")),
        }}
      />
    );
  if (
    session.role !== role ||
    ((params.userId || params.userid) &&
      (params.userId || params.userid) !== session.userId)
  )
    return <Navigate to={workspaceHome(session)} replace />;
  return children;
}
