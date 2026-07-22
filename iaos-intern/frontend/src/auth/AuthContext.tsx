import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { clearToken, get, post, setToken } from "../lib/api";
import type { Session, User, Tenant } from "../lib/types";

interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
}

interface SignupData {
  organization_name: string;
  full_name: string;
  email: string;
  password: string;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  function applySession(s: Session) {
    setToken(s.token.access_token);
    setUser(s.user);
    setTenant(s.tenant);
  }

  useEffect(() => {
    // Restore session on refresh if a token is present.
    get<Session>("/api/auth/me")
      .then(applySession)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const s = await post<Session>("/api/auth/login", { email, password });
    applySession(s);
  }

  async function signup(data: SignupData) {
    const s = await post<Session>("/api/auth/signup", data);
    applySession(s);
  }

  function logout() {
    clearToken();
    setUser(null);
    setTenant(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, tenant, loading, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
