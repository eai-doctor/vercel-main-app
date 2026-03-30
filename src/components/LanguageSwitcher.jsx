import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { useLanguage } from '@/hooks';

export default function LanguageSwitcher() {
  const { currentLanguage, changeLanguage, LANGUAGES } = useLanguage();

  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

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
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open, handleClickOutside]);

  const currentLang = currentLanguage;

  const getDropdownStyle = () => {
    if (!buttonRef.current) return {};
    const rect = buttonRef.current.getBoundingClientRect();
    return {
      position: 'fixed',
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
      zIndex: 99999,
    };
  };

  const handleClickLanguage = (languageCode) => {
    changeLanguage(languageCode); 
    setOpen(false);
  }

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setOpen(v => !v)}
        className="flex items-center space-x-1.5 px-3 py-2 text-sm font-medium bg-[#f8fafc] border border-[rgba(15,23,42,0.1)] rounded-lg hover:border-[rgba(59,130,246,0.4)] transition-all"
        title="Switch language"
      >
        <svg className="w-4 h-4 text-[#475569]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10A15.3 15.3 0 0112 2z" />
        </svg>
        <span className="text-[#1e293b]">{currentLang.flag}</span>
        <svg className={`w-3 h-3 text-[#94a3b8] transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && ReactDOM.createPortal(
        <div
          ref={dropdownRef}
          className="w-40 bg-white rounded-lg shadow-[0_4px_12px_rgba(15,23,42,0.15)] border border-[rgba(15,23,42,0.1)] overflow-hidden"
          style={getDropdownStyle()}
        >
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => { handleClickLanguage(lang.code) }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                currentLang.code === lang.code
                  ? 'bg-[rgba(59,130,246,0.08)] text-[#3b82f6] font-medium'
                  : 'text-[#475569] hover:bg-[#f8fafc]'
              }`}
            >
              <span className="font-mono mr-2">{lang.flag}</span>
              {lang.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}
