import { BrowserRouter, Navigate, Route, Routes } from "react-router";

function LoginPage() {
  return <div>Tela de Login</div>;
}

function DashboardPage() {
  return <div>Tela de Pendências</div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<DashboardPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
