
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
import { Eye } from "lucide-react";

// Transaction type for the table
export interface Transaction {
  id: string;
  date: string;
  entity: string;
  type: "import" | "export";
  currency: string;
  amount: number;
  product: string;
  status: "compliant" | "pending" | "flagged";
  bank: string;
}

interface TransactionTableProps {
  transactions: Transaction[];
  title: string;
  onViewDetails: (id: string) => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  title,
  onViewDetails,
}) => {
  // Format currency display
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  };

  // Get appropriate badge color based on status
  const getStatusBadge = (status: Transaction["status"]) => {
    switch (status) {
      case "compliant":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Compliant
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            Pending
          </Badge>
        );
      case "flagged":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Flagged
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-zicapi-primary">{title}</h3>
      </div>
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Bank</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">
                    {transaction.date}
                  </TableCell>
                  <TableCell>{transaction.entity}</TableCell>
                  <TableCell>
                    <Badge variant={transaction.type === "import" ? "default" : "secondary"}>
                      {transaction.type === "import" ? "Import" : "Export"}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate" title={transaction.product}>
                    {transaction.product}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </TableCell>
                  <TableCell>{transaction.bank}</TableCell>
                  <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(transaction.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TransactionTable;
