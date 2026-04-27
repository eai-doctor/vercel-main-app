import {
    AdminRegister,
    AdminLogin,
    AdminDashboard
} from '@/pages/admin';

import { AdminOnlyGuard } from "@/app/RouteGuard";


export const adminRoutes = [
  { path: "/admin/register", element: <AdminRegister /> },
  { path: "/admin/login", element: <AdminLogin /> },
  { path: "/admin/dashboard", element: <AdminOnlyGuard><AdminDashboard /></AdminOnlyGuard> },
];
