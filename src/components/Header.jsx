import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Stethoscope, User } from "lucide-react";

import LanguageSwitcher from "@/components/LanguageSwitcher";

import ProfileDropdown from "@/components/ProfileDropdown";
import { useAuth } from "@/context/AuthContext";
import logoImage from "/images/logo.png";
import { Button } from "./ui";
import { useAuthModal } from "@/context/AuthModalContext";

function Header() {
  const { user, loading } = useAuth();
  const { openLogin } = useAuthModal();
  const location = useLocation();
  const { t } = useTranslation(["common"]);

  const handleOnSignInBtnClick = () => openLogin();
  const onClickHeaderLogo = () =>
    !loading && user?.role === "clinician"
      ? (window.location.href = "/clinics")
      : (window.location.href = "/");

  // 포털 전환 정보
  const isClinicRoute = location.pathname.includes("clinic");
  const portalSwitchHref = isClinicRoute
    ? "/"
    : user?.role === "clinician"
    ? "/clinics"
    : "/clinic-login"; 
  const portalSwitchLabel = isClinicRoute ? t("common:buttons.patientPortal","Patient Portal") : t("common:buttons.clinicPortal","Clinic Portal");
  const PortalIcon = isClinicRoute ? User : Stethoscope;

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* -------- Left (Logo) -------- */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={onClickHeaderLogo}>
          <img
            src={logoImage}
            alt="logo"
            className="w-12 h-12 object-contain"
          />
          <span className="text-[16px] font-bold text-slate-800 tracking-tight">EAI-DOCTOR</span>
        </div>

        {/* -------- Right -------- */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Portal Switch (데스크톱: 텍스트 포함) */}
          <a
            href={portalSwitchHref}
            className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#2C3B8D]/40 text-[#2C3B8D] text-sm font-medium hover:bg-[#2C3B8D]/5 hover:border-[#2C3B8D] transition-colors"
          >
            <PortalIcon className="w-4 h-4" />
            {portalSwitchLabel}
          </a>

          {/* Portal Switch (모바일: 아이콘만) */}
          <a
            href={portalSwitchHref}
            aria-label={portalSwitchLabel}
            className="sm:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-[#2C3B8D]/40 text-[#2C3B8D] hover:bg-[#2C3B8D]/5 transition-colors"
          >
            <PortalIcon className="w-4 h-4" />
          </a>

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Auth */}
          {user ? (
            <ProfileDropdown />
          ) : (
            <Button
              onClick={handleOnSignInBtnClick}
              className="bg-[#2C3B8D] hover:bg-[#1f2a63] text-white"
            >
              {t("common:buttons.signIn","Sign In")}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;