import { useEffect, useState } from "react";
import { Outlet, useLocation  } from "react-router-dom";

import { useAuth } from '@/context/AuthContext';
import { useLanguage, useSessionGuard } from "@/hooks";

import AppFooter from './AppFooter';
import { AuthModalProvider, useAuthModal } from "@/context/AuthModalContext";
import { LoginModal } from "@/pages/public";
import medicalRecordApi from "@/api/medicalRecordApi";

function AppLayoutInner() {
  const { user, loading, logout } = useAuth();
  const { changeLanguage, getLanguageCode } = useLanguage();
  const { isLocked, setIsLocked } = useSessionGuard();
  const { isLoginOpen, closeLogin, onSuccess, message } = useAuthModal();

  const location = useLocation();
  const { hash, pathname, search } = location;
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      const code = getLanguageCode(user?.preferences?.language || "en");
      changeLanguage(code);
    }
  }, [user, loading]);

  const handleLoginSuccess = (userData) => {
    closeLogin();
  };

  const handleSessionLogoutClicked = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <Outlet />
      </main>

      { !pathname.includes("dashboard") && <AppFooter /> }

      {isLoginOpen && (
        <LoginModal
          onClose={closeLogin}
          onSuccess={handleLoginSuccess}
          message={message}
        />
      )}

      {/* Session Lock Overlay */}
      {user?.role == "clinician" && isLocked && <div className="fixed inset-0 bg-slate-900/95 flex items-center justify-center z-50 transition-opacity duration-300">
        <div className="bg-white rounded-2xl p-8 text-center shadow-xl max-w-sm w-full">

          {isLoggingOut ? (
            <div className="flex flex-col items-center gap-4 py-2">
              <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-[#2C3B8D] animate-spin" />
              <p className="text-slate-500 text-sm">Signing out...</p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <p className="text-slate-800 font-semibold mb-2">Session Locked</p>
              <p className="text-slate-500 text-sm mb-6">
                You need to login again to access the portal
              </p>
              <button
                onClick={handleSessionLogoutClicked}
                disabled={isLoggingOut}
                className="w-full py-2.5 bg-[#2C3B8D] text-white rounded-xl font-semibold text-sm cursor-pointer hover:bg-[#243070] active:scale-[0.98] transition-all duration-150 disabled:opacity-60"
              >
                Login Again
              </button>
            </>
          )}

        </div>
      </div>}

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