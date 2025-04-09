import fetchApi from "@/hooks/api/v1/utils/fetchApi";
import { UseMutationOptions, useMutation } from "@tanstack/react-query";

export const updateProfile = async (payload: any) => {
  return await fetchApi<void>({
    url: "/users/me",
    method: "PUT",
    data: payload,
  });
};

export const useUpdateProfile = (
  options?: UseMutationOptions<void, any, any, unknown>,
) => {
  return useMutation({
    ...options,
    mutationFn: updateProfile,
    mutationKey: ["update-profile"],
  });
};