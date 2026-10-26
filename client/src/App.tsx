
import { SessionProvider, useSession } from "./lib/session";
import AuthPage from "./pages/AuthPage";
import { useState } from "react";
import UploadBox from "./components/UploadBox";
import FileList from "./components/FileList";

function Inner() {
  const { session, logout } = useSession();
  const [refreshKey, setRefreshKey] = useState(0);

  if (!session) return <AuthPage />;

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <div className="dashboard-logo" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <rect
                x="4"
                y="10"
                width="16"
                height="11"
                rx="2.5"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="M8 10V7a4 4 0 0 1 8 0v3"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <circle cx="12" cy="15" r="1.3" fill="currentColor" />
            </svg>
          </div>

          <div>
            <h1>SecureVault</h1>
            <p>Private file storage</p>
          </div>
        </div>

        <div className="dashboard-account">
          <div className="account-avatar" aria-hidden="true">
            {session.user.email.charAt(0).toUpperCase()}
          </div>

          <div className="account-details">
            <span className="account-label">Signed in as</span>
            <span className="account-email">{session.user.email}</span>
          </div>

          <button className="secondary logout-button" onClick={logout}>
            Log out
          </button>
        </div>
      </header>

      <section className="dashboard-welcome">
        <div>
          <span className="dashboard-eyebrow">YOUR PRIVATE WORKSPACE</span>
          <h2>Welcome to your vault</h2>
          <p>Upload, manage, and securely share your files.</p>
        </div>

        <div className="security-status">
          <span className="security-status-dot" />
          <span>Secure session</span>
        </div>
      </section>

      <section className="dashboard-content">
        <div className="card dashboard-upload-card">
          <div className="dashboard-section-title">
            <div>
              <span className="section-eyebrow">GET STARTED</span>
              <h3>Upload a file</h3>
              <p>Your file is encrypted before it is uploaded.</p>
            </div>

            <div className="section-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 16V4m0 0L7 9m5-5 5 5M5 15v4a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          <UploadBox onDone={() => setRefreshKey((k) => k + 1)} />
        </div>

        <div className="card dashboard-files-card">
          <div className="dashboard-section-title">
            <div>
              <span className="section-eyebrow">FILE MANAGEMENT</span>
              <h3>My files</h3>
              <p>Access and manage your stored files.</p>
            </div>

            <div className="section-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          <FileList refreshKey={refreshKey} />
        </div>
      </section>

      <footer className="dashboard-footer">
        <span>SecureVault</span>
        <span>Private file storage · Built for security</span>
      </footer>
    </main>
  );
}

export default function App() {
  return (
    <SessionProvider>
      <Inner />
    </SessionProvider>
  );
}
