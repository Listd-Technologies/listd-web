"use client";

import { PropertyType } from "@/components/providers/listing-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bath,
  BedDouble,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock,
  HomeIcon,
  HomeIcon as HouseIcon,
  Landmark,
  Mail,
  MapPin,
  ParkingCircle,
  Smartphone,
  TrendingUp,
  User2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { UseFormReturn, useForm } from "react-hook-form";
import { z } from "zod";

// Property types for the form with icons - using PropertyType from listing-provider
const PROPERTY_TYPES = [
  {
    label: "Condominium",
    value: "condominium" as PropertyType,
    icon: <Building2 className="h-5 w-5" />,
  },
  {
    label: "House and Lot",
    value: "house-and-lot" as PropertyType,
    icon: <HomeIcon className="h-5 w-5" />,
  },
  {
    label: "Vacant Lot",
    value: "vacant-lot" as PropertyType,
    icon: <Landmark className="h-5 w-5" />,
  },
  {
    label: "Warehouse",
    value: "warehouse" as PropertyType,
    icon: <HouseIcon className="h-5 w-5" />,
  },
];

// Define Zod schemas for validation using PropertyType from listing-provider
const propertyBaseSchema = z.object({
  propertyType: z.enum(["condominium", "house-and-lot", "vacant-lot", "warehouse"] as const),
  address: z.string().min(5, "Address is required and must be at least 5 characters"),
  area: z.number().positive("Area must be greater than zero").optional(),
  additionalDetails: z.string().optional(),
});

// Schema for condominium and house-and-lot
const residentialSchema = propertyBaseSchema.extend({
  propertyType: z.enum(["condominium", "house-and-lot"] as const) as unknown as z.ZodType<
    Extract<PropertyType, "condominium" | "house-and-lot">
  >,
  bedrooms: z.number().int().min(0, "Bedrooms must be a positive number"),
  bathrooms: z.number().int().min(0, "Bathrooms must be a positive number"),
  parkingLots: z.number().int().min(0, "Parking lots must be a positive number"),
});

// Schema for vacant lot
const vacantLotSchema = propertyBaseSchema.extend({
  propertyType: z.literal("vacant-lot") as z.ZodType<Extract<PropertyType, "vacant-lot">>,
});

// Schema for warehouse
const warehouseSchema = propertyBaseSchema.extend({
  propertyType: z.literal("warehouse") as z.ZodType<Extract<PropertyType, "warehouse">>,
  buildingSize: z.number().positive("Building size must be greater than zero").optional(),
  ceilingHeight: z.number().positive("Ceiling height must be greater than zero").optional(),
  floorArea: z.number().positive("Floor area must be greater than zero").optional(),
});

// Combined property schema with discriminated union
const propertyFormSchema = z.discriminatedUnion("propertyType", [
  residentialSchema,
  vacantLotSchema,
  warehouseSchema,
]);

// Contact form schema
const contactFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email address"),
  interestedInSelling: z.boolean().default(false),
});

// Type inference from schemas
type PropertyFormData = z.infer<typeof propertyFormSchema>;
type ContactFormData = z.infer<typeof contactFormSchema>;

interface ValuationResult {
  estimatedValue: number;
  priceRange: {
    min: number;
    max: number;
  };
  pricePerSqm: number;
  comparableProperties: number;
}

// Default form values for property - with test data in development mode
const getDefaultPropertyValues = (type: PropertyType): Partial<PropertyFormData> => {
  const isDevEnvironment = process.env.NODE_ENV === "development";

  // Common test data for development - Updated for BGC location
  const testBaseValues = {
    address: isDevEnvironment ? "5th Avenue, Bonifacio Global City, Taguig, Metro Manila" : "",
    additionalDetails: isDevEnvironment
      ? "Premium unit with unobstructed city view and high-end finishes. Near Uptown Mall and High Street."
      : "",
    area: isDevEnvironment ? 120 : undefined,
  };

  const baseValues = {
    propertyType: type,
    address: "",
    additionalDetails: "",
  };

  const values = isDevEnvironment ? { ...baseValues, ...testBaseValues } : baseValues;

  if (type === "condominium" || type === "house-and-lot") {
    return {
      ...values,
      propertyType: type,
      bedrooms: isDevEnvironment ? 2 : 1,
      bathrooms: isDevEnvironment ? 2 : 1,
      parkingLots: isDevEnvironment ? 1 : 0,
    };
  } else if (type === "warehouse") {
    return {
      ...values,
      propertyType: type,
      buildingSize: isDevEnvironment ? 500 : undefined,
      ceilingHeight: isDevEnvironment ? 4.5 : undefined,
      floorArea: isDevEnvironment ? 450 : undefined,
    };
  } else {
    return {
      ...values,
      propertyType: type,
    };
  }
};

