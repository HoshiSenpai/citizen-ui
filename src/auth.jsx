import { createContext, useContext, useEffect, useState } from "react";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem("auth_user");
    if (raw) setUser(JSON.parse(raw));
  }, []);

  const signIn = (u) => {
    setUser(u);
    localStorage.setItem("auth_user", JSON.stringify(u));
  };
  const signOut = () => {
    setUser(null);
    localStorage.removeItem("auth_user");
  };

  return <AuthCtx.Provider value={{ user, signIn, signOut }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
