
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, DollarSign, Building, Receipt, ExternalLink } from "lucide-react";
import { createAuditLog, AuditActions, AuditModules } from "@/services/auditService";

export interface AcquittalDocument {
  id: string;
  name: string;
  date: string;
  size: string;
  type: string;
}

export interface Acquittal {
  id: string;
  transactionId: string;
  entity: string;
  transactionDate: string;
  transactionAmount: string;
  dueDate: string;
  status: "pending" | "completed" | "overdue" | "initiated";
  type: "import" | "export";
  documents?: AcquittalDocument[];
  companyTIN?: string;
  description?: string;
}

interface AcquittalDetailsProps {
  acquittal: Acquittal | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: { id: string; username: string; role: string } | null;
}

const AcquittalDetails: React.FC<AcquittalDetailsProps> = ({ 
  acquittal, 
  isOpen, 
  onClose,
  currentUser 
}) => {
  if (!acquittal) return null;

  // Log the view action in audit trail
  React.useEffect(() => {
    if (isOpen && acquittal && currentUser) {
      createAuditLog(
        currentUser.id,
        currentUser.username,
        currentUser.role,
        AuditActions.DATA_VIEW,
        AuditModules.ACQUITTALS,
        `Viewed details for acquittal ID ${acquittal.id} for entity ${acquittal.entity}`
      );
    }
  }, [isOpen, acquittal, currentUser]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800 hover:bg-green-200";
      case "pending": return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "overdue": return "bg-red-100 text-red-800 hover:bg-red-200";
      case "initiated": return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      default: return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Acquittal Details</DialogTitle>
          <DialogDescription>
            Transaction ID: {acquittal.transactionId}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Entity</p>
              <p className="font-medium flex items-center">
                <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                {acquittal.entity}
              </p>
            </div>
            
            {acquittal.companyTIN && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Company TIN</p>
                <p className="font-medium">{acquittal.companyTIN}</p>
              </div>
            )}
            
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Transaction Date</p>
              <p className="font-medium flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                {acquittal.transactionDate}
              </p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Due Date</p>
              <p className="font-medium flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                {acquittal.dueDate}
              </p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Transaction Amount</p>
              <p className="font-medium flex items-center">
                <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                {acquittal.transactionAmount}
              </p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Transaction Type</p>
              <Badge variant={acquittal.type === "import" ? "default" : "secondary"}>
                {acquittal.type === "import" ? "Import" : "Export"}
              </Badge>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge className={getStatusColor(acquittal.status)}>
                {formatStatus(acquittal.status)}
              </Badge>
            </div>
          </div>
          
          {acquittal.description && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="text-sm border rounded-md p-3 bg-gray-50">{acquittal.description}</p>
            </div>
          )}
          
          {acquittal.documents && acquittal.documents.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Supporting Documents</p>
              <div className="border rounded-md overflow-hidden">
                {acquittal.documents.map((doc) => (
                  <div 
                    key={doc.id} 
                    className="flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-gray-50"
                  >
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.date} · {doc.size} · {doc.type}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="opacity-70 hover:opacity-100">
                      <ExternalLink className="h-4 w-4" />
                      <span className="sr-only">View document</span>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AcquittalDetails;
