import api from "@/api/api";
import type { Category, PageResult, Tour } from "@/types/tour";

interface GetToursParams {
  city?: string;
  category?: Category;
  page?: number;
  size?: number;
}

export async function getTours(params: GetToursParams = {}): Promise<PageResult<Tour>> {
  const response = await api.get<PageResult<Tour>>("/tours", {
    params,
  });

  return response.data;
}
