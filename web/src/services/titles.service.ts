import { api } from "@/lib/api";
import type {
  FetchPendingTitlesResponse,
  TitleStatusFilter,
} from "@/types/titles";

export interface FetchPendingTitlesParams {
  page?: number;
  limit?: number;
  status?: TitleStatusFilter;
}

export async function fetchPendingTitles(
  params?: FetchPendingTitlesParams,
): Promise<FetchPendingTitlesResponse> {
  const response = await api.get<FetchPendingTitlesResponse>("/titles", {
    params,
  });
  return response.data;
}
