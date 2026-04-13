import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from "react-i18next";

function ProfileDropdown({ variant = "light" }) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useTranslation('common');

  const handleClickOutside = useCallback((e) => {
    if (
      buttonRef.current && !buttonRef.current.contains(e.target) &&
      dropdownRef.current && !dropdownRef.current.contains(e.target)
    ) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open, handleClickOutside]);

  const handleLogout = () => {
    setOpen(false);
    logout();
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const isDark = variant === "dark";

  // Calculate dropdown position relative to the button
  const getDropdownStyle = () => {
    if (!buttonRef.current) return {};
    const rect = buttonRef.current.getBoundingClientRect();
    return {
      position: "fixed",
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
      zIndex: 99999,
    };
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setOpen((v) => !v)}
        className={`w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold text-sm flex items-center justify-center cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
          isDark ? "border-2 border-white/40" : "border-2 border-blue-100"
        }`}
        title={user?.name || "Profile"}
      >
        {initials}
      </button>

      {open &&
        ReactDOM.createPortal(
          <div
            ref={dropdownRef}
            className="w-64 bg-white rounded-xl shadow-lg border border-gray-200"
            style={getDropdownStyle()}
          >
            <div className="px-4 py-3">
              <p className="font-semibold text-gray-900 text-sm truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-gray-500 truncate mt-0.5">
                {user?.email || ""}
              </p>
              {user?.role && (
                <span className="inline-block mt-1.5 bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 text-xs font-medium capitalize">
                  {user.role}
                </span>
              )}
            </div>
            <div className="border-t border-gray-100" />
            {/* <button
              onClick={() => { setOpen(false); navigate('/consent'); }}
              className="w-full flex items-center space-x-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>{t('buttons.privacyConsent', 'Privacy & Consent')}</span>
            </button>
            <button
              onClick={() => { setOpen(false); navigate('/account'); }}
              className="w-full flex items-center space-x-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{t('buttons.accountSettings', 'Account Settings')}</span>
            </button> */}

            <div className="border-t border-gray-100" />
            <button
              onClick={handleLogout}
              className="cursor-pointer w-full flex items-center space-x-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors rounded-b-xl"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>{t('buttons.signOut')}</span>
            </button>
          </div>,
          document.body
        )}
    </>
  );
}

export default ProfileDropdown;
