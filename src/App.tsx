import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProfileProvider } from "./context/ProfileContext";
import { AuthForm } from "./components/AuthForm";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Expenses from "./pages/Expenses";
import Reports from "./pages/Reports";
import Admin from "./pages/Admin";
import IncomePage from "./pages/Income";
import Investments from "./pages/Investments";
import Calculators from "./pages/Calculators";
import Insurance from "./pages/Insurance";
import Assets from "./pages/Assets";
import TaxDeductions from "./pages/TaxDeductions";
import NotFound from "./pages/NotFound";
import { CurrencyProvider } from "./context/CurrencyContext";
import { CategoryProvider } from "./context/CategoryContext";
import { IncomeSourceProvider } from "./context/IncomeSourceContext";
import { SavingsEntryProvider } from "./context/SavingsEntryContext";
import { SavingsInstrumentProvider } from "./context/SavingsInstrumentContext";
import { ExpenseProvider } from "./context/ExpenseContext";
import { IncomeSummaryProvider } from "./context/IncomeSummaryContext";
import { InvestmentProvider } from "./context/InvestmentContext";
import { InsuranceProvider } from "./context/InsuranceContext";
import { AssetProvider } from "./context/AssetContext";
import { TaxDeductionProvider } from "./context/TaxDeductionContext";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, loading } = useAuth();

  console.log('AppContent render - User:', user?.email || 'No user', 'Loading:', loading);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <img src="/logo.svg" alt="TrackMyFunds" className="h-16 w-16 animate-pulse" />
          <div className="text-lg">Loading TrackMyFunds...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('No user found, showing AuthForm');
    return <AuthForm />;
  }

  console.log('User authenticated, showing main app');
  return (
    <ProfileProvider>
      <BrowserRouter>
        <CurrencyProvider>
          <CategoryProvider>
            <IncomeSourceProvider>
              <SavingsInstrumentProvider>
                <SavingsEntryProvider>
                  <ExpenseProvider>
                    <IncomeSummaryProvider>
                      <InvestmentProvider>
                        <InsuranceProvider>
                          <AssetProvider>
                            <TaxDeductionProvider>
                              <Layout>
                                <Routes>
                                  {/* Default route redirects to dashboard */}
                                  <Route path="/" element={<Index />} />
                                  <Route path="/dashboard" element={<Navigate to="/" replace />} />
                                  <Route path="/income" element={<IncomePage />} />
                                  <Route path="/expenses" element={<Expenses />} />
                                  <Route path="/investments" element={<Investments />} />
                                  <Route path="/insurance" element={<Insurance />} />
                                  <Route path="/assets" element={<Assets />} />
                                  <Route path="/tax-deductions" element={<TaxDeductions />} />
                                  <Route path="/calculators" element={<Calculators />} />
                                  <Route path="/reports" element={<Reports />} />
                                  <Route path="/admin" element={<Admin />} />
                                  <Route path="*" element={<NotFound />} />
                                </Routes>
                              </Layout>
                            </TaxDeductionProvider>
                          </AssetProvider>
                        </InsuranceProvider>
                      </InvestmentProvider>
                    </IncomeSummaryProvider>
                  </ExpenseProvider>
                </SavingsEntryProvider>
              </SavingsInstrumentProvider>
            </IncomeSourceProvider>
          </CategoryProvider>
        </CurrencyProvider>
      </BrowserRouter>
    </ProfileProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;