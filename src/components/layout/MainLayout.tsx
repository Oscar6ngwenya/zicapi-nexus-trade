
import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import { toast } from "sonner";
import { createAuditLog, AuditActions, AuditModules } from "@/services/auditService";

const MainLayout: React.FC = () => {
  const [user, setUser] = useState<{
    id: string;
    username: string;
    role: string;
    name: string;
  } | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user is authenticated
    const storedUser = localStorage.getItem("zicapi-user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      
      // Log page navigation for audit trail
      if (userData) {
        const pathSegments = location.pathname.split("/");
        const pageName = pathSegments[1] || "dashboard";
        const moduleMap: Record<string, string> = {
          "dashboard": AuditModules.DASHBOARD,
          "data-import": AuditModules.DATA_IMPORT,
          "extensions": AuditModules.EXTENSIONS,
          "acquittals": AuditModules.ACQUITTALS,
          "compliance": AuditModules.COMPLIANCE,
          "reports": AuditModules.REPORTS,
          "penalties": AuditModules.PENALTIES,
          "users": AuditModules.USERS,
          "financial-institutions": AuditModules.FINANCIAL,
          "audit-trail": "Audit Trail"
        };
        
        // Only log navigation to main pages, not initial load
        if (pageName && location.key !== "default") {
          createAuditLog(
            userData.id,
            userData.username,
            userData.role,
            "Page View",
            moduleMap[pageName] || pageName.charAt(0).toUpperCase() + pageName.slice(1),
            `User accessed the ${moduleMap[pageName] || pageName} page`
          );
        }
      }
    } else {
      navigate("/");
    }
  }, [navigate, location]);

  const handleLogout = () => {
    // Log the logout action
    if (user) {
      createAuditLog(
        user.id,
        user.username,
        user.role,
        AuditActions.LOGOUT,
        AuditModules.AUTH,
        "User logged out of the system"
      );
    }
    
    // Clear user data and navigate to login
    setUser(null);
    localStorage.removeItem("zicapi-user");
    navigate("/");
    toast.info("You have been logged out");
  };

  // Show loading state while checking authentication
  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Loading...</h2>
          <p className="text-muted-foreground">Please wait while we authenticate you</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar userRole={user.role} userName={user.name} onLogout={handleLogout} />
      <main className="flex-1 overflow-auto bg-background">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
