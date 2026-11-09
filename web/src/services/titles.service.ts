import { api } from "@/lib/api";
import type { FetchPendingTitlesResponse } from "@/types/titles";

export async function fetchPendingTitles(): Promise<FetchPendingTitlesResponse> {
  const response = await api.get<FetchPendingTitlesResponse>("/titles");
  return response.data;
}
