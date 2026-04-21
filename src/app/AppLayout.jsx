import { useEffect } from "react";
import { Outlet } from "react-router-dom";

import { useAuth } from '@/context/AuthContext';
import { useLanguage, useSessionGuard } from "@/hooks";

import AppFooter from './AppFooter';
import { AuthModalProvider, useAuthModal } from "@/context/AuthModalContext";
import { LoginModal } from "@/pages/public";

function AppLayoutInner() {
  const { user, loading, logout } = useAuth();
  const { changeLanguage, getLanguageCode } = useLanguage();
  const { isLocked, setIsLocked } = useSessionGuard();
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

      { user?.role == "clinician" && isLocked &&
          <div className="fixed inset-0 bg-slate-900/95 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 text-center shadow-xl max-w-sm w-full">
              <p className="text-slate-800 font-semibold mb-4">Session Locked</p>
              <p className="text-slate-500 text-sm mb-6">You need to login again to access the portal</p>
              <button onClick={logout}
                className="w-full py-2.5 bg-[#2C3B8D] text-white rounded-xl font-semibold text-sm cursor-pointer">
                Login Again
              </button>
            </div>
          </div>
      }

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