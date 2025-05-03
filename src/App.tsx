import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DataImport from "./pages/DataImport";
import Extensions from "./pages/Extensions";
import Acquittals from "./pages/Acquittals";
import Compliance from "./pages/Compliance";
import Users from "./pages/Users";
import Penalties from "./pages/Penalties";
import FinancialInstitutions from "./pages/FinancialInstitutions";
import AuditTrail from "./pages/AuditTrail";
import MainLayout from "./components/layout/MainLayout";
import NotFound from "./pages/NotFound";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Login />} />
              
              <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/data-import" element={<DataImport />} />
                <Route path="/extensions" element={<Extensions />} />
                <Route path="/acquittals" element={<Acquittals />} />
                <Route path="/compliance" element={<Compliance />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/penalties" element={<Penalties />} />
                
                {/* Restricted routes - admin only */}
                <Route 
                  path="/users" 
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <Users />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/financial-institutions" 
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <FinancialInstitutions />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Make audit trail accessible to both admin and regulator users */}
                <Route 
                  path="/audit-trail" 
                  element={
                    <ProtectedRoute allowedRoles={["admin", "regulator"]}>
                      <AuditTrail />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Settings route */}
                <Route path="/settings" element={<Settings />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

// Protected route component to check user role
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const userString = localStorage.getItem("zicapi-user");
  const user = userString ? JSON.parse(userString) : null;
  
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

export default App;
