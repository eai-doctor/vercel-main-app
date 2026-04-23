import { createContext, useContext, useState, useCallback, useEffect } from "react";

const AuthModalContext = createContext(null);

export function AuthModalProvider({ children }) {
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [pendingRoute, setPendingRoute] = useState(null);
  const [onSuccess, setOnSuccess] = useState(null);
  const [message, setMessage] = useState(null);
  const [requiredStep, setRequiredStep] = useState("login");
  const [externalRedirect, setExternalRedirect] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect");

    if (redirect) {
      setExternalRedirect(redirect);
      setLoginOpen(true);

      // URL에서 redirect 파라미터 제거
      params.delete("redirect");
      const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : "");
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

  const openLogin = useCallback(
    ({ route = null, onSuccess = null, message = null, step = "login" } = {}) => {
      setRequiredStep(step);
      setPendingRoute(route);
      setOnSuccess(() => onSuccess); 
      setMessage(message);
      setLoginOpen(true);
    },
    []
  );

  const closeLogin = useCallback(() => {
    setLoginOpen(false);
    setPendingRoute(null);
    setOnSuccess(null);
    setMessage(null);
    setRequiredStep("login");
    setExternalRedirect(null);
  }, []);

  return (
    <AuthModalContext.Provider
      value={{
        isLoginOpen,
        openLogin,
        closeLogin,
        pendingRoute,
        onSuccess,
        message,
        requiredStep,
        externalRedirect
      }}
    >
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error("useAuthModal must be used within AuthModalProvider");
  }
  return context;
}