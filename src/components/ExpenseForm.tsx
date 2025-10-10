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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Expense } from "@/types";
import { useCategories } from "@/context/CategoryContext";

const expenseFormSchema = z.object({
  amount: z.coerce.number().min(0.01, { message: "Amount must be positive." }),
  category: z.string().min(1, { message: "Category is required." }),
  date: z.date({
    required_error: "A date is required.",
  }),
  description: z.string().max(200, { message: "Description cannot exceed 200 characters." }).optional(),
  isRecurring: z.boolean().default(false).optional(),
  recurrenceInterval: z.enum(['monthly']).optional(),
  endYear: z.string().optional(),
  endMonth: z.string().optional(),
  endDay: z.string().optional(),
}).refine((data) => {
  // If recurring and end date components are provided, validate the end date
  if (data.isRecurring && data.endYear && data.endMonth && data.endDay) {
    const endDate = new Date(parseInt(data.endYear), parseInt(data.endMonth), parseInt(data.endDay));
    return endDate > data.date;
  }
  return true;
}, {
  message: "End date must be after the start date",
  path: ["endDay"],
});

type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

interface ExpenseFormProps {
  onSubmit: (data: ExpenseFormValues & { endDate?: Date }) => void;
  initialData?: Expense;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSubmit, initialData }) => {
  const { categories } = useCategories();

  // Convert initialData to form values format
  const getFormDefaultValues = () => {
    if (!initialData) {
      return {
        amount: 0,
        category: "",
        date: new Date(),
        description: "",
        isRecurring: false,
        recurrenceInterval: 'monthly',
        endYear: "",
        endMonth: "",
        endDay: "",
      };
    }

    // Extract end date components if available
    let endYear = "";
    let endMonth = "";
    let endDay = "";

    if (initialData.endDate) {
      endYear = initialData.endDate.getFullYear().toString();
      endMonth = initialData.endDate.getMonth().toString();
      endDay = initialData.endDate.getDate().toString();
    }

    return {
      amount: initialData.amount,
      category: initialData.category,
      date: initialData.date,
      description: initialData.description || "",
      isRecurring: initialData.isRecurring || false,
      recurrenceInterval: initialData.recurrenceInterval || 'monthly',
      endYear,
      endMonth,
      endDay,
    };
  };

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: getFormDefaultValues(),
  });

  const isRecurring = form.watch("isRecurring");
  const startDate = form.watch("date");
  const selectedEndYear = form.watch("endYear");
  const selectedEndMonth = form.watch("endMonth");

  const handleSubmit = (values: ExpenseFormValues) => {
    // Convert the separate date components into a single Date object
    let endDate: Date | undefined = undefined;
    if (values.endYear && values.endMonth && values.endDay) {
      endDate = new Date(parseInt(values.endYear), parseInt(values.endMonth), parseInt(values.endDay));
    }

    const submitData = {
      amount: values.amount,
      category: values.category,
      date: values.date,
      description: values.description,
      isRecurring: values.isRecurring,
      recurrenceInterval: values.recurrenceInterval,
      endDate,
    };

    onSubmit(submitData);
    
    // Only reset the form if it's not an edit (no initialData)
    if (!initialData) {
      form.reset({
        amount: 0,
        category: "",
        date: new Date(),
        description: "",
        isRecurring: false,
        recurrenceInterval: 'monthly',
        endYear: "",
        endMonth: "",
        endDay: "",
      });
    }
  };

  // Generate endless year options - starting from current year and going far into the future
  const currentYear = new Date().getFullYear();
  const generateYears = () => {
    const years = [];
    // Generate 200 years starting from current year (should be more than enough for any use case)
    for (let i = 0; i < 200; i++) {
      years.push(currentYear + i);
    }
    return years;
  };

  const years = generateYears();

  // Generate month options
  const months = [
    { value: "0", label: "January" },
    { value: "1", label: "February" },
    { value: "2", label: "March" },
    { value: "3", label: "April" },
    { value: "4", label: "May" },
    { value: "5", label: "June" },
    { value: "6", label: "July" },
    { value: "7", label: "August" },
    { value: "8", label: "September" },
    { value: "9", label: "October" },
    { value: "10", label: "November" },
    { value: "11", label: "December" },
  ];

  // Generate day options based on selected month and year
  const getDaysInMonth = (year: string, month: string) => {
    if (!year || !month) return [];
    const daysInMonth = new Date(parseInt(year), parseInt(month) + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  const availableDays = getDaysInMonth(selectedEndYear, selectedEndMonth);

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
                <Input type="number" step="0.01" placeholder="e.g., 123.45" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
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
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Start Date</FormLabel>
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
                <Textarea placeholder="e.g., Monthly software license fee" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isRecurring"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Recurring Expense</FormLabel>
                <FormDescription>
                  Mark this expense as recurring (e.g., monthly).
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
        {isRecurring && (
          <>
            <FormField
              control={form.control}
              name="recurrenceInterval"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recurrence Interval</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select interval" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    How often does this expense recur?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* End Date Selection with Dropdowns */}
            <div className="space-y-3">
              <FormLabel>End Date (Optional)</FormLabel>
              <FormDescription>
                When should this recurring expense stop? Leave empty for indefinite.
              </FormDescription>
              
              <div className="grid grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name="endYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Year</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Year" />
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
                
                <FormField
                  control={form.control}
                  name="endMonth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Month</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Month" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {months.map((month) => (
                            <SelectItem key={month.value} value={month.value}>
                              {month.label}
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
                  name="endDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Day</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        disabled={!selectedEndYear || !selectedEndMonth}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Day" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableDays.map((day) => (
                            <SelectItem key={day} value={day.toString()}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {selectedEndYear && selectedEndMonth && form.watch("endDay") && (
                <div className="text-sm text-muted-foreground">
                  Selected end date: {format(
                    new Date(
                      parseInt(selectedEndYear), 
                      parseInt(selectedEndMonth), 
                      parseInt(form.watch("endDay") || "1")
                    ), 
                    "PPP"
                  )}
                </div>
              )}
            </div>
          </>
        )}
        <Button type="submit" className="w-full">{initialData ? 'Update Expense' : 'Add Expense'}</Button>
      </form>
    </Form>
  );
};