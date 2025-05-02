
import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { 
  AuditLog, 
  getAuditLogs, 
  AuditModules, 
  AuditActions, 
  RiskLevels,
  verifyAuditLogIntegrity 
} from "@/services/auditService";
import { Search, Download, Clock, UserRound, Activity, FileText, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import jsPDF from "jspdf";
import "jspdf-autotable";

const AuditTrail: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [filters, setFilters] = useState({
    username: "",
    userRole: "",
    module: "",
    action: "",
    riskLevel: "",
    isLoginAttempt: "",
    isLogout: "",
    startDate: "",
    endDate: "",
  });
  const [userRole, setUserRole] = useState("admin");
  const [currentPage, setCurrentPage] = useState(1);
  const [isVerifying, setIsVerifying] = useState(false);
  const itemsPerPage = 10;
  
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
    
    if (filters.riskLevel) {
      result = result.filter(log => log.riskLevel === filters.riskLevel);
    }
    
    if (filters.isLoginAttempt) {
      const isLogin = filters.isLoginAttempt === "true";
      result = result.filter(log => log.isLoginAttempt === isLogin);
    }
    
    if (filters.isLogout) {
      const isLogout = filters.isLogout === "true";
      result = result.filter(log => log.isLogout === isLogout);
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
    setCurrentPage(1); // Reset to first page when filters change
  }, [filters, logs]);

  // Calculate pagination
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLogs, currentPage]);
  
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

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
      riskLevel: "",
      isLoginAttempt: "",
      isLogout: "",
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
  const exportToExcel = () => {
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
      "Risk Level": log.riskLevel || "N/A",
      "IP Address": log.ipAddress || "N/A",
      "Device": log.deviceInfo || "N/A",
      "Session Duration (s)": log.sessionDuration || "N/A",
      "Details": log.details || "N/A"
    }));

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Audit Logs");

    // Generate download
    XLSX.writeFile(wb, `audit-logs-${new Date().toISOString().slice(0, 10)}.xlsx`);
    
    toast.success("Audit logs exported to Excel successfully");
  };
  
  // Export audit logs to CSV
  const exportToCSV = () => {
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
      "Risk Level": log.riskLevel || "N/A",
      "IP Address": log.ipAddress || "N/A",
      "Device": log.deviceInfo || "N/A",
      "Session Duration (s)": log.sessionDuration || "N/A",
      "Details": log.details || "N/A"
    }));

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    const csv = XLSX.utils.sheet_to_csv(ws);
    
    // Create download link
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Audit logs exported to CSV successfully");
  };
  
  // Export audit logs to PDF
  const exportToPDF = () => {
    if (filteredLogs.length === 0) {
      toast.error("No data to export");
      return;
    }

    // Create new PDF document
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text("Audit Trail Report", 14, 22);
    
    // Add generated date
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    
    // Format data for table
    const tableData = filteredLogs.map(log => [
      formatDate(log.timestamp),
      log.username,
      log.userRole,
      log.action,
      log.module,
      log.riskLevel || "N/A",
      log.details || "N/A"
    ]);
    
    // Add table
    (doc as any).autoTable({
      startY: 40,
      head: [["Timestamp", "Username", "Role", "Action", "Module", "Risk", "Details"]],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      styles: { fontSize: 8, cellPadding: 3 }
    });
    
    // Save document
    doc.save(`audit-logs-${new Date().toISOString().slice(0, 10)}.pdf`);
    
    toast.success("Audit logs exported to PDF successfully");
  };

  // Verify log integrity
  const verifyLogIntegrity = () => {
    setIsVerifying(true);
    
    setTimeout(() => {
      const tamperedLogs = verifyAuditLogIntegrity();
      setIsVerifying(false);
      
      if (tamperedLogs.length > 0) {
        toast.error(`Found ${tamperedLogs.length} potentially tampered logs!`, {
          description: "Log integrity check failed"
        });
      } else {
        toast.success("All logs passed integrity verification", {
          description: "No tampered logs detected"
        });
      }
    }, 1000);
  };
  
  // Get badge color for risk level
  const getRiskBadgeColor = (risk?: string) => {
    switch (risk) {
      case 'high': return "bg-red-100 text-red-800 hover:bg-red-200";
      case 'medium': return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case 'low': return "bg-green-100 text-green-800 hover:bg-green-200";
      default: return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
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
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zicapi-primary">System Audit Trail</h1>
          <p className="text-muted-foreground">
            View a log of all user activities in the system for accountability and audit purposes
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={exportToExcel} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export to Excel
          </Button>
          
          <Button variant="outline" onClick={exportToCSV} className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Export to CSV
          </Button>
          
          <Button variant="outline" onClick={exportToPDF} className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Export to PDF
          </Button>
          
          <Button 
            variant="secondary" 
            onClick={verifyLogIntegrity} 
            disabled={isVerifying}
            className="flex items-center gap-2"
          >
            <AlertTriangle className="h-4 w-4" />
            {isVerifying ? "Verifying..." : "Verify Log Integrity"}
          </Button>
        </div>
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
              <label className="text-sm font-medium">Risk Level</label>
              <Select 
                value={filters.riskLevel} 
                onValueChange={(value) => handleFilterChange("riskLevel", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select risk level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Risk Levels</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Login Events</label>
              <Select 
                value={filters.isLoginAttempt} 
                onValueChange={(value) => handleFilterChange("isLoginAttempt", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Events</SelectItem>
                  <SelectItem value="true">Login Attempts</SelectItem>
                  <SelectItem value="false">Other Events</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <DatePicker
                date={filters.startDate ? new Date(filters.startDate) : undefined}
                setDate={(date) => handleFilterChange("startDate", date ? date.toISOString() : "")}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <DatePicker
                date={filters.endDate ? new Date(filters.endDate) : undefined}
                setDate={(date) => handleFilterChange("endDate", date ? date.toISOString() : "")}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Logout Events</label>
              <Select 
                value={filters.isLogout} 
                onValueChange={(value) => handleFilterChange("isLogout", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Events</SelectItem>
                  <SelectItem value="true">Logout Events</SelectItem>
                  <SelectItem value="false">Other Events</SelectItem>
                </SelectContent>
              </Select>
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
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Device / IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                      No audit logs found matching your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedLogs.map((log) => (
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
                      <TableCell>
                        {log.riskLevel && (
                          <Badge className={getRiskBadgeColor(log.riskLevel)}>
                            {log.riskLevel.charAt(0).toUpperCase() + log.riskLevel.slice(1)}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate" title={log.details}>
                        {log.details || "N/A"}
                      </TableCell>
                      <TableCell className="text-xs">
                        <div title={log.deviceInfo}>{log.deviceInfo || "Unknown"}</div>
                        <div className="text-muted-foreground">{log.ipAddress}</div>
                        {log.sessionDuration && (
                          <div className="text-muted-foreground">
                            Session: {log.sessionDuration}s
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                    let pageNum;
                    
                    if (totalPages <= 5) {
                      // If 5 or fewer pages, show all pages
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      // If at the start, show first 5 pages
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      // If at the end, show last 5 pages
                      pageNum = totalPages - 4 + i;
                    } else {
                      // Show 2 pages before and after current page
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink 
                          isActive={pageNum === currentPage}
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditTrail;
