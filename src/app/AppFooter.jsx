import { Stethoscope, User, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "react-router-dom";

export default function AppFooter() {
  const { user } = useAuth();
  const location = useLocation();

  const isClinicRoute = location.pathname.includes("clinic");

  const portalSwitchHref = isClinicRoute
    ? "/"
    : user?.role === "clinician"
    ? "/clinics"
    : "/clinic-login";

  const portalTitle = isClinicRoute ? "For Patients" : "For Clinicians";
  const portalDescription = isClinicRoute
    ? "Access health consultations, your medical profile, and self-triage tools."
    : "Access patient records, SOAP notes, and AI-powered consultation tools.";
  const portalCta = isClinicRoute ? "Visit Patient Portal" : "Visit Clinic Portal";
  const PortalIcon = isClinicRoute ? User : Stethoscope;

  return (
    <footer className="border-t border-blue-200 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-8 text-sm text-gray-600">

        {/* Company Info + Portal Switch Card */}
        <div>
          <h3 className="text-gray-800 font-semibold mb-3">E-AI Doctor</h3>
          <p>
            AI-Powered Medical Intelligence Platform providing secure and
            compliant healthcare data solutions.
          </p>

          {/* Portal Switch CTA Card */}
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
          <h3 className="text-gray-800 font-semibold mb-3">Privacy Officer</h3>
          <p>Dr. Zhenlong Liu</p>
          <p>Email: support@e-ai.ca</p>
          <p>Phone: +1 (450) 688-8377</p>
        </div>

        {/* Legal */}
        <div>
          <h3 className="text-gray-800 font-semibold mb-3">Legal</h3>
          <ul className="space-y-2">
            <li>
              <a href="/privacy-policy" className="hover:text-blue-600 transition">
                Privacy Policy
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-200 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} E-AI Doctor. All rights reserved.
      </div>
    </footer>
  );
}