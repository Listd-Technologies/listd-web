// Server-side functions
import { auth as clerkAuth, currentUser } from '@clerk/nextjs/server';

// Client-side functions
import { useAuth as useClerkAuth } from '@clerk/nextjs';

// Server-side auth functions - ONLY USE IN SERVER COMPONENTS
export async function getAuthToken() {
  const { getToken } = await clerkAuth();
  return await getToken();
}

export async function getUserId() {
  const { userId } = await clerkAuth();
  return userId;
}

export async function getUser() {
  return await currentUser();
}

// Client-side auth hook - ONLY USE IN CLIENT COMPONENTS
// export function useAuth() {
//   const { isLoaded, isSignedIn, getToken, userId } = useClerkAuth();
  
//   return {
//     isLoaded,
//     isSignedIn,
//     getToken,
//     userId
//   };
// } 