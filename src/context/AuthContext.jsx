import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import config from "@/config";
import { authLogin, authMe, authLogout, authRefresh, authRegister,authVerifyEmail, authResendVerification, authForgotPassword } from "@/api/authApi";
import { setStoredToken } from "@/api/axiosBase";

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(null);

  const isAuthenticated = !!user;
  const isPatient = isAuthenticated && user.role == "patient";

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const refreshRes = await authRefresh({ withCredentials: true });
        const newAccessToken = refreshRes.data.access_token;

        if (isMounted) {
          setStoredToken(newAccessToken);
          setAccessToken(newAccessToken); 
        }

        const userRes = await authMe({
          headers: { Authorization: `Bearer ${newAccessToken}` }
        });

        if (isMounted && userRes.data?.user) {
          setUser(userRes.data.user);
        }
      } catch (err) {
        if (isMounted) {
          console.warn("Session recovery failed (No refresh token or expired)");
          setUser(null);
          setAccessToken(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initializeAuth();
    return () => { isMounted = false; };
  }, []);

  // saebyeok - cookie reflected
const login = useCallback(async (email, password) => {
  try {
    const res = await authLogin({ email, password });
    const { user: userData, access_token: tokenData } = res.data;

    setUser(userData);
    setAccessToken(tokenData);
    setStoredToken(tokenData);
    return userData;

  } catch (err) {
    if (err.response?.status === 403 && err.response?.data?.requires_verification) {
      const enriched = new Error(err.response.data.error);
      enriched.code = "REQUIRES_VERIFICATION";
      enriched.requiresVerification = true;
      enriched.email = err.response.data.email;
      throw enriched;
    }

    const code = err.response?.data?.code;
    const enrichedError = new Error(err.response?.data?.error ?? "unknown");
    enrichedError.code = code;
    enrichedError.status = err.response?.status;
    throw enrichedError;
  }
}, []);

  // saebyeok - cookie reflected
  const logout = useCallback(async () => {
    const role = user?.role;

    try {
      await authLogout();
    } catch (err) {
      console.error("Logout notification failed", err);
    }

    setUser(null);

    window.location.replace(
      role === "clinician" ? "/clinic-login" : "/"
    );
  }, [user]);

 const register = useCallback(async (email, password, name, role) => {  // t 제거
  try {
    const res = await authRegister({ email, password, name, role });

    if (res.data.requires_verification) {
      return { requiresVerification: true, email: res.data.email };
    }

    const { user: userData, access_token: tokenData } = res.data;
    setUser(userData);
    setAccessToken(tokenData);
    setStoredToken(tokenData);
    return userData;

  } catch (err) {
    // 에러 정규화만 담당, 번역 없음
    const code = err.response?.data?.code;
    const enrichedError = new Error(err.response?.data?.error ?? "unknown");
    enrichedError.code = code;
    enrichedError.status = err.response?.status;
    throw enrichedError;
  }
}, []);

  const verifyEmail = useCallback(async (email, code) => {
    const res = await authVerifyEmail({
      email,
      code,
    });
    const data = res.data;
      const userData = data.user;
      const tokenData = data.access_token;

      setUser(userData);
      setAccessToken(tokenData);
      setStoredToken(tokenData);

    return userData;
  }, []);

  const resendVerification = useCallback(async (email) => {
    const res = await authResendVerification({
      email,
    });
    return res.data;
  }, []);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    return null;
  }, []);

  const forgotPassword = useCallback(async (email) => {
    const res = await authForgotPassword({
      email,
    });
    return res.data;
  }, []);

  // Set up axios response interceptor for 401s
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (res) => res,
      (err) => {
        // Session expired or invalid — log out
        if (err.response?.status === 401 && user) {
          logout();
        }
        return Promise.reject(err);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, [user, logout]);

  return (
    <AuthContext.Provider
      value={{ user, setUser, isAuthenticated, isPatient, loading, login, logout, register, verifyEmail, resendVerification, accessToken, changePassword, forgotPassword }}
    >
      {children}
    </AuthContext.Provider>
  );


}
