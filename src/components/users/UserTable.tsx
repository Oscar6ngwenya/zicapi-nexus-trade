
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CheckCircle, XCircle, MoreHorizontal } from "lucide-react";

interface User {
  id: string;
  name: string;
  username: string;
  role: string;
  status: string;
  email: string;
}

interface UserTableProps {
  users: User[];
  onStatusChange: (userId: string, status: string) => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, onStatusChange }) => {
  // Get role display name
  const getRoleName = (role: string) => {
    switch (role) {
      case "regulator":
        return "Regulatory Agency";
      case "bank":
        return "Bank Official";
      case "customs":
        return "Customs Official";
      case "business":
        return "Importer/Exporter";
      default:
        return role;
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Active
          </Badge>
        );
      case "inactive":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            Inactive
          </Badge>
        );
      case "suspended":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Suspended
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{getRoleName(user.role)}</TableCell>
                <TableCell>{getStatusBadge(user.status)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {user.status !== "active" && (
                        <DropdownMenuItem onClick={() => onStatusChange(user.id, "active")}>
                          <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                          Activate
                        </DropdownMenuItem>
                      )}
                      {user.status !== "suspended" && (
                        <DropdownMenuItem onClick={() => onStatusChange(user.id, "suspended")}>
                          <XCircle className="mr-2 h-4 w-4 text-red-500" />
                          Suspend
                        </DropdownMenuItem>
                      )}
                      {user.status !== "inactive" && (
                        <DropdownMenuItem onClick={() => onStatusChange(user.id, "inactive")}>
                          <XCircle className="mr-2 h-4 w-4 text-amber-500" />
                          Deactivate
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserTable;
