import { api } from "@/lib/api";
import type { LoginRequest, LoginResponse, Supplier } from "@/types/auth";

const SUPPLIER_STORAGE_KEY = "@queiroz:supplier";

export async function loginSupplier({
  id,
  password,
}: LoginRequest): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/auth/login", {
    id,
    password,
  });

  localStorage.setItem(
    SUPPLIER_STORAGE_KEY,
    JSON.stringify(response.data.supplier),
  );

  return response.data;
}

export async function logoutSupplier(): Promise<void> {
  try {
    await api.post("/auth/logout");
  } finally {
    localStorage.removeItem(SUPPLIER_STORAGE_KEY);
  }
}

export function getStoredSupplier(): Supplier | null {
  const raw = localStorage.getItem(SUPPLIER_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as Supplier;
  } catch {
    localStorage.removeItem(SUPPLIER_STORAGE_KEY);
    return null;
  }
}

export function clearStoredSupplier(): void {
  localStorage.removeItem(SUPPLIER_STORAGE_KEY);
}
