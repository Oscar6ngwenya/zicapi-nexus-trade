
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileX, Calculator, Download } from "lucide-react";
import { toast } from "sonner";
import { Transaction } from "@/components/dashboard/TransactionTable";
import { calculatePenaltyAndInterest, PenaltyCalculation } from "@/services/analyticsService";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import * as XLSX from "xlsx";
import { DatePicker } from "@/components/ui/date-picker";
import { format, differenceInDays } from "date-fns";

const Penalties: React.FC = () => {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [daysLate, setDaysLate] = useState<number>(1);
  const [receivedAmount, setReceivedAmount] = useState<string>("");
  const [penalties, setPenalties] = useState<PenaltyCalculation[]>([]);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [dateToday, setDateToday] = useState<Date>(new Date());

  // Mock transaction data for demonstration
  const sampleTransactions: Transaction[] = [
    {
      id: "1",
      date: "2023-05-10",
      entity: "Global Imports Ltd",
      type: "import",
      currency: "USD",
      amount: 45000,
      quantity: 500,
      unitPrice: 90,
      product: "Industrial machinery",
      status: "flagged",
      bank: "First National Bank",
      source: "imported",
      flagReason: "Payment deadline expired"
    },
    {
      id: "2",
      date: "2023-05-15",
      entity: "Tech Solutions Inc",
      type: "import",
      currency: "EUR",
      amount: 38000,
      quantity: 100,
      unitPrice: 380,
      product: "Computer equipment",
      status: "flagged",
      bank: "Commerce Bank",
      source: "imported",
      flagReason: "Partial payment received"
    },
    {
      id: "3",
      date: "2023-05-20",
      entity: "Agro Exports Co",
      type: "export",
      currency: "USD",
      amount: 75000,
      quantity: 1500,
      unitPrice: 50,
      product: "Agricultural produce",
      status: "flagged",
      bank: "First National Bank",
      source: "imported",
      flagReason: "Payment not received"
    },
  ];

  // Handle transaction selection
  const handleTransactionSelect = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setReceivedAmount("");
    // Auto-set days late based on transaction date
    const txDate = new Date(transaction.date);
    const today = new Date();
    const daysDiff = differenceInDays(today, txDate);
    setDaysLate(Math.max(daysDiff, 1)); // At least 1 day late
  };

  // Calculate penalties when button is clicked
  const handleCalculate = () => {
    if (!selectedTransaction) {
      toast.error("Please select a transaction");
      return;
    }

    // Calculate days late if due date is set
    let calculatedDaysLate = daysLate;
    if (dueDate) {
      calculatedDaysLate = Math.max(1, differenceInDays(dateToday, dueDate));
    }

    const receivedAmt = parseFloat(receivedAmount) || 0;
    
    if (receivedAmt > selectedTransaction.amount) {
      toast.error("Received amount cannot exceed original amount");
      return;
    }

    const penalty = calculatePenaltyAndInterest(
      selectedTransaction,
      calculatedDaysLate,
      receivedAmt
    );

    // Add to penalties list
    setPenalties([penalty, ...penalties]);
    toast.success("Penalty calculated successfully");
  };

  // Export penalties to Excel
  const exportToExcel = () => {
    if (penalties.length === 0) {
      toast.error("No penalties to export");
      return;
    }

    // Format data for export
    const exportData = penalties.map(p => ({
      "Reference ID": p.transaction.id,
      "Entity": p.transaction.entity,
      "Original Date": p.transaction.date,
      "Product": p.transaction.product,
      "Original Amount": p.originalAmount,
      "Currency": p.transaction.currency,
      "Received Amount": p.receivedAmount,
      "Outstanding Amount": p.outstandingAmount,
      "Days Late": p.daysLate,
      "Penalty (100%)": p.penaltyAmount,
      "Interest (5%/day)": p.interestAmount,
      "Total Amount Due": p.totalDue,
      "Calculation Date": format(new Date(), "yyyy-MM-dd")
    }));

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Penalties");

    // Generate download
    XLSX.writeFile(wb, `penalties-interest-${new Date().toISOString().slice(0, 10)}.xlsx`);
    
    toast.success("Penalties report exported successfully");
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zicapi-primary">Penalties & Interest</h1>
        <p className="text-muted-foreground">
          Calculate penalties and interest for non-compliant transactions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Flagged Transactions</CardTitle>
              <CardDescription>
                Select a transaction to calculate penalties
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-64 overflow-y-auto">
                <Table>
                  <TableBody>
                    {sampleTransactions.map((tx) => (
                      <TableRow 
                        key={tx.id} 
                        className={`cursor-pointer ${selectedTransaction?.id === tx.id ? 'bg-muted' : ''}`}
                        onClick={() => handleTransactionSelect(tx)}
                      >
                        <TableCell>
                          <div className="font-medium">{tx.entity}</div>
                          <div className="text-sm text-muted-foreground">{tx.date}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(tx.amount, tx.currency)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {selectedTransaction && (
            <Card>
              <CardHeader>
                <CardTitle>Penalty Calculator</CardTitle>
                <CardDescription>
                  Calculate penalties and interest for selected transaction
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="transaction">Selected Transaction</Label>
                    <Input 
                      id="transaction" 
                      value={`${selectedTransaction.entity} - ${formatCurrency(selectedTransaction.amount, selectedTransaction.currency)}`} 
                      readOnly
                      className="bg-muted"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Payment Due Date</Label>
                    <div className="flex items-center space-x-2">
                      <DatePicker 
                        date={dueDate} 
                        setDate={setDueDate}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="today">Calculation Date</Label>
                    <div className="flex items-center space-x-2">
                      <DatePicker 
                        date={dateToday} 
                        setDate={setDateToday}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  {!dueDate && (
                    <div className="space-y-2">
                      <Label htmlFor="daysLate">Days Late</Label>
                      <Input 
                        id="daysLate" 
                        type="number" 
                        min="1"
                        value={daysLate} 
                        onChange={(e) => setDaysLate(parseInt(e.target.value) || 1)}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="receivedAmount">Amount Received (if partial)</Label>
                    <Input 
                      id="receivedAmount" 
                      type="number" 
                      placeholder="0.00" 
                      value={receivedAmount} 
                      onChange={(e) => setReceivedAmount(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Leave empty if no payment received</p>
                  </div>

                  <Button 
                    type="button" 
                    className="w-full"
                    onClick={handleCalculate}
                  >
                    <Calculator className="h-4 w-4 mr-2" />
                    Calculate Penalty & Interest
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Calculated Penalties</CardTitle>
                <CardDescription>
                  Penalties and interest for non-compliant transactions
                </CardDescription>
              </div>
              {penalties.length > 0 && (
                <Button variant="outline" size="sm" onClick={exportToExcel}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {penalties.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <FileX className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No penalties calculated yet.</p>
                  <p className="text-sm text-muted-foreground">
                    Select a transaction and click Calculate to see penalties.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Entity</TableHead>
                        <TableHead>Original Amount</TableHead>
                        <TableHead>Outstanding</TableHead>
                        <TableHead>Days Late</TableHead>
                        <TableHead>Penalty (100%)</TableHead>
                        <TableHead>Interest (5%/day)</TableHead>
                        <TableHead>Total Due</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {penalties.map((penalty, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            <div>{penalty.transaction.entity}</div>
                            <div className="text-xs text-muted-foreground">{penalty.transaction.date}</div>
                          </TableCell>
                          <TableCell>{formatCurrency(penalty.originalAmount, penalty.transaction.currency)}</TableCell>
                          <TableCell>{formatCurrency(penalty.outstandingAmount, penalty.transaction.currency)}</TableCell>
                          <TableCell>{penalty.daysLate}</TableCell>
                          <TableCell className="text-amber-600">{formatCurrency(penalty.penaltyAmount, penalty.transaction.currency)}</TableCell>
                          <TableCell className="text-red-600">{formatCurrency(penalty.interestAmount, penalty.transaction.currency)}</TableCell>
                          <TableCell className="font-bold">{formatCurrency(penalty.totalDue, penalty.transaction.currency)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Penalties;
