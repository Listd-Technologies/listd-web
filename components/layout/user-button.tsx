"use client";

import { useRouter } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, Home } from "lucide-react";
import { useGetUserData } from "@/apis/user/get-user-data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";

export function UserButton() {
  const router = useRouter();
  const { signOut } = useClerk();
  const { user } = useUser();
  const { data: userData } = useGetUserData();

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (userData?.first_name && userData?.last_name) {
      return `${userData.first_name[0]}${userData.last_name[0]}`.toUpperCase();
    }
    return user?.firstName && user?.lastName 
      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
      : user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() || "U";
  };

  // Handle navigation to profile page
  const handleProfileClick = () => {
    router.push("/profile");
  };

  // Handle sign out
  const handleSignOut = () => {
    signOut().then(() => {
      router.push("/");
    });
  };

  // Navigation helper
  const navigateTo = (path: string) => {
    router.push(path);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="group flex items-center space-x-2 p-2 rounded bg-background hover:bg-accent/40 transition-all duration-200 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.imageUrl || ""} alt="Profile" className="object-cover" />
            <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary font-semibold text-white">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col items-start">
            <span className="text-sm font-medium">
              {userData?.first_name || user?.firstName || "Account"}
            </span>
          </div>
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56 p-2">
        <div className="flex items-center space-x-2 px-2 py-2.5 mb-1">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.imageUrl || ""} alt="Profile" className="object-cover" />
            <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary font-semibold text-white">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-sm font-semibold">
              {userData?.first_name && userData?.last_name
                ? `${userData.first_name} ${userData.last_name}`
                : user?.fullName || "User"}
            </h3>
            <p className="text-xs text-muted-foreground truncate max-w-[150px]">
              {user?.emailAddresses?.[0]?.emailAddress || ""}
            </p>
          </div>
        </div>
        
        <DropdownMenuSeparator className="my-1" />
        
        <DropdownMenuGroup>
          {/* <DropdownMenuItem 
            onClick={() => navigateTo('/dashboard')}
            className="cursor-pointer flex items-center h-9 px-3 rounded"
          >
            <Home className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </DropdownMenuItem> */}
          
          <DropdownMenuItem 
            onClick={handleProfileClick}
            className="cursor-pointer flex items-center h-9 px-3 rounded"
          >
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator className="my-1" />
        
        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer flex items-center h-9 px-3 rounded text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 font-medium"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 