
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { KeyIcon, UserIcon, Shield } from "lucide-react";

interface LoginFormProps {
  onLoginSuccess: (userData: {
    id: string;
    username: string;
    role: string;
    name: string;
  }) => void;
}

// Define a proper user type
interface User {
  id: string;
  username: string;
  password: string;
  role: string;
  name: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userRole, setUserRole] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const navigate = useNavigate();

  // Load users from localStorage on component mount
  useEffect(() => {
    const storedUsers = localStorage.getItem("zicapi-users");
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      // Initialize with default users if no stored users exist
      const defaultUsers: User[] = [
        { id: "1", username: "admin", password: "admin123", role: "admin", name: "System Administrator" },
        { id: "2", username: "regulator", password: "regulator123", role: "regulator", name: "Regulator User" },
        { id: "3", username: "bank", password: "bank123", role: "bank", name: "Bank Officer" },
        { id: "4", username: "customs", password: "customs123", role: "customs", name: "Customs Officer" },
        { id: "5", username: "importer", password: "importer123", role: "business", name: "Import Company" },
        { id: "6", username: "exporter", password: "exporter123", role: "business", name: "Export Company" },
      ];
      
      localStorage.setItem("zicapi-users", JSON.stringify(defaultUsers));
      setUsers(defaultUsers);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simple validation
    if (!username || !password || !userRole) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    // Simulate API call delay
    setTimeout(() => {
      const user = users.find(
        (u) => u.username === username && u.password === password && u.role === userRole
      );

      if (user) {
        // Login successful
        toast.success("Login successful!", {
          description: `Welcome back, ${user.name}`,
        });
        
        // Store current user in localStorage
        localStorage.setItem("zicapi-user", JSON.stringify({
          id: user.id,
          username: user.username,
          role: user.role,
          name: user.name,
        }));
        
        onLoginSuccess({
          id: user.id,
          username: user.username,
          role: user.role,
          name: user.name,
        });
        
        navigate("/dashboard");
      } else {
        // Login failed
        setError("Invalid credentials. Please try again.");
        toast.error("Login failed", {
          description: "Invalid username, password, or role.",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center text-zicapi-primary">
          ZiCapi Flight Management System
        </CardTitle>
        <CardDescription className="text-center">
          Enter your credentials to access the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="username"
                placeholder="Enter your username"
                className="pl-10"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <KeyIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="pl-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">User Role</Label>
            <div className="relative">
              <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Select value={userRole} onValueChange={setUserRole}>
                <SelectTrigger id="role" className="pl-10">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">System Administrator</SelectItem>
                  <SelectItem value="regulator">Regulatory Agency</SelectItem>
                  <SelectItem value="bank">Bank</SelectItem>
                  <SelectItem value="customs">Customs</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            type="submit"
            className="w-full bg-zicapi-primary hover:bg-zicapi-secondary"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Sign In"}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <p className="text-center text-sm text-muted-foreground w-full">
          For demo purposes, use username/password: admin/admin123, regulator/regulator123, bank/bank123, etc.
        </p>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
