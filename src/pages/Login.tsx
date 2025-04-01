
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "@/components/auth/LoginForm";

const Login: React.FC = () => {
  const navigate = useNavigate();

  // Handle successful login
  const handleLoginSuccess = (userData: {
    id: string;
    username: string;
    role: string;
    name: string;
  }) => {
    // Navigate to dashboard on successful login
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center space-y-8 w-full max-w-md">
        <div className="text-center mb-4">
          <h1 className="text-4xl font-bold text-zicapi-primary">
            ZiCapi Flight
          </h1>
          <h2 className="text-xl text-zicapi-secondary mt-2">
            Management System
          </h2>
        </div>
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      </div>
    </div>
  );
};

export default Login;
