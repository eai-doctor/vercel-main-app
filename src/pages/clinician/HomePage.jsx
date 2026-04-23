import { useCallback } from "react";
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { MessageSquare, Dna, ClipboardList, LogIn } from "lucide-react";
import { FeatureCard, Header, SystemStatus } from "@/components";
import { UserIcon, StethoscopeIcon, BooksIcon, SettingsIcon } from "@/components/ui/icons";

/* -------------------- Main Page -------------------- */
export default function HomePage() {
  const navigate = useNavigate();
  const { t } = useTranslation(['clinic', 'common']);
  const { isAuthenticated, loading, accessToken  } = useAuth();

  const baseModules = [
    {
      id: "patient-browse",
      title: t('clinic:home.modules.consultation.title'),
      description: t('clinic:home.modules.consultation.description'),
      icon: <UserIcon className="w-12 h-12 text-blue-500" />,
      route: "/patients",
      color: "from-blue-400 via-blue-500 to-blue-600",
      disabled: false
    },
    {
      id: "consultation",
      title: t('clinic:home.modules.genetic.title'),
      description: t('clinic:home.modules.genetic.description'),
      icon: <StethoscopeIcon className="w-12 h-12 text-blue-500" />,
      externalUrl: 
      "https://genetic.e-ai.ca/dashboard" ,
      // "http://localhost:4200/dashboard",
      color: "from-blue-500 via-blue-600 to-blue-700",
    },
    {
      id: "function-libraries",
      title: t('clinic:home.modules.functionLibrary.title'),
      description: t('clinic:home.modules.functionLibrary.description'),
      icon: <BooksIcon className="w-12 h-12 text-blue-500" />,
      route: "/functions",
      color: "from-blue-400 to-blue-600",
      disabled: false
    },
  ];


  const handleFeatureClick = useCallback(
    (module) => {
      if (module.externalUrl) {
        if (isAuthenticated) {
          const url = accessToken
            ? `${module.externalUrl}?token=${encodeURIComponent(accessToken)}`
            : module.externalUrl;
          window.open(url, "_blank", "noopener,noreferrer");
        } else {
          window.open(module.externalUrl, "_blank", "noopener,noreferrer");
        }
        return;
      }

      if (!module.requiresAuth || isAuthenticated) {
        navigate(module.route);
        return;
      }

      if (!loading) {
        window.location.replace("/clinic-login"); 
      }
    },
    [isAuthenticated, loading, navigate]
  );

  const handleOnSignInBtnClick = () => window.location.replace("/clinic-login");

  return (
    <div className="min-h-96 bg-gradient-to-br from-gray-50 to-blue-50">
      
      {/* ---------------- Header ---------------- */}
      <Header handleOnSignInBtnClick={handleOnSignInBtnClick} />
      
      {/* ---------------- Hero ---------------- */}
      <section className="max-w-5xl mx-auto px-4 py-14 text-center">
        <h2 className="text-4xl font-semibold text-gray-800 mb-3">
          {t('common:appName')}
        </h2>

        <p className="text-lg text-gray-500">
          {t('common:appSubtitle')}
        </p>
      </section>

      {/* ---------------- Feature Cards ---------------- */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          { baseModules.map((e, index) => <FeatureCard
            key={`clinic-card-`+index}
            disabled={e.disabled}
            icon={e.icon}
            title={e.title}
            description={e.description}
            onClick={()=>handleFeatureClick(e)}
          />) }

        </div>
      </section>

      {/* ---------------- Status ---------------- */}
      <SystemStatus />
    </div>
  );
}