
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
  n >= 1e6
    ? (n / 1e6).toFixed(1) + " MB"
    : n >= 1e3
      ? (n / 1e3).toFixed(1) + " KB"
      : n + " B";

export default function FileList({
  refreshKey,
}: {
  refreshKey: number;
}) {
  const { session } = useSession();

  const [items, setItems] = useState<Item[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pct, setPct] = useState(0);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<{
    url: string;
    name: string;
  } | null>(null);
  const [shareId, setShareId] = useState<string | null>(null);
  const [auditId, setAuditId] = useState<string | null>(null);

  useEffect(() => {
    setError("");

    api<Item[]>("/files")
      .then(setItems)
      .catch((e) => setError(e.message));
  }, [refreshKey]);

  const closePreview = () => {
    if (preview) {
      URL.revokeObjectURL(preview.url);
    }

    setPreview(null);
  };

  const run = async (
    item: Item,
    mode: "download" | "preview",
  ) => {
    setError("");
    setBusyId(item.id);
    setPct(0);

    try {
      const { name, blob } = await downloadFile(
        item.id,
        session!.privateKey,
        setPct,
      );

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
    } catch (e: unknown) {
      setError(
        e instanceof Error
          ? e.message
          : "Unable to process this file.",
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="file-manager">
      <div className="file-manager-heading">
        <div>
          <h3>Stored documents</h3>
          <p>View, download, preview, and share your files.</p>
        </div>

        <span className="file-count">
          {items.length} {items.length === 1 ? "file" : "files"}
        </span>
      </div>

      {error && (
        <div
          className="file-message file-message-error"
          role="alert"
        >
          {error}
        </div>
      )}

      {items.length === 0 && !error ? (
        <div className="file-empty">
          <div className="file-empty-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M6 3.75h8l4 4V20a.75.75 0 0 1-.75.75h-10.5A.75.75 0 0 1 6 20V3.75Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path
                d="M14 4v4h4M9 13h6m-6 3h6"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <strong>No files yet</strong>
          <p>Upload your first file to see it here.</p>
        </div>
      ) : items.length > 0 ? (
        <div className="file-table-wrap">
          <table className="file-table">
            <thead>
              <tr>
                <th>File</th>
                <th>Size</th>
                <th>Access</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {items.map((f) => (
                <tr key={f.id}>
                  <td>
                    <div className="file-name-cell">
                      <div
                        className="file-type-icon"
                        aria-hidden="true"
                      >
                        <svg viewBox="0 0 24 24" fill="none">
                          <path
                            d="M6 3.75h8l4 4V20a.75.75 0 0 1-.75.75h-10.5A.75.75 0 0 1 6 20V3.75Z"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M14 4v4h4"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>

                      <span className="file-name" title={f.name}>
                        {f.name}
                      </span>
                    </div>
                  </td>

                  <td className="file-size">{fmt(f.size)}</td>

                  <td>
                    <span
                      className={
                        "file-role " +
                        (f.role === "owner"
                          ? "file-role-owner"
                          : "file-role-viewer")
                      }
                    >
                      {f.role === "owner" ? "Owner" : "Viewer"}
                    </span>
                  </td>

                  <td>
                    <span
                      className={
                        "file-status " +
                        (f.status === "complete"
                          ? "file-status-complete"
                          : "file-status-incomplete")
                      }
                    >
                      <span className="file-status-dot" />
                      {f.status === "complete"
                        ? "Ready"
                        : "Incomplete"}
                    </span>

                    {busyId === f.id && (
                      <div className="file-progress">
                        <div
                          className="file-progress-bar"
                          style={{ width: `${pct}%` }}
                        />
                        <span>{pct}%</span>
                      </div>
                    )}
                  </td>

                  <td>
                    <div className="file-actions">
                      {f.status === "complete" && (
                        <>
                          <button
                            className="file-action-primary"
                            disabled={busyId !== null}
                            onClick={() => run(f, "download")}
                          >
                            Download
                          </button>

                          {f.mimeType === "application/pdf" && (
                            <button
                              className="file-action-secondary"
                              disabled={busyId !== null}
                              onClick={() => run(f, "preview")}
                            >
                              Preview
                            </button>
                          )}

                          {f.role === "owner" && (
                            <>
                              <button
                                className="file-action-secondary"
                                onClick={() => setShareId(f.id)}
                              >
                                Share
                              </button>

                              <button
                                className="file-action-secondary"
                                onClick={() => setAuditId(f.id)}
                              >
                                Audit
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {shareId && (
        <ShareBox
          fileId={shareId}
          onClose={() => setShareId(null)}
        />
      )}

      {auditId && (
        <AuditBox
          fileId={auditId}
          onClose={() => setAuditId(null)}
        />
      )}

      {preview && (
        <div className="file-preview-panel">
          <div className="file-preview-heading">
            <div>
              <span className="section-eyebrow">
                DOCUMENT PREVIEW
              </span>
              <h3>{preview.name}</h3>
            </div>

            <button
              className="secondary"
              onClick={closePreview}
            >
              Close preview
            </button>
          </div>

          <iframe
            src={preview.url}
            title={`Preview of ${preview.name}`}
            className="file-preview-frame"
          />
        </div>
      )}
    </div>
  );
}