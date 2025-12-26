import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
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
import { useInvestments } from "@/context/InvestmentContext";
import { InvestmentAsset } from "@/types";

const realEstateFormSchema = z.object({
  name: z.string().min(1, { message: "Property name is required." }),
  propertyType: z.enum(['Residential', 'Commercial', 'Land', 'Industrial', 'Other'], { message: "Property type is required." }),
  location: z.string().min(1, { message: "Location is required." }),
  area: z.coerce.number().min(0.01, { message: "Area must be positive." }),
  areaUnit: z.enum(['sqft', 'sqm', 'acre', 'hectare'], { message: "Area unit is required." }),
  currentPrice: z.coerce.number().min(0.01, { message: "Current value must be positive." }),
  purchaseYear: z.coerce.number().min(1900).max(new Date().getFullYear(), { message: "Invalid purchase year." }),
  riskLevel: z.enum(['Low', 'Moderate', 'High', 'Very High'], { message: "Risk level is required." }),
  rentalIncome: z.coerce.number().min(0).optional(),
  propertyTax: z.coerce.number().min(0).optional(),
  maintenanceCost: z.coerce.number().min(0).optional(),
  mortgageDetails: z.string().optional(),
  isActive: z.boolean().default(true),
});

type RealEstateFormValues = z.infer<typeof realEstateFormSchema>;

interface RealEstateFormProps {
  onSuccess?: () => void;
  initialData?: InvestmentAsset;
  isEditing?: boolean;
}

export const RealEstateForm: React.FC<RealEstateFormProps> = ({
  onSuccess,
  initialData,
  isEditing = false
}) => {
  const { addInvestmentAsset, updateInvestmentAsset } = useInvestments();

  const form = useForm<RealEstateFormValues>({
    resolver: zodResolver(realEstateFormSchema),
    defaultValues: initialData ? {
      ...initialData,
      area: (initialData as any).area || 0,
    } as any : {
      name: "",
      propertyType: "Residential",
      location: "",
      area: 0,
      areaUnit: "sqft",
      currentPrice: 0,
      purchaseYear: new Date().getFullYear(),
      riskLevel: "Moderate",
      rentalIncome: 0,
      propertyTax: 0,
      maintenanceCost: 0,
      mortgageDetails: "",
      isActive: true,
    },
  });

  const handleSubmit = (values: RealEstateFormValues) => {
    const assetData = {
      name: values.name,
      type: 'Real Estate' as const,
      category: values.propertyType,
      currentPrice: values.currentPrice,
      riskLevel: values.riskLevel,
      isActive: values.isActive,
      // Real Estate specific fields
      propertyType: values.propertyType,
      location: values.location,
      area: values.area,
      areaUnit: values.areaUnit,
      rentalIncome: values.rentalIncome || 0,
      propertyTax: values.propertyTax || 0,
      maintenanceCost: values.maintenanceCost || 0,
      mortgageDetails: values.mortgageDetails,
      purchaseYear: values.purchaseYear,
    };

    if (isEditing && initialData) {
      updateInvestmentAsset(initialData.id, assetData as any);
    } else {
      addInvestmentAsset(assetData as any);
    }

    form.reset();
    if (onSuccess) {
      onSuccess();
    }
  };

  // Generate year options
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Seaside Villa, Downtown Apartment" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="propertyType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Residential">Residential</SelectItem>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                    <SelectItem value="Land">Land</SelectItem>
                    <SelectItem value="Industrial">Industrial</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="purchaseYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Year</FormLabel>
                <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-[200px]">
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="Address or location description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="area"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Area</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="1200" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="areaUnit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="sqft">Square Feet</SelectItem>
                    <SelectItem value="sqm">Square Meters</SelectItem>
                    <SelectItem value="acre">Acres</SelectItem>
                    <SelectItem value="hectare">Hectares</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="currentPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Market Value</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="1000000" {...field} />
              </FormControl>
              <FormDescription>
                Estimated current market value of the property
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="riskLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Risk Level</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select risk level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Moderate">Moderate</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Very High">Very High</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
          <h3 className="text-lg font-semibold">Financial Details (Optional)</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="rentalIncome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Rental Income</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="propertyTax"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Annual Property Tax</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maintenanceCost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Maintenance</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="mortgageDetails"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mortgage Details</FormLabel>
                <FormControl>
                  <Textarea placeholder="Brief details about mortgage if applicable" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Active Investment</FormLabel>
                <FormDescription>
                  Is this property currently owned?
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          {isEditing ? 'Update Property' : 'Add Property'}
        </Button>
      </form>
    </Form>
  );
};