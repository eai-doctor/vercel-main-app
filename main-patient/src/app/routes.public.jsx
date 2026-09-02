import PrivacyPolicy from "@/pages/public/legal/PrivacyPolicy.jsx";
import Settings from "@/pages/public/settings/index.jsx";
import ResetPasswordPage from "@/pages/public/ResetPasswordPage.jsx";
import AboutUs from "@/pages/public/AboutUs.jsx";
import HelpCenter from "@/pages/public/HelpCenter.jsx";
import LegalPage from "@/pages/public/legal/Legal.jsx";

import { RouteGuard, PublicOnlyGuard } from "@/app/RouteGuard";


export const publicRoutes = [
  // { path: "/", element: <LandingPage /> },

  // { path: "/clinic-register", element: <PublicOnlyGuard><ClinicLoginPage mode="register" /></PublicOnlyGuard> },
  // { path: "/personal-home", element: <PersonalLandingPage />},
  { path: "/privacy-policy", element: <PrivacyPolicy /> },
  // { path: "/consent", element: <ConsentSettings /> },
  { path: "/settings", element: <RouteGuard><Settings /></RouteGuard> },
  // { path: "/genetic", element: <GeneticConsult /> },

  { path: "/reset-password", element: <ResetPasswordPage  /> },
  { path: "/about-us", element: <AboutUs  /> },
  { path: "/help-center", element: <HelpCenter /> },
  { path: "/legal", element: <LegalPage /> },
];
