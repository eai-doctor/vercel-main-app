import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui";

export default function LoginModal({
  onClose,
  onSuccess,
  defaultRole = "patient",
  message,
}) {
  const { login, register, verifyEmail, resendVerification } = useAuth();
  const { pendingRoute } = useAuthModal();
  const { t } = useTranslation(["auth", "patient"]);
  const navigate = useNavigate();

  const [step, setStep] = useState("login"); // login | register | verify
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    role: defaultRole,
  });

  const [verificationCode, setVerificationCode] = useState("");
  const [verificationEmail, setVerificationEmail] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);

  // 초기화
  useEffect(() => {
    setStep("login");
    setForm({ email: "", password: "", name: "", role: defaultRole });
    setVerificationCode("");
    setVerificationEmail("");
    setError("");
    setLoading(false);
    setCooldown(0);

    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, [defaultRole]);

  // resend cooldown
  useEffect(() => {
    if (cooldown <= 0) return;

    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(cooldownRef.current);
  }, [cooldown]);

  // ---------- Helpers ----------
  const normalizeEmail = (email) => email.trim().toLowerCase();

  const safeError = (err) => {
    const msg = err?.response?.data?.error;

    if (msg === "Invalid email or password") {
      return t("common:invalidCredentials");
    }

    return t("common:errors.generic");
  };

  // 🔥 성공 처리 통합
  const handleSuccess = (res) => {
    if (pendingRoute) {
      navigate(pendingRoute);
    }else if (onSuccess) {
      onSuccess(res);
    }

    onClose?.();
  };

  // ---------- Handlers ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError("");
    setLoading(true);

    const email = normalizeEmail(form.email);

    try {
      if (step === "register") {
        if (!form.name.trim()) {
          setError(t("nameRequired"));
          return;
        }

        if (form.password.length < 8) {
          setError(t("passwordTooShort"));
          return;
        }

        const res = await register(email, form.password, form.name, form.role);

        if (res?.requiresVerification) {
          setVerificationEmail(res.email);
          setStep("verify");
          setCooldown(60);
        } else {
          handleSuccess(res);
        }
      } else {
        await new Promise((r) => setTimeout(r, 400)); // anti brute-force UX

        const res = await login(email, form.password);
        handleSuccess(res);
      }
    } catch (err) {
      if (err?.requiresVerification) {
        setVerificationEmail(err.email);
        setStep("verify");
        setCooldown(60);
      } else {
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

  // ---------- UI ----------
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(15,23,42,0.15)] max-w-md w-full">

        {/* Header */}
        <div className="bg-[#2C3B8D] p-5 rounded-t-2xl flex justify-between items-center">
          <div>
            <h2 className="text-white text-xl font-bold">
              {t("patient:portal.title")}
            </h2>
            <p className="text-white/80 text-sm">
              {step === "register"
                ? t("createAccount")
                : step === "verify"
                ? t("verifyEmail")
                : t("signIn")}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-white/80 hover:text-white text-xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <form
          onSubmit={step === "verify" ? handleVerify : handleSubmit}
          className="p-6 space-y-4"
        >
          {message && (
            <div className="bg-gray-50 text-gray-600 p-3 rounded-lg text-sm">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">
              {error}
            </div>
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
                focus:outline-none focus:ring-2 focus:ring-[#2C3B8D]/20 
                focus:border-[#2C3B8D]"
                placeholder="000000"
              />

              <button
                disabled={loading || verificationCode.length !== 6}
                className="w-full bg-[#2C3B8D] hover:bg-[#1f2a63] text-white py-3 rounded-xl disabled:opacity-50"
              >
                {loading ? t("verifying") : t("verifyEmail")}
              </button>

              <div className="flex justify-between text-sm">
                <button type="button" onClick={() => setStep("login")}>
                  {t("backToLogin")}
                </button>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={cooldown > 0}
                >
                  {cooldown > 0
                    ? t("resendIn", { seconds: cooldown })
                    : t("resendCode")}
                </button>
              </div>
            </>
          )}

          {/* LOGIN / REGISTER */}
          {step !== "verify" && (
            <>
              {step === "register" && (
                <input
                  type="text"
                  placeholder={t("namePlaceholder")}
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200"
                />
              )}

              <Input
                type="email"
                placeholder={t("emailPlaceholder")}
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                className="w-full h-12 rounded-lg bg-gray-50 border border-gray-200"
                required
              />

              {/* 🔥 Password with toggle */}
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder={t("auth:passwordPlaceholderLogin")}
                  className="pr-12 h-12 border-gray-300"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-[#2C3B8D]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <button
                disabled={loading}
                className="w-full bg-[#2C3B8D] hover:bg-[#1f2a63] text-white py-3 rounded-xl font-semibold disabled:opacity-50"
              >
                {loading
                  ? step === "register"
                    ? t("creating")
                    : t("signingIn")
                  : step === "register"
                  ? t("createAccount")
                  : t("signIn")}
              </button>

              <div className="text-center text-sm">
                <button
                  type="button"
                  onClick={() =>
                    setStep(step === "register" ? "login" : "register")
                  }
                  className="text-[#2C3B8D] hover:text-[#1f2a63] cursor-pointer"
                >
                  {step === "register"
                    ? t("alreadyHaveAccount")
                    : t("noAccount")}
                </button>
                  <p className="text-gray-600">
                    {t("auth:areYouClinician")}
                    <a
                      href="/clinic-login"
                      className="text-[#277cc4] hover:text-[#2C3B8D] font-medium transition-colors"
                    >
                      {t("auth:visitClinicPortal")}
                    </a>
                  </p>
              </div>
              
            </>
          )}
        </form>
      </div>
    </div>
  );
}