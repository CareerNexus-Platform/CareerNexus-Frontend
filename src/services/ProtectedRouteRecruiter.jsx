import RequireSession from '../components/RequireSession';
export default function ProtectedRouteRecruiter({ children }) { return <RequireSession role="recruiter">{children}</RequireSession>; }
