import { useState } from "react";
import { useSession } from "../lib/session";
import { uploadFile } from "../lib/upload";

export default function UploadBox({ onDone }: { onDone: () => void }) {
  const { session } = useSession();
  const [pct, setPct] = useState<number | null>(null);
  const [error, setError] = useState("");

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session) return;
    setError("");
    setPct(0);
    try {
      await uploadFile(file, { privateKey: session.privateKey, publicKey: session.user.publicKey }, setPct);
      onDone();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPct(null);
      e.target.value = "";
    }
  };

  return (
    <div>
      <input type="file" onChange={onPick} disabled={pct !== null} />
      {pct !== null && <span> Uploading… {pct}%</span>}
      {error && <p style={{ color: "crimson" }}>{error}</p>}
    </div>
  );
}