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
    <div>
      <div className="topbar">
        <h2 style={{ margin: 0 }}>SecureVault</h2>
        <div>
          {session.user.email}{" "}
          <button className="secondary" onClick={logout}>Logout</button>
        </div>
      </div>
      <div className="card">
        <UploadBox onDone={() => setRefreshKey((k) => k + 1)} />
      </div>
      <div className="card">
        <FileList refreshKey={refreshKey} />
      </div>
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