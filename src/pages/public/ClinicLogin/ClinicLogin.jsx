import { useState } from "react"; // useNavigate가 필요하다면 추가하세요
import { useTranslation } from 'react-i18next';
import { Lock, User, Eye, EyeOff } from "lucide-react"; // Eye, EyeOff 추가

import { useAuth } from '@/context/AuthContext';
import { Button, Input, Label } from "@/components/ui";

function ClinicLogin() {
  const { login } = useAuth();
  const { t } = useTranslation(['landing', 'common', 'clinic', 'auth']);

  const [formData, setFormData] = useState({ email: "", password: "", name: "", role: "clinician" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(formData.email, formData.password);
    } catch (err) {
      const msg = t('common:errors.invalidCredentials');
      setError(msg);
      console.error("Login attempt failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="mb-6 text-center">
        <h2 className="text-2xl text-gray-800 font-semibold mb-2">{t('common:states.welcomeBack')}</h2>
        <p className="text-gray-600 text-sm">{t('clinic:home.welcome.signin')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="userId" className="text-gray-700">{t('common:labels.email')}</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              id="userId"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder={t('auth:emailPlaceholder')}
              className="pl-11 h-12 border-gray-300 focus:border-[#277cc4] focus:ring-[#277cc4]"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-700">{t('common:labels.password')}</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={t('auth:passwordPlaceholderLogin')}
              className="pl-11 pr-12 h-12 border-gray-300 focus:border-[#277cc4] focus:ring-[#277cc4]"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div> 

        <div className="flex items-center justify-between text-sm">
          <p className="text-center text-sm text-gray-600">
              <a href="/clinic-register" className="text-[#277cc4] hover:text-[#2C3B8D] font-medium transition-colors">
                {t('auth:joinAccount')}
              </a>
            </p>
        </div>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        <Button
          type="submit"
          disabled={submitting}
          className="w-full h-12 bg-gradient-to-r from-[#2C3B8D] to-[#277cc4] hover:from-[#1f2a63] hover:to-[#1d5d94] text-white text-base font-medium"
        >
          { submitting ? t('auth:signingIn') : t('auth:signIn')}
        </Button>
      </form>
    </>
  );
}

export default ClinicLogin;