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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useInvestments } from "@/context/InvestmentContext";

const investmentGoalFormSchema = z.object({
  name: z.string().min(1, { message: "Goal name is required." }),
  targetAmount: z.coerce.number().min(1, { message: "Target amount must be positive." }),
  targetDate: z.date({
    required_error: "Target date is required.",
  }),
  currentAmount: z.coerce.number().min(0, { message: "Current amount cannot be negative." }),
  monthlyContribution: z.coerce.number().min(0, { message: "Monthly contribution cannot be negative." }),
  associatedInvestments: z.array(z.string()).default([]),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

type InvestmentGoalFormValues = z.infer<typeof investmentGoalFormSchema>;

interface InvestmentGoalFormProps {
  onSuccess?: () => void;
}

export const InvestmentGoalForm: React.FC<InvestmentGoalFormProps> = ({ onSuccess }) => {
  const { investments, addInvestmentGoal } = useInvestments();

  const form = useForm<InvestmentGoalFormValues>({
    resolver: zodResolver(investmentGoalFormSchema),
    defaultValues: {
      name: "",
      targetAmount: 0,
      targetDate: new Date(),
      currentAmount: 0,
      monthlyContribution: 0,
      associatedInvestments: [],
      description: "",
      isActive: true,
    },
  });

  const handleSubmit = (values: InvestmentGoalFormValues) => {
    addInvestmentGoal(values);
    form.reset();
    if (onSuccess) {
      onSuccess();
    }
  };

  const targetAmount = form.watch("targetAmount");
  const currentAmount = form.watch("currentAmount");
  const targetDate = form.watch("targetDate");

  // Calculate suggested monthly contribution
  const suggestedMonthlyContribution = React.useMemo(() => {
    if (targetAmount > currentAmount && targetDate) {
      const monthsRemaining = Math.max(1, Math.ceil((targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30)));
      return (targetAmount - currentAmount) / monthsRemaining;
    }
    return 0;
  }, [targetAmount, currentAmount, targetDate]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Goal Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., House Down Payment, Child Education" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="targetAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Amount</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="1000000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currentAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Amount</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="50000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="targetDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Target Date</FormLabel>
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
                    disabled={(date) => date < new Date()}
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
          name="monthlyContribution"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monthly Contribution</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="10000" {...field} />
              </FormControl>
              {suggestedMonthlyContribution > 0 && (
                <FormDescription>
                  Suggested: ₹{suggestedMonthlyContribution.toFixed(0)} per month to reach your goal
                </FormDescription>
              )}
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
                <Textarea placeholder="Describe your investment goal..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {investments.length > 0 && (
          <FormField
            control={form.control}
            name="associatedInvestments"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel className="text-base">Link Investments</FormLabel>
                  <FormDescription>
                    Select investments that contribute to this goal
                  </FormDescription>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {investments.map((investment) => (
                    <FormField
                      key={investment.id}
                      control={form.control}
                      name="associatedInvestments"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={investment.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(investment.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, investment.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== investment.id
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">
                              {investment.investmentType} - ₹{investment.amount.toFixed(0)}
                              <span className="text-muted-foreground text-xs block">
                                {format(investment.purchaseDate, 'dd MMM yyyy')}
                              </span>
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Active Goal</FormLabel>
                <FormDescription>
                  Is this goal currently being pursued?
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

        <Button type="submit" className="w-full">Create Investment Goal</Button>
      </form>
    </Form>
  );
};