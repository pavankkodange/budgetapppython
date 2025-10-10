import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
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
import { Textarea } from "@/components/ui/textarea";
import { TaxDeduction } from "@/types";

const taxDeductionFormSchema = z.object({
  year: z.coerce.number().min(2000, { message: "Year must be 2000 or later." }).max(2100, { message: "Year must be 2100 or earlier." }),
  deductionType: z.string().min(1, { message: "Deduction type is required." }),
  amount: z.coerce.number().min(0.01, { message: "Amount must be positive." }),
  description: z.string().optional(),
});

type TaxDeductionFormValues = z.infer<typeof taxDeductionFormSchema>;

interface TaxDeductionFormProps {
  onSubmit: (data: TaxDeductionFormValues) => void;
  initialData?: TaxDeduction;
  isEditing?: boolean;
}

const deductionTypes = [
  "Medical Expenses",
  "Charitable Contributions",
  "Home Mortgage Interest",
  "Education Expenses",
  "Retirement Contributions",
  "Property Taxes",
  "State and Local Taxes",
  "Business Expenses",
  "Investment Expenses",
  "Other"
];

export const TaxDeductionForm: React.FC<TaxDeductionFormProps> = ({ 
  onSubmit, 
  initialData, 
  isEditing = false 
}) => {
  const form = useForm<TaxDeductionFormValues>({
    resolver: zodResolver(taxDeductionFormSchema),
    defaultValues: initialData || {
      year: new Date().getFullYear(),
      deductionType: "",
      amount: 0,
      description: "",
    },
  });

  const handleSubmit = (values: TaxDeductionFormValues) => {
    onSubmit(values);
    if (!isEditing) {
      form.reset();
    }
  };

  // Generate year options (current year and 5 previous years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="year"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tax Year</FormLabel>
              <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tax year" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
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

        <FormField
          control={form.control}
          name="deductionType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deduction Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select deduction type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {deductionTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="e.g., 1000.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Additional details about this deduction" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          {isEditing ? 'Update Deduction' : 'Add Deduction'}
        </Button>
      </form>
    </Form>
  );
};