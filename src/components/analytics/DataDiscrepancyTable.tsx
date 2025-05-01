
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataDiscrepancy, formatDiscrepanciesForExport } from "@/services/analyticsService";
import { AlertTriangle, Download, FileWarning } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface DataDiscrepancyTableProps {
  discrepancies: DataDiscrepancy[];
  userRole?: string;
}

const DataDiscrepancyTable: React.FC<DataDiscrepancyTableProps> = ({ 
  discrepancies,
  userRole = "regulator" 
}) => {
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
    if (discrepancies.length === 0) {
      toast.error("No data to export");
      return;
    }

    // Use the utility function for formatting export data
    const exportData = formatDiscrepanciesForExport(discrepancies);

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Discrepancies");

    // Generate download
    XLSX.writeFile(wb, `data-discrepancies-report-${new Date().toISOString().slice(0, 10)}.xlsx`);
    
    toast.success("Variance report exported successfully");
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 p-3 bg-amber-50 text-amber-800 rounded-md border border-amber-200">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <p>
            The following discrepancies were found between customs and financial data. 
            These inconsistencies require investigation.
          </p>
        </div>
        
        {canExport && (
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={exportToExcel}
          >
            <Download className="h-4 w-4" />
            Export Variance Report
          </Button>
        )}
      </div>

      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Entity</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Discrepancy Field</TableHead>
              <TableHead className="text-right">Customs Value</TableHead>
              <TableHead className="text-right">Financial Value</TableHead>
              <TableHead className="text-right">% Difference</TableHead>
              <TableHead>Product</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {discrepancies.map((discrepancy, index) => {
              // Determine severity based on percentage difference
              const getSeverityClass = () => {
                if (discrepancy.percentageDifference > 15) return "bg-red-50 hover:bg-red-100";
                if (discrepancy.percentageDifference > 5) return "bg-amber-50 hover:bg-amber-100";
                return "hover:bg-red-50";
              };
              
              const entity = discrepancy.customsTransaction?.entity || discrepancy.financialTransaction?.entity || "Unknown";
              const date = discrepancy.customsTransaction?.date || discrepancy.financialTransaction?.date || "Unknown";
              const product = discrepancy.customsTransaction?.product || discrepancy.financialTransaction?.product || "Unknown";
              
              return (
                <TableRow key={index} className={getSeverityClass()}>
                  <TableCell className="font-medium">
                    {entity}
                  </TableCell>
                  <TableCell>{formatDate(date)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-red-50 text-red-800">
                      {getDiscrepancyTypeLabel(discrepancy.discrepancyType, discrepancy.field)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatValue(discrepancy, true)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatValue(discrepancy, false)}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-red-700">
                    {discrepancy.percentageDifference.toFixed(2)}%
                  </TableCell>
                  <TableCell>{product}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DataDiscrepancyTable;
