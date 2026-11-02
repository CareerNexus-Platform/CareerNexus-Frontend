import { Link } from "react-router-dom";
import { ArrowLeft, KeyRound } from "lucide-react";
import { Brand } from "../../components/ui";
export default function StudentForgotPassword() {
  return (
    <main className="cn-recovery">
      <Brand />
      <div className="cn-recovery-card">
        <span className="cn-empty-icon">
          <KeyRound size={25} />
        </span>
        <span className="cn-eyebrow">LET'S GET YOU BACK ON TRACK</span>
        <h1>Need a hand signing in?</h1>
        <p>
          Password recovery is managed by your institution. Contact your
          placement officer or administrator with your roll number and
          registered email address to request account assistance.
        </p>
        <p className="cn-recovery-note">
          Self-service password reset isn't available yet.
        </p>
        <Link to="/student/login" className="cn-button">
          <ArrowLeft size={16} />
          Back to sign in
        </Link>
      </div>
    </main>
  );
}
