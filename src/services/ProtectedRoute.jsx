import RequireSession from '../components/RequireSession';
export default function ProtectedRoute({ children }) { return <RequireSession role="student">{children}</RequireSession>; }
