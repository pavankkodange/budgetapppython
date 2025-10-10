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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select, // Import Select components
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { SavingsEntry } from "@/types";
import { useSavingsInstruments } from "@/context/SavingsInstrumentContext"; // Import useSavingsInstruments

const savingsFormSchema = z.object({
  amount: z.coerce.number().min(0.01, { message: "Amount must be positive." }),
  instrument: z.string().min(1, { message: "Savings instrument is required." }),
  date: z.date({
    required_error: "A date is required.",
  }),
  description: z.string().max(200, { message: "Description cannot exceed 200 characters." }).optional(),
});

type SavingsFormValues = z.infer<typeof savingsFormSchema>;

interface SavingsFormProps {
  onSubmit: (data: SavingsFormValues) => void;
  initialData?: SavingsEntry;
}

export const SavingsForm: React.FC<SavingsFormProps> = ({ onSubmit, initialData }) => {
  const { savingsInstruments } = useSavingsInstruments(); // Use savings instruments from context

  const form = useForm<SavingsFormValues>({
    resolver: zodResolver(savingsFormSchema),
    defaultValues: initialData || {
      amount: 0,
      instrument: "",
      date: new Date(),
      description: "",
    },
  });

  const handleSubmit = (values: SavingsFormValues) => {
    onSubmit(values);
    form.reset({
      amount: 0,
      instrument: "",
      date: new Date(),
      description: "",
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
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="e.g., 100.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="instrument"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Savings Instrument</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a savings instrument" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {savingsInstruments.map((instrument) => (
                    <SelectItem key={instrument.id} value={instrument.name}>
                      {instrument.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Where is this money being saved?
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
                <Textarea placeholder="e.g., Monthly transfer from checking" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">Add Savings</Button>
      </form>
    </Form>
  );
};