"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Settings, 
  Home, 
  Lock, 
  Check, 
  ChevronRight, 
  Mail, 
  Phone, 
  UserCheck,
  LogOut,
  Edit,
  PlusCircle
} from "lucide-react";
import { useGetUserData } from "@/apis/user/get-user-data";
import { useClerk, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("about");
  const { user: clerkUser } = useUser();
  const { data: userData } = useGetUserData();
  const { signOut } = useClerk();
  const router = useRouter();

  // Handle sign out
  const handleSignOut = () => {
    signOut().then(() => {
      router.push("/");
    });
  };

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (userData?.first_name && userData?.last_name) {
      return `${userData.first_name[0]}${userData.last_name[0]}`.toUpperCase();
    }
    return clerkUser?.firstName && clerkUser?.lastName 
      ? `${clerkUser.firstName[0]}${clerkUser.lastName[0]}`.toUpperCase()
      : clerkUser?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() || "U";
  };

  // Get full name
  const getFullName = () => {
    if (userData?.first_name && userData?.last_name) {
      return `${userData.first_name} ${userData.last_name}`;
    }
    return clerkUser?.fullName || "User";
  };

  // Placeholder data for reviews
  const reviews = [
    {
      id: 1,
      name: "John Doe",
      rating: 4.2,
      text: "It's a wonderful experience interacting with Angelo. The quick brown fox jumps over the lazy dog, bringing joy and excitement to all."
    },
    {
      id: 2,
      name: "Jane Doe",
      rating: 4.5,
      text: "It's a wonderful experience interacting with Angelo. The quick brown fox jumps over the lazy dog, bringing joy and excitement to all."
    }
  ];

  // Placeholder data for listings
  const listings = [
    {
      id: 1,
      title: "Cozy Urban Apartment in Silicon Valley",
      price: "$1,850/day",
      image: "/placeholder.jpg",
      location: "Palo Alto, CA"
    },
    {
      id: 2,
      title: "Modern Loft with City View",
      price: "$2,150/day",
      image: "/placeholder.jpg",
      location: "San Francisco, CA"
    }
  ];

  return (
    <div className="container mx-auto py-16 px-4 hide-footer">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Profile & Navigation */}
        <div className="space-y-6">
          {/* Profile Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={clerkUser?.imageUrl || ""} alt="Profile" />
                  <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary text-white text-xl font-semibold">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold">{getFullName()}</h2>
                <p className="text-sm text-muted-foreground">{clerkUser?.emailAddresses?.[0]?.emailAddress}</p>
                
                <Button 
                  variant="outline" 
                  className="mt-4 text-sm"
                  onClick={() => router.push("/update-profile")}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Menu */}
          <Card>
            <CardContent className="p-0">
              <nav className="flex flex-col">
                <div className="px-4 py-3 font-medium text-sm text-muted-foreground">
                  Theme
                </div>
                <Button variant="ghost" className="justify-start rounded-none h-12 px-4">
                  <Settings className="h-4 w-4 mr-3" />
                  Light Mode
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Button>

                <div className="px-4 py-3 font-medium text-sm text-muted-foreground">
                  Housing
                </div>
                <Button variant="ghost" className="justify-start rounded-none h-12 px-4">
                  <PlusCircle className="h-4 w-4 mr-3" />
                  Post Listing
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Button>
                <Button variant="ghost" className="justify-start rounded-none h-12 px-4">
                  <Home className="h-4 w-4 mr-3" />
                  Valuate Property
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Button>

                <div className="px-4 py-3 font-medium text-sm text-muted-foreground">
                  Settings
                </div>
                <Button 
                  variant="ghost" 
                  className="justify-start rounded-none h-12 px-4"
                  onClick={() => router.push("/update-profile")}
                >
                  <User className="h-4 w-4 mr-3" />
                  Personal Information
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Button>
                <Button variant="ghost" className="justify-start rounded-none h-12 px-4">
                  <Lock className="h-4 w-4 mr-3" />
                  Login & Security
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Button>

                <Button 
                  variant="ghost" 
                  className="justify-start rounded-none h-12 px-4 text-red-600"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Sign Out
                </Button>
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Content */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-0">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">{getFullName()}</h2>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="about" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="about">About</TabsTrigger>
                  <TabsTrigger value="published">Published</TabsTrigger>
                  <TabsTrigger value="closed">Closed</TabsTrigger>
                </TabsList>

                <TabsContent value="about" className="pt-4">
                  {/* Verification Section */}
                  <div className="mb-6">
                    <h3 className="text-md font-semibold mb-3">Verification</h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">Identity</span>
                      </div>
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">Email Address</span>
                      </div>
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">Phone Number</span>
                      </div>
                    </div>
                  </div>

                  {/* Reviews Section */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-md font-semibold">Reviews</h3>
                    </div>
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="border-b pb-4 last:border-0 last:pb-0">
                          <div className="flex items-center mb-2">
                            <div className="bg-gray-200 h-8 w-8 rounded-full mr-2"></div>
                            <span className="font-medium">{review.name}</span>
                          </div>
                          <p className="text-sm text-gray-600">{review.text}</p>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full text-sm">
                        View All Reviews
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="published" className="pt-4">
                  <div className="space-y-4">
                    {listings.map((listing) => (
                      <div key={listing.id} className="border rounded-md overflow-hidden">
                        <div className="bg-gray-200 h-48 w-full flex items-center justify-center text-gray-400">
                          Listing Image
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium">{listing.title}</h3>
                          <p className="text-sm text-gray-500">{listing.location}</p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-lg font-bold">{listing.price}</span>
                            <Button size="sm" variant="outline">View</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="closed" className="pt-4">
                  {activeTab === "closed" && (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="bg-gray-200 h-24 w-24 flex items-center justify-center rounded-md mb-4">
                        <span className="text-gray-400">No image</span>
                      </div>
                      <h3 className="text-lg font-medium">No closed listings to show</h3>
                      <p className="text-sm text-gray-500 text-center mt-2">
                        Once a listing is closed, it will appear here.
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">Personal Information</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Legal Name</p>
                  <p className="font-medium">{getFullName()}</p>
                </div>
                <Button size="sm" variant="ghost">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
              <Separator />

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Phone Number</p>
                  <p className="font-medium">{userData?.phone_number || "+1 123 456 7890"}</p>
                </div>
                <Button size="sm" variant="ghost">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
              <Separator />

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Email Address</p>
                  <p className="font-medium">{clerkUser?.emailAddresses?.[0]?.emailAddress}</p>
                </div>
                <Button size="sm" variant="ghost">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
              <Separator />

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{userData?.address || "Not Provided"}</p>
                </div>
                <Button size="sm" variant="ghost">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
              <Separator />

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Emergency Contact</p>
                  <p className="font-medium">Not Provided</p>
                </div>
                <Button size="sm" variant="ghost">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
              <Separator />

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Government ID</p>
                  <p className="font-medium">Not Provided</p>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost"
                  className="text-red-600"
                >
                  Remove
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
