
import React, { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Eye } from "lucide-react";

// Flagged transaction type
export interface FlaggedTransaction {
  id: string;
  date: string;
  entity: string;
  type: "import" | "export";
  currency: string;
  amount: number;
  product: string;
  bank: string;
  reason: string;
  severity: "low" | "medium" | "high";
}

interface FlaggedTransactionsProps {
  transactions: FlaggedTransaction[];
}

const FlaggedTransactions: React.FC<FlaggedTransactionsProps> = ({
  transactions,
}) => {
  const [selectedTransaction, setSelectedTransaction] = useState<FlaggedTransaction | null>(null);
  const [open, setOpen] = useState(false);

  // Format currency display
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  };

  // Get severity badge
  const getSeverityBadge = (severity: FlaggedTransaction["severity"]) => {
    switch (severity) {
      case "low":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            Low
          </Badge>
        );
      case "medium":
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            Medium
          </Badge>
        );
      case "high":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            High
          </Badge>
        );
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const handleViewDetails = (transaction: FlaggedTransaction) => {
    setSelectedTransaction(transaction);
    setOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader className="bg-red-50">
          <CardTitle className="flex items-center text-red-700">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Flagged Transactions
          </CardTitle>
          <CardDescription className="text-red-600">
            Transactions that have been flagged for potential violations
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Bank</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-6">
                    No flagged transactions found
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
                    <TableCell className="text-right">
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </TableCell>
                    <TableCell>{transaction.bank}</TableCell>
                    <TableCell>{getSeverityBadge(transaction.severity)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(transaction)}
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
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          {selectedTransaction && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                  Flagged Transaction Details
                </DialogTitle>
                <DialogDescription>
                  Review the details and reason for flagging
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">Transaction ID</h3>
                  <p>{selectedTransaction.id}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">Date</h3>
                  <p>{selectedTransaction.date}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">Entity</h3>
                  <p>{selectedTransaction.entity}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">Type</h3>
                  <p>{selectedTransaction.type === "import" ? "Import" : "Export"}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">Amount</h3>
                  <p>{formatCurrency(selectedTransaction.amount, selectedTransaction.currency)}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">Bank</h3>
                  <p>{selectedTransaction.bank}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">Product</h3>
                  <p>{selectedTransaction.product}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">Severity</h3>
                  <p>{getSeverityBadge(selectedTransaction.severity)}</p>
                </div>
                <div className="col-span-2">
                  <h3 className="font-semibold text-sm text-muted-foreground">Reason for Flagging</h3>
                  <div className="mt-1 p-3 bg-red-50 text-red-800 rounded-md border border-red-200">
                    {selectedTransaction.reason}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Close
                </Button>
                <Button>Investigate</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FlaggedTransactions;
