import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useSession } from "../lib/session";
import { downloadFile } from "../lib/download";
import ShareBox from "./ShareBox";
import AuditBox from "./AuditBox";

interface Item {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  status: string;
  role: "owner" | "viewer";
}

const fmt = (n: number) =>
  n > 1e6 ? (n / 1e6).toFixed(1) + " MB" : n > 1e3 ? (n / 1e3).toFixed(1) + " KB" : n + " B";

export default function FileList({ refreshKey }: { refreshKey: number }) {
  const { session } = useSession();
  const [items, setItems] = useState<Item[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pct, setPct] = useState(0);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<{ url: string; name: string } | null>(null);
  const [shareId, setShareId] = useState<string | null>(null);
  const [auditId, setAuditId] = useState<string | null>(null);

  useEffect(() => {
    api<Item[]>("/files").then(setItems).catch((e) => setError(e.message));
  }, [refreshKey]);

  const closePreview = () => {
    if (preview) URL.revokeObjectURL(preview.url);
    setPreview(null);
  };

  const run = async (item: Item, mode: "download" | "preview") => {
    setError("");
    setBusyId(item.id);
    setPct(0);
    try {
      const { name, blob } = await downloadFile(item.id, session!.privateKey, setPct);
      const url = URL.createObjectURL(blob);
      if (mode === "preview") {
        closePreview();
        setPreview({ url, name });
      } else {
        const a = document.createElement("a");
        a.href = url;
        a.download = name;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <h3>My files</h3>
      {error && <p style={{ color: "crimson" }}>{error}</p>}
      <table cellPadding={6}>
        <tbody>
          {items.map((f) => (
            <tr key={f.id}>
              <td>{f.name}</td>
              <td>{fmt(f.size)}</td>
              <td>{f.role}</td>
              <td>{f.status !== "complete" ? "incomplete" : ""}</td>
              <td>
                {f.status === "complete" && (
                  <>
                    <button disabled={busyId !== null} onClick={() => run(f, "download")}>Download</button>{" "}
                    {f.mimeType === "application/pdf" && (
                      <>
                        <button disabled={busyId !== null} onClick={() => run(f, "preview")}>Preview</button>{" "}
                      </>
                    )}
                    {f.role === "owner" && (
                      <>
                        <button onClick={() => setShareId(f.id)}>Share</button>{" "}
                        <button className="secondary" onClick={() => setAuditId(f.id)}>Audit</button>
                      </>
                    )}
                  </>
                )}
                {busyId === f.id && <span> {pct}%</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {shareId && <ShareBox fileId={shareId} onClose={() => setShareId(null)} />}
      {auditId && <AuditBox fileId={auditId} onClose={() => setAuditId(null)} />}

      {preview && (
        <div style={{ marginTop: 16 }}>
          <b>{preview.name}</b> <button onClick={closePreview}>Close</button>
          <iframe src={preview.url} title="preview" style={{ width: "100%", height: "80vh", border: "1px solid #ccc" }} />
        </div>
      )}
    </div>
  );
}