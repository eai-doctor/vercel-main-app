import { useEffect } from "react";
import { Outlet } from "react-router-dom";

import { useAuth } from '@/context/AuthContext';
import { useLanguage } from "@/hooks";

import AppFooter from './AppFooter';
import { LoginModal } from "@/components/modal";
import { AuthModalProvider, useAuthModal } from "@/context/AuthModalContext";

function AppLayoutInner() {
  const { user, loading } = useAuth();
  const { changeLanguage, getLanguageCode } = useLanguage();
  const { isLoginOpen, closeLogin,  onSuccess, message } =
    useAuthModal();

  //260311 saebyeok - if language has a preset, use it; otherwise, set it to english
  useEffect(() => {
    if (!loading && user) {
      const code = getLanguageCode(user?.preferences?.language || "en");
      changeLanguage(code);
    }

  }, [user, loading]);

  const handleLoginSuccess = (userData) => {
    closeLogin();
  };

  return (
    <div className="min-h-screen flex flex-col">

      <main className="flex-1">
        <Outlet />
      </main>

      <AppFooter />

      {isLoginOpen && (
        <LoginModal
          onClose={closeLogin}
          onSuccess={handleLoginSuccess}
          message={message}
        />
      )}

    </div>
  );
}

export default function AppLayout() {
  return (
    <AuthModalProvider>
      <AppLayoutInner />
    </AuthModalProvider>
  );
}