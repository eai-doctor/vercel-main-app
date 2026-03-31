import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import config from "@/config";

const AUTH_API = {
  LOGIN: `${config.authServiceUrl}/api/auth/login`,
  REGISTER: `${config.authServiceUrl}/api/auth/register`,
  LOGOUT: `${config.authServiceUrl}/api/auth/logout`,
  ME: `${config.authServiceUrl}/api/auth/me`,
  VERIFY_EMAIL: `${config.authServiceUrl}/api/auth/verify-email`,
  RESEND_VERIFICATION: `${config.authServiceUrl}/api/auth/resend-verification`,
  CONSENT: `${config.authServiceUrl}/api/auth/consent`,
  EXPORT: `${config.authServiceUrl}/api/auth/export`,
  ACCOUNT: `${config.authServiceUrl}/api/auth/account`,
};

const BACKEND_API = {
  EXPORT: `${config.backendUrl}/api/user-data/export`,
  USER_DATA: `${config.backendUrl}/api/user-data`,
};

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

  // On mount, verify existing using cookie
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await axios.get(AUTH_API.ME, {
          withCredentials: true
        });

        console.log("auth me res",res);
        if (res.data && res.data.user) {
          setUser(res.data.user);
        }
      } catch (err) {
        console.warn("Session expired");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  // saebyeok - cookie reflected
  const login = useCallback(async (email, password) => {
    try {
      const res = await axios.post(AUTH_API.LOGIN, {
        email,
        password,
      }, {
        withCredentials: true
      });
      console.log(res);
      
      const { user: userData } = res.data;

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

  // saebyeok - cookie reflected
  const logout = useCallback(async () => {
    const role = user?.role;

    try {
      await axios.post(AUTH_API.LOGOUT);
    } catch (err) {
      console.error("Logout notification failed", err);
    }

    setUser(null);

    window.location.replace(
      role === "clinician" ? "/clinic-login" : "/"
    );
  }, [user]);

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
      value={{ user, setUser, isAuthenticated, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );


}
