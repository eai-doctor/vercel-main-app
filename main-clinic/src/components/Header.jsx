import { PORTAL_ROLE, PORTAL_HOME, OTHER_PORTAL_URL } from "@/app/portal";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Stethoscope, User } from "lucide-react";

import LanguageSwitcher from "@/components/LanguageSwitcher";

import ProfileDropdown from "@/components/ProfileDropdown";
import { useAuth } from "@/context/AuthContext";
import logoImage from "/images/logo.png";
import { Button } from "@/components/ui/button.jsx";
import { useAuthModal } from "@/context/AuthModalContext";
import { URLS }  from "@/constants/urls";

function Header() {
  const { user, loading } = useAuth();
  const { openLogin } = useAuthModal();
  const location = useLocation();
  const { t } = useTranslation(["common"]);

  const handleOnSignInBtnClick = () => openLogin();
  const onClickHeaderLogo = () => { window.location.href = PORTAL_HOME; };
  const isClinicRoute = PORTAL_ROLE === "clinician";
  const portalSwitchHref = OTHER_PORTAL_URL;
  const portalSwitchLabel = isClinicRoute ? t("common:buttons.patientPortal","Patient Portal") : t("common:buttons.clinicPortal","Clinic Portal");
  const PortalIcon = isClinicRoute ? User : Stethoscope;

  const goToWebsiteLabel = t("common:buttons.goToWebsite","Website") ;

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

          <a
            href={URLS.website}
            className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#2C3B8D]/40 text-[#2C3B8D] text-sm font-medium hover:bg-[#2C3B8D]/5 hover:border-[#2C3B8D] transition-colors"
          >
            {goToWebsiteLabel}
          </a>

          <a
            href={portalSwitchHref || undefined}
            style={!portalSwitchHref ? { display: "none" } : undefined}
            className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#2C3B8D]/40 text-[#2C3B8D] text-sm font-medium hover:bg-[#2C3B8D]/5 hover:border-[#2C3B8D] transition-colors"
          >
            <PortalIcon className="w-4 h-4" />
            {portalSwitchLabel}
          </a>

          {/* Portal Switch  */}
          <a
            href={portalSwitchHref || undefined}
            style={!portalSwitchHref ? { display: "none" } : undefined}
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