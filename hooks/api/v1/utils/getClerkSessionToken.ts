"use client"

type WindowWithClerk = Window & {
  Clerk?: {
    session?: {
      getToken(): Promise<string | null>
    }
  }
}

export const getClerkSessionToken = async () => {
  if (!(window as WindowWithClerk).Clerk?.session) return null
  return (await (window as WindowWithClerk)?.Clerk?.session?.getToken()) ?? null
}