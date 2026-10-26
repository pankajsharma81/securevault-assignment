import { useEffect, useState } from "react";
import { useSession } from "../lib/session";
import { shareFile, listAcl, revokeAccess } from "../lib/share";

interface AclItem {
  userId: string;
  email: string;
  role: string;
}

export default function ShareBox({ fileId, onClose }: { fileId: string; onClose: () => void }) {
  const { session } = useSession();
  const [email, setEmail] = useState("");
  const [acl, setAcl] = useState<AclItem[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => listAcl(fileId).then(setAcl).catch((e) => setError(e.message));
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
    <div style={{ marginTop: 16, padding: 12, border: "1px solid #ccc" }}>
      <b>Share</b> <button onClick={onClose}>Close</button>
      <div style={{ margin: "8px 0" }}>
        <input placeholder="recipient email" value={email} onChange={(e) => setEmail(e.target.value)} />{" "}
        <button disabled={busy || !email} onClick={share}>Share</button>
      </div>
      {error && <p style={{ color: "crimson" }}>{error}</p>}
      <table cellPadding={6}>
        <tbody>
          {acl.map((a) => (
            <tr key={a.userId}>
              <td>{a.email}</td>
              <td>{a.role}</td>
              <td>{a.role !== "owner" && <button onClick={() => revoke(a.userId)}>Revoke</button>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}