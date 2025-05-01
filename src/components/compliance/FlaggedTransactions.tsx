
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, FileSearch, Search } from "lucide-react";

export interface FlaggedTransaction {
  id: string;
  date: string;
  entity: string;
  type: string;
  currency: string;
  amount: number;
  bank: string;
  product: string;
  reason: string;
  severity: "high" | "medium" | "low";
}

interface FlaggedTransactionsProps {
  transactions: FlaggedTransaction[];
  onInvestigate?: (transaction: FlaggedTransaction) => void;
}

const FlaggedTransactions: React.FC<FlaggedTransactionsProps> = ({ 
  transactions,
  onInvestigate
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
      <CardContent className="p-0">
        {transactions.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            No flagged transactions found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Bank</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell className="font-medium">{transaction.entity}</TableCell>
                  <TableCell>
                    {formatCurrency(transaction.amount, transaction.currency)}
                    <div className="text-xs text-muted-foreground mt-1">
                      {transaction.type === "import" ? "Import" : "Export"}
                    </div>
                  </TableCell>
                  <TableCell>{transaction.product}</TableCell>
                  <TableCell>{transaction.bank}</TableCell>
                  <TableCell>
                    {transaction.severity === "high" && (
                      <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        High
                      </Badge>
                    )}
                    {transaction.severity === "medium" && (
                      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Medium
                      </Badge>
                    )}
                    {transaction.severity === "low" && (
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Low
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate" title={transaction.reason}>
                      {transaction.reason}
                    </div>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button size="sm" variant="outline">
                      <Search className="h-3 w-3 mr-1" />
                      Details
                    </Button>
                    {onInvestigate && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-amber-500 text-amber-600 hover:bg-amber-50"
                        onClick={() => onInvestigate(transaction)}
                      >
                        <FileSearch className="h-3 w-3 mr-1" />
                        Investigate
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default FlaggedTransactions;
