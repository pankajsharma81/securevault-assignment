import { createContext, useContext, useState, type ReactNode } from "react";
import { post, setToken } from "./api";
import { createIdentity, deriveKeys, unlockPrivateKey } from "./keys";

interface Session {
  user: { id: string; email: string; publicKey: string };
  privateKey: CryptoKey;
}

interface Ctx {
  session: Session | null;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const SessionCtx = createContext<Ctx>(null!);
export const useSession = () => useContext(SessionCtx);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);

  const login = async (email: string, password: string) => {
    const { authKey, wrapKey } = await deriveKeys(email, password);
    const data = await post("/auth/login", { email, authKey });
    setToken(data.token);
    try {
      const privateKey = await unlockPrivateKey(wrapKey, data.user.encryptedPrivateKey, data.user.privateKeyIv);
      setSession({ user: data.user, privateKey });
    } catch (e) {
      setToken(null);
      throw e;
    }
  };

  const register = async (email: string, password: string) => {
    const identity = await createIdentity(email, password);
    await post("/auth/register", identity);
    await login(email, password);
  };

  const logout = () => {
    setToken(null);
    setSession(null);
  };

  return <SessionCtx.Provider value={{ session, register, login, logout }}>{children}</SessionCtx.Provider>;
}