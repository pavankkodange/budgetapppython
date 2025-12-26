import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { MaintenanceRecord, Asset } from "@/types";

const maintenanceRecordFormSchema = z.object({
  assetId: z.string().min(1, { message: "Asset is required." }),
  date: z.date({ required_error: "Date is required." }),
  type: z.enum(['Repair', 'Service', 'Upgrade', 'Cleaning', 'Other'], { message: "Type is required." }),
  cost: z.coerce.number().min(0, { message: "Cost cannot be negative." }),
  provider: z.string().min(1, { message: "Service provider is required." }),
  description: z.string().min(1, { message: "Description is required." }),
  notes: z.string().optional(),
});

type MaintenanceRecordFormValues = z.infer<typeof maintenanceRecordFormSchema>;

interface MaintenanceRecordFormProps {
  onSubmit: (data: MaintenanceRecordFormValues) => void;
  initialData?: MaintenanceRecord;
  isEditing?: boolean;
  assets: Asset[];
  preselectedAssetId?: string;
}

export const MaintenanceRecordForm: React.FC<MaintenanceRecordFormProps> = ({
  onSubmit,
  initialData,
  isEditing = false,
  assets,
  preselectedAssetId
}) => {
  const form = useForm<MaintenanceRecordFormValues>({
    resolver: zodResolver(maintenanceRecordFormSchema),
    defaultValues: initialData ? {
      ...initialData,
      provider: initialData.provider || initialData.serviceProvider || "",
      notes: initialData.notes || "",
    } as any : {
      assetId: preselectedAssetId || "",
      date: new Date(),
      type: "Service",
      cost: 0,
      provider: "",
      description: "",
      notes: "",
    },
  });

  const handleSubmit = (values: MaintenanceRecordFormValues) => {
    onSubmit(values as any);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="assetId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Asset</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!preselectedAssetId}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select asset" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {assets.map((asset) => (
                    <SelectItem key={asset.id} value={asset.id}>
                      {asset.name} ({asset.brand} {asset.model})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maintenance Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Repair">Repair</SelectItem>
                    <SelectItem value="Service">Service</SelectItem>
                    <SelectItem value="Upgrade">Upgrade</SelectItem>
                    <SelectItem value="Cleaning">Cleaning</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="cost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cost</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="e.g., 150.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="provider"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service Provider</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Apple Store, Local Mechanic" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe the maintenance or repair work" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Any additional notes about this maintenance record" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          {isEditing ? 'Update Record' : 'Add Record'}
        </Button>
      </form>
    </Form>
  );
};