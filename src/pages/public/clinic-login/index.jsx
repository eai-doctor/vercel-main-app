import { useTranslation } from 'react-i18next';

import logoImage from "/images/logo.png";
import Fields from './fields';
// import ClinicRegister from "@/features/clinic-login/ClinicRegister";

export default function ClinicLoginPage( { mode } ) {
  const { t } = useTranslation(['landing', 'common', 'clinic', 'auth']);


  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-[#2C3B8D] via-[#277cc4] to-[#0ba9ea] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img src={logoImage} alt="E-AI Doctor Logo" className="w-48 h-24" />
          </div>
          <h1 className="text-white text-3xl font-semibold mb-2">{t('common:appName')}</h1>
          <p className="text-white/80 text-sm mt-2">{t('common:appSubtitle')}</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          
 
          {mode === "login" && <Fields />}
          {/*{mode === "register" && <ClinicRegister />} */}


          {/* <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Are you a patient?{" "}
              <a href="/" className="text-[#277cc4] hover:text-[#2C3B8D] font-medium transition-colors">
                Visit Personal Portal
              </a>
            </p>
          </div> */}
        </div>
      </div>
    </div>
    </> 
  );
}