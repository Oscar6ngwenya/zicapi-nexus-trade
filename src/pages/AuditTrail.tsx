
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { AuditLog, getAuditLogs, AuditModules, AuditActions } from "@/services/auditService";
import { Search, Download, Clock, UserRound, Activity } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

const AuditTrail: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [filters, setFilters] = useState({
    username: "",
    userRole: "",
    module: "",
    action: "",
    startDate: "",
    endDate: "",
  });
  const [userRole, setUserRole] = useState("admin");

  // Load user role and audit logs on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem("zicapi-user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserRole(user.role);
    }

    // Load audit logs
    const auditLogs = getAuditLogs();
    setLogs(auditLogs);
    setFilteredLogs(auditLogs);
  }, []);

  // Apply filters when they change
  useEffect(() => {
    let result = logs;

    if (filters.username) {
      result = result.filter(log => 
        log.username.toLowerCase().includes(filters.username.toLowerCase())
      );
    }

    if (filters.userRole) {
      result = result.filter(log => log.userRole === filters.userRole);
    }

    if (filters.module) {
      result = result.filter(log => log.module === filters.module);
    }

    if (filters.action) {
      result = result.filter(log => log.action === filters.action);
    }

    if (filters.startDate) {
      const startDateTime = new Date(filters.startDate).getTime();
      result = result.filter(log => new Date(log.timestamp).getTime() >= startDateTime);
    }

    if (filters.endDate) {
      const endDateTime = new Date(filters.endDate).getTime() + 86400000; // Add 1 day to include the end date
      result = result.filter(log => new Date(log.timestamp).getTime() <= endDateTime);
    }

    setFilteredLogs(result);
  }, [filters, logs]);

  // Handle filter changes
  const handleFilterChange = (name: string, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      username: "",
      userRole: "",
      module: "",
      action: "",
      startDate: "",
      endDate: "",
    });
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  };

  // Export audit logs to Excel
  const exportLogs = () => {
    if (filteredLogs.length === 0) {
      toast.error("No data to export");
      return;
    }

    // Format data for export
    const exportData = filteredLogs.map(log => ({
      "Timestamp": formatDate(log.timestamp),
      "Username": log.username,
      "User Role": log.userRole,
      "Action": log.action,
      "Module": log.module,
      "Details": log.details || "N/A",
      "IP Address": log.ipAddress || "N/A"
    }));

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Audit Logs");

    // Generate download
    XLSX.writeFile(wb, `audit-logs-${new Date().toISOString().slice(0, 10)}.xlsx`);
    
    toast.success("Audit logs exported successfully");
  };

  // Check if user has permission to access the page
  if (userRole !== "admin" && userRole !== "regulator") {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You do not have permission to view the system audit trail.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-zicapi-primary">System Audit Trail</h1>
          <p className="text-muted-foreground">
            View a log of all user activities in the system for accountability and audit purposes
          </p>
        </div>
        
        <Button variant="outline" onClick={exportLogs} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Audit Logs
        </Button>
      </div>

      {/* Filter controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Audit Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by username"
                  className="pl-8"
                  value={filters.username}
                  onChange={(e) => handleFilterChange("username", e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">User Role</label>
              <Select 
                value={filters.userRole} 
                onValueChange={(value) => handleFilterChange("userRole", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Roles</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="regulator">Regulator</SelectItem>
                  <SelectItem value="bank">Bank</SelectItem>
                  <SelectItem value="customs">Customs</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Module</label>
              <Select 
                value={filters.module} 
                onValueChange={(value) => handleFilterChange("module", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select module" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Modules</SelectItem>
                  {Object.values(AuditModules).map((module) => (
                    <SelectItem key={module} value={module}>{module}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Action</label>
              <Select 
                value={filters.action} 
                onValueChange={(value) => handleFilterChange("action", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Actions</SelectItem>
                  {Object.values(AuditActions).map((action) => (
                    <SelectItem key={action} value={action}>{action}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <DatePicker
                date={filters.startDate ? new Date(filters.startDate) : undefined}
                onSelect={(date) => handleFilterChange("startDate", date ? date.toISOString() : "")}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <DatePicker
                date={filters.endDate ? new Date(filters.endDate) : undefined}
                onSelect={(date) => handleFilterChange("endDate", date ? date.toISOString() : "")}
              />
            </div>
          </div>
          
          <Button variant="secondary" className="mt-4" onClick={resetFilters}>
            Reset Filters
          </Button>
        </CardContent>
      </Card>

      {/* Audit logs table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Audit Logs
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({filteredLogs.length} entries)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Timestamp
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <UserRound className="h-4 w-4" />
                      User / Role
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Action
                    </div>
                  </TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                      No audit logs found matching your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-xs">
                        {formatDate(log.timestamp)}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{log.username}</div>
                        <div className="text-sm text-muted-foreground">{log.userRole}</div>
                      </TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>{log.module}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={log.details}>
                        {log.details || "N/A"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditTrail;
