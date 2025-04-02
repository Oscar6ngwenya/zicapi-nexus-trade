
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
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DataDiscrepancyTableProps {
  discrepancies: DataDiscrepancy[];
}

const DataDiscrepancyTable: React.FC<DataDiscrepancyTableProps> = ({ discrepancies }) => {
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

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 p-3 bg-amber-50 text-amber-800 rounded-md border border-amber-200">
        <AlertTriangle className="h-5 w-5 text-amber-500" />
        <p>
          The following discrepancies were found between imported data and manual entries. 
          These inconsistencies require investigation.
        </p>
      </div>

      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Entity</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Discrepancy Type</TableHead>
              <TableHead className="text-right">Imported Value</TableHead>
              <TableHead className="text-right">Manual Value</TableHead>
              <TableHead className="text-right">% Difference</TableHead>
              <TableHead>Product</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {discrepancies.map((discrepancy, index) => (
              <TableRow key={index} className="hover:bg-red-50">
                <TableCell className="font-medium">
                  {discrepancy.importedTransaction.entity}
                </TableCell>
                <TableCell>{discrepancy.importedTransaction.date}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-red-50 text-red-800">
                    {getDiscrepancyTypeLabel(discrepancy.discrepancyType)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {discrepancy.discrepancyType === "quantity" 
                    ? discrepancy.importedValue.toLocaleString()
                    : formatCurrency(
                        discrepancy.importedValue,
                        discrepancy.importedTransaction.currency
                      )}
                </TableCell>
                <TableCell className="text-right">
                  {discrepancy.discrepancyType === "quantity"
                    ? discrepancy.manualValue.toLocaleString()
                    : formatCurrency(
                        discrepancy.manualValue,
                        discrepancy.importedTransaction.currency
                      )}
                </TableCell>
                <TableCell className="text-right font-semibold text-red-700">
                  {discrepancy.percentageDifference.toFixed(2)}%
                </TableCell>
                <TableCell>{discrepancy.importedTransaction.product}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DataDiscrepancyTable;
