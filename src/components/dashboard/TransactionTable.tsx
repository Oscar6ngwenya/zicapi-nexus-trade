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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Download, ExternalLink, Eye } from "lucide-react";
import { formatTransactionsForExport } from "@/services/analyticsService";
import * as XLSX from "xlsx";
import { toast } from "sonner";

export interface Transaction {
  id: string;
  date: string;
  entity: string;
  type: "import" | "export";
  currency: string;
  amount: number;
  product: string;
  status?: "compliant" | "pending" | "flagged";
  bank: string;
  flagReason?: string;
  source?: "imported" | "manual" | "customs" | "financial";
  quantity?: number;
  unitPrice?: number;
  facilitator?: string;
}

interface TransactionTableProps {
  transactions: Transaction[];
  title: string;
  onViewDetails?: (id: string) => void;
  displayFlag?: boolean;
  userRole?: string;
}

const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  title,
  onViewDetails,
  displayFlag = false,
  userRole = "investigator",
}) => {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleViewClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDialogOpen(true);
    if (onViewDetails) {
      onViewDetails(transaction.id);
    }
  };

  const handleExportToExcel = () => {
    const dataToExport = displayFlag 
      ? transactions.filter(t => t.status === "flagged") 
      : transactions;
    
    if (dataToExport.length === 0) {
      toast.error("No data to export");
      return;
    }

    const formattedData = formatTransactionsForExport(dataToExport);
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
    
    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `${displayFlag ? "flagged_" : ""}transactions_${dateStr}.xlsx`;
    
    XLSX.writeFile(workbook, filename);
    
    toast.success("Export successful", {
      description: `Downloaded ${dataToExport.length} transactions to Excel`,
    });
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    switch (status) {
      case "compliant":
        return <Badge className="bg-green-100 text-green-800">Compliant</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "flagged":
        return <Badge className="bg-red-100 text-red-800">Flagged</Badge>;
      default:
        return null;
    }
  };

  return (
    <div>
      {title && <h3 className="text-lg font-medium mb-4">{title}</h3>}
      
      {displayFlag && userRole !== "bank" && (
        <div className="flex justify-end mb-4">
          <Button 
            onClick={handleExportToExcel}
            variant="outline"
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Export to Excel
          </Button>
        </div>
      )}
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Bank</TableHead>
              {displayFlag && <TableHead>Status</TableHead>}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={displayFlag ? 7 : 6}
                  className="h-24 text-center"
                >
                  No transactions found.
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell className="font-medium">
                    {transaction.entity}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        transaction.type === "import" ? "default" : "secondary"
                      }
                    >
                      {transaction.type === "import" ? "Import" : "Export"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: transaction.currency,
                    }).format(transaction.amount)}
                  </TableCell>
                  <TableCell>{transaction.bank}</TableCell>
                  {displayFlag && (
                    <TableCell>
                      {getStatusBadge(transaction.status)}
                    </TableCell>
                  )}
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewClick(transaction)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              View complete transaction information
            </DialogDescription>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date</p>
                <p>{selectedTransaction.date}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Entity</p>
                <p>{selectedTransaction.entity}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Type</p>
                <p>{selectedTransaction.type === "import" ? "Import" : "Export"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Amount</p>
                <p>
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: selectedTransaction.currency,
                  }).format(selectedTransaction.amount)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Product</p>
                <p>{selectedTransaction.product}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bank</p>
                <p>{selectedTransaction.bank}</p>
              </div>
              
              {selectedTransaction.quantity && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Quantity</p>
                  <p>{selectedTransaction.quantity}</p>
                </div>
              )}
              
              {selectedTransaction.unitPrice && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Unit Price</p>
                  <p>
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: selectedTransaction.currency,
                    }).format(selectedTransaction.unitPrice)}
                  </p>
                </div>
              )}
              
              {selectedTransaction.status && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <p>{getStatusBadge(selectedTransaction.status)}</p>
                </div>
              )}
              
              {selectedTransaction.flagReason && (
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Flag Reason</p>
                  <p className="p-2 bg-red-50 text-red-700 rounded-md mt-1">
                    {selectedTransaction.flagReason}
                  </p>
                </div>
              )}
              
              <div className="col-span-2 flex justify-end space-x-2 pt-2">
                {userRole !== "bank" && selectedTransaction.status === "flagged" && (
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const dataToExport = formatTransactionsForExport([selectedTransaction]);
                      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
                      const workbook = XLSX.utils.book_new();
                      XLSX.utils.book_append_sheet(workbook, worksheet, "Transaction");
                      XLSX.writeFile(workbook, `transaction_${selectedTransaction.id}.xlsx`);
                      toast.success("Transaction exported successfully");
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                )}
                <Button 
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Close
                </Button>
                {selectedTransaction.status === "flagged" && (
                  <Button>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Investigate
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransactionTable;
