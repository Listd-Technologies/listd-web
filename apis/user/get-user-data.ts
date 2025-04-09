import fetchApi from "@/hooks/api/v1/utils/fetchApi";
import { UserData } from "@/types/user";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

export async function getUserData(token?: string) {
  return fetchApi<UserData>({
    url: '/users/me',
    token
      // Pass the token here
  });
}

export const useGetUserData = (
  options?: Partial<UseQueryOptions<UserData, any>>,
) => {
  return useQuery({
    queryKey: ["user-data"],
    queryFn: () => getUserData(),
    ...options,
  });
};