import { RequestInit } from "next/dist/server/web/spec-extension/request";
import { redirect } from "next/navigation";
import { API_VERSION, API_BASE_URL } from "../constants";
import { getClerkSessionToken } from "./getClerkSessionToken";

interface FetchApiOptions extends RequestInit {
  baseURL?: string;
  url: string;
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params?: Record<string, any>;
  data?: object;
  token?: string | null;
}

const fetchApi = async <T>(
  options: FetchApiOptions = { url: "", token: null }
): Promise<T> => {
  const baseURL = `${API_BASE_URL}${API_VERSION}`;
  
  let token: string | null = options.token ?? null;
  
  // Get token based on environment
  if(!token) {
    if (typeof window === "undefined") {
      // Server-side: use dynamic import
      try {
        const { auth } = await import("@clerk/nextjs/server");
        const { getToken } = await auth();
        token = await getToken();
      } catch (error) {
        console.error("Error getting server token:", error);
        token = null;
      }
    } else {
      try {
          token = await getClerkSessionToken();
        } catch (error) {
          console.error("Error getting client token:", error);
          token = null;
      }
    }
  }

  if (!options.baseURL) {
    options.baseURL = baseURL;
  }

  let queryString = "";

  if (options.params) {
    const searchParamsObj = options.params;
    const queryParts: string[] = [];

    Object.keys(searchParamsObj).forEach((key) => {
      if (!searchParamsObj[key] && searchParamsObj[key] !== 0) {
        // Skip null/undefined values
      } else if (Array.isArray(searchParamsObj[key])) {
        const arrayValue = searchParamsObj[key].join(",");
        queryParts.push(`${encodeURIComponent(key)}=${arrayValue}`);
      } else {
        queryParts.push(
          `${encodeURIComponent(key)}=${encodeURIComponent(searchParamsObj[key].toString())}`,
        );
      }
    });

    if (queryParts.length > 0) {
      queryString = queryParts.join("&");
    }
  }

  const headers: HeadersInit & { Authorization?: string } = {
    ...options.headers,
    Accept: "application/json, text/plain, */*",
    "Content-Type": "application/json",
  };

  // Add token to headers if available
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (options.data) {
    options.body = JSON.stringify(options.data);
  }

  console.log("headers", headers);

  const url = `${options.baseURL}${options.url}${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    ...options,
    headers,
    next: {
      revalidate: 120,
    },
  });

  // Handle authentication errors
  if (response.status === 401) {
    // If on client side, redirect to login
    if (typeof window !== "undefined") {
      window.location.href = "/login";
      return {} as T; // Return empty to avoid errors during redirect
    } else {
      // On server side, use redirect from next/navigation
      redirect("/login");
    }
  }

  if (!response.ok) {
    const errorData = await response.text();

    try {
      // Try to parse as JSON
      const errorJson = JSON.parse(errorData);
      return Promise.reject(errorJson as Error);
    } catch {
      // const error = {
      //   code: response.status,
      //   detail: "Something went wrong",
      //   instance: "",
      //   meta: [],
      //   status: response.status,
      //   title: "Server Error",
      //   type: "",
      // };

      return Promise.reject();
    }
  }

  return await response.json();
};

export default fetchApi;
