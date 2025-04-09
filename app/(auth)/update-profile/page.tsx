"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, User, Phone, MapPin, ArrowRight } from "lucide-react";
import fetchApi from "@/hooks/api/v1/utils/fetchApi";
import { useGetUserData } from "@/apis/user/get-user-data";
import { useAuth } from "@clerk/nextjs";
import { useUpdateProfile } from "@/apis/user/update-profile";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { useToast } from "@/components/ui/use-toast";

// Define the form validation schema with latitude and longitude as numbers
const formSchema = z.object({
  first_name: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  last_name: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  phone_number: z.string()
    .regex(/^\+63\s?9\d{9}$/, {
      message: "Please enter a valid Philippines phone number (+63 9XX XXX XXXX)",
    }),
  address: z.string().min(5, {
    message: "Address must be at least 5 characters.",
  }),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

// Define the type for form values
type FormValues = z.infer<typeof formSchema>;

export default function UpdateProfilePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  // const { toast } = useToast();
  
  // Get existing user data
  const { data: userData, isLoading: isLoadingUserData } = useGetUserData({
    enabled: isLoaded && isSignedIn,
    staleTime: 10000
  });

  const { mutate: updateProfile, isPending: isUpdatingProfile } = useUpdateProfile({onSuccess: () => {
    router.push("/profile");
  }});

  // Initialize form with useForm hook
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      phone_number: "",
      address: "",
      latitude: undefined,
      longitude: undefined,
    },
  });

  // Pre-populate form with user data when it loads
  useEffect(() => {
    if (userData && !isLoadingUserData) {
      // Update form with existing user data
      form.setValue('first_name', userData.first_name || '');
      form.setValue('last_name', userData.last_name || '');
      form.setValue('phone_number', userData.phone_number || '');
      
      // Only set address from userData if no geolocation address is set yet
      if (userData.address && userData.address !== "No address provided" && !form.getValues('address')) {
        form.setValue('address', userData.address);
      }
      
      // Set coordinates if available - convert to number
      if (userData.latitude) form.setValue('latitude', Number(userData.latitude));
      if (userData.longitude) form.setValue('longitude', Number(userData.longitude));
    }
  }, [userData, isLoadingUserData, form]);

  // Function to get location from browser
  const getLocation = async () => {
    setIsLocating(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setIsLocating(false);
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });

      const { latitude, longitude } = position.coords;
      
      // Update the form with coordinates as numbers, not strings
      form.setValue('latitude', latitude);
      form.setValue('longitude', longitude);
      
      // Get address from coordinates using reverse geocoding
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await response.json();
        
        if (data && data.display_name) {
          form.setValue('address', data.display_name);
        }
      } catch (error) {
        console.error("Error getting address from coordinates:", error);
      }
      
    } catch (error) {
      if (error instanceof GeolocationPositionError) {
        switch(error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Location permission denied. Please enter your address manually.");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location information is unavailable. Please enter your address manually.");
            break;
          case error.TIMEOUT:
            setLocationError("The request to get location timed out. Please enter your address manually.");
            break;
          default:
            setLocationError("An unknown error occurred. Please enter your address manually.");
        }
      } else {
        setLocationError("Error getting location. Please enter your address manually.");
      }
    } finally {
      setIsLocating(false);
    }
  };

  // Automatically request location when component mounts
  useEffect(() => {
    getLocation();
  }, []);

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    
    try {
      
      // Update user profile via API
       updateProfile(values);
      
      // toast({
      //   title: "Profile updated",
      //   description: "Your profile has been successfully updated.",
      //   variant: "default",
      // });

      // Redirect to home page after successful update
      // router.push("/");
    } catch (error) {
      console.error("Error updating profile:", error);
      // toast({
      //   title: "Error",
      //   description: "There was a problem updating your profile. Please try again.",
      //   variant: "destructive",
      // });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <Card className="w-full max-w-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="bg-primary/10 dark:bg-primary/5 px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-2xl font-bold text-primary">Complete Your Profile</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Please provide your information to unlock all features
          </p>
        </div>

        <CardContent className="p-6 pt-8">
          {isLoadingUserData ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-lg">Loading your profile data...</span>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Personal Information Section */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 border-b pb-2 border-gray-200 dark:border-gray-800">
                    <User className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-medium">Personal Information</h2>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">First Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="John" 
                              {...field} 
                              className="h-12 text-base" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Last Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Doe" 
                              {...field} 
                              className="h-12 text-base" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                {/* Contact Information */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 border-b pb-2 border-gray-200 dark:border-gray-800">
                    <Phone className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-medium">Contact Information</h2>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="phone_number"
                    render={({ field }) => {
                      // Ensure the field always has +63 prefix
                      const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                        let value = e.target.value;
                        
                        // If the user deletes the +63 prefix, add it back
                        if (!value.startsWith('+63')) {
                          value = '+63' + value.replace(/^\+63/, '');
                        }
                        
                        field.onChange(value);
                      };
                      
                      // Initialize with +63 if empty
                      useEffect(() => {
                        if (!field.value) {
                          field.onChange('+63');
                        } else if (!field.value.startsWith('+63')) {
                          field.onChange('+63' + field.value.replace(/^\+63/, ''));
                        }
                      }, []);
                      
                      return (
                        <FormItem>
                          <FormLabel className="text-base">Phone Number</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="+63 9XX XXX XXXX" 
                              {...field} 
                              className="h-12 text-base"
                              onChange={handlePhoneChange}
                            />
                          </FormControl>
                          <FormDescription>
                            Enter a Philippines mobile number starting with +63 9
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>
                
                {/* Location Information */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 border-b pb-2 border-gray-200 dark:border-gray-800">
                    <MapPin className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-medium">Location Information</h2>
                    {isLocating && <Loader2 className="ml-2 h-4 w-4 animate-spin text-primary" />}
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Address</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="123 Main St, City, Country" 
                            {...field} 
                            className="h-12 text-base" 
                          />
                        </FormControl>
                        {locationError ? (
                          <FormDescription className="text-destructive text-sm">
                            {locationError}
                          </FormDescription>
                        ) : (
                          <FormDescription>
                            {isLocating ? "Detecting your location..." : "Your location will help us provide local listings"}
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </form>
            </Form>
          )}
        </CardContent>
        
        <CardFooter className="border-t border-gray-200 dark:border-gray-800 p-6 bg-gray-50 dark:bg-gray-900 flex flex-col">
          <Button 
            onClick={form.handleSubmit(onSubmit)}
            className="w-full h-14 text-lg font-medium"
            disabled={isSubmitting || isLoadingUserData}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Saving Profile...
              </>
            ) : (
              <>
               Continue
              </>
            )}
          </Button>
          
          <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-4">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
