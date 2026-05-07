import { Stethoscope, User, ArrowRight } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "react-router-dom";

export default function AppFooter() {
  const { user } = useAuth();
  const location = useLocation();
  const { t } = useTranslation(['privacy']);

  const isClinicRoute = location.pathname.includes("clinic");

  const portalSwitchHref = isClinicRoute
    ? "/"
    : user?.role === "clinician"
    ? "/clinics"
    : "/clinic-login";

  const portalTitle = isClinicRoute
    ? t('footer.portalTitle.patient')
    : t('footer.portalTitle.clinician');

  const portalDescription = isClinicRoute
    ? t('footer.portalDesc.patient')
    : t('footer.portalDesc.clinician');

  const portalCta = isClinicRoute
    ? t('footer.portalCta.patient')
    : t('footer.portalCta.clinician');

  const PortalIcon = isClinicRoute ? User : Stethoscope;

  return (
    <footer className="border-t border-blue-200 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-8 text-sm text-gray-600">

        {/* Company Info + Portal Switch Card */}
        <div>
          <h3 className="text-gray-800 font-semibold mb-3">
            {t('footer.companyName')}
          </h3>
          <p>{t('footer.companyDesc')}</p>

          <a
            href={portalSwitchHref}
            className="mt-6 group block bg-white border border-blue-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-[#2C3B8D] transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-[#2C3B8D] transition-colors">
                <PortalIcon className="w-5 h-5 text-[#2C3B8D] group-hover:text-white transition-colors" />
              </div>
              <h4 className="text-gray-800 font-semibold text-base">
                {portalTitle}
              </h4>
            </div>

            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              {portalDescription}
            </p>

            <span className="inline-flex items-center gap-2 text-sm font-medium text-[#2C3B8D] group-hover:gap-3 transition-all">
              {portalCta}
              <ArrowRight className="w-4 h-4" />
            </span>
          </a>
        </div>

        {/* Privacy Officer */}
        <div>
          <h3 className="text-gray-800 font-semibold mb-3">
            {t('footer.privacyOfficer.title')}
          </h3>
          <p>{t('footer.privacyOfficer.name')}</p>
          <p>{t('footer.privacyOfficer.email')}</p>
          <p>{t('footer.privacyOfficer.phone')}</p>
        </div>

        {/* Legal */}
        <div>
          <div>
            <h3 className="text-gray-800 font-semibold mb-3">
              {t('footer.legal.title')}
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="/privacy-policy" className="hover:text-blue-600 transition">
                  {t('title')}
                </a>
              </li>
            </ul>
          </div>
          <div className="mt-6 group block">
            <h3 className="text-gray-800 font-semibold mb-3">
              {t('footer.about.title')}
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="https://tech.e-ai.ca" className="hover:text-blue-600 transition">
                  {t('footer.about.blog')}
                </a>
              </li>
              <li>
                <a href="/admin/login" className="hover:text-blue-600 transition">
                  {t('footer.about.businessHelp')}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} E-AI Doctor. {t('footer.copyright')}
      </div>
    </footer>
  );
}