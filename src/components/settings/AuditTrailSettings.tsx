
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, AlertTriangle, Clock, CheckCircle, Search, 
  Download, Calendar, User
} from "lucide-react";
import { format } from "date-fns";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { 
  getAuditLogs, 
  AuditLog, 
  AuditModules, 
  RiskLevels 
} from "@/services/auditService";

const AuditTrailSettings: React.FC = () => {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [username, setUsername] = useState("");
  const [module, setModule] = useState<string>("");
  const [riskLevel, setRiskLevel] = useState<string>("");
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isFiltered, setIsFiltered] = useState(false);

  // Get all modules for filtering
  const modules = Object.values(AuditModules);

  // Handle search with filters
  const handleSearch = () => {
    const filters: any = {};
    
    if (username) filters.username = username;
    if (module) filters.module = module;
    if (riskLevel) filters.riskLevel = riskLevel as any;
    if (startDate) filters.startDate = startDate.toISOString();
    if (endDate) filters.endDate = endDate.toISOString();
    
    const logs = getAuditLogs(filters);
    setAuditLogs(logs);
    setIsFiltered(true);
    
    if (logs.length === 0) {
      toast.info("No audit logs found matching your filters");
    } else {
      toast.success(`Found ${logs.length} audit log entries`);
    }
  };

  // Clear all filters
  const handleClearFilters = () => {
    setUsername("");
    setModule("");
    setRiskLevel("");
    setStartDate(undefined);
    setEndDate(undefined);
    setAuditLogs(getAuditLogs());
    setIsFiltered(false);
  };

  // Export to Excel
  const handleExport = () => {
    if (auditLogs.length === 0) {
      toast.error("No data to export");
      return;
    }
    
    // Prepare data for export
    const exportData = auditLogs.map(log => ({
      "Timestamp": format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss"),
      "User": log.username,
      "Role": log.userRole,
      "Action": log.action,
      "Module": log.module,
      "IP Address": log.ipAddress || "-",
      "Device": log.deviceInfo || "-",
      "Session Duration": log.sessionDuration ? `${log.sessionDuration} seconds` : "-",
      "Risk Level": log.riskLevel?.toUpperCase() || "-",
      "Details": log.details || "-"
    }));
    
    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Audit Trail");
    
    // Generate filename with current date
    const filename = `audit-trail-${format(new Date(), "yyyy-MM-dd")}.xlsx`;
    
    // Generate download
    XLSX.writeFile(wb, filename);
    
    toast.success("Audit trail exported successfully");
  };

  // Get risk level badge
  const getRiskLevelBadge = (level: string) => {
    switch (level) {
      case "high":
        return <Badge variant="destructive">HIGH</Badge>;
      case "medium":
        return <Badge variant="outline" className="bg-amber-100 text-amber-800">MEDIUM</Badge>;
      case "low":
        return <Badge variant="outline" className="bg-green-100 text-green-800">LOW</Badge>;
      default:
        return <Badge variant="outline">UNKNOWN</Badge>;
    }
  };

  // Initial load of audit logs
  React.useEffect(() => {
    // Load all logs on component mount
    const logs = getAuditLogs();
    setAuditLogs(logs);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          System Audit Trail
        </CardTitle>
        <CardDescription>
          Track user activities and system events within the application
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <Input
              placeholder="Filter by username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div>
            <Select value={module} onValueChange={setModule}>
              <SelectTrigger>
                <SelectValue placeholder="Select module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Modules</SelectItem>
                {modules.map((mod) => (
                  <SelectItem key={mod} value={mod}>{mod}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Select value={riskLevel} onValueChange={setRiskLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Risk level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Levels</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <DatePicker 
              date={startDate} 
              setDate={setStartDate}
              placeholder="Start date"
            />
          </div>
          
          <div>
            <DatePicker 
              date={endDate} 
              setDate={setEndDate}
              placeholder="End date"
              fromDate={startDate}
            />
          </div>
        </div>
        
        <div className="flex justify-between">
          <div className="space-x-2">
            <Button onClick={handleSearch} className="gap-1">
              <Search className="h-4 w-4" />
              Search
            </Button>
            {isFiltered && (
              <Button variant="outline" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
          
          <Button
            variant="outline"
            onClick={handleExport}
            className="gap-1"
            disabled={auditLogs.length === 0}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
        
        {/* Audit logs table */}
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                    No audit logs found
                  </TableCell>
                </TableRow>
              ) : (
                auditLogs.slice(0, 50).map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {format(new Date(log.timestamp), "yyyy-MM-dd")}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(log.timestamp), "HH:mm:ss")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">{log.username}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {log.userRole}
                      </div>
                    </TableCell>
                    <TableCell>
                      {log.isLoginAttempt && log.loginSuccess && (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          {log.action}
                        </div>
                      )}
                      {log.isLoginAttempt && !log.loginSuccess && (
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3 text-red-500" />
                          {log.action}
                        </div>
                      )}
                      {!log.isLoginAttempt && (
                        <div>{log.action}</div>
                      )}
                      {log.sessionDuration && (
                        <div className="text-xs text-muted-foreground">
                          Session: {log.sessionDuration}s
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{log.module}</TableCell>
                    <TableCell>{getRiskLevelBadge(log.riskLevel || "low")}</TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate" title={log.details}>
                        {log.details || "-"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {log.ipAddress && `IP: ${log.ipAddress}`}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
              {auditLogs.length > 50 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-2 text-muted-foreground text-sm">
                    Showing 50 of {auditLogs.length} logs. Export to see all logs.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuditTrailSettings;
