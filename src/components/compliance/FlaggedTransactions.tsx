
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, FileSearch } from "lucide-react";

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
  onInvestigate: (transaction: FlaggedTransaction) => void;
}

const FlaggedTransactions: React.FC<FlaggedTransactionsProps> = ({
  transactions,
  onInvestigate,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          Flagged Transactions
        </CardTitle>
        <CardDescription>
          Transactions flagged for potential compliance issues
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
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
                <TableCell>{transaction.type}</TableCell>
                <TableCell>
                  {transaction.currency} {transaction.amount.toLocaleString()}
                </TableCell>
                <TableCell>{transaction.bank}</TableCell>
                <TableCell>
                  {transaction.severity === "high" && (
                    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                      High
                    </Badge>
                  )}
                  {transaction.severity === "medium" && (
                    <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                      Medium
                    </Badge>
                  )}
                  {transaction.severity === "low" && (
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                      Low
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="max-w-[300px] truncate" title={transaction.reason}>
                  {transaction.reason}
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="outline" 
                    onClick={() => onInvestigate(transaction)}
                    size="sm"
                    className="gap-1"
                  >
                    <FileSearch className="h-4 w-4" />
                    Investigate
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default FlaggedTransactions;
