import { useEffect, useState } from "react";
import { api } from "../lib/api";

interface Log {
  id: string;
  action: string;
  actor: string | null;
  target: string | null;
  at: string;
}

export default function AuditBox({ fileId, onClose }: { fileId: string; onClose: () => void }) {
  const [logs, setLogs] = useState<Log[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Log[]>(`/audit/${fileId}`).then(setLogs).catch((e) => setError(e.message));
  }, [fileId]);

  return (
    <div style={{ marginTop: 16, padding: 12, border: "1px solid #ccc", borderRadius: 8 }}>
      <b>Audit log</b> <button className="secondary" onClick={onClose}>Close</button>
      {error && <p style={{ color: "crimson" }}>{error}</p>}
      <table cellPadding={6}>
        <tbody>
          {logs.map((l) => (
            <tr key={l.id}>
              <td>{new Date(l.at).toLocaleString()}</td>
              <td>{l.action}</td>
              <td>{l.actor}</td>
              <td>{l.target ? `→ ${l.target}` : ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!error && logs.length === 0 && <p>No activity yet.</p>}
    </div>
  );
}