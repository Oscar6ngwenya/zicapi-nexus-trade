
import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { toast } from "sonner";

const MainLayout: React.FC = () => {
  const [user, setUser] = useState<{
    id: string;
    username: string;
    role: string;
    name: string;
  } | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const storedUser = localStorage.getItem("zicapi-user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = () => {
    setUser(null);
    navigate("/");
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
