import { useRef, useState } from "react";
import { useSession } from "../lib/session";
import { uploadFile } from "../lib/upload";

export default function UploadBox({ onDone }: { onDone: () => void }) {
  const { session } = useSession();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pct, setPct] = useState<number | null>(null);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file: File) => {
    if (!session) return;
    setError("");
    setPct(0);
    try {
      await uploadFile(file, { privateKey: session.privateKey, publicKey: session.user.publicKey }, setPct);
      onDone();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPct(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const busy = pct !== null;

  return (
    <div
      className={"drop" + (drag ? " active" : "")}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        const f = e.dataTransfer.files?.[0];
        if (f && !busy) handleFile(f);
      }}
      onClick={() => !busy && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        hidden
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
      {!busy ? (
        <p style={{ margin: 0 }}>Drag & drop a file here, or click to choose</p>
      ) : (
        <>
          <p style={{ margin: "0 0 8px" }}>Encrypting & uploading… {pct}%</p>
          <progress value={pct ?? 0} max={100} />
        </>
      )}
      {error && <p style={{ color: "crimson", marginBottom: 0 }}>{error}</p>}
    </div>
  );
}