import React from "react";
import { Sidebar } from "./Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const isMobile = useIsMobile();

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
            <Sidebar />
            <div className={`flex-1 flex flex-col w-full ${isMobile ? "pt-16" : "md:ml-64"}`}>
                {children}
            </div>
        </div>
    );
};

export default Layout;
