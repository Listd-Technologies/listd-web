"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React, { useState } from "react";
import { getQueryClient } from "./get-query-client";

interface ReactQueryProviderProps {
  children: React.ReactNode;
}

/**
 * Provider for React Query with client-side only rendering
 */
export function ReactQueryProvider({ children }: ReactQueryProviderProps) {
  // Create a client on the client-side
  // const [queryClient] = useState(
  //   () =>
  //     new QueryClient({
  //       defaultOptions: {
  //         queries: {
  //           staleTime: 60 * 1000, // 1 minute
  //           refetchOnWindowFocus: false,
  //         },
  //       },
  //     })
  // );
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
