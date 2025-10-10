import React from "react";
import { useForm, useFieldArray } from "react-hook-form"; // Import useFieldArray
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, PlusCircle, MinusCircle } from "lucide-react"; // Import icons for add/remove deduction

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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Income } from "@/types";
import { useIncomeSources } from "@/context/IncomeSourceContext";

const incomeFormSchema = z.object({
  amount: z.coerce.number().min(0.01, { message: "Amount must be positive." }),
  source: z.string().min(1, { message: "Income source is required." }),
  date: z.date({
    required_error: "A date is required.",
  }),
  description: z.string().max(200, { message: "Description cannot exceed 200 characters." }).optional(),
  deductions: z.array(
    z.object({
      name: z.string().min(1, { message: "Deduction name is required." }),
      amount: z.coerce.number().min(0, { message: "Deduction amount must be non-negative." }),
    })
  ).optional(), // New: Deductions array
});

type IncomeFormValues = z.infer<typeof incomeFormSchema>;

interface IncomeFormProps {
  onSubmit: (data: IncomeFormValues) => void;
  initialData?: Income;
}

export const IncomeForm: React.FC<IncomeFormProps> = ({ onSubmit, initialData }) => {
  const { incomeSources } = useIncomeSources();

  const form = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeFormSchema),
    defaultValues: initialData || {
      amount: 0,
      source: "",
      date: new Date(),
      description: "",
      deductions: [], // Initialize deductions as an empty array
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "deductions",
  });

  const handleSubmit = (values: IncomeFormValues) => {
    onSubmit(values);
    form.reset({
      amount: 0,
      source: "",
      date: new Date(),
      description: "",
      deductions: [], // Reset deductions as well
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gross Amount</FormLabel> {/* Changed label to Gross Amount */}
              <FormControl>
                <Input type="number" step="0.01" placeholder="e.g., 2500.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="source"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Source</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an income source" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {incomeSources
                    .filter(source => source.type === 'income')
                    .map((source) => (
                      <SelectItem key={source.id} value={source.name}>
                        {source.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Where did this income come from?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date Received</FormLabel>
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
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., Full-time job payment for January" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Deductions Section */}
        <div className="space-y-3 border p-4 rounded-md">
          <h3 className="text-lg font-semibold flex items-center justify-between">
            Deductions (Optional)
            <Button type="button" variant="outline" size="sm" onClick={() => append({ name: "", amount: 0 })}>
              <PlusCircle className="h-4 w-4 mr-2" /> Add Deduction
            </Button>
          </h3>
          {fields.length === 0 && (
            <p className="text-muted-foreground text-sm">No deductions added yet.</p>
          )}
          {fields.map((item, index) => (
            <div key={item.id} className="flex space-x-2 items-end">
              <FormField
                control={form.control}
                name={`deductions.${index}.name`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className={index === 0 ? "block" : "sr-only"}>Deduction Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Tax, Health Insurance" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`deductions.${index}.amount`}
                render={({ field }) => (
                  <FormItem className="w-24">
                    <FormLabel className={index === 0 ? "block" : "sr-only"}>Amount</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                <MinusCircle className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>

        <Button type="submit" className="w-full">Add Income</Button>
      </form>
    </Form>
  );
};