
import React, { useState } from "react";
import { DataDiscrepancy } from "@/services/analyticsService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeftRight,
  CheckCircle2,
  FileQuestion,
  UserRound,
  X,
  Save,
  AlertTriangle,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createAuditLog, AuditActions, AuditModules } from "@/services/auditService";

interface ReconciliationInterfaceProps {
  discrepancy: DataDiscrepancy;
  onResolutionSave?: (discrepancy: DataDiscrepancy) => void;
}

const ReconciliationInterface: React.FC<ReconciliationInterfaceProps> = ({
  discrepancy,
  onResolutionSave,
}) => {
  // States for the resolution interface
  const [annotations, setAnnotations] = useState<string>(discrepancy.annotations || "");
  const [resolutionStatus, setResolutionStatus] = useState<string>(
    discrepancy.resolutionStatus || "unresolved"
  );
  const [isOpen, setIsOpen] = useState(false);

  // Format currency values for display
  const formatCurrency = (value: any, currencyCode: string = "USD") => {
    if (typeof value === 'number') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode
      }).format(value);
    }
    return value;
  };

  const handleSaveResolution = () => {
    // Update the discrepancy with new information
    const updatedDiscrepancy = {
      ...discrepancy,
      annotations,
      resolutionStatus: resolutionStatus as 'unresolved' | 'investigating' | 'resolved',
    };
    
    // Notify parent component
    if (onResolutionSave) {
      onResolutionSave(updatedDiscrepancy);
    }
    
    // Show success message
    toast.success("Resolution details saved", {
      description: `This discrepancy has been marked as ${resolutionStatus}`,
    });
    
    // Log this action to audit trail
    const storedUser = localStorage.getItem("zicapi-user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      createAuditLog(
        user.id,
        user.username,
        user.role,
        AuditActions.DATA_UPDATE,
        AuditModules.DATA_IMPORT,
        `Updated discrepancy resolution status to '${resolutionStatus}' for ${discrepancy.customsTransaction?.entity || discrepancy.financialTransaction?.entity}`
      );
    }
    
    // Close dialog
    setIsOpen(false);
  };

  // Get field value for display
  const getFieldValue = (transaction?: any, field?: string) => {
    if (!transaction || !field) return "—";
    
    // Try to find the field in the transaction
    const value = transaction[field.toLowerCase().replace(/\s+/g, '')];
    
    if (value === undefined || value === null) return "—";
    
    // Format currency fields
    if (
      field === "Item Unit Price" ||
      field === "Total Cost" ||
      field.includes("Price") ||
      field.includes("Cost") ||
      field.includes("Amount") ||
      field.includes("Value")
    ) {
      return formatCurrency(value, transaction.currency || "USD");
    }
    
    // Format quantity fields
    if (field === "Quantity") {
      return typeof value === 'number' ? value.toLocaleString() : value;
    }
    
    return value;
  };

  // Get severity badge styling
  const getSeverityBadge = () => {
    switch (discrepancy.severity) {
      case 'high':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Low</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  const getComparisonTitle = () => {
    if (discrepancy.customsTransaction && discrepancy.financialTransaction) {
      return `Compare ${discrepancy.field || 'Data'}: ${discrepancy.customsTransaction.entity}`;
    } else if (discrepancy.customsTransaction) {
      return `Missing Financial Record: ${discrepancy.customsTransaction.entity}`;
    } else if (discrepancy.financialTransaction) {
      return `Missing Customs Record: ${discrepancy.financialTransaction.entity}`;
    } else {
      return "Data Comparison";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
          title="Compare and reconcile data"
        >
          <ArrowLeftRight className="h-4 w-4" />
          Reconcile
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileQuestion className="h-5 w-5 text-amber-500" />
            {getComparisonTitle()}
          </DialogTitle>
          <DialogDescription>
            Compare customs and financial data to resolve discrepancies
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Discrepancy summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 border rounded-md bg-amber-50">
            <div>
              <p className="font-medium flex items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                {discrepancy.impact || `Discrepancy in ${discrepancy.field || discrepancy.discrepancyType}`}
              </p>
              <p className="text-sm text-muted-foreground">
                {discrepancy.percentageDifference.toFixed(2)}% difference • Severity: {discrepancy.severity || 'Medium'} • Match Confidence: {discrepancy.matchConfidence || '—'}%
              </p>
            </div>
            
            {getSeverityBadge()}
          </div>

          {/* Side by side comparison */}
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-1/4">Field</TableHead>
                  <TableHead className="w-1/3">Customs Data</TableHead>
                  <TableHead className="w-1/3">Financial Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Entity Name */}
                <TableRow>
                  <TableCell className="font-medium">Trading Company Name</TableCell>
                  <TableCell>{discrepancy.customsTransaction?.entity || "—"}</TableCell>
                  <TableCell>{discrepancy.financialTransaction?.entity || "—"}</TableCell>
                </TableRow>
                
                {/* Registration Number */}
                <TableRow>
                  <TableCell className="font-medium">Registration Number (TIN)</TableCell>
                  <TableCell>{discrepancy.customsTransaction?.regNumber || "—"}</TableCell>
                  <TableCell>{discrepancy.financialTransaction?.regNumber || "—"}</TableCell>
                </TableRow>
                
                {/* Bill of Entry */}
                <TableRow>
                  <TableCell className="font-medium">Bill of Entry Number</TableCell>
                  <TableCell>{discrepancy.customsTransaction?.entryNumber || "—"}</TableCell>
                  <TableCell>{discrepancy.financialTransaction?.entryNumber || "—"}</TableCell>
                </TableRow>
                
                {/* Date */}
                <TableRow>
                  <TableCell className="font-medium">Transaction Date</TableCell>
                  <TableCell>{discrepancy.customsTransaction?.date || "—"}</TableCell>
                  <TableCell>{discrepancy.financialTransaction?.date || "—"}</TableCell>
                </TableRow>
                
                {/* The specific field with discrepancy */}
                {discrepancy.field && (
                  <TableRow className="bg-amber-50">
                    <TableCell className="font-medium">{discrepancy.field}</TableCell>
                    <TableCell className="font-mono">
                      {getFieldValue(discrepancy.customsTransaction, discrepancy.field)}
                    </TableCell>
                    <TableCell className="font-mono">
                      {getFieldValue(discrepancy.financialTransaction, discrepancy.field)}
                    </TableCell>
                  </TableRow>
                )}
                
                {/* Currency */}
                <TableRow>
                  <TableCell className="font-medium">Currency</TableCell>
                  <TableCell>{discrepancy.customsTransaction?.currency || "—"}</TableCell>
                  <TableCell>{discrepancy.financialTransaction?.currency || "—"}</TableCell>
                </TableRow>
                
                {/* Product Description */}
                <TableRow>
                  <TableCell className="font-medium">Product Description</TableCell>
                  <TableCell>{discrepancy.customsTransaction?.product || "—"}</TableCell>
                  <TableCell>{discrepancy.financialTransaction?.product || "—"}</TableCell>
                </TableRow>
                
                {/* Unit Price */}
                <TableRow>
                  <TableCell className="font-medium">Unit Price</TableCell>
                  <TableCell className="font-mono">
                    {discrepancy.customsTransaction?.unitPrice 
                      ? formatCurrency(discrepancy.customsTransaction.unitPrice, discrepancy.customsTransaction.currency) 
                      : "—"}
                  </TableCell>
                  <TableCell className="font-mono">
                    {discrepancy.financialTransaction?.unitPrice 
                      ? formatCurrency(discrepancy.financialTransaction.unitPrice, discrepancy.financialTransaction.currency) 
                      : "—"}
                  </TableCell>
                </TableRow>
                
                {/* Quantity */}
                <TableRow>
                  <TableCell className="font-medium">Quantity</TableCell>
                  <TableCell className="font-mono">
                    {discrepancy.customsTransaction?.quantity 
                      ? discrepancy.customsTransaction.quantity.toLocaleString() 
                      : "—"}
                  </TableCell>
                  <TableCell className="font-mono">
                    {discrepancy.financialTransaction?.quantity 
                      ? discrepancy.financialTransaction.quantity.toLocaleString() 
                      : "—"}
                  </TableCell>
                </TableRow>
                
                {/* Total Amount */}
                <TableRow>
                  <TableCell className="font-medium">Total Amount</TableCell>
                  <TableCell className="font-mono">
                    {discrepancy.customsTransaction?.amount 
                      ? formatCurrency(discrepancy.customsTransaction.amount, discrepancy.customsTransaction.currency) 
                      : "—"}
                  </TableCell>
                  <TableCell className="font-mono">
                    {discrepancy.financialTransaction?.amount 
                      ? formatCurrency(discrepancy.financialTransaction.amount, discrepancy.financialTransaction.currency) 
                      : "—"}
                  </TableCell>
                </TableRow>
                
                {/* Bank Used */}
                <TableRow>
                  <TableCell className="font-medium">Bank Used</TableCell>
                  <TableCell>{discrepancy.customsTransaction?.bank || "—"}</TableCell>
                  <TableCell>{discrepancy.financialTransaction?.bank || "—"}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Resolution section */}
          <div>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <UserRound className="h-4 w-4" />
              Resolution Notes
            </h3>
            <Textarea
              value={annotations}
              onChange={(e) => setAnnotations(e.target.value)}
              placeholder="Add your analysis or findings about this discrepancy..."
              className="min-h-[100px]"
            />
          </div>

          {/* Resolution status */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">Resolution Status</p>
              <Select value={resolutionStatus} onValueChange={setResolutionStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unresolved">Unresolved</SelectItem>
                  <SelectItem value="investigating">Under Investigation</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              
              <Button onClick={handleSaveResolution}>
                <Save className="h-4 w-4 mr-2" />
                Save Resolution
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReconciliationInterface;
