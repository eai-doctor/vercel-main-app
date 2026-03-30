import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ProfileDropdown from "./ProfileDropdown";
import LanguageSwitcher from "./LanguageSwitcher";

function Header({ title, subtitle, showBackButton = false, backRoute = "/function-libraries" }) {
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  return (
    <>
    <div className="fixed top-0 left-0 right-0 h-[3px] bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] z-50" />
    <header className="bg-white/95 backdrop-blur-[20px] border-b border-[rgba(15,23,42,0.1)] shadow-[0_1px_3px_rgba(15,23,42,0.08)] mt-[3px]">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gradient">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-[#475569] mt-1">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {/* Home Button */}
            <button
              onClick={() => navigate("/")}
              className="flex items-center space-x-2 px-4 py-2 bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] text-white rounded-lg hover:opacity-90 hover:shadow-[0_0_40px_rgba(59,130,246,0.25)] btn-glow transition-all duration-250 ease"
              title={t('header.goToHome')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="font-medium">{t('header.home')}</span>
            </button>

            {/* Optional Back Button */}
            {showBackButton && (
              <button
                onClick={() => navigate(backRoute)}
                className="flex items-center space-x-2 px-4 py-2 bg-[#f8fafc] border border-[rgba(15,23,42,0.1)] rounded-lg hover:border-[rgba(59,130,246,0.4)] transition-all duration-250 ease"
              >
                <svg className="w-5 h-5 text-[#475569]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="text-[#1e293b] font-medium">{t('header.back')}</span>
              </button>
            )}

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Profile Avatar */}
            <ProfileDropdown />
          </div>
        </div>
      </div>
    </header>
    </>
  );
}

export default Header;
