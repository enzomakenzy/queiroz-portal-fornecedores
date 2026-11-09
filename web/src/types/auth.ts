export interface Supplier {
  id: number;
  companyName: string;
}

export interface LoginRequest {
  id: number;
  password: string;
}

export interface LoginResponse {
  supplier: Supplier;
}
