import {
    ClinicJoin,
    PrivacyPolicy,
    Settings,
    ResetPasswordPage, 
    AboutUs,
    HelpCenter,
    LegalPage,
    DemoRequest
} from '@/pages/public';

import { PublicOnlyGuard } from "@/app/RouteGuard";


export const publicRoutes = [
  // { path: "/", element: <LandingPage /> },
  { path: "/clinic-join", element: <ClinicJoin mode="scrolling" /> },
  // { path: "/clinic-register", element: <PublicOnlyGuard><ClinicLoginPage mode="register" /></PublicOnlyGuard> },
  // { path: "/personal-home", element: <PersonalLandingPage />},
  { path: "/privacy-policy", element: <PrivacyPolicy /> },
  // { path: "/consent", element: <ConsentSettings /> },
  { path: "/settings", element: <Settings /> },
  // { path: "/genetic", element: <GeneticConsult /> },
  {
    path: "/demo-request",
    element: <DemoRequest />,
  },
  { path: "/reset-password", element: <ResetPasswordPage  /> },
  { path: "/about-us", element: <AboutUs  /> },
  { path: "/help-center", element: <HelpCenter /> },
  { path: "/legal", element: <LegalPage /> },
];
