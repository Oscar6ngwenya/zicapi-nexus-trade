
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataDiscrepancy } from "@/services/analyticsService";
import { AlertTriangle, Download } from "lucide-react";
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
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  };

  // Function to get discrepancy type label
  const getDiscrepancyTypeLabel = (type: string) => {
    switch (type) {
      case "price":
        return "Unit Price";
      case "quantity":
        return "Quantity";
      case "total":
        return "Total Amount";
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

    // Format data for export
    const exportData = discrepancies.map((d) => ({
      Date: d.customsTransaction?.date || d.financialTransaction?.date,
      Entity: d.customsTransaction?.entity || d.financialTransaction?.entity,
      Product: d.customsTransaction?.product || d.financialTransaction?.product,
      "Discrepancy Type": getDiscrepancyTypeLabel(d.discrepancyType),
      "Customs Value": d.discrepancyType === "quantity" 
        ? d.customsValue 
        : formatCurrency(d.customsValue || 0, d.customsTransaction?.currency || "USD").replace(/[^0-9.-]+/g, ""),
      "Financial Value": d.discrepancyType === "quantity"
        ? d.financialValue
        : formatCurrency(d.financialValue || 0, d.financialTransaction?.currency || "USD").replace(/[^0-9.-]+/g, ""),
      "% Difference": `${d.percentageDifference.toFixed(2)}%`,
      "Currency": d.customsTransaction?.currency || d.financialTransaction?.currency,
      "Recommended Action": d.percentageDifference > 10 
        ? "Immediate Investigation Required" 
        : "Verification Needed",
      "Potential Impact": d.discrepancyType === "price"
        ? "Potential under/over invoicing"
        : d.discrepancyType === "quantity"
        ? "Potential misrepresentation of goods quantity"
        : "Potential financial discrepancy"
    }));

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Discrepancies");

    // Generate download
    XLSX.writeFile(wb, `data-discrepancies-${new Date().toISOString().slice(0, 10)}.xlsx`);
    
    toast.success("Report exported successfully");
  };

  // Check if user can export (not a bank role)
  const canExport = userRole !== "bank";

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
            Export Report
          </Button>
        )}
      </div>

      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Entity</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Discrepancy Type</TableHead>
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
              const currency = discrepancy.customsTransaction?.currency || discrepancy.financialTransaction?.currency || "USD";
              
              return (
                <TableRow key={index} className={getSeverityClass()}>
                  <TableCell className="font-medium">
                    {entity}
                  </TableCell>
                  <TableCell>{date}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-red-50 text-red-800">
                      {getDiscrepancyTypeLabel(discrepancy.discrepancyType)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {discrepancy.discrepancyType === "quantity" 
                      ? (discrepancy.customsValue || 0).toLocaleString()
                      : formatCurrency(
                          discrepancy.customsValue || 0,
                          currency
                        )}
                  </TableCell>
                  <TableCell className="text-right">
                    {discrepancy.discrepancyType === "quantity"
                      ? (discrepancy.financialValue || 0).toLocaleString()
                      : formatCurrency(
                          discrepancy.financialValue || 0,
                          currency
                        )}
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
