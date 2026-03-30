import {
    ClinicLoginPage,
} from '@/pages/public';

import { PublicOnlyGuard } from "@/app/RouteGuard";


export const publicRoutes = [
  // { path: "/", element: <LandingPage /> },
  { path: "/clinic-login", element: <PublicOnlyGuard><ClinicLoginPage mode="login" /></PublicOnlyGuard> },
  // { path: "/clinic-register", element: <PublicOnlyGuard><ClinicLoginPage mode="register" /></PublicOnlyGuard> },
  // { path: "/personal-home", element: <PersonalLandingPage />},
  // { path: "/privacy-policy", element: <PrivacyPolicy /> },
  // { path: "/consent", element: <ConsentSettings /> },
  // { path: "/account", element: <AccountSettings /> },
  // { path: "/genetic", element: <GeneticConsult /> },
];
