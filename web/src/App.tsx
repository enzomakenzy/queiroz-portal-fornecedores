import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { LoginPage } from "@/pages/login";
import { DashboardPage } from "@/pages/dashboard";
import { ProtectedRoute, PublicOnlyRoute } from "@/routes/route-guards";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota pública exclusiva para visitantes não autenticados */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Rota protegida exclusiva para fornecedores autenticados */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
