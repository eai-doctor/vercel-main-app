import { useAuth } from '@/context/AuthContext';
import { useLocation } from "react-router-dom";

export default function AppFooter () {
  const { user } = useAuth();
  const location = useLocation();

  const isClinicRoute = location.pathname.includes("clinic");

  return (
    <footer className="border-t border-blue-200 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-8 text-sm text-gray-600">
        
        {/* Company Info */}
        <div>
          <h3 className="text-gray-800 font-semibold mb-3">E-AI Doctor</h3>
          <p>
            AI-Powered Medical Intelligence Platform providing secure and
            compliant healthcare data solutions.
          </p>
          {!user && (
            <div className="mt-6 pt-6">
              <p className="text-start text-sm text-gray-600">
                {isClinicRoute ? "Are you a patient?" : "Are you a clinician?"}{" "}
                
                <a
                  href={isClinicRoute ? "/" : "/clinic-login"}
                  className="text-[#277cc4] hover:text-[#2C3B8D] font-medium transition-colors"
                >
                  {isClinicRoute ? "Visit Patient Portal" : "Visit Clinic Portal"}
                </a>
              </p>
            </div>
          )}
        </div> 

        {/* Privacy Officer */}
        <div>
          <h3 className="text-gray-800 font-semibold mb-3">
            Privacy Officer
          </h3>
          <p>Dr. Zhenlong Liu</p>
          <p>Email: support@e-ai.ca</p>
          <p>Phone: +1 (450) 688-8377</p>
        </div>

        {/* Links */}
        <div>
          <h3 className="text-gray-800 font-semibold mb-3">Legal</h3>
          <ul className="space-y-2">
            <li>
              <a
                href="/privacy-policy"
                className="hover:text-blue-600 transition"
              >
                Privacy Policy
              </a>
            </li>
            {/* <li>
              <a
                href="/information-request"
                className="hover:text-blue-600 transition"
              >
                Request Personal Information
              </a>
            </li> */}
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-200 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} E-AI Doctor. All rights reserved.
      </div>
    </footer>
  );
}

