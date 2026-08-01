import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AUTH_LOGOUT_EVENT = "auth:logout";

const TOKEN_KEY = "lmo_admin_token";
const USER_KEY = "lmo_admin_user";

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === TOKEN_KEY || e.key === USER_KEY) {
        setToken(localStorage.getItem(TOKEN_KEY));
        const raw = localStorage.getItem(USER_KEY);
        setUser(raw ? JSON.parse(raw) : null);
      }
    };

    const handleLogoutEvent = () => {
      setToken(null);
      setUser(null);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(AUTH_LOGOUT_EVENT, handleLogoutEvent);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(AUTH_LOGOUT_EVENT, handleLogoutEvent);
    };
  }, []);

  const login = ({ token: nextToken, user: nextUser }) => {
    setToken(nextToken);
    setUser(nextUser);
    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        role: user?.role,
        isAuthenticated: Boolean(token),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
