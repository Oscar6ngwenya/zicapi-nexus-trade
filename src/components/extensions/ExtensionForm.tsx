
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, FileUp, X } from "lucide-react";
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
  const [files, setFiles] = useState<File[]>([]);
  const [transactionType, setTransactionType] = useState<"import" | "export">("import");
  const [itemValue, setItemValue] = useState<string>("");

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
      setTransactionType(selectedTx.type);
      setItemValue(selectedTx.amount.toString());
    }
  };

  // Calculate new deadline
  const calculateNewDeadline = () => {
    const days = parseInt(requestedDays, 10) || 0;
    return format(addDays(new Date(), days), "yyyy-MM-dd");
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
      setHasDocuments(true);
    }
  };

  // Remove file from list
  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    setHasDocuments(newFiles.length > 0);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!transactionType || !requestedDays || !reason || !companyName || !companyTIN || !extensionItem || !itemValue) {
      setError("Please fill in all required fields");
      return;
    }

    // Clear any previous error
    setError("");

    // Find the selected transaction if any
    const selectedTransaction = transactionId ? 
      transactions.find(tx => tx.id === transactionId) : 
      null;

    // Prepare file information
    const fileInfo = files.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    }));

    // Prepare extension data
    const extensionData = {
      id: `ext-${Date.now()}`,
      transactionId,
      transactionInfo: selectedTransaction || {
        id: `manual-tx-${Date.now()}`,
        date: format(selectedDate, "yyyy-MM-dd"),
        entity: companyName,
        type: transactionType,
        currency: "USD", // Default currency
        amount: parseFloat(itemValue) || 0,
        product: extensionItem,
        status: "pending",
        bank: "Not specified",
        regNumber: companyTIN
      },
      requestedDays: parseInt(requestedDays, 10),
      reason,
      requestDate: format(new Date(), "yyyy-MM-dd"),
      newDeadline: calculateNewDeadline(),
      status: "pending",
      hasDocuments,
      documentFiles: fileInfo,
      companyName,
      companyTIN,
      extensionItem,
      transactionType,
      itemValue: parseFloat(itemValue) || 0
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
    setFiles([]);
    setTransactionType("import");
    setItemValue("");
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
            <Label htmlFor="transaction">Select Transaction (Optional)</Label>
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
            <p className="text-xs text-muted-foreground">
              If you don't select an existing transaction, a new one will be created
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="transaction-type">Transaction Type *</Label>
            <Select 
              value={transactionType} 
              onValueChange={(value: "import" | "export") => setTransactionType(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select transaction type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="import">Import</SelectItem>
                <SelectItem value="export">Export</SelectItem>
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
            <Label htmlFor="item-value">Item Value (Amount) *</Label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
                $
              </span>
              <Input
                id="item-value"
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter item value"
                value={itemValue}
                onChange={(e) => setItemValue(e.target.value)}
                className="rounded-l-none"
              />
            </div>
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
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className="w-full"
                >
                  <FileUp className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png"
                />
              </div>
              
              {files.length > 0 && (
                <div className="mt-2 space-y-2">
                  <Label>Uploaded Documents:</Label>
                  <div className="max-h-40 overflow-y-auto border rounded-md p-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between py-1 border-b last:border-b-0">
                        <span className="text-sm truncate max-w-[80%]" title={file.name}>
                          {file.name} ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <p className="text-xs text-muted-foreground">
                Accepted formats: PDF, Word, Excel, JPEG, PNG (Max 10MB per file)
              </p>
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
