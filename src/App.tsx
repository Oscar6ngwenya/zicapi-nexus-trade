
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DataImport from "./pages/DataImport";
import Extensions from "./pages/Extensions";
import Acquittals from "./pages/Acquittals";
import MainLayout from "./components/layout/MainLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          
          {/* Protected routes inside the MainLayout */}
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/data-import" element={<DataImport />} />
            <Route path="/extensions" element={<Extensions />} />
            <Route path="/acquittals" element={<Acquittals />} />
            <Route path="/compliance" element={<Dashboard />} /> {/* Placeholder */}
            <Route path="/reports" element={<Dashboard />} /> {/* Placeholder */}
            <Route path="/analytics" element={<Dashboard />} /> {/* Placeholder */}
            <Route path="/users" element={<Dashboard />} /> {/* Placeholder */}
            <Route path="/settings" element={<Dashboard />} /> {/* Placeholder */}
          </Route>
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
