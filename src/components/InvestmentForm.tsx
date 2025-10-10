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
import { useInvestments } from "@/context/InvestmentContext";

const investmentFormSchema = z.object({
  assetId: z.string().min(1, { message: "Please select an asset." }),
  investmentType: z.enum(['SIP', 'Lumpsum', 'Recurring Deposit', 'One-time Purchase'], { message: "Investment type is required." }),
  amount: z.coerce.number().min(0.01, { message: "Amount must be positive." }),
  units: z.coerce.number().min(0.001, { message: "Units must be positive." }),
  purchasePrice: z.coerce.number().min(0.01, { message: "Purchase price must be positive." }),
  purchaseDate: z.date({
    required_error: "Purchase date is required.",
  }),
  sipDate: z.coerce.number().min(1).max(31).optional(),
  maturityDate: z.date().optional(),
  lockInPeriod: z.coerce.number().min(0).optional(),
  isActive: z.boolean().default(true),
  notes: z.string().optional(),
});

type InvestmentFormValues = z.infer<typeof investmentFormSchema>;

interface InvestmentFormProps {
  onSuccess?: () => void;
}

export const InvestmentForm: React.FC<InvestmentFormProps> = ({ onSuccess }) => {
  const { investmentAssets, addInvestment } = useInvestments();

  const form = useForm<InvestmentFormValues>({
    resolver: zodResolver(investmentFormSchema),
    defaultValues: {
      assetId: "",
      investmentType: "Lumpsum",
      amount: 0,
      units: 0,
      purchasePrice: 0,
      purchaseDate: new Date(),
      sipDate: 1,
      lockInPeriod: 0,
      isActive: true,
      notes: "",
    },
  });

  const selectedAssetId = form.watch("assetId");
  const investmentType = form.watch("investmentType");
  const amount = form.watch("amount");
  const purchasePrice = form.watch("purchasePrice");

  const selectedAsset = investmentAssets.find(asset => asset.id === selectedAssetId);

  // Auto-calculate units when amount and purchase price change
  React.useEffect(() => {
    if (amount > 0 && purchasePrice > 0) {
      const calculatedUnits = amount / purchasePrice;
      form.setValue("units", parseFloat(calculatedUnits.toFixed(6)));
    }
  }, [amount, purchasePrice, form]);

  const handleSubmit = (values: InvestmentFormValues) => {
    addInvestment(values);
    form.reset();
    if (onSuccess) {
      onSuccess();
    }
  };

  const activeAssets = investmentAssets.filter(asset => asset.isActive);

  const getInvestmentTypes = (assetType: string) => {
    switch (assetType) {
      case 'Mutual Fund':
        return ['SIP', 'Lumpsum'];
      case 'Savings Bank Deposit':
        return ['Lumpsum', 'Recurring Deposit'];
      default:
        return ['Lumpsum', 'One-time Purchase'];
    }
  };

  const getUnitsLabel = (assetType: string) => {
    switch (assetType) {
      case 'Mutual Fund': return 'Units';
      case 'Stocks': return 'Shares';
      case 'Gold': return 'Grams/Units';
      case 'Cryptocurrency': return 'Tokens';
      default: return 'Quantity';
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="assetId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Investment Asset</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an asset" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-[200px]">
                  {activeAssets.map((asset) => (
                    <SelectItem key={asset.id} value={asset.id}>
                      <div className="flex flex-col">
                        <span>{asset.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {asset.type} • Current Price: ₹{asset.currentPrice.toFixed(2)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedAsset && (
          <FormField
            control={form.control}
            name="investmentType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Investment Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select investment type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {getInvestmentTypes(selectedAsset.type).map((type) => (
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
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount Invested</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="5000.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="purchasePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Price</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="45.67" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="units"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{selectedAsset ? getUnitsLabel(selectedAsset.type) : 'Units'}</FormLabel>
              <FormControl>
                <Input type="number" step="0.001" placeholder="109.456" {...field} />
              </FormControl>
              <FormDescription>
                Units are auto-calculated based on amount and price
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="purchaseDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Purchase Date</FormLabel>
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

        {(investmentType === 'SIP' || investmentType === 'Recurring Deposit') && (
          <FormField
            control={form.control}
            name="sipDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{investmentType === 'SIP' ? 'SIP Date' : 'Deposit Date'}</FormLabel>
                <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select date" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <SelectItem key={day} value={day.toString()}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Day of the month for {investmentType === 'SIP' ? 'SIP deduction' : 'recurring deposit'}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {selectedAsset?.type === 'Savings Bank Deposit' && (
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="maturityDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Maturity Date (Optional)</FormLabel>
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
              name="lockInPeriod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lock-in Period (Months)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="12" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Any additional notes about this investment..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Active Investment</FormLabel>
                <FormDescription>
                  Is this investment currently active?
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

        <Button type="submit" className="w-full">Add Investment</Button>
      </form>
    </Form>
  );
};