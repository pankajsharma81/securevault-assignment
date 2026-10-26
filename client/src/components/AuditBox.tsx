
import { useEffect, useState } from "react";
import { api } from "../lib/api";

interface Log {
  id: string;
  action: string;
  actor: string | null;
  target: string | null;
  at: string;
}

export default function AuditBox({
  fileId,
  onClose,
}: {
  fileId: string;
  onClose: () => void;
}) {
  const [logs, setLogs] = useState<Log[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Log[]>(`/audit/${fileId}`)
      .then(setLogs)
      .catch((e) => setError(e.message));
  }, [fileId]);

  return (
    <section className="management-panel">
      <header className="management-panel-header">
        <div className="management-panel-title">
          <div className="management-panel-icon audit-panel-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M4 5h16v15H4zM8 9h8M8 13h8M8 17h4"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 2v3m8-3v3"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div>
            <h3>Audit log</h3>
            <p>Activity recorded for this file.</p>
          </div>
        </div>

        <button
          className="management-close"
          type="button"
          onClick={onClose}
          aria-label="Close audit log"
        >
          ×
        </button>
      </header>

      {error && (
        <div className="management-error" role="alert">
          {error}
        </div>
      )}

      {!error && logs.length === 0 ? (
        <div className="management-empty">
          No activity entries to display.
        </div>
      ) : (
        <div className="audit-table-wrap">
          <table className="audit-table">
            <thead>
              <tr>
                <th>Date and time</th>
                <th>Action</th>
                <th>Actor</th>
                <th>Target</th>
              </tr>
            </thead>

            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="audit-date">
                    {new Date(log.at).toLocaleString()}
                  </td>
                  <td>
                    <span className="audit-action">{log.action}</span>
                  </td>
                  <td>{log.actor || "—"}</td>
                  <td>{log.target || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
