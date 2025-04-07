
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { UserPlus, UserX, RefreshCw } from "lucide-react";
import UserTable from "@/components/users/UserTable";

interface User {
  id: string;
  name: string;
  username: string;
  role: string;
  status: string;
  email: string;
  password?: string;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);

  const [newUser, setNewUser] = useState({
    name: "",
    username: "",
    role: "",
    email: "",
    password: "",
  });

  // Load users from localStorage on component mount
  useEffect(() => {
    const storedUsers = localStorage.getItem("zicapi-users");
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      // Initialize with default users
      const defaultUsers: User[] = [
        {
          id: "1",
          name: "System Administrator",
          username: "admin",
          role: "admin",
          status: "active",
          email: "admin@zicapi.com",
        },
        {
          id: "2",
          name: "Regulator User",
          username: "regulator",
          role: "regulator",
          status: "active",
          email: "regulator@zicapi.com",
        },
        {
          id: "3",
          name: "Bank Officer",
          username: "bank",
          role: "bank",
          status: "active",
          email: "bank@zicapi.com",
        },
        {
          id: "4",
          name: "Customs Officer",
          username: "customs",
          role: "customs",
          status: "active",
          email: "customs@zicapi.com",
        },
        {
          id: "5",
          name: "Import Company",
          username: "importer",
          role: "business",
          status: "active",
          email: "importer@example.com",
        },
        {
          id: "6",
          name: "Export Company",
          username: "exporter",
          role: "business",
          status: "active",
          email: "exporter@example.com",
        },
      ];
      
      localStorage.setItem("zicapi-users", JSON.stringify(defaultUsers));
      setUsers(defaultUsers);
    }
  }, []);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!newUser.name || !newUser.username || !newUser.role || !newUser.email || !newUser.password) {
      toast.error("Please fill in all fields");
      return;
    }
    
    // Create new user
    const id = (users.length + 1).toString();
    const updatedUsers = [
      ...users,
      {
        id,
        name: newUser.name,
        username: newUser.username,
        role: newUser.role,
        status: "active",
        email: newUser.email,
        password: newUser.password,
      },
    ];
    
    // Update state and localStorage
    setUsers(updatedUsers);
    localStorage.setItem("zicapi-users", JSON.stringify(updatedUsers));
    
    // Reset form
    setNewUser({
      name: "",
      username: "",
      role: "",
      email: "",
      password: "",
    });
    
    toast.success("User added successfully");
  };

  const handleStatusChange = (userId: string, newStatus: string) => {
    const updatedUsers = users.map((user) =>
      user.id === userId ? { ...user, status: newStatus } : user
    );
    
    setUsers(updatedUsers);
    localStorage.setItem("zicapi-users", JSON.stringify(updatedUsers));
    
    toast.success(`User status updated to ${newStatus}`);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zicapi-primary">User Management</h1>
        <p className="text-muted-foreground">
          Create and manage user accounts for the system
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>System Users</CardTitle>
              <CardDescription>
                All registered users in the ZiCapi Flight Management System
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserTable users={users} onStatusChange={handleStatusChange} />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Add New User</CardTitle>
              <CardDescription>
                Create a new user account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser({ ...newUser, name: e.target.value })
                    }
                    placeholder="Enter full name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={newUser.username}
                    onChange={(e) =>
                      setNewUser({ ...newUser, username: e.target.value })
                    }
                    placeholder="Enter username"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    placeholder="Enter email address"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                    placeholder="Enter password"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value) =>
                      setNewUser({ ...newUser, role: value })
                    }
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">System Administrator</SelectItem>
                      <SelectItem value="regulator">Regulatory Agency</SelectItem>
                      <SelectItem value="bank">Bank Official</SelectItem>
                      <SelectItem value="customs">Customs Official</SelectItem>
                      <SelectItem value="business">Importer/Exporter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button type="submit" className="w-full">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Users;
