
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Transaction } from "@/components/dashboard/TransactionTable";
import { cn } from "@/lib/utils";
import { format, addDays } from "date-fns";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

interface ExtensionFormProps {
  onSubmit: (extensionData: any) => void;
  transactions: Transaction[];
}

const ExtensionForm: React.FC<ExtensionFormProps> = ({ onSubmit, transactions }) => {
  const [transactionId, setTransactionId] = useState("");
  const [requestedDays, setRequestedDays] = useState("30");
  const [reason, setReason] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [companyName, setCompanyName] = useState("");
  const [companyTIN, setCompanyTIN] = useState("");
  const [extensionItem, setExtensionItem] = useState("");
  const [hasDocuments, setHasDocuments] = useState(false);
  const [error, setError] = useState("");

  // Handle transaction selection
  const handleTransactionSelect = (id: string) => {
    setTransactionId(id);
    // Auto-fill company information based on selected transaction
    const selectedTx = transactions.find(tx => tx.id === id);
    if (selectedTx) {
      setCompanyName(selectedTx.entity);
      // Set TIN if available or empty
      setCompanyTIN(selectedTx.regNumber || "");
      setExtensionItem(selectedTx.product);
    }
  };

  // Calculate new deadline
  const calculateNewDeadline = () => {
    const days = parseInt(requestedDays, 10) || 0;
    return format(addDays(new Date(), days), "yyyy-MM-dd");
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!transactionId || !requestedDays || !reason || !companyName || !companyTIN || !extensionItem) {
      setError("Please fill in all required fields");
      return;
    }

    // Clear any previous error
    setError("");

    // Find the selected transaction
    const selectedTransaction = transactions.find(tx => tx.id === transactionId);
    if (!selectedTransaction) {
      setError("Transaction not found");
      return;
    }

    // Prepare extension data
    const extensionData = {
      id: `ext-${Date.now()}`,
      transactionId,
      transactionInfo: selectedTransaction,
      requestedDays: parseInt(requestedDays, 10),
      reason,
      requestDate: format(new Date(), "yyyy-MM-dd"),
      newDeadline: calculateNewDeadline(),
      status: "pending",
      hasDocuments,
      companyName,
      companyTIN,
      extensionItem
    };

    // Submit the extension request
    onSubmit(extensionData);
    
    toast.success("Extension request submitted", {
      description: `Your request for a ${requestedDays}-day extension has been submitted`,
    });

    // Reset form
    setTransactionId("");
    setRequestedDays("30");
    setReason("");
    setSelectedDate(new Date());
    setCompanyName("");
    setCompanyTIN("");
    setExtensionItem("");
    setHasDocuments(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Deadline Extension</CardTitle>
        <CardDescription>
          Request an extension for your transaction deadline
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="company-name">Company Name *</Label>
            <Input
              id="company-name"
              placeholder="Enter company name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company-tin">Company Registration Number (TIN) *</Label>
            <Input
              id="company-tin"
              placeholder="Enter TIN number"
              value={companyTIN}
              onChange={(e) => setCompanyTIN(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="transaction">Select Transaction *</Label>
            <Select value={transactionId} onValueChange={handleTransactionSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select a transaction" />
              </SelectTrigger>
              <SelectContent>
                {transactions.map((transaction) => (
                  <SelectItem key={transaction.id} value={transaction.id}>
                    {transaction.date} - {transaction.product} (
                    {transaction.currency} {transaction.amount.toLocaleString()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="extension-item">Extension Item *</Label>
            <Input
              id="extension-item"
              placeholder="Item/Product requiring extension"
              value={extensionItem}
              onChange={(e) => setExtensionItem(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requested-days">Days Requested *</Label>
            <Input
              id="requested-days"
              type="number"
              min="1"
              max="90"
              value={requestedDays}
              onChange={(e) => setRequestedDays(e.target.value)}
            />
            {requestedDays && (
              <p className="text-sm text-muted-foreground">
                New deadline would be: {calculateNewDeadline()}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Supporting Documents</Label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="has-documents"
                checked={hasDocuments}
                onChange={(e) => setHasDocuments(e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="has-documents" className="font-normal">
                I have supporting documents for this request
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Extension *</Label>
            <Textarea
              id="reason"
              placeholder="Explain why you need an extension"
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={500}
            />
            <p className="text-sm text-muted-foreground">
              {reason.length}/500 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label>Request Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                  disabled={(date) => date < new Date()}
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button type="submit" className="w-full">
            Submit Extension Request
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ExtensionForm;
