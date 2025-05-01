
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";

export interface Transaction {
  id: string;
  date: string;
  entity: string;
  type: "import" | "export";
  currency: string;
  amount: number;
  product: string;
  status?: "pending" | "compliant" | "flagged" | "initiated";
  bank: string;
  source?: "customs" | "financial" | "manual"; // Updated to include "manual" as a valid source
  flagReason?: string;
  unitPrice?: number;
  quantity?: number;
  regNumber?: string;
  entryNumber?: string;
  facilitator?: string;
}

interface TransactionTableProps {
  transactions: Transaction[];
  title?: string;
  onViewDetails?: (id: string) => void;
  compact?: boolean;
}

const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  title = "Recent Transactions",
  onViewDetails,
  compact = false,
}) => {
  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  };

  return (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={title ? undefined : "p-0"}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Entity</TableHead>
              {!compact && <TableHead>Reg Number</TableHead>}
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              {!compact && <TableHead>Source</TableHead>}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={compact ? 6 : 8}
                  className="text-center text-muted-foreground"
                >
                  No transactions to display
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell className="font-medium">
                    {transaction.entity}
                    {transaction.bank && (
                      <div className="text-xs text-muted-foreground">
                        {transaction.bank}
                      </div>
                    )}
                  </TableCell>
                  {!compact && (
                    <TableCell>
                      {transaction.regNumber || <span className="text-muted-foreground">N/A</span>}
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="max-w-xs truncate">{transaction.product}</div>
                    <div className="text-xs text-muted-foreground">
                      {transaction.type === "import" ? "Import" : "Export"}
                      {transaction.entryNumber && ` • Entry: ${transaction.entryNumber}`}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(transaction.amount, transaction.currency)}
                    {transaction.unitPrice && transaction.quantity && (
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(transaction.unitPrice, transaction.currency)} × {transaction.quantity}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {!transaction.status && (
                      <Badge variant="outline">N/A</Badge>
                    )}
                    {transaction.status === "pending" && (
                      <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                        Pending
                      </Badge>
                    )}
                    {transaction.status === "compliant" && (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                        Compliant
                      </Badge>
                    )}
                    {transaction.status === "flagged" && (
                      <Badge 
                        className="bg-red-100 text-red-800 hover:bg-red-200"
                        title={transaction.flagReason}
                      >
                        Flagged
                      </Badge>
                    )}
                    {transaction.status === "initiated" && (
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                        Initiated
                      </Badge>
                    )}
                  </TableCell>
                  {!compact && (
                    <TableCell>
                      {transaction.source ? (
                        <Badge variant="outline" className={
                          transaction.source === "customs" ? "bg-blue-50" :
                          transaction.source === "financial" ? "bg-purple-50" :
                          "bg-gray-50"
                        }>
                          {transaction.source === "customs" ? "Customs" : 
                           transaction.source === "financial" ? "Financial" : 
                           "Manual"}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Unknown</Badge>
                      )}
                    </TableCell>
                  )}
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetails?.(transaction.id)}
                    >
                      <Search className="h-4 w-4" />
                      <span className="sr-only">View details</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TransactionTable;
