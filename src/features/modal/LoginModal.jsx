import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from '@/context/AuthContext';

function LoginModal({ isOpen, onClose, onSuccess, portalTitle, portalIcon: PortalIcon, defaultRole = "patient", message }) {
  const { login, register, verifyEmail, resendVerification } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "", name: "", role: defaultRole });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Verification state
  const [verificationStep, setVerificationStep] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownRef = useRef(null);
  const { t } = useTranslation('auth');

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setIsRegister(false);
      setFormData({ email: "", password: "", name: "", role: defaultRole });
      setError("");
      setSubmitting(false);
      setVerificationStep(false);
      setVerificationEmail("");
      setVerificationCode("");
      setResendCooldown(0);
    }
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, [isOpen, defaultRole]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      cooldownRef.current = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(cooldownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(cooldownRef.current);
    }
  }, [resendCooldown]);

  if (!isOpen) return null;

  const startVerification = (email) => {
    setVerificationEmail(email);
    setVerificationCode("");
    setVerificationStep(true);
    setError("");
    setResendCooldown(60);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (isRegister) {
        if (!formData.name.trim()) {
          setError(t('nameRequired'));
          setSubmitting(false);
          return;
        }
        const result = await register(formData.email, formData.password, formData.name, formData.role);
        if (result?.requiresVerification) {
          startVerification(result.email);
        } else {
          onSuccess(result);
        }
      } else {
        const userData = await login(formData.email, formData.password);
        onSuccess(userData);
      }
    } catch (err) {
      if (err.requiresVerification) {
        startVerification(err.email);
      } else {
        const msg = err.response?.data?.error || err.message || t('common:errors.generic');
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const userData = await verifyEmail(verificationEmail, verificationCode);
      onSuccess(userData);
    } catch (err) {
      const msg = err.response?.data?.error || t('verificationFailed');
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError("");

    try {
      await resendVerification(verificationEmail);
      setResendCooldown(60);
      setVerificationCode("");
    } catch (err) {
      const msg = err.response?.data?.error || t('failedResend');
      setError(msg);
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setError("");
  };

  // Verification step UI
  if (verificationStep) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-[0_25px_50px_rgba(15,23,42,0.15)] max-w-md w-full border border-[rgba(15,23,42,0.1)]">
          {/* Header */}
          <div className="bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] p-6 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{t('verifyEmail')}</h2>
                  <p className="text-white/80 text-sm">{t('checkInbox')}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 text-2xl w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </div>
          </div>

          {/* Verification Content */}
          <form onSubmit={handleVerify} className="p-6 space-y-4">
            <div className="text-center">
              <p className="text-[#475569] text-sm">
                {t('sentCode')}
              </p>
              <p className="text-[#1e293b] font-semibold mt-1">{verificationEmail}</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#475569] mb-2 text-center">{t('verificationCode')}</label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setVerificationCode(val);
                }}
                placeholder="000000"
                className="w-full px-4 py-4 border border-[rgba(15,23,42,0.1)] rounded-lg focus:outline-none focus:border-[#3b82f6] transition-colors text-center text-3xl font-mono tracking-[0.5em] placeholder:tracking-[0.5em] placeholder:text-gray-300"
                autoFocus
              />
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="submit"
                disabled={submitting || verificationCode.length !== 6}
                className="flex-1 px-6 py-3 rounded-lg text-white font-semibold bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] hover:opacity-90 hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(59,130,246,0.25)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    {t('verifying')}
                  </span>
                ) : (
                  t('verifyEmail')
                )}
              </button>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  setVerificationStep(false);
                  setError("");
                }}
                className="text-sm text-[#64748b] hover:text-[#475569] hover:underline"
              >
                {t('backToLogin')}
              </button>
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0}
                className="text-sm text-[#3b82f6] hover:text-[#2563eb] hover:underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed"
              >
                {resendCooldown > 0 ? t('resendIn', { seconds: resendCooldown }) : t('resendCode')}
              </button>
            </div>

            <p className="text-xs text-[#94a3b8] text-center">
              {t('codeExpires')}
            </p>
          </form>
        </div>
      </div>
    );
  }

  // Login/Register form UI (unchanged)
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-[0_25px_50px_rgba(15,23,42,0.15)] max-w-md w-full border border-[rgba(15,23,42,0.1)]">
        {/* Modal Header */}
        <div className="bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {PortalIcon && <div><PortalIcon className="w-10 h-10 text-white" /></div>}
              <div>
                <h2 className="text-2xl font-bold text-white">{portalTitle}</h2>
                <p className="text-white/80 text-sm">{isRegister ? t('createAccount') : t('signIn')}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {message && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-[#475569] mb-1">{t('common:labels.fullName')}</label>
              <input
                type="text"
                autoComplete="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('namePlaceholder')}
                className="w-full px-4 py-2 border border-[rgba(15,23,42,0.1)] rounded-lg focus:outline-none focus:border-[#3b82f6] transition-colors"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#475569] mb-1">{t('common:labels.email')}</label>
            <input
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder={t('emailPlaceholder')}
              className="w-full px-4 py-2 border border-[rgba(15,23,42,0.1)] rounded-lg focus:outline-none focus:border-[#3b82f6] transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#475569] mb-1">{t('common:labels.password')}</label>
            <input
              type="password"
              autoComplete={isRegister ? "new-password" : "current-password"}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={isRegister ? t('passwordPlaceholderNew') : t('passwordPlaceholderLogin')}
              className="w-full px-4 py-2 border border-[rgba(15,23,42,0.1)] rounded-lg focus:outline-none focus:border-[#3b82f6] transition-colors"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 rounded-lg text-white font-semibold bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] hover:opacity-90 hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(59,130,246,0.25)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {isRegister ? t('creating') : t('signingIn')}
                </span>
              ) : (
                isRegister ? t('createAccount') : t('signIn')
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-lg text-[#1e293b] font-semibold bg-[#f8fafc] border border-[rgba(15,23,42,0.1)] hover:border-[rgba(59,130,246,0.4)] transition-all"
            >
              {t('common:buttons.cancel')}
            </button>
          </div>

          {/* Privacy Policy link */}
          {isRegister && <div className="text-xs text-[#94a3b8] text-start">
            <p >
              By continuing past this page, you agree to the Terms of Use and understand that information will be used as described in our 
              <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[#3b82f6] hover:text-[#2563eb] hover:underline"> Privacy Policy</a>.
            </p>
            <p className="pt-2">
              As set forth in our Privacy Policy, we may use your information for email marketing, including promotions and updates on our own or third-party products. You can opt out of our marketing emails anytime.
            </p>
          </div>}

          {/* Toggle Login/Register */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-[#3b82f6] hover:text-[#2563eb] hover:underline"
            >
              {isRegister
                ? t('alreadyHaveAccount')
                : t('noAccount')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginModal;
