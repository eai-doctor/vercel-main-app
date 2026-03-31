import { createContext, useContext, useState, useCallback } from "react";

const AuthModalContext = createContext(null);

export function AuthModalProvider({ children }) {
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [pendingRoute, setPendingRoute] = useState(null);
  const [onSuccess, setOnSuccess] = useState(null);
  const [message, setMessage] = useState(null);

  const openLogin = useCallback(
    ({ route = null, onSuccess = null, message = null } = {}) => {
      setPendingRoute(route);
      setOnSuccess(() => onSuccess); // 함수 유지 중요
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