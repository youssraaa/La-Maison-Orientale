import { createContext, useContext, useEffect, useState } from "react";

const ClientAuthContext = createContext(null);

export const useClientAuth = () => useContext(ClientAuthContext);

const TOKEN_KEY = "lmo_client_token";
const USER_KEY = "lmo_client_user";
const REMEMBER_PREF_KEY = "lmo_client_remember";
const REMEMBER_EMAIL_KEY = "lmo_client_email";

function readAuthFromStorage() {
  let token = localStorage.getItem(TOKEN_KEY);
  let userRaw = localStorage.getItem(USER_KEY);

  if (!token) {
    token = sessionStorage.getItem(TOKEN_KEY);
    userRaw = sessionStorage.getItem(USER_KEY);
  }

  return {
    token,
    user: userRaw ? JSON.parse(userRaw) : null,
  };
}

function clearAuthStorage() {
  [localStorage, sessionStorage].forEach((storage) => {
    storage.removeItem(TOKEN_KEY);
    storage.removeItem(USER_KEY);
  });
}

export function getRememberPreference() {
  return localStorage.getItem(REMEMBER_PREF_KEY) !== "false";
}

export function getRememberedEmail() {
  return localStorage.getItem(REMEMBER_EMAIL_KEY) || "";
}

export default function ClientAuthProvider({ children }) {
  const initial = readAuthFromStorage();
  const [token, setToken] = useState(initial.token);
  const [user, setUser] = useState(initial.user);

  useEffect(() => {
    const sync = () => {
      const next = readAuthFromStorage();
      setToken(next.token);
      setUser(next.user);
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const login = ({ token: nextToken, user: nextUser, rememberMe = true }) => {
    clearAuthStorage();

    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(TOKEN_KEY, nextToken);
    storage.setItem(USER_KEY, JSON.stringify(nextUser));

    if (rememberMe) {
      localStorage.setItem(REMEMBER_PREF_KEY, "true");
      if (nextUser?.email) {
        localStorage.setItem(REMEMBER_EMAIL_KEY, nextUser.email);
      }
    } else {
      localStorage.setItem(REMEMBER_PREF_KEY, "false");
      localStorage.removeItem(REMEMBER_EMAIL_KEY);
    }

    setToken(nextToken);
    setUser(nextUser);
  };

  const logout = () => {
    clearAuthStorage();
    setToken(null);
    setUser(null);
  };

  return (
    <ClientAuthContext.Provider
      value={{
        token,
        user,
        isClientAuthenticated: Boolean(token),
        login,
        logout,
      }}
    >
      {children}
    </ClientAuthContext.Provider>
  );
}
