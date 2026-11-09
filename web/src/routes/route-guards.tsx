import { Navigate, Outlet } from "react-router";
import { getStoredSupplier } from "@/services/auth.service";

export function ProtectedRoute() {
  const supplier = getStoredSupplier();

  if (!supplier) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export function PublicOnlyRoute() {
  const supplier = getStoredSupplier();

  if (supplier) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
