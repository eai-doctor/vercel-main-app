import { useEffect } from "react";
import { Outlet } from "react-router-dom";

import { useAuth } from '@/context/AuthContext';
import { useLanguage } from "@/hooks";
import AppFooter from './AppFooter';

export default function AppLayout() {
  const { user, loading } = useAuth();
  const { changeLanguage, getLanguageCode } = useLanguage();

  //260311 saebyeok - if language has a preset, use it; otherwise, set it to english
  useEffect(() => {
    if (!loading && user) {
      const code = getLanguageCode(user?.preferences?.language || "en");
      changeLanguage(code);
    }

  }, [user, loading]);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
}