// Mocked API call for valuation with updated BGC market values
const getPropertyValuation = async (
  propertyData: PropertyFormData,
  contactData: ContactFormData
): Promise<ValuationResult> => {
  // In a real app, this would be an API call that uses contactData
  // for personalization, lead generation, or follow-up notifications
  console.log("Contact data will be used for personalized follow-up:", contactData.email);

  return new Promise((resolve) => {
    setTimeout(() => {
      // Different base prices based on property type - Updated for BGC market
      // Based on research, BGC condos average ~₱300,000 per sqm
      let basePrice = 0;
      const isBGCAddress =
        propertyData.address?.toLowerCase().includes("bgc") ||
        propertyData.address?.toLowerCase().includes("bonifacio") ||
        propertyData.address?.toLowerCase().includes("global city");

      switch (propertyData.propertyType) {
        case "condominium":
          basePrice = isBGCAddress ? 300000 : 150000; // ₱300k per sqm for BGC
          break;
        case "house-and-lot":
          basePrice = isBGCAddress ? 350000 : 200000; // ₱350k per sqm for BGC
          break;
        case "vacant-lot":
          basePrice = isBGCAddress ? 400000 : 100000; // ₱400k per sqm for BGC
          break;
        case "warehouse":
          basePrice = isBGCAddress ? 200000 : 120000; // ₱200k per sqm for BGC
          break;
      }

      // Calculate estimated value based on property type and features
      let estimatedValue = 0;
      // Get area with fallback to 0
      const area = propertyData.area || 0;

      if (
        propertyData.propertyType === "condominium" ||
        propertyData.propertyType === "house-and-lot"
      ) {
        // For residential properties
        const areaPrice = area * basePrice;
        const bedroomFactor = (propertyData.bedrooms || 0) * 0.15; // Increased impact
        const bathroomFactor = (propertyData.bathrooms || 0) * 0.08; // Increased impact
        const parkingFactor = (propertyData.parkingLots || 0) * 0.12; // Increased impact for BGC

        estimatedValue = areaPrice * (1 + bedroomFactor + bathroomFactor + parkingFactor);
      } else if (propertyData.propertyType === "vacant-lot") {
        // For vacant lots
        estimatedValue = area * basePrice;
      } else if (propertyData.propertyType === "warehouse") {
        // For warehouses
        const buildingSizeFactor = (propertyData.buildingSize || 0) * 0.7;
        const ceilingHeightFactor = (propertyData.ceilingHeight || 0) * 0.15;
        const floorAreaFactor = (propertyData.floorArea || 0) * 0.15;

        estimatedValue =
          area *
          basePrice *
          (1 + (buildingSizeFactor + ceilingHeightFactor + floorAreaFactor) / 100);
      }

      // Add premium for BGC location if mentioned in additional details
      if (
        propertyData.additionalDetails?.toLowerCase().includes("premium") ||
        propertyData.additionalDetails?.toLowerCase().includes("high-end") ||
        propertyData.additionalDetails?.toLowerCase().includes("luxury")
      ) {
        estimatedValue *= 1.1; // 10% premium for luxury properties
      }

      // Adjust for view if mentioned
      if (propertyData.additionalDetails?.toLowerCase().includes("view")) {
        estimatedValue *= 1.05; // 5% premium for good views
      }

      const priceRange = {
        min: Math.round(estimatedValue * 0.9),
        max: Math.round(estimatedValue * 1.1),
      };

      resolve({
        estimatedValue: Math.round(estimatedValue),
        priceRange,
        pricePerSqm: area > 0 ? Math.round(estimatedValue / area) : 0,
        comparableProperties: 12,
      });
    }, 1500); // Simulate API delay
  });
};

// Form step definition
type FormStep = "property" | "details" | "contact" | "processing" | "results";

// Steps configuration for stepper
const formSteps = [
  {
    id: "property" as const,
    title: "Property Type",
    description: "Select your property type",
    icon: Building2,
  },
  {
    id: "details" as const,
    title: "Property Details",
    description: "Tell us about your property",
    icon: HomeIcon,
  },
  {
    id: "contact" as const,
    title: "Contact Info",
    description: "Your contact information",
    icon: User2,
  },
  {
    id: "results" as const,
    title: "Results",
    description: "Your property valuation",
    icon: CircleDollarSign,
  },
];

export function ValuationForm() {
  const [formStep, setFormStep] = useState<FormStep>("property");
  const [loading, setLoading] = useState(false);
  const [valuationResults, setValuationResults] = useState<{
    result: ValuationResult;
    property: PropertyFormData;
    contact: ContactFormData;
  } | null>(null);

  // Common transition for all animations
  const commonTransition = {
    type: "tween",
    ease: "easeOut",
    duration: 0.2, // Faster duration for more responsive feel
  };

  // Faster transition for property type selection
  const propertyTypeTransition = {
    type: "spring",
    stiffness: 500,
    damping: 30,
    duration: 0.1,
  };

  // Property form setup
  const propertyForm = useForm<PropertyFormData>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: getDefaultPropertyValues("condominium"),
    mode: "onChange",
  });

  // Contact form setup
  const contactForm = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      firstName: process.env.NODE_ENV === "development" ? "Maria" : "",
      lastName: process.env.NODE_ENV === "development" ? "Santos" : "",
      phoneNumber: process.env.NODE_ENV === "development" ? "09178889999" : "",
      email: process.env.NODE_ENV === "development" ? "maria.santos@example.com" : "",
      interestedInSelling: process.env.NODE_ENV === "development",
    },
    mode: "onChange",
  });

  // Watch for property type changes to update form schema
  const propertyType = propertyForm.watch("propertyType");

  const propertyFormRef = useRef<HTMLFormElement>(null);

  // Add form debugging
  // biome-ignore lint/correctness/useExhaustiveDependencies: This effect only needs to run when the form reference changes, not on every dependency update
  useEffect(() => {
    const formElement = propertyFormRef.current;
    if (!formElement) return;

    const debugHandler = (e: Event) => {
      console.log("Form event occurred:", e.type);
    };

    // Listen for form events
    formElement.addEventListener("submit", debugHandler, true);
    formElement.addEventListener("click", debugHandler, true);

    return () => {
      formElement.removeEventListener("submit", debugHandler, true);
      formElement.removeEventListener("click", debugHandler, true);
    };
  }, [propertyFormRef.current]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: We only want this effect to run once on component mount to initialize the form
  useEffect(() => {
    // Initialize the form with default values for condominium property type
    // This ensures the form has proper initial values regardless of how the component is rendered
    propertyForm.reset(getDefaultPropertyValues("condominium"));

    // Make sure the form is valid on first render
    // This pre-validates the form so we don't need to wait for user interaction to determine validity
    propertyForm.trigger();
  }, []);

  // Calculate current step index
  const getCurrentStepIndex = () => {
    // Map form steps to indices and ensure the stepper updates correctly
    switch (formStep) {
      case "property":
        return 0;
      case "details":
        return 1;
      case "contact":
        return 2;
      case "processing":
        return 2; // Show processing as part of contact step
      case "results":
        return 3;
      default:
        return 0;
    }
  };

  // Handle direct navigation for debugging
  const moveToDetailsStep = () => {
    const propertyType = propertyForm.getValues().propertyType;
    console.log("Direct navigation attempt:", { propertyType });

    if (propertyType) {
      setFormStep("details");
    } else {
      propertyForm.trigger("propertyType");
    }
  };

  // Handle property type change
  const handlePropertyTypeChange = (value: PropertyType) => {
    // Properly set fields based on property type to avoid complete re-render
    if (value === "condominium" || value === "house-and-lot") {
      // These fields only exist for residential properties
      propertyForm.setValue("bedrooms", 1);
      propertyForm.setValue("bathrooms", 1);
      propertyForm.setValue("parkingLots", 0);
    } else if (value === "warehouse") {
      // For warehouse properties
      const form = propertyForm as unknown as UseFormReturn<z.infer<typeof warehouseSchema>>;
      form.setValue("buildingSize", undefined);
      form.setValue("ceilingHeight", undefined);
      form.setValue("floorArea", undefined);
    }

    // Keep the current address and other common fields
  };

  // Stepper component with improved visual styling
  const FormStepper = () => {
    const currentStepIndex = getCurrentStepIndex();

    // Calculate progress percentage for the progress bar
    const progressPercentage =
      formSteps.length > 1 ? Math.round((currentStepIndex / (formSteps.length - 1)) * 100) : 0;

    return (
      <div className="mb-8">
        {/* Progress bar */}
        <div className="h-1 w-full bg-gray-200 rounded-full mb-6 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: "var(--motion-purple-600)" }}
            initial={{ width: "0%" }}
            animate={{ width: `${progressPercentage}%` }}
            transition={commonTransition}
          />
        </div>

        {/* Step circles */}
        <div className="flex justify-between">
          {formSteps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = index === currentStepIndex;
            const isCompleted = index < currentStepIndex;

            // Fix any potential issue with step indicators
            let stepStatus = "incomplete";
            if (isActive) stepStatus = "active";
            if (isCompleted) stepStatus = "completed";

            return (
              <div key={step.id} className="flex flex-col items-center">
                <motion.div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center shadow-sm
                    ${
                      isActive
                        ? "bg-purple-600 text-white ring-4 ring-purple-100 dark:ring-purple-900/20"
                        : isCompleted
                          ? "bg-purple-600 text-white"
                          : "bg-gray-100 text-gray-400 border border-gray-300"
                    }
                  `}
                  data-state={stepStatus}
                  initial={{
                    backgroundColor:
                      isActive || isCompleted ? "var(--motion-purple-600)" : "#f3f4f6",
                    scale: 1,
                  }}
                  animate={{
                    scale: isActive ? [1, 1.05, 1] : 1,
                    backgroundColor:
                      isActive || isCompleted ? "var(--motion-purple-600)" : "#f3f4f6",
                  }}
                  transition={{
                    ...commonTransition,
                    repeat: isActive ? 1 : 0,
                    repeatType: "reverse",
                    repeatDelay: 3,
                  }}
                >
                  {isCompleted ? <Check className="h-5 w-5" /> : <StepIcon className="h-5 w-5" />}
                </motion.div>

                <span
                  className={`
                  mt-2 text-xs
                  ${
                    isActive
                      ? "font-medium text-foreground"
                      : isCompleted
                        ? "text-foreground"
                        : "text-gray-400"
                  }
                `}
                >
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Property Type Selection Step - make it visually appealing
  const renderPropertyTypeStep = () => (
    <Form {...propertyForm}>
      <form
        onSubmit={(e) => {
          e.preventDefault(); // Prevent default form submission
          console.log("Form submission event triggered");
          // Get the form values directly
          const data = propertyForm.getValues();
          console.log("Current form data:", data);

          // Manually validate
          const isValid = propertyForm.formState.isValid;
          console.log("Form is valid:", isValid);

          // If we have a property type, proceed
          if (data.propertyType) {
            console.log("Moving to details step");
            setFormStep("details");
          } else {
            console.log("Property type missing, triggering validation");
            propertyForm.trigger("propertyType");
          }
        }}
        className="space-y-4"
        id="property-type-form"
        ref={propertyFormRef}
      >
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold">Select Your Property Type</h2>
          <p className="text-muted-foreground mt-1">
            Choose the type of property you want to get valuation for
          </p>
        </div>

        <FormField
          control={propertyForm.control}
          name="propertyType"
          render={({ field }) => (
            <FormItem className="space-y-4">
              <FormControl>
                <div className="grid grid-cols-2 gap-4">
                  {PROPERTY_TYPES.map((type) => {
                    const isSelected = field.value === type.value;
                    return (
                      <motion.div
                        key={type.value}
                        className={`relative cursor-pointer rounded-xl border-2 p-4 property-type-card ${
                          isSelected
                            ? "border-purple-600 bg-purple-50 dark:border-purple-500 dark:bg-purple-900/20"
                            : "border-muted hover:border-purple-300 dark:hover:border-purple-700"
                        }`}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => {
                          // Perform the form value change immediately
                          field.onChange(type.value);
                          handlePropertyTypeChange(type.value);
                        }}
                        initial={false}
                        animate={{
                          borderColor: isSelected
                            ? "var(--motion-purple-600)"
                            : "var(--motion-border-light)",
                          backgroundColor: isSelected
                            ? "var(--color-selected-bg)"
                            : "rgba(255,255,255,0)",
                        }}
                        transition={propertyTypeTransition}
                      >
                        <div className="flex flex-col items-center justify-center text-center py-4">
                          <div
                            className={`mb-3 p-3 rounded-full ${
                              isSelected
                                ? "bg-purple-600 text-white dark:bg-purple-500"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {type.icon}
                          </div>
                          <h3 className="font-medium">{type.label}</h3>
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2 text-purple-600 dark:text-purple-400">
                            <CheckCircle2 className="h-5 w-5" />
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-2">
          <Button
            type="submit"
            className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white h-12"
          >
            Continue <ChevronRight className="ml-2 h-4 w-4" />
          </Button>

          {process.env.NODE_ENV === "development" && (
            <>
              <Button
                type="button"
                variant="outline"
                className="w-full mt-2 h-10 text-sm"
                onClick={(e) => {
                  e.preventDefault();
                  console.log("Direct submit attempt via button");
                  const form = propertyFormRef.current;
                  if (form) {
                    const event = new Event("submit", { bubbles: true, cancelable: true });
                    console.log("Manually dispatching submit event");
                    form.dispatchEvent(event);
                  }
                }}
              >
                Debug: Manual Form Submit
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full mt-2 h-10 text-sm"
                onClick={moveToDetailsStep}
              >
                Debug: Continue Directly
              </Button>
            </>
          )}
        </div>
      </form>
    </Form>
  );

  // Property Details Step - styled fields with icons
  const renderPropertyDetailsStep = () => (
    <Form {...propertyForm}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          console.log("Property details form submitted");

          // Validate form
          propertyForm.trigger().then((isValid) => {
            console.log("Details form validation:", isValid);
            if (isValid) {
              setFormStep("contact");
            }
          });
        }}
        className="space-y-4"
      >
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold">Property Details</h2>
          <p className="text-muted-foreground mt-1">
            Tell us more about your {propertyType.replace(/-/g, " ")}
          </p>
        </div>

        {/* Address Field with icon */}
        <FormField
          control={propertyForm.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-purple-600" /> Property Address
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter your complete property address"
                  className="resize-none"
                  rows={2}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Area Field with icon */}
        <FormField
          control={propertyForm.control}
          name="area"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Landmark className="h-4 w-4 text-purple-600" /> Property Size (sqm)
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    placeholder="Total area in square meters"
                    {...field}
                    value={field.value === undefined || field.value === 0 ? "" : field.value}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === "" ? undefined : Number(value));
                    }}
                    className="pl-11"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-muted-foreground text-sm">sqm</span>
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Conditional fields based on property type */}
        {(propertyType === "condominium" || propertyType === "house-and-lot") && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={commonTransition}
          >
            {/* Bedrooms Field with icon */}
            <FormField
              control={propertyForm.control}
              name="bedrooms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <BedDouble className="h-4 w-4 text-purple-600" /> Bedrooms
                  </FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num === 0 ? "Studio" : num.toString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Bathrooms Field with icon */}
            <FormField
              control={propertyForm.control}
              name="bathrooms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Bath className="h-4 w-4 text-purple-600" /> Bathrooms
                  </FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num.toString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Parking Lots Field with icon */}
            <FormField
              control={propertyForm.control}
              name="parkingLots"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <ParkingCircle className="h-4 w-4 text-purple-600" /> Parking Lots
                  </FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[0, 1, 2, 3, 4, 5].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num.toString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>
        )}

        {/* Warehouse specific fields */}
        {propertyType === "warehouse" && (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={commonTransition}
          >
            {/* Building Size Field */}
            <FormField
              control={propertyForm.control}
              name="buildingSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-purple-600" /> Building Size (sqm)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="Building size in square meters"
                      {...field}
                      value={field.value === undefined || field.value === 0 ? "" : field.value}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === "" ? undefined : Number(value));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Ceiling Height Field */}
            <FormField
              control={propertyForm.control}
              name="ceilingHeight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ceiling Height (meters)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      placeholder="Ceiling height in meters"
                      {...field}
                      value={field.value === undefined || field.value === 0 ? "" : field.value}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === "" ? undefined : Number(value));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Floor Area Field */}
            <FormField
              control={propertyForm.control}
              name="floorArea"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Floor Area (sqm)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="Floor area in square meters"
                      {...field}
                      value={field.value === undefined || field.value === 0 ? "" : field.value}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === "" ? undefined : Number(value));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>
        )}

        {/* Additional Details Field */}
        <FormField
          control={propertyForm.control}
          name="additionalDetails"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Details (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any renovations, special features or conditions..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
              <FormDescription>
                Include any important details that might affect the property value
              </FormDescription>
            </FormItem>
          )}
        />

        <div className="flex justify-between gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setFormStep("property")}
            className="w-1/3"
          >
            Back
          </Button>
          <Button type="submit" className="w-2/3 bg-purple-600 hover:bg-purple-700 text-white">
            Continue to Contact Info
          </Button>
        </div>
      </form>
    </Form>
  );

  // Contact Form Step
  const renderContactForm = () => (
    <Form {...contactForm}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          console.log("Contact form submitted");

          contactForm.trigger().then((isValid) => {
            console.log("Contact form validation:", isValid);
            if (isValid) {
              const data = contactForm.getValues();
              console.log("Contact form data:", data);

              setLoading(true);

              // Call processing function
              try {
                // Set processing state
                setFormStep("processing");

                // Get property form data
                const propertyData = propertyForm.getValues() as PropertyFormData;
                console.log("Property data for submission:", propertyData);

                // Add delay to simulate API call
                setTimeout(async () => {
                  try {
                    // Call API
                    const result = await getPropertyValuation(propertyData, data);
                    console.log("Valuation result:", result);

                    // Store results locally
                    setValuationResults({
                      result,
                      property: propertyData,
                      contact: data,
                    });

                    // Set to results step
                    setFormStep("results");
                  } catch (err) {
                    console.error("Error during valuation:", err);
                    setFormStep("contact");
                  } finally {
                    setLoading(false);
                  }
                }, 1500);
              } catch (err) {
                console.error("Error in submission:", err);
                setFormStep("contact");
                setLoading(false);
              }
            }
          });
        }}
        className="space-y-4"
      >
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold">Your Contact Information</h2>
          <p className="text-muted-foreground mt-1">
            We'll use this to deliver your property valuation
          </p>
        </div>

        {/* Name Fields in a 2-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={contactForm.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <User2 className="h-4 w-4 text-purple-600" /> First Name
                </FormLabel>
                <FormControl>
                  <Input placeholder="Enter first name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={contactForm.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter last name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Phone Number Field */}
        <FormField
          control={contactForm.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-purple-600" /> Phone Number
              </FormLabel>
              <FormControl>
                <Input placeholder="Enter phone number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email Field */}
        <FormField
          control={contactForm.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-purple-600" /> Email Address
              </FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter email address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Interested in Selling Checkbox */}
        <FormField
          control={contactForm.control}
          name="interestedInSelling"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 border bg-muted/20">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>I'm interested in selling this property</FormLabel>
                <FormDescription>
                  Our agents can help you list and sell your property at the best price
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-between gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setFormStep("details")}
            className="w-1/3"
          >
            Back
          </Button>
          <Button
            type="submit"
            className="w-2/3 bg-purple-600 hover:bg-purple-700 text-white"
            disabled={loading}
          >
            {loading ? "Please wait..." : "Get My Valuation"}
          </Button>
        </div>

        {/* Privacy Note */}
        <p className="text-xs text-muted-foreground text-center mt-4">
          Your information is secure and will not be shared with third parties.
        </p>
      </form>
    </Form>
  );

  // Processing State with animation
  const renderProcessing = () => (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      <motion.div
        className="mx-auto h-20 w-20 text-purple-600"
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <Clock className="h-20 w-20" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-center"
      >
        <h3 className="text-2xl font-bold mb-2">Calculating Your Property Valuation</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Please wait while we analyze your property details and generate an accurate valuation
          based on current market data.
        </p>
      </motion.div>

      <motion.div
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ ...commonTransition, duration: 1.5 }}
        className="w-full max-w-md h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: "#e9d5ff" }}
      >
        <motion.div
          className="h-full"
          style={{ backgroundColor: "#9333ea" }}
          initial={{ width: "0%" }}
          animate={{ width: ["0%", "30%", "60%", "90%", "100%"] }}
          transition={{
            times: [0, 0.3, 0.6, 0.9, 1],
            duration: 1.5,
            ease: "easeInOut",
          }}
        />
      </motion.div>
    </div>
  );

  // Results Step - show the valuation result with animations
  const renderResults = () => {
    if (!valuationResults) return null;

    const { result, property } = valuationResults;

    return (
      <motion.div
        className="space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="mb-4 mx-auto w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center"
          >
            <TrendingUp className="h-10 w-10 text-purple-600" />
          </motion.div>

          <motion.h2
            className="text-2xl font-bold mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Your Property Valuation
          </motion.h2>

          <motion.p
            className="text-muted-foreground mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Based on current market data and property details
          </motion.p>
        </div>

        {/* Estimated Value */}
        <motion.div
          className="text-center p-8 rounded-lg border"
          style={{
            backgroundColor: "#f3e8ff",
            borderColor: "#e9d5ff",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <p className="text-muted-foreground mb-2">Estimated Market Value</p>
          <motion.h1
            className="text-5xl font-bold text-purple-600 mb-2"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.8, delay: 0.6 }}
          >
            {formatCurrency(result.estimatedValue)}
          </motion.h1>
          <p className="text-sm text-muted-foreground">
            Range: {formatCurrency(result.priceRange.min)} - {formatCurrency(result.priceRange.max)}
          </p>
        </motion.div>

        {/* Property Details Summary */}
        <motion.div
          className="grid grid-cols-2 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Property Type</p>
            <p className="font-semibold capitalize">{property.propertyType.replace(/-/g, " ")}</p>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Property Size</p>
            <p className="font-semibold">{property.area} sqm</p>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Price per sqm</p>
            <p className="font-semibold">{formatCurrency(result.pricePerSqm)}</p>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Comparable Properties</p>
            <p className="font-semibold">{result.comparableProperties} properties</p>
          </div>
        </motion.div>

        {/* Additional property-specific details */}
        {(property.propertyType === "condominium" || property.propertyType === "house-and-lot") && (
          <motion.div
            className="grid grid-cols-3 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <div className="flex flex-col items-center p-4 bg-muted/30 rounded-lg">
              <BedDouble className="h-5 w-5 text-purple-600 mb-2" />
              <p className="text-sm text-muted-foreground">Bedrooms</p>
              <p className="font-semibold">{property.bedrooms}</p>
            </div>

            <div className="flex flex-col items-center p-4 bg-muted/30 rounded-lg">
              <Bath className="h-5 w-5 text-purple-600 mb-2" />
              <p className="text-sm text-muted-foreground">Bathrooms</p>
              <p className="font-semibold">{property.bathrooms}</p>
            </div>

            <div className="flex flex-col items-center p-4 bg-muted/30 rounded-lg">
              <ParkingCircle className="h-5 w-5 text-purple-600 mb-2" />
              <p className="text-sm text-muted-foreground">Parking</p>
              <p className="font-semibold">{property.parkingLots}</p>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 pt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white h-12">
            Download Detailed Report
          </Button>
          <Button variant="outline" className="flex-1 h-12">
            Talk to an Agent
          </Button>
        </motion.div>

        <motion.p
          className="text-center text-sm text-muted-foreground mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          This valuation is based on the information provided and current market conditions. For a
          more precise valuation, consider consulting with a Listd real estate expert.
        </motion.p>
      </motion.div>
    );
  };

  return (
    <Card
      className="w-full shadow-sm border border-muted rounded-xl overflow-hidden"
      id="valuation-form"
    >
      <CardHeader className="pb-0 pt-4">
        {formStep !== "results" && <FormStepper />}
        {process.env.NODE_ENV === "development" && (
          <div className="text-xs text-amber-600 text-center mt-1 bg-amber-50 py-1 px-2 rounded-sm border border-amber-200">
            Development Mode: Using BGC property test data
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-4 pb-6">
        <AnimatePresence mode="wait">
          {formStep === "property" && (
            <motion.div
              key="property-step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={commonTransition}
              className="max-w-3xl mx-auto"
            >
              {renderPropertyTypeStep()}
            </motion.div>
          )}

          {formStep === "details" && (
            <motion.div
              key="details-step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={commonTransition}
              className="max-w-3xl mx-auto"
            >
              {renderPropertyDetailsStep()}
            </motion.div>
          )}

          {formStep === "contact" && (
            <motion.div
              key="contact-step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={commonTransition}
              className="max-w-3xl mx-auto"
            >
              {renderContactForm()}
            </motion.div>
          )}

          {formStep === "processing" && (
            <motion.div
              key="processing-step"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={commonTransition}
              className="max-w-3xl mx-auto"
            >
              {renderProcessing()}
            </motion.div>
          )}

          {formStep === "results" && (
            <motion.div
              key="results-step"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={commonTransition}
              className="max-w-3xl mx-auto"
            >
              {renderResults()}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
