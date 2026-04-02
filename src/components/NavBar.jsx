import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import ProfileDropdown from "./ProfileDropdown";
import logoImage from "/images/logo.png";

export default function NavBar() {
  const navigate = useNavigate();
  const { t } = useTranslation(["common"]);

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-100">
      {/* Left */}
      <div className="flex items-center gap-2">
        <img
          src={logoImage}
          alt="logo"
          className="w-12 h-12 object-contain cursor-pointer"
          onClick={()=>window.location.href="/"}
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="cursor-pointer text-slate-500 hover:text-slate-800 text-sm font-medium"
        >
          &larr; {t("common:back")}
        </button>

        <LanguageSwitcher />
        <ProfileDropdown />
      </div>
    </nav>
  );
}