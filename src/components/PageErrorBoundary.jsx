import { Component } from "react";
import { RefreshCw } from "lucide-react";

export default class PageErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <div className="cn-recovery">
          <div className="cn-recovery-card" role="alert">
            <span className="cn-eyebrow">A SMALL BUMP IN THE ROAD</span>
            <h1>Let's try that again.</h1>
            <p>
              This page couldn't be displayed. Refresh to load your workspace
              again.
            </p>
            <button
              className="cn-button"
              onClick={() => window.location.reload()}
            >
              <RefreshCw size={16} />
              Refresh workspace
            </button>
          </div>
        </div>
      );
    return this.props.children;
  }
}
