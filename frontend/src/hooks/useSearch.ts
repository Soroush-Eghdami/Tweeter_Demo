import { useQuery } from "@tanstack/react-query";
import api from "../api-services/api";

const searchFunc = async (q: string, signal?: AbortSignal) => {
  const response = await api.get("/accounts/search/", {
    params: { q },
    signal,
  });
  return response.data;
};

export const useSearch = (q: string) => {
  return useQuery({
    queryKey: ["search", q],
    queryFn: ({ signal }) => searchFunc(q, signal),
    refetchOnWindowFocus: false,
    enabled: !!q,
  });
};
