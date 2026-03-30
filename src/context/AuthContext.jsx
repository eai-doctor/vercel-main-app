import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import config from "../config";

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("auth_token"));
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!token && !!user;

  // Set up axios interceptor to attach token only to backend/auth service requests
  useEffect(() => {
    const authTargets = [config.backendUrl, config.authServiceUrl].filter(Boolean);
    const interceptor = axios.interceptors.request.use((cfg) => {
      const t = localStorage.getItem("auth_token");
      if (t && authTargets.some((base) => cfg.url?.startsWith(base))) {
        cfg.headers.Authorization = `Bearer ${t}`;
        cfg.headers["X-Auth-Token"] = t;
      }
      return cfg;
    });
    return () => axios.interceptors.request.eject(interceptor);
  }, []);

  // Set up axios response interceptor for 401s
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err.response?.status === 401 && token) {
          // Token expired or invalid — log out
          logout();
        }
        return Promise.reject(err);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, [token]);

  // On mount, verify existing token
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    axios
      .get(`${config.authServiceUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}`, "X-Auth-Token": token },
      })
      .then((res) => {
        setUser(res.data.user);
      })
      .catch(() => {
        // Token invalid/expired
        localStorage.removeItem("auth_token");
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const res = await axios.post(`${config.authServiceUrl}/api/auth/login`, {
        email,
        password,
      });
      const { token: jwt, user: userData } = res.data;
      localStorage.setItem("auth_token", jwt);
      setToken(jwt);
      setUser(userData);
      return userData;
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.requires_verification) {
        const enriched = new Error(err.response.data.error);
        enriched.requiresVerification = true;
        enriched.email = err.response.data.email;
        throw enriched;
      }
      throw err;
    }
  }, []);

  const register = useCallback(async (email, password, name, role) => {
    const res = await axios.post(`${config.authServiceUrl}/api/auth/register`, {
      email,
      password,
      name,
      role,
    });
    if (res.data.requires_verification) {
      return { requiresVerification: true, email: res.data.email };
    }
    const { token: jwt, user: userData } = res.data;
    localStorage.setItem("auth_token", jwt);
    setToken(jwt);
    setUser(userData);
    return userData;
  }, []);

  const verifyEmail = useCallback(async (email, code) => {
    const res = await axios.post(`${config.authServiceUrl}/api/auth/verify-email`, {
      email,
      code,
    });
    const { token: jwt, user: userData } = res.data;
    localStorage.setItem("auth_token", jwt);
    setToken(jwt);
    setUser(userData);
    return userData;
  }, []);

  const resendVerification = useCallback(async (email) => {
    const res = await axios.post(`${config.authServiceUrl}/api/auth/resend-verification`, {
      email,
    });
    return res.data;
  }, []);

  const updateConsents = useCallback(async (consentUpdates) => {
    const res = await axios.put(`${config.authServiceUrl}/api/auth/consent`, consentUpdates);
    console.log("updateConsents", res);
    const updatedConsents = res.data.consents;
    setUser(prev => prev ? { ...prev, consents: updatedConsents } : prev);
    return updatedConsents;
  }, []);

  const updateProfile = useCallback(async (data) => {
    const res = await axios.put(`${config.authServiceUrl}/api/auth/me`, data);
    if (data.name) {
      setUser(prev => prev ? { ...prev, name: data.name } : prev);
    }
    return res.data;
  }, []);

  const changeEmail = useCallback(async (newEmail) => {
    const res = await axios.post(`${config.authServiceUrl}/api/auth/change-email`, { email: newEmail });
    return res.data;
  }, []);

  const verifyEmailChange = useCallback(async (code) => {
    const res = await axios.post(`${config.authServiceUrl}/api/auth/verify-email-change`, { code });
    if (res.data.user) {
      setUser(prev => prev ? { ...prev, email: res.data.user.email } : prev);
    }
    return res.data;
  }, []);

  const exportUserData = useCallback(async () => {
    // Call both export endpoints in parallel
    const [backendRes, authRes] = await Promise.all([
      axios.get(`${config.backendUrl}/api/user-data/export`),
      axios.get(`${config.authServiceUrl}/api/auth/export`),
    ]);

    const authData = authRes.data;
    const backendData = backendRes.data;
    const exportedAt = new Date().toISOString();

    // Merge into Law 25 compliant envelope
    const exportPayload = {
      export_info: {
        format: "JSON",
        exported_at: exportedAt,
        service: "EboAI Medical Platform",
        regulation: "Quebec Law 25 (Act respecting the protection of personal information in the private sector)",
        data_controller: "EboAI Inc.",
      },
      profile: authData.profile || {},
      consents: {
        current: authData.profile?.consents || {},
        history: authData.consent_history || [],
      },
      consultation_summaries: backendData.consultation_summaries || [],
      medical_records: backendData.medical_records || [],
      audit_logs: {
        auth: authData.auth_audit_logs || [],
        backend: backendData.backend_audit_logs || [],
      },
    };

    // Trigger browser download
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const date = new Date().toISOString().split("T")[0];
    const a = document.createElement("a");
    a.href = url;
    a.download = `eboai-data-export-${date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const deleteAccount = useCallback(async (confirmPhrase) => {
    // Step 1: Delete user data from backend service
    await axios.delete(`${config.backendUrl}/api/user-data`);
    // Step 2: Delete account from auth service
    await axios.delete(`${config.authServiceUrl}/api/auth/account`, {
      data: { confirm: confirmPhrase },
    });
    // Step 3: Log out locally
    localStorage.removeItem("auth_token");
    setToken(null);
    setUser(null);
  }, []);

  const logout = useCallback(() => {
    // Fire-and-forget logout to auth service (for audit log)
    if (token) {
      axios
        .post(
          `${config.authServiceUrl}/api/auth/logout`,
          {},
          { headers: { Authorization: `Bearer ${token}`, "X-Auth-Token": token } }
        )
        .catch(() => {});
    }
    localStorage.removeItem("auth_token");
    setToken(null);
    setUser(null);
  }, [token]);

  return (
    <AuthContext.Provider
      value={{ user, setUser, token, login, register, logout, verifyEmail, resendVerification, updateConsents, updateProfile, changeEmail, verifyEmailChange, exportUserData, deleteAccount, isAuthenticated, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}
