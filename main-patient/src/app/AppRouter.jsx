import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./AppLayout";
import { publicRoutes } from "./routes.public";
import { patientRoutes } from "./routes.patient";
import LoginPage from "./LoginPage";
export default function AppRouter() {
  return <Routes><Route element={<AppLayout />}>
    {publicRoutes.map(r => <Route key={r.path} path={r.path} element={r.element} />)}
    {patientRoutes.map(r => <Route key={r.path} path={r.path} element={r.element} />)}
    <Route path="/login" element={<LoginPage />} />
    <Route path="*" element={<section className="p-12 text-center"><h1>Page not found</h1><a href="/">Return to portal</a></section>} />
  </Route></Routes>;
}
