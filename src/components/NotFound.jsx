import { Link } from "react-router-dom";
import { Compass, ArrowLeft } from "lucide-react";
export default function NotFound() {
  return (
    <main className="cn-recovery">
      <div className="cn-recovery-card">
        <Compass size={38} className="mx-auto text-brand-600 mb-6" />
        <span className="cn-eyebrow">A SMALL DETOUR</span>
        <h1>Let's find your way back.</h1>
        <p>
          This page has moved or doesn't exist. Your next chapter is still
          waiting.
        </p>
        <Link className="cn-button mt-5" to="/">
          <ArrowLeft size={16} />
          Back to CareerNexus
        </Link>
      </div>
    </main>
  );
}
