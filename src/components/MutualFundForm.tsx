import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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
import { Switch } from "@/components/ui/switch";
import { useInvestments } from "@/context/InvestmentContext";
import { InvestmentAsset } from "@/types";

const mutualFundFormSchema = z.object({
  name: z.string().min(1, { message: "Fund name is required." }),
  schemeCode: z.string().min(1, { message: "Scheme code is required." }),
  fundHouse: z.string().min(1, { message: "Fund house is required." }),
  category: z.string().min(1, { message: "Category is required." }),
  riskLevel: z.enum(['Low', 'Moderate', 'High', 'Very High'], { message: "Risk level is required." }),
  expenseRatio: z.coerce.number().min(0).max(5, { message: "Expense ratio must be between 0 and 5%." }),
  nav: z.coerce.number().min(0.01, { message: "NAV must be positive." }),
  isActive: z.boolean().default(true),
});

type MutualFundFormValues = z.infer<typeof mutualFundFormSchema>;


interface MutualFundFormProps {
  onSuccess?: () => void;
  initialData?: InvestmentAsset;
  isEditing?: boolean;
}

const fundCategories = [
  "Large Cap",
  "Mid Cap",
  "Small Cap",
  "Multi Cap",
  "Flexi Cap",
  "Large & Mid Cap",
  "Focused",
  "Value",
  "Contra",
  "Dividend Yield",
  "ELSS",
  "Sectoral/Thematic",
  "Index",
  "Hybrid Conservative",
  "Hybrid Aggressive",
  "Balanced Advantage",
  "Multi Asset",
  "Arbitrage",
  "Equity Savings",
  "Liquid",
  "Ultra Short Duration",
  "Low Duration",
  "Money Market",
  "Short Duration",
  "Medium Duration",
  "Medium to Long Duration",
  "Long Duration",
  "Dynamic Bond",
  "Corporate Bond",
  "Credit Risk",
  "Banking & PSU",
  "Gilt",
  "Floater",
  "FMP",
  "International",
  "Gold ETF",
  "Other ETF"
];

const fundHouses = [
  "SBI Mutual Fund",
  "HDFC Mutual Fund",
  "ICICI Prudential Mutual Fund",
  "Axis Mutual Fund",
  "Kotak Mahindra Mutual Fund",
  "Nippon India Mutual Fund",
  "Aditya Birla Sun Life Mutual Fund",
  "UTI Mutual Fund",
  "DSP Mutual Fund",
  "Franklin Templeton Mutual Fund",
  "Mirae Asset Mutual Fund",
  "Invesco Mutual Fund",
  "L&T Mutual Fund",
  "Tata Mutual Fund",
  "Mahindra Manulife Mutual Fund",
  "PGIM India Mutual Fund",
  "Quant Mutual Fund",
  "Edelweiss Mutual Fund",
  "PPFAS Mutual Fund",
  "Motilal Oswal Mutual Fund",
  "Canara Robeco Mutual Fund",
  "Union Mutual Fund",
  "Sundaram Mutual Fund",
  "JM Financial Mutual Fund",
  "Baroda BNP Paribas Mutual Fund",
  "HSBC Mutual Fund",
  "LIC Mutual Fund",
  "Shriram Mutual Fund",
  "360 ONE Mutual Fund",
  "Groww Mutual Fund",
  "Zerodha Mutual Fund",
  "Other"
];

export const MutualFundForm: React.FC<MutualFundFormProps> = ({ onSuccess, initialData, isEditing = false }) => {
  const { addInvestmentAsset, updateInvestmentAsset } = useInvestments();

  const form = useForm<MutualFundFormValues>({
    resolver: zodResolver(mutualFundFormSchema),
    defaultValues: initialData ? {
      ...initialData,
      nav: (initialData as any).nav || (initialData as any).currentPrice || 0,
    } as any : {
      name: "",
      schemeCode: "",
      fundHouse: "",
      category: "",
      riskLevel: "Moderate",
      expenseRatio: 0,
      nav: 0,
      isActive: true,
    },
  });

  const handleSubmit = (values: MutualFundFormValues) => {
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fund Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., SBI Blue Chip Fund" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="schemeCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Scheme Code</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 125497" {...field} />
              </FormControl>
              <FormDescription>
                The unique scheme code from the AMC (check your Groww app or statement)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

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
                  {fundCategories.map((category) => (
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

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="expenseRatio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expense Ratio (%)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="1.25" {...field} />
                </FormControl>
                <FormDescription>
                  Check fund factsheet for this
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nav"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current NAV</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="45.67" {...field} />
                </FormControl>
                <FormDescription>
                  Today's NAV from Groww/AMC website
                </FormDescription>
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
                <FormLabel>Active Fund</FormLabel>
                <FormDescription>
                  Is this fund currently available for investment?
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
          {isEditing ? 'Update Mutual Fund' : 'Add Mutual Fund'}
        </Button>
      </form>
    </Form>
  );
};