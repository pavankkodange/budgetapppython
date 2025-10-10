import React from "react";
import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Menu, LayoutDashboard, DollarSign, BarChart, Settings, Wallet, LogOut, User, Edit, TrendingUp, Calculator, Shield, Package, Receipt } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/context/ProfileContext";
import { ProfileForm } from "@/components/ProfileForm";

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ to, icon, label, onClick }) => (
  <Link to={to} onClick={onClick} className="w-full group">
    <div className={`flex items-center w-full px-3 py-3 rounded-md transition-all duration-200 text-white/90 hover:bg-white/10 hover:text-white active:bg-white/20 active:text-white`}>
      <span className="flex-shrink-0">{icon}</span>
      <span className="ml-3 text-sm font-medium truncate">{label}</span>
    </div>
  </Link>
);

const SidebarContent: React.FC<{ onLinkClick?: () => void }> = ({ onLinkClick }) => {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const [isProfileDialogOpen, setIsProfileDialogOpen] = React.useState(false);
  const isMobile = useIsMobile();

  const handleSignOut = async () => {
    try {
      await signOut();
      if (onLinkClick) onLinkClick();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleProfileUpdate = () => {
    setIsProfileDialogOpen(false);
    if (onLinkClick) onLinkClick();
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white overflow-hidden">
      {/* TrackMyFunds Branding Section */}
      <div className="p-4 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
        <div className="flex items-center space-x-2">
          <div className="h-10 w-10 flex-shrink-0 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <img src="/logo.svg" alt="TrackMyFunds Logo" className="h-8 w-8" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-white mb-0 leading-tight">TrackMyFunds</h1>
            <p className="text-xs text-white/70 leading-tight mt-0.5">Your Finance Manager</p>
          </div>
        </div>
      </div>
      
      {/* User Profile Section */}
      <div className="p-4 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
        <div className="flex items-center space-x-2">
          <div className="h-10 w-10 flex-shrink-0 relative">
            {profile?.profile_picture_url ? (
              <img
                src={profile.profile_picture_url}
                alt="Profile"
                className="h-10 w-10 rounded-full object-cover border-2 border-white/20 shadow-lg"
              />
            ) : (
              <div className="h-10 w-10 bg-gradient-to-br from-white/20 to-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                <User className="h-5 w-5 text-white" />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">
              {profile?.full_name || user?.email || 'Not logged in'}
            </p>
            <p className="text-xs text-white/70 truncate text-[10px]">
              {profile?.full_name ? user?.email : 'Welcome back!'}
            </p>
            {profile?.phone && (
              <p className="text-xs text-white/70 truncate text-[10px]">
                {profile.phone}
              </p>
            )}
          </div>
          <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0 hover:bg-white/10 text-white">
                <Edit className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {profile ? 'Update Profile' : 'Create Profile'}
                </DialogTitle>
              </DialogHeader>
              <ProfileForm onSuccess={handleProfileUpdate} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-3 overflow-y-auto scrollbar-thin">
        <nav className="space-y-1 px-2">
          <NavLink
            to="/"
            icon={<LayoutDashboard className="h-5 w-5" />}
            label="Dashboard"
            onClick={onLinkClick}
          />
          <NavLink
            to="/income"
            icon={<Wallet className="h-5 w-5" />}
            label="Income"
            onClick={onLinkClick}
          />
          <NavLink
            to="/expenses"
            icon={<DollarSign className="h-5 w-5" />}
            label="Expenses"
            onClick={onLinkClick}
          />
          <NavLink
            to="/investments"
            icon={<TrendingUp className="h-5 w-5" />}
            label="Investments"
            onClick={onLinkClick}
          />
          <NavLink
            to="/insurance"
            icon={<Shield className="h-5 w-5" />}
            label="Insurance"
            onClick={onLinkClick}
          />
          <NavLink
            to="/assets"
            icon={<Package className="h-5 w-5" />}
            label="Assets"
            onClick={onLinkClick}
          />
          <NavLink
            to="/tax-deductions"
            icon={<Receipt className="h-5 w-5" />}
            label="Tax Deductions"
            onClick={onLinkClick}
          />
          <NavLink
            to="/calculators"
            icon={<Calculator className="h-5 w-5" />}
            label="Calculators"
            onClick={onLinkClick}
          />
          <NavLink
            to="/reports"
            icon={<BarChart className="h-5 w-5" />}
            label="Reports"
            onClick={onLinkClick}
          />
          <NavLink
            to="/admin"
            icon={<Settings className="h-5 w-5" />}
            label="Admin"
            onClick={onLinkClick}
          />
        </nav>
      </div>
      
      {/* Sign Out Section */}
      <div className="p-3 mt-auto border-t border-white/10 bg-gradient-to-r from-white/5 to-transparent">
        <Button
          variant="ghost"
          className="w-full justify-start text-white hover:bg-red-500/20 hover:text-red-100 transition-all duration-200 group"
          onClick={handleSignOut}
        >
          <LogOut className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
          <span className="ml-3 font-medium">Sign Out</span>
        </Button>
      </div>
    </div>
  );
};

export const Sidebar: React.FC = () => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLinkClick = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen} className="z-50">
        <SheetTrigger asChild>
          <Button
            variant="ghost" 
            size="icon" 
            className="fixed top-2 left-2 z-50 h-10 w-10 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-foreground shadow-sm rounded-lg"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-[85vw] max-w-[300px] border-0 overflow-hidden mobile-sidebar">
          <SidebarContent onLinkClick={handleLinkClick} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 z-40 shadow-2xl">
      <SidebarContent />
    </div>
  ); 
};