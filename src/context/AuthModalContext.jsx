import { createContext, useContext, useState, useCallback } from "react";

const AuthModalContext = createContext(null);

export function AuthModalProvider({ children }) {
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [pendingRoute, setPendingRoute] = useState(null);
  const [onSuccess, setOnSuccess] = useState(null);
  const [message, setMessage] = useState(null);
  const [requiredStep, setRequiredStep] = useState("login");

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
        requiredStep
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