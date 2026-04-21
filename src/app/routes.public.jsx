import {
    ClinicLoginPage,
    PrivacyPolicy,
    ClinicJoin,
    Settings,
    ResetPasswordPage 
} from '@/pages/public';

import { PublicOnlyGuard } from "@/app/RouteGuard";


export const publicRoutes = [
  // { path: "/", element: <LandingPage /> },
  { path: "/clinic-login", element: <ClinicLoginPage mode="login" /> },
  // { path: "/clinic-register", element: <PublicOnlyGuard><ClinicLoginPage mode="register" /></PublicOnlyGuard> },
  // { path: "/personal-home", element: <PersonalLandingPage />},
  { path: "/privacy-policy", element: <PrivacyPolicy /> },
  // { path: "/consent", element: <ConsentSettings /> },
  { path: "/settings", element: <Settings /> },
  // { path: "/genetic", element: <GeneticConsult /> },
  {
    path: "/clinic-join",
    element: <ClinicJoin />,
  },
  { path: "/reset-password", element: <ResetPasswordPage  /> },
];
