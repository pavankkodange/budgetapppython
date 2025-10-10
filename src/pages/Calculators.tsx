import React from "react";
import { Sidebar } from "@/components/Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SIPCalculator } from "@/components/SIPCalculator";
import { SWPCalculator } from "@/components/SWPCalculator";
import { StepUpSIPCalculator } from "@/components/StepUpSIPCalculator";
import { Calculator } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";

const Calculators = () => {
  const isMobile = useIsMobile();

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className={`flex-1 flex flex-col ${isMobile ? "pt-16" : "ml-64"}`}>
        <header className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BackButton />
            <div>
              <h1 className="text-2xl font-bold">Investment Calculators</h1>
              <p className="text-sm text-muted-foreground">Plan your investments with accurate calculations</p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <Tabs defaultValue="sip-calc" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="sip-calc">SIP Calculator</TabsTrigger>
              <TabsTrigger value="swp-calc">SWP Calculator</TabsTrigger>
              <TabsTrigger value="stepup-calc">Step-up SIP</TabsTrigger>
            </TabsList>

            <TabsContent value="sip-calc" className="space-y-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2 flex items-center">
                  <Calculator className="h-6 w-6 mr-2" />
                  SIP Calculator
                </h2>
                <p className="text-muted-foreground">
                  Calculate the future value of your Systematic Investment Plan with CAGR and visual breakdown.
                </p>
              </div>
              <SIPCalculator />
            </TabsContent>

            <TabsContent value="swp-calc" className="space-y-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2 flex items-center">
                  <Calculator className="h-6 w-6 mr-2" />
                  SWP Calculator
                </h2>
                <p className="text-muted-foreground">
                  Calculate how long your investment will last with Systematic Withdrawal Plan and plan your retirement income.
                </p>
              </div>
              <SWPCalculator />
            </TabsContent>

            <TabsContent value="stepup-calc" className="space-y-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2 flex items-center">
                  <Calculator className="h-6 w-6 mr-2" />
                  Step-up SIP Calculator
                </h2>
                <p className="text-muted-foreground">
                  Calculate the benefits of increasing your SIP amount annually to beat inflation and accelerate wealth creation.
                </p>
              </div>
              <StepUpSIPCalculator />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default Calculators;