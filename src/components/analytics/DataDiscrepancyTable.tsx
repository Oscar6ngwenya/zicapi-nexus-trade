import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataDiscrepancy, formatDiscrepanciesForExport } from "@/services/analyticsService";
import { AlertTriangle, Download, FileWarning, AlertCircle, Filter, Trash2, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createAuditLog, AuditActions, AuditModules } from "@/services/auditService";
import ReconciliationInterface from "../data/ReconciliationInterface";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface DataDiscrepancyTableProps {
  discrepancies: DataDiscrepancy[];
  userRole?: string;
  onUpdateDiscrepancy?: (updatedDiscrepancy: DataDiscrepancy) => void;
}

const DataDiscrepancyTable: React.FC<DataDiscrepancyTableProps> = ({ 
  discrepancies,
  userRole = "regulator",
  onUpdateDiscrepancy
}) => {
  const [filteredDiscrepancies, setFilteredDiscrepancies] = useState<DataDiscrepancy[]>(discrepancies);
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [potentialFlightFilter, setPotentialFlightFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [matchConfidenceFilter, setMatchConfidenceFilter] = useState<string>("all");
  
  // Function to format currency
  const formatCurrency = (amount: number | string, currency: string) => {
    if (typeof amount === 'number') {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
      }).format(amount);
    }
    return amount;
  };

  // Function to format dates for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown";
    
    // Check if it's a valid date string
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    // Format date for display
    return date.toLocaleDateString("en-US", { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Function to get discrepancy type label
  const getDiscrepancyTypeLabel = (type: string, field?: string) => {
    if (field) return field;
    
    switch (type) {
      case "price":
        return "Unit Price";
      case "quantity":
        return "Quantity";
      case "total":
        return "Total Amount";
      case "value":
        return "Value";
      case "data":
        return "Data Mismatch";
      default:
        return type;
    }
  };

  // Export discrepancies to Excel
  const exportToExcel = () => {
    if (filteredDiscrepancies.length === 0) {
      toast.error("No data to export");
      return;
    }

    // Use the utility function for formatting export data
    const exportData = formatDiscrepanciesForExport(filteredDiscrepancies);

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Discrepancies");

    // Generate download
    const filename = `data-discrepancies-report-${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, filename);
    
    toast.success("Variance report exported successfully");
    
    // Log audit for export
    const storedUser = localStorage.getItem("zicapi-user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      createAuditLog(
        user.id,
        user.username,
        user.role,
        AuditActions.DATA_EXPORT,
        AuditModules.DATA_IMPORT,
        `Exported ${filteredDiscrepancies.length} data discrepancies to Excel file: ${filename}`
      );
    }
  };

  // Export discrepancies to CSV
  const exportToCSV = () => {
    if (filteredDiscrepancies.length === 0) {
      toast.error("No data to export");
      return;
    }

    // Use the utility function for formatting export data
    const exportData = formatDiscrepanciesForExport(filteredDiscrepancies);

    // Convert to CSV
    const ws = XLSX.utils.json_to_sheet(exportData);
    const csv = XLSX.utils.sheet_to_csv(ws);

    // Create download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `data-discrepancies-report-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("CSV report exported successfully");
    
    // Log audit for export
    const storedUser = localStorage.getItem("zicapi-user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      createAuditLog(
        user.id,
        user.username,
        user.role,
        AuditActions.DATA_EXPORT,
        AuditModules.DATA_IMPORT,
        `Exported ${filteredDiscrepancies.length} data discrepancies to CSV file`
      );
    }
  };

  // Export discrepancies to PDF
  const exportToPDF = () => {
    if (filteredDiscrepancies.length === 0) {
      toast.error("No data to export");
      return;
    }

    // Create PDF document
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text("Data Discrepancy Report", 14, 22);
    
    // Add metadata
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Total Discrepancies: ${filteredDiscrepancies.length}`, 14, 35);
    
    // Convert discrepancies to table format
    const tableData = filteredDiscrepancies.map(d => [
      d.customsTransaction?.entity || d.financialTransaction?.entity || "Unknown",
      d.customsTransaction?.date || d.financialTransaction?.date || "Unknown",
      d.field || d.discrepancyType,
      d.severity || "Medium",
      String(d.percentageDifference.toFixed(2)) + "%",
      d.potentialCapitalFlight ? "Yes" : "No",
      d.resolutionStatus || "Unresolved"
    ]);
    
    // Generate table
    autoTable(doc, {
      head: [["Entity", "Date", "Discrepancy Field", "Severity", "Difference %", "Capital Flight Risk", "Status"]],
      body: tableData,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      margin: { top: 40 }
    });
    
    // Save PDF
    doc.save(`data-discrepancies-report-${new Date().toISOString().slice(0, 10)}.pdf`);
    
    toast.success("PDF report exported successfully");
    
    // Log audit for export
    const storedUser = localStorage.getItem("zicapi-user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      createAuditLog(
        user.id,
        user.username,
        user.role,
        AuditActions.DATA_EXPORT,
        AuditModules.DATA_IMPORT,
        `Exported ${filteredDiscrepancies.length} data discrepancies to PDF file`
      );
    }
  };

  // Handle discrepancy resolution update
  const handleDiscrepancyUpdate = (updatedDiscrepancy: DataDiscrepancy) => {
    // Update local state with the updated discrepancy
    const updatedDiscrepancies = filteredDiscrepancies.map(d => 
      d === updatedDiscrepancy.customsTransaction?.id && d === updatedDiscrepancy.financialTransaction?.id
        ? updatedDiscrepancy
        : d
    );
    
    setFilteredDiscrepancies(updatedDiscrepancies);
    
    // Notify parent component
    if (onUpdateDiscrepancy) {
      onUpdateDiscrepancy(updatedDiscrepancy);
    }
  };

  // Apply filters
  React.useEffect(() => {
    let result = [...discrepancies];
    
    // Apply severity filter
    if (severityFilter !== "all") {
      result = result.filter(d => d.severity === severityFilter);
    }
    
    // Apply potential capital flight filter
    if (potentialFlightFilter === "yes") {
      result = result.filter(d => d.potentialCapitalFlight === true);
    } else if (potentialFlightFilter === "no") {
      result = result.filter(d => d.potentialCapitalFlight === false);
    }
    
    // Apply resolution status filter
    if (statusFilter !== "all") {
      result = result.filter(d => d.resolutionStatus === statusFilter);
    }
    
    // Apply match confidence filter
    if (matchConfidenceFilter !== "all") {
      const confidenceRanges = {
        high: (d: DataDiscrepancy) => (d.matchConfidence || 0) >= 90,
        medium: (d: DataDiscrepancy) => (d.matchConfidence || 0) >= 70 && (d.matchConfidence || 0) < 90,
        low: (d: DataDiscrepancy) => (d.matchConfidence || 0) < 70
      };
      
      result = result.filter(confidenceRanges[matchConfidenceFilter as keyof typeof confidenceRanges]);
    }
    
    setFilteredDiscrepancies(result);
  }, [discrepancies, severityFilter, potentialFlightFilter, statusFilter, matchConfidenceFilter]);

  // Reset all filters
  const resetFilters = () => {
    setSeverityFilter("all");
    setPotentialFlightFilter("all");
    setStatusFilter("all");
    setMatchConfidenceFilter("all");
  };

  // Check if user can export (not a bank role)
  const canExport = userRole !== "bank";

  // Function to determine if a value should be displayed as numeric or text
  const formatValue = (discrepancy: DataDiscrepancy, isCustoms: boolean) => {
    const value = isCustoms ? discrepancy.customsValue : discrepancy.financialValue;
    const transaction = isCustoms ? discrepancy.customsTransaction : discrepancy.financialTransaction;
    
    // If it's undefined, return "N/A"
    if (value === undefined) return "N/A";
    
    // Handle numeric values for specific fields
    if (
      discrepancy.field === "Item Unit Price" || 
      discrepancy.field === "Total Cost" ||
      discrepancy.discrepancyType === "price" ||
      discrepancy.discrepancyType === "total" ||
      typeof value === 'number'
    ) {
      const currency = transaction?.currency || "USD";
      return typeof value === 'number' ? formatCurrency(value, currency) : value;
    }
    
    // Handle quantity field
    if (discrepancy.field === "Quantity" || discrepancy.discrepancyType === "quantity") {
      return typeof value === 'number' ? value.toLocaleString() : value;
    }
    
    // For all other fields, return as is
    return value;
  };

  // Get severity badge color
  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'high': return "bg-red-100 text-red-800 border-red-300";
      case 'medium': return "bg-amber-100 text-amber-800 border-amber-300";
      case 'low': return "bg-blue-100 text-blue-800 border-blue-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  // Get resolution status badge
  const getResolutionStatusBadge = (status?: string) => {
    switch (status) {
      case 'resolved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Resolved</Badge>;
      case 'investigating':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Investigating</Badge>;
      case 'unresolved':
      default:
        return <Badge variant="outline" className="bg-slate-100 text-slate-800 border-slate-300">Unresolved</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 p-3 bg-amber-50 text-amber-800 rounded-md border border-amber-200">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <p>
            {filteredDiscrepancies.length} discrepancies found between customs and financial data. 
            These inconsistencies require investigation.
          </p>
        </div>
        
        <div className="flex gap-2">
          {canExport && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2"
                onClick={exportToExcel}
              >
                <Download className="h-4 w-4" />
                Excel
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2"
                onClick={exportToCSV}
              >
                <Download className="h-4 w-4" />
                CSV
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2"
                onClick={exportToPDF}
              >
                <Download className="h-4 w-4" />
                PDF
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Filter controls */}
      <div className="bg-slate-50 p-3 rounded-md border flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-slate-500" />
          <span className="text-sm font-medium">Filters:</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm">Severity:</span>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="h-8 w-[130px]">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm">Capital Flight:</span>
          <Select value={potentialFlightFilter} onValueChange={setPotentialFlightFilter}>
            <SelectTrigger className="h-8 w-[130px]">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm">Status:</span>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 w-[130px]">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="unresolved">Unresolved</SelectItem>
              <SelectItem value="investigating">Investigating</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm">Match Confidence:</span>
          <Select value={matchConfidenceFilter} onValueChange={setMatchConfidenceFilter}>
            <SelectTrigger className="h-8 w-[130px]">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="high">High (90%+)</SelectItem>
              <SelectItem value="medium">Medium (70-90%)</SelectItem>
              <SelectItem value="low">Low (&lt;70%)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 px-2">
          <Trash2 className="h-3.5 w-3.5 mr-1" /> Clear
        </Button>
      </div>

      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Entity</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Discrepancy Field</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead className="text-right">Customs Value</TableHead>
              <TableHead className="text-right">Financial Value</TableHead>
              <TableHead className="text-right">% Difference</TableHead>
              <TableHead>Capital Flight Risk</TableHead>
              <TableHead>Match Confidence</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDiscrepancies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="h-24 text-center">
                  No discrepancies found matching your criteria
                </TableCell>
              </TableRow>
            ) : (
              filteredDiscrepancies.map((discrepancy, index) => {
                // Determine severity based on percentage difference and field type
                const getSeverityClass = () => {
                  if (discrepancy.severity === 'high') return "bg-red-50 hover:bg-red-100";
                  if (discrepancy.severity === 'medium') return "bg-amber-50 hover:bg-amber-100";
                  return "bg-slate-50 hover:bg-slate-100";
                };
                
                const entity = discrepancy.customsTransaction?.entity || discrepancy.financialTransaction?.entity || "Unknown";
                const date = discrepancy.customsTransaction?.date || discrepancy.financialTransaction?.date || "Unknown";
                
                return (
                  <TableRow key={index} className={getSeverityClass()}>
                    <TableCell className="font-medium">
                      {entity}
                      {discrepancy.customsTransaction?.regNumber && (
                        <div className="text-xs text-muted-foreground">
                          Reg: {discrepancy.customsTransaction.regNumber}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(date)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-slate-100 font-medium">
                        {getDiscrepancyTypeLabel(discrepancy.discrepancyType, discrepancy.field)}
                      </Badge>
                      {discrepancy.impact && (
                        <div className="text-xs mt-1 text-slate-600 max-w-[200px]">
                          {discrepancy.impact}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getSeverityColor(discrepancy.severity)}>
                        {discrepancy.severity || 'Medium'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatValue(discrepancy, true)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatValue(discrepancy, false)}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-red-700">
                      {discrepancy.percentageDifference.toFixed(2)}%
                    </TableCell>
                    <TableCell>
                      {discrepancy.potentialCapitalFlight ? (
                        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                          <AlertCircle className="h-3 w-3 mr-1" /> Yes
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                          No
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {discrepancy.matchConfidence !== undefined ? (
                        <Badge variant="outline" className={
                          discrepancy.matchConfidence >= 90 
                            ? "bg-green-100 text-green-800 border-green-300"
                            : discrepancy.matchConfidence >= 70
                              ? "bg-blue-100 text-blue-800 border-blue-300"
                              : "bg-amber-100 text-amber-800 border-amber-300"
                        }>
                          {discrepancy.matchConfidence}%
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-slate-100">—</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {getResolutionStatusBadge(discrepancy.resolutionStatus)}
                    </TableCell>
                    <TableCell>
                      <ReconciliationInterface 
                        discrepancy={discrepancy} 
                        onResolutionSave={handleDiscrepancyUpdate}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DataDiscrepancyTable;
