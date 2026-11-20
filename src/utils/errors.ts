import axios from "axios";

export function errorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error) && typeof error.response?.data === "string") {
    return error.response.data;
  }
  if (axios.isAxiosError(error) && error.response?.data) {
    const data = error.response.data as { message?: unknown; detail?: unknown };
    if (typeof data.message === "string") return data.message;
    if (typeof data.detail === "string") return data.detail;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
