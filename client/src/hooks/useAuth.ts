import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "../lib/queryClient";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    retry: false,
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
