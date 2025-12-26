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
import { Switch } from "@/components/ui/switch";
import { useInvestments } from "@/context/InvestmentContext";
import { InvestmentAsset } from "@/types";

const investmentAssetFormSchema = z.object({
  name: z.string().min(1, { message: "Asset name is required." }),
  type: z.enum(['Mutual Fund', 'Emergency Fund', 'Savings Bank Deposit', 'Gold', 'Stocks', 'Cryptocurrency'], { message: "Asset type is required." }),
  category: z.string().optional(),
  currentPrice: z.coerce.number().min(0.01, { message: "Current price must be positive." }),
  riskLevel: z.enum(['Low', 'Moderate', 'High', 'Very High'], { message: "Risk level is required." }),
  isActive: z.boolean().default(true),
  // Optional fields for specific asset types
  symbol: z.string().optional(),
  fundHouse: z.string().optional(),
  schemeCode: z.string().optional(),
  expenseRatio: z.coerce.number().min(0).max(5).optional(),
  interestRate: z.coerce.number().min(0).max(20).optional(),
  maturityDate: z.date().optional(),
  purity: z.string().optional(),
  exchange: z.string().optional(),
});

type InvestmentAssetFormValues = z.infer<typeof investmentAssetFormSchema>;

interface InvestmentAssetFormProps {
  onSuccess?: () => void;
  initialData?: InvestmentAsset;
  isEditing?: boolean;
}

const assetCategories = {
  'Mutual Fund': ["Large Cap", "Mid Cap", "Small Cap", "Multi Cap", "Flexi Cap", "Large & Mid Cap", "Focused", "Value", "Contra", "Dividend Yield", "ELSS", "Sectoral/Thematic", "Index", "Hybrid Conservative", "Hybrid Aggressive", "Balanced Advantage", "Multi Asset", "Arbitrage", "Equity Savings", "Liquid", "Ultra Short Duration", "Low Duration", "Money Market", "Short Duration", "Medium Duration", "Medium to Long Duration", "Long Duration", "Dynamic Bond", "Corporate Bond", "Credit Risk", "Banking & PSU", "Gilt", "Floater", "FMP", "International", "Gold ETF", "Other ETF"],
  'Emergency Fund': ["High-Yield Savings", "Money Market", "Liquid Fund", "Short-term FD"],
  'Savings Bank Deposit': ["Savings Account", "Fixed Deposit", "Recurring Deposit", "Tax Saver FD"],
  'Gold': ["Physical Gold", "Gold ETF", "Gold Mutual Fund", "Digital Gold", "Gold Bonds"],
  'Stocks': ["Large Cap", "Mid Cap", "Small Cap", "Blue Chip", "Growth", "Value", "Dividend"],
  'Cryptocurrency': ["Bitcoin", "Ethereum", "Altcoins", "Stablecoins", "DeFi Tokens", "NFTs"]
};

const fundHouses = [
  "SBI Mutual Fund", "HDFC Mutual Fund", "ICICI Prudential Mutual Fund", "Axis Mutual Fund", "Kotak Mahindra Mutual Fund", "Nippon India Mutual Fund", "Aditya Birla Sun Life Mutual Fund", "UTI Mutual Fund", "DSP Mutual Fund", "Franklin Templeton Mutual Fund", "Mirae Asset Mutual Fund", "Invesco Mutual Fund", "L&T Mutual Fund", "Tata Mutual Fund", "Mahindra Manulife Mutual Fund", "PGIM India Mutual Fund", "Quant Mutual Fund", "Edelweiss Mutual Fund", "PPFAS Mutual Fund", "Motilal Oswal Mutual Fund", "Other"
];

const exchanges = [
  "NSE", "BSE", "Binance", "Coinbase", "WazirX", "CoinDCX", "Kraken", "Other"
];

const goldPurities = ["24K", "22K", "18K", "14K", "10K"];

export const InvestmentAssetForm: React.FC<InvestmentAssetFormProps> = ({ onSuccess, initialData, isEditing = false }) => {
  const { addInvestmentAsset, updateInvestmentAsset } = useInvestments();

  const form = useForm<InvestmentAssetFormValues>({
    resolver: zodResolver(investmentAssetFormSchema),
    defaultValues: initialData ? {
      ...initialData,
    } as any : {
      name: "",
      type: "Mutual Fund",
      category: "",
      currentPrice: 0,
      riskLevel: "Moderate",
      isActive: true,
      symbol: "",
      fundHouse: "",
      schemeCode: "",
      expenseRatio: 0,
      interestRate: 0,
      purity: "",
      exchange: "",
    },
  });

  const selectedType = form.watch("type");

  const handleSubmit = (values: InvestmentAssetFormValues) => {
    if (isEditing && initialData) {
      updateInvestmentAsset(initialData.id, values as any);
    } else {
      addInvestmentAsset(values as any);
    }
    form.reset();
    if (onSuccess) {
      onSuccess();
    }
  };

  const getFieldLabel = (type: string) => {
    switch (type) {
      case 'Mutual Fund': return 'NAV';
      case 'Emergency Fund': return 'Current Value';
      case 'Savings Bank Deposit': return 'Current Balance';
      case 'Gold': return 'Price per gram/unit';
      case 'Stocks': return 'Share Price';
      case 'Cryptocurrency': return 'Token Price';
      default: return 'Current Price';
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Asset Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., SBI Blue Chip Fund, Emergency Fund, HDFC Bank" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Asset Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select asset type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Mutual Fund">Mutual Fund</SelectItem>
                  <SelectItem value="Emergency Fund">Emergency Fund</SelectItem>
                  <SelectItem value="Savings Bank Deposit">Savings Bank Deposit</SelectItem>
                  <SelectItem value="Gold">Gold</SelectItem>
                  <SelectItem value="Stocks">Stocks</SelectItem>
                  <SelectItem value="Cryptocurrency">Cryptocurrency</SelectItem>
                </SelectContent>
              </Select>
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
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-[200px]">
                  {assetCategories[selectedType]?.map((category) => (
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

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="currentPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{getFieldLabel(selectedType)}</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="45.67" {...field} />
                </FormControl>
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
        </div>

        {/* Conditional fields based on asset type */}
        {selectedType === 'Mutual Fund' && (
          <>
            <FormField
              control={form.control}
              name="fundHouse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fund House</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select fund house" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[200px]">
                      {fundHouses.map((house) => (
                        <SelectItem key={house} value={house}>
                          {house}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="schemeCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scheme Code</FormLabel>
                    <FormControl>
                      <Input placeholder="125497" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expenseRatio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expense Ratio (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="1.25" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        )}

        {(selectedType === 'Stocks' || selectedType === 'Cryptocurrency') && (
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="symbol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Symbol/Ticker</FormLabel>
                  <FormControl>
                    <Input placeholder="HDFCBANK, BTC, ETH" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="exchange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exchange</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select exchange" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {exchanges.map((exchange) => (
                        <SelectItem key={exchange} value={exchange}>
                          {exchange}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {selectedType === 'Gold' && (
          <FormField
            control={form.control}
            name="purity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purity</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select purity" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {goldPurities.map((purity) => (
                      <SelectItem key={purity} value={purity}>
                        {purity}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {selectedType === 'Savings Bank Deposit' && (
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="interestRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interest Rate (%)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="6.5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
          </div>
        )}

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Active Asset</FormLabel>
                <FormDescription>
                  Is this asset currently available for investment?
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
          {isEditing ? 'Update Asset' : 'Add Asset'}
        </Button>
      </form>
    </Form>
  );
};