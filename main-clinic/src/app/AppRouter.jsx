import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./AppLayout";
import { publicRoutes } from "./routes.public";
import { clinicianRoutes } from "./routes.clinician";
import { functionRoutes } from "./routes.clinician.functions";
import { adminRoutes } from "./routes.admin";
import { RouteGuard } from "./RouteGuard";
export default function AppRouter() {
  return <Routes><Route element={<AppLayout />}>
    {publicRoutes.map(r => <Route key={r.path} path={r.path} element={r.element} />)}
    <Route path="/" element={<Navigate to="/clinics" replace />} />
    {[...clinicianRoutes, ...functionRoutes].map(r => <Route key={r.path} path={r.path} element={<RouteGuard roles={["clinician","admin"]}>{r.element}</RouteGuard>} />)}
    {adminRoutes.map(r => <Route key={r.path} path={r.path} element={r.element} />)}
    <Route path="*" element={<section className="p-12 text-center"><h1>Page not found</h1><a href="/">Return to portal</a></section>} />
  </Route></Routes>;
}
