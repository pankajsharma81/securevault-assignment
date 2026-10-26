
import { SessionProvider, useSession } from "./lib/session";
import AuthPage from "./pages/AuthPage";
import { useState } from "react";
import UploadBox from "./components/UploadBox";
import FileList from "./components/FileList";

function Inner() {
  const { session, logout } = useSession();
  const [refreshKey, setRefreshKey] = useState(0);
  if (!session) return <AuthPage />;
  return (
    <div style={{ padding: 24 }}>
      <p>Logged in as {session.user.email}</p>
      <button onClick={logout}>Logout</button>
      <UploadBox onDone={() => setRefreshKey((k) => k + 1)} />
      <FileList refreshKey={refreshKey} />
    </div>
  );
}

export default function App() {
  return (
    <SessionProvider>
      <Inner />
    </SessionProvider>
  );
}