
import { useEffect, useState } from "react";
import { useSession } from "../lib/session";
import { shareFile, listAcl, revokeAccess } from "../lib/share";

interface AclItem {
  userId: string;
  email: string;
  role: string;
}

export default function ShareBox({
  fileId,
  onClose,
}: {
  fileId: string;
  onClose: () => void;
}) {
  const { session } = useSession();
  const [email, setEmail] = useState("");
  const [acl, setAcl] = useState<AclItem[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () =>
    listAcl(fileId)
      .then(setAcl)
      .catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, [fileId]);

  const share = async () => {
    setError("");
    setBusy(true);

    try {
      await shareFile(fileId, email.trim().toLowerCase(), session!.privateKey);
      setEmail("");
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const revoke = async (userId: string) => {
    setError("");

    try {
      await revokeAccess(fileId, userId);
      await load();
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <section className="management-panel">
      <header className="management-panel-header">
        <div className="management-panel-title">
          <div className="management-panel-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <circle
                cx="18"
                cy="5"
                r="3"
                stroke="currentColor"
                strokeWidth="1.7"
              />
              <circle
                cx="6"
                cy="12"
                r="3"
                stroke="currentColor"
                strokeWidth="1.7"
              />
              <circle
                cx="18"
                cy="19"
                r="3"
                stroke="currentColor"
                strokeWidth="1.7"
              />
              <path
                d="m8.7 10.6 6.6-4.2M8.7 13.4l6.6 4.2"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div>
            <h3>Share access</h3>
            <p>Manage who can access this file.</p>
          </div>
        </div>

        <button
          className="management-close"
          type="button"
          onClick={onClose}
          aria-label="Close share panel"
        >
          ×
        </button>
      </header>

      <div className="share-form">
        <label htmlFor="share-recipient">Recipient email</label>

        <div className="share-form-row">
          <input
            id="share-recipient"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            type="button"
            disabled={busy || !email.trim()}
            onClick={share}
          >
            {busy ? "Sharing..." : "Share file"}
          </button>
        </div>

        <p className="management-hint">
          Share access with a registered user by email.
        </p>
      </div>

      {error && (
        <div className="management-error" role="alert">
          {error}
        </div>
      )}

      <div className="access-list-header">
        <h4>People with access</h4>
        <span>{acl.length}</span>
      </div>

      {acl.length === 0 ? (
        <div className="management-empty">
          No access entries to display.
        </div>
      ) : (
        <div className="access-list">
          {acl.map((a) => (
            <div className="access-person" key={a.userId}>
              <div className="access-avatar" aria-hidden="true">
                {a.email.charAt(0).toUpperCase()}
              </div>

              <div className="access-person-details">
                <span className="access-person-email">{a.email}</span>
                <span className="access-person-role">{a.role}</span>
              </div>

              {a.role !== "owner" && (
                <button
                  className="revoke-button"
                  type="button"
                  onClick={() => revoke(a.userId)}
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}