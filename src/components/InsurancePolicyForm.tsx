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
import { InsurancePolicy } from "@/types";

const insurancePolicyFormSchema = z.object({
  policyNumber: z.string().min(1, { message: "Policy number is required." }),
  policyType: z.enum(['Term Life', 'Health', 'Motor', 'Home', 'Travel', 'Other'], { message: "Policy type is required." }),
  insurerName: z.string().min(1, { message: "Insurer name is required." }),
  policyHolderName: z.string().min(1, { message: "Policy holder name is required." }),
  sumInsured: z.coerce.number().min(1, { message: "Sum insured must be positive." }),
  premiumAmount: z.coerce.number().min(1, { message: "Premium amount must be positive." }),
  premiumFrequency: z.enum(['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'], { message: "Premium frequency is required." }),
  policyStartDate: z.date({ required_error: "Policy start date is required." }),
  policyEndDate: z.date({ required_error: "Policy end date is required." }),
  nextPremiumDueDate: z.date({ required_error: "Next premium due date is required." }),
  isActive: z.boolean().default(true),
  // Health Insurance specific
  familyMembers: z.string().optional(),
  roomRentLimit: z.coerce.number().optional(),
  copaymentPercentage: z.coerce.number().min(0).max(100).optional(),
  waitingPeriod: z.coerce.number().min(0).optional(),
  // Term Life specific
  beneficiaryName: z.string().optional(),
  beneficiaryRelation: z.string().optional(),
  // Additional details
  agentName: z.string().optional(),
  agentContact: z.string().optional(),
  notes: z.string().optional(),
});

type InsurancePolicyFormValues = z.infer<typeof insurancePolicyFormSchema>;

interface InsurancePolicyFormProps {
  onSubmit: (data: InsurancePolicyFormValues) => void;
  initialData?: InsurancePolicy;
  isEditing?: boolean;
}

const insurerOptions = [
  "LIC of India", "HDFC Life", "ICICI Prudential", "SBI Life", "Max Life", "Bajaj Allianz",
  "Star Health", "HDFC ERGO", "ICICI Lombard", "Bajaj Finserv Health", "Care Health",
  "New India Assurance", "Oriental Insurance", "United India Insurance", "National Insurance",
  "Tata AIG", "Reliance General", "Future Generali", "Kotak Mahindra General", "Other"
];

const relationOptions = [
  "Spouse", "Child", "Parent", "Sibling", "Other Family Member"
];

export const InsurancePolicyForm: React.FC<InsurancePolicyFormProps> = ({ 
  onSubmit, 
  initialData, 
  isEditing = false 
}) => {
  const form = useForm<InsurancePolicyFormValues>({
    resolver: zodResolver(insurancePolicyFormSchema),
    defaultValues: initialData ? {
      ...initialData,
      familyMembers: initialData.familyMembers?.join(', ') || '',
    } : {
      policyNumber: "",
      policyType: "Health",
      insurerName: "",
      policyHolderName: "",
      sumInsured: 0,
      premiumAmount: 0,
      premiumFrequency: "Yearly",
      policyStartDate: new Date(),
      policyEndDate: new Date(),
      nextPremiumDueDate: new Date(),
      isActive: true,
      familyMembers: "",
      roomRentLimit: 0,
      copaymentPercentage: 0,
      waitingPeriod: 0,
      beneficiaryName: "",
      beneficiaryRelation: "",
      agentName: "",
      agentContact: "",
      notes: "",
    },
  });

  const selectedPolicyType = form.watch("policyType");

  const handleSubmit = (values: InsurancePolicyFormValues) => {
    // Convert familyMembers string to array
    const processedValues = {
      ...values,
      familyMembers: values.familyMembers 
        ? values.familyMembers.split(',').map(member => member.trim()).filter(Boolean)
        : undefined,
    };
    
    onSubmit(processedValues as any);
    if (!isEditing) {
      form.reset();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="policyNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Policy Number</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., POL123456789" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="policyType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Policy Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select policy type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Term Life">Term Life Insurance</SelectItem>
                    <SelectItem value="Health">Health Insurance</SelectItem>
                    <SelectItem value="Motor">Motor Insurance</SelectItem>
                    <SelectItem value="Home">Home Insurance</SelectItem>
                    <SelectItem value="Travel">Travel Insurance</SelectItem>
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
            name="insurerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Insurance Company</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select insurer" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-[200px]">
                    {insurerOptions.map((insurer) => (
                      <SelectItem key={insurer} value={insurer}>
                        {insurer}
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
            name="policyHolderName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Policy Holder Name</FormLabel>
                <FormControl>
                  <Input placeholder="Full name as per policy" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="sumInsured"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sum Insured</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="500000" {...field} />
                </FormControl>
                <FormDescription>
                  Coverage amount in your currency
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="premiumAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Premium Amount</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="12000" {...field} />
                </FormControl>
                <FormDescription>
                  Premium amount per frequency selected
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="premiumFrequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Premium Frequency</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                  <SelectItem value="Quarterly">Quarterly</SelectItem>
                  <SelectItem value="Half-Yearly">Half-Yearly</SelectItem>
                  <SelectItem value="Yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="policyStartDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Policy Start Date</FormLabel>
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
            name="policyEndDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Policy End Date</FormLabel>
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
            name="nextPremiumDueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Next Premium Due</FormLabel>
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

        {/* Health Insurance Specific Fields */}
        {selectedPolicyType === 'Health' && (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <h3 className="text-lg font-semibold">Health Insurance Details</h3>
            
            <FormField
              control={form.control}
              name="familyMembers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Covered Family Members</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Self, Spouse, Child 1, Child 2" {...field} />
                  </FormControl>
                  <FormDescription>
                    Comma-separated list of covered members
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="roomRentLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Rent Limit</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="5000" {...field} />
                    </FormControl>
                    <FormDescription>Per day limit</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="copaymentPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Co-payment %</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" max="100" placeholder="10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="waitingPeriod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Waiting Period (months)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="24" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {/* Term Life Insurance Specific Fields */}
        {selectedPolicyType === 'Term Life' && (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <h3 className="text-lg font-semibold">Term Life Insurance Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="beneficiaryName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Beneficiary Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Full name of beneficiary" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="beneficiaryRelation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Beneficiary Relation</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select relation" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {relationOptions.map((relation) => (
                          <SelectItem key={relation} value={relation}>
                            {relation}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {/* Agent Details */}
        <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
          <h3 className="text-lg font-semibold">Agent Details (Optional)</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="agentName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agent Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Agent's full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="agentContact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agent Contact</FormLabel>
                  <FormControl>
                    <Input placeholder="Phone number or email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Any additional information about this policy..." {...field} />
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
                <FormLabel>Active Policy</FormLabel>
                <FormDescription>
                  Is this policy currently active?
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
          {isEditing ? 'Update Policy' : 'Add Policy'}
        </Button>
      </form>
    </Form>
  );
};