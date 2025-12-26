import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SIPCalculator } from "@/components/SIPCalculator";
import { SWPCalculator } from "@/components/SWPCalculator";
import { StepUpSIPCalculator } from "@/components/StepUpSIPCalculator";
import { BackButton } from "@/components/ui/back-button";

const Calculators = () => {
  return (
    <>
      <header className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BackButton />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Investment Calculators</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Plan your investments with accurate calculations</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-3 sm:p-6 overflow-auto">
        <Tabs defaultValue="sip-calc" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sip-calc" className="text-xs sm:text-sm">SIP</TabsTrigger>
            <TabsTrigger value="swp-calc" className="text-xs sm:text-sm">SWP</TabsTrigger>
            <TabsTrigger value="stepup-calc" className="text-xs sm:text-sm">Step-up</TabsTrigger>
          </TabsList>

          <TabsContent value="sip-calc" className="space-y-4 sm:space-y-6">
            <SIPCalculator />
          </TabsContent>

          <TabsContent value="swp-calc" className="space-y-4 sm:space-y-6">
            <SWPCalculator />
          </TabsContent>

          <TabsContent value="stepup-calc" className="space-y-4 sm:space-y-6">
            <StepUpSIPCalculator />
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
};

export default Calculators;