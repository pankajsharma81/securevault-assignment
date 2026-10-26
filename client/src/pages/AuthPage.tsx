import { useState } from "react";
import { useSession } from "../lib/session";

export default function AuthPage() {
  const { login, register } = useSession();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await (mode === "login" ? login : register)(email, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ maxWidth: 320, margin: "80px auto", display: "grid", gap: 12 }}>
      <h2>SecureVault — {mode === "login" ? "Login" : "Register"}</h2>
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
      <button disabled={busy}>{busy ? "Please wait…" : mode === "login" ? "Login" : "Create account"}</button>
      {error && <p style={{ color: "crimson" }}>{error}</p>}
      <a href="#" onClick={(e) => { e.preventDefault(); setMode(mode === "login" ? "register" : "login"); }}>
        {mode === "login" ? "New here? Register" : "Have an account? Login"}
      </a>
    </form>
  );
}