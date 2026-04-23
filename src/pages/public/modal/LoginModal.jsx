import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui";

const validatePassword = (pw) => ({
  length:    pw.length >= 8,
  uppercase: /[A-Z]/.test(pw),
  number:    /[0-9]/.test(pw),
});

export default function LoginModal({
  onClose,
  onSuccess,
  defaultRole = "patient",
  message,
}) {
  const { login, register, verifyEmail, resendVerification, forgotPassword, accessToken } = useAuth();
  const { pendingRoute, requiredStep, externalRedirect } = useAuthModal();
  const { t } = useTranslation(["auth", "patient"]);
  const navigate = useNavigate();

  const [step, setStep] = useState(requiredStep); // login | register | verify | forgotPassword | forgotPasswordSent
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    role: defaultRole,
  });

  const [verificationCode, setVerificationCode] = useState("");
  const [verificationEmail, setVerificationEmail] = useState("");
  const [resetEmail, setResetEmail] = useState("");       

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);

  const passwordRules = validatePassword(form.password);
const isPasswordValid = Object.values(passwordRules).every(Boolean);

  useEffect(() => {
    setStep(requiredStep);
    setForm({ email: "", password: "", name: "", role: defaultRole });
    setVerificationCode("");
    setVerificationEmail("");
    setResetEmail("");
    setError("");
    setLoading(false);
    setCooldown(0);

    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, [defaultRole, requiredStep]);

  useEffect(() => {
    if (cooldown <= 0) return;
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) { clearInterval(cooldownRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(cooldownRef.current);
  }, [cooldown]);

  const normalizeEmail = (email) => email.trim().toLowerCase();

  const safeError = (err) => {
    const code = err?.code;
    if (!code) return t("common:errors.generic");

    const key = `auth:errors.${code}`;
    const translated = t(key);
    return translated === key ? t("common:errors.generic") : translated;
  };

  const handleSuccess = (res) => {
    if (externalRedirect) {
      const token = accessToken; 
      if (token) {
        sessionStorage.setItem('sso_token', token);
      }
      const url = token
        ? `${externalRedirect}?token=${encodeURIComponent(token)}`
        : externalRedirect;
      window.location.href = url;
      return;
    }

    if (pendingRoute) navigate(pendingRoute);
    else if (onSuccess) onSuccess(res);
    onClose?.();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    const email = normalizeEmail(form.email);

    try {
      if (step === "register") {
        if (!form.name.trim()) { setError(t("auth:errors.NAME_REQUIRED")); return; }
        if (!isPasswordValid) { setError(t("auth:errors.PASSWORD_INVALID")); return; }

        const res = await register(email, form.password, form.name, form.role);
        if (res?.requiresVerification) {
          setVerificationEmail(res.email);
          setStep("verify");
          setCooldown(60);
        } else {
          handleSuccess(res);
        }
      } else {
        await new Promise((r) => setTimeout(r, 400));
        const res = await login(email, form.password);
        handleSuccess(res);
      }
    } catch (err) {
      if (err?.requiresVerification) {
        setVerificationEmail(err.email);
        setStep("verify");
        setCooldown(60);
      } else {
        console.log("error : ", error);
        setError(safeError(err));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (loading || verificationCode.length !== 6) return;
    setError("");
    setLoading(true);
    try {
      const res = await verifyEmail(verificationEmail, verificationCode);
      handleSuccess(res);
    } catch {
      setError(t("verificationFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || !verificationEmail) return;
    try {
      await resendVerification(verificationEmail);
      setCooldown(60);
      setVerificationCode("");
    } catch {
      setError(t("failedResend"));
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (loading || !resetEmail.trim()) return;
    setError("");
    setLoading(true);
    try {
      await forgotPassword(normalizeEmail(resetEmail));
      setStep("forgotPasswordSent");
    } catch {
      setError(t("auth:forgotPasswordFailed"));
    } finally {
      setLoading(false);
    }
  };
  
  const stepTitle = {
    register: t("createAccount"),
    verify: t("verifyEmail"),
    forgotPassword: t("auth:forgotPassword"),
    forgotPasswordSent: t("auth:checkYourEmail"),
  }[step] ?? t("signIn");

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(15,23,42,0.15)] max-w-md w-full">

        {/* Header */}
        <div className="bg-[#2C3B8D] p-5 rounded-t-2xl flex justify-between items-center">
          <div>
            <h2 className="text-white text-xl font-bold">{t("patient:portal.title")}</h2>
            <p className="text-white/80 text-sm">{stepTitle}</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white text-xl">×</button>
        </div>

        {/* Content */}
        <form
          onSubmit={
            step === "verify"
              ? handleVerify
              : step === "forgotPassword"
              ? handleForgotPassword
              : handleSubmit
          }
          className="p-6 space-y-4"
        >
          {message && (
            <div className="bg-gray-50 text-gray-600 p-3 rounded-lg text-sm">{message}</div>
          )}
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">{error}</div>
          )}

          {/* ✅ FORGOT PASSWORD SENT */}
          {step === "forgotPasswordSent" && (
            <>
              <div className="text-center space-y-2 py-2">
                <div className="w-12 h-12 rounded-full bg-[#2C3B8D]/10 flex items-center justify-center mx-auto">
                  {/* envelope icon via inline SVG */}
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2C3B8D" strokeWidth="1.8">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="M2 7l10 7 10-7"/>
                  </svg>
                </div>
                <p className="text-sm text-gray-700">
                  {t("auth:resetLinkSent")}{" "}
                  <strong>{resetEmail}</strong>
                </p>
                <p className="text-xs text-gray-400">{t("auth:checkSpam")}</p>
              </div>

              <button
                type="button"
                onClick={() => { setStep("login"); setResetEmail(""); setError(""); }}
                className="cursor-pointer w-full bg-[#2C3B8D] hover:bg-[#1f2a63] text-white py-3 rounded-xl font-semibold"
              >
                {t("auth:backToLogin")}
              </button>
            </>
          )}

          {/* ✅ FORGOT PASSWORD FORM */}
          {step === "forgotPassword" && (
            <>
              <p className="text-sm text-gray-500 text-center">
                {t("auth:forgotPasswordDesc")}
              </p>

              <Input
                type="email"
                placeholder={t("emailPlaceholder")}
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full h-12 rounded-lg bg-gray-50 border border-gray-200"
                required
                autoFocus
              />

              <button
                disabled={loading || !resetEmail.trim()}
                className="w-full bg-[#2C3B8D] hover:bg-[#1f2a63] text-white py-3 rounded-xl font-semibold disabled:opacity-50"
              >
                {loading ? t("auth:sending") : t("auth:sendResetLink")}
              </button>

              <div className="text-center text-sm">
                <button
                  type="button"
                  onClick={() => { setStep("login"); setError(""); }}
                  className="text-[#2C3B8D] hover:text-[#1f2a63]"
                >
                  ← {t("backToLogin")}
                </button>
              </div>
            </>
          )}

          {/* VERIFY */}
          {step === "verify" && (
            <>
              <p className="text-center text-sm">
                {t("sentCode")} <br />
                <strong>{verificationEmail}</strong>
              </p>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                autoFocus
                value={verificationCode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  if (val.length <= 6) setVerificationCode(val);
                }}
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 
                focus:outline-none focus:ring-2 focus:ring-[#2C3B8D]/20 focus:border-[#2C3B8D]"
                placeholder="000000"
              />
              <button
                disabled={loading || verificationCode.length !== 6}
                className="w-full bg-[#2C3B8D] hover:bg-[#1f2a63] text-white py-3 rounded-xl disabled:opacity-50"
              >
                {loading ? t("verifying") : t("verifyEmail")}
              </button>
              <div className="flex justify-between text-sm">
                <button type="button" onClick={() => setStep("login")}>{t("backToLogin")}</button>
                <button type="button" onClick={handleResend} disabled={cooldown > 0}>
                  {cooldown > 0 ? t("resendIn", { seconds: cooldown }) : t("resendCode")}
                </button>
              </div>
            </>
          )}

          {/* LOGIN / REGISTER */}
          {step !== "verify" && step !== "forgotPassword" && step !== "forgotPasswordSent" && (
            <>
              {step === "register" && (
                <input
                  type="text"
                  placeholder={t("namePlaceholder")}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200"
                />
              )}

              <Input
                type="email"
                placeholder={t("emailPlaceholder")}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full h-12 rounded-lg bg-gray-50 border border-gray-200"
                required
              />

             <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={t("auth:passwordPlaceholderLogin")}
                className="pr-12 h-12 border-gray-300"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-[#2C3B8D]"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* relative div 밖으로 */}
            {step === "register" && form.password.length > 0 && (
              <ul className="space-y-1 text-xs px-1 mt-1">
                {[
                  { key: "length",    label: t("auth:passwordRule.length") },
                  { key: "uppercase", label: t("auth:passwordRule.uppercase") },
                  { key: "number",    label: t("auth:passwordRule.number") },
                ].map(({ key, label }) => (
                  <li key={key} className={`flex items-center gap-1.5 ${passwordRules[key] ? "text-green-500" : "text-gray-400"}`}>
                    <span>{passwordRules[key] ? "✓" : "○"}</span>
                    {label}
                  </li>
                ))}
              </ul>
            )}

              {/* ✅ Forgot password 링크 (login step에서만 표시) */}
              {step === "login" && (
                <div className="flex justify-between text-sm">
                  <button
                    type="button"
                    onClick={() => setStep(step === "register" ? "login" : "register")}
                    className="text-[#2C3B8D] hover:text-[#1f2a63] cursor-pointer"
                  >
                    {t("auth:createAccount", "Create account")}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => { setStep("forgotPassword"); setResetEmail(form.email); setError(""); }}
                    className="cursor-pointer text-sm text-[#2C3B8D] hover:text-[#1f2a63]"
                  >
                    {t("auth:forgotPassword")}
                  </button>
                </div>
              )}

           

              <button
                disabled={loading}
                className="w-full bg-[#2C3B8D] hover:bg-[#1f2a63] text-white py-3 rounded-xl font-semibold disabled:opacity-50"
              >
                {loading
                  ? step === "register" ? t("creating") : t("signingIn")
                  : step === "register" ? t("createAccount") : t("signIn")}
              </button>

                 {step === "register" && (
                  <div className="text-center text-sm">
                    <button
                      type="button"
                      onClick={() => { setStep("login"); setError(""); }}
                      className="text-[#2C3B8D] hover:text-[#1f2a63]"
                    >
                      ← {t("backToLogin")}
                    </button>
                  </div>
              )}
            </>
          )}
        </form>
      </div>
    </div>
  );
}