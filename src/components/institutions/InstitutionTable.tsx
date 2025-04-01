
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

interface Institution {
  id: string;
  name: string;
  code: string;
  type: string;
  status: string;
  address: string;
}

interface InstitutionTableProps {
  institutions: Institution[];
  onStatusChange: (institutionId: string, status: string) => void;
}

const InstitutionTable: React.FC<InstitutionTableProps> = ({ institutions, onStatusChange }) => {
  // Get institution type display name
  const getTypeName = (type: string) => {
    switch (type) {
      case "commercial":
        return "Commercial Bank";
      case "central":
        return "Central Bank";
      case "microfinance":
        return "Microfinance";
      case "investment":
        return "Investment Bank";
      default:
        return type;
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
            <TableHead>Code</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {institutions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No institutions found
              </TableCell>
            </TableRow>
          ) : (
            institutions.map((institution) => (
              <TableRow key={institution.id}>
                <TableCell className="font-medium">{institution.name}</TableCell>
                <TableCell>{institution.code}</TableCell>
                <TableCell>{getTypeName(institution.type)}</TableCell>
                <TableCell className="max-w-xs truncate" title={institution.address}>
                  {institution.address}
                </TableCell>
                <TableCell>{getStatusBadge(institution.status)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {institution.status !== "active" && (
                        <DropdownMenuItem onClick={() => onStatusChange(institution.id, "active")}>
                          <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                          Activate
                        </DropdownMenuItem>
                      )}
                      {institution.status !== "suspended" && (
                        <DropdownMenuItem onClick={() => onStatusChange(institution.id, "suspended")}>
                          <XCircle className="mr-2 h-4 w-4 text-red-500" />
                          Suspend
                        </DropdownMenuItem>
                      )}
                      {institution.status !== "inactive" && (
                        <DropdownMenuItem onClick={() => onStatusChange(institution.id, "inactive")}>
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

export default InstitutionTable;
