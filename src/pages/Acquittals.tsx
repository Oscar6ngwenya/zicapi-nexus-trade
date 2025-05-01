
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileCheck, Upload, Search, Check, AlertTriangle, Lock } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AcquittalDocument {
  id: string;
  name: string;
  date: string;
  size: string;
  type: string;
}

interface Acquittal {
  id: string;
  transactionId: string;
  entity: string;
  transactionDate: string;
  transactionAmount: string;
  dueDate: string;
  status: "pending" | "completed" | "overdue" | "initiated";
  type: "import" | "export";
  documents?: AcquittalDocument[];
}

const Acquittals: React.FC = () => {
  // State for document upload dialog
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [currentAcquittalId, setCurrentAcquittalId] = useState<string | null>(null);
  
  // State for approval dialog
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [userRole, setUserRole] = useState<string>("regulator"); // Default to regulator for demo purposes
  
  // Get user role from localStorage if available
  React.useEffect(() => {
    const storedUser = localStorage.getItem("zicapi-user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserRole(user.role);
    }
  }, []);

  // Mock data for acquittals
  const [acquittals, setAcquittals] = useState<Acquittal[]>([
    {
      id: "acq1",
      transactionId: "tx123",
      entity: "Global Imports Ltd",
      transactionDate: "2023-04-15",
      transactionAmount: "$25,000.00",
      dueDate: "2023-05-15",
      status: "pending",
      type: "import",
    },
    {
      id: "acq2",
      transactionId: "tx456",
      entity: "Tech Solutions Inc",
      transactionDate: "2023-04-20",
      transactionAmount: "€15,000.00",
      dueDate: "2023-05-20",
      status: "completed",
      type: "import",
      documents: [
        { 
          id: "doc1", 
          name: "invoice_456.pdf", 
          date: "2023-05-10", 
          size: "1.2MB",
          type: "invoice"
        }
      ]
    },
    {
      id: "acq3",
      transactionId: "tx789",
      entity: "Agro Exports Co",
      transactionDate: "2023-05-01",
      transactionAmount: "$35,000.00",
      dueDate: "2023-06-01",
      status: "overdue",
      type: "export",
    },
    {
      id: "acq4",
      transactionId: "tx101",
      entity: "Pharma Global",
      transactionDate: "2023-05-05",
      transactionAmount: "CHF42,000.00",
      dueDate: "2023-06-05",
      status: "initiated",
      type: "import",
      documents: [
        { 
          id: "doc2", 
          name: "invoice_101.pdf", 
          date: "2023-05-20", 
          size: "0.8MB",
          type: "invoice"
        }
      ]
    },
  ]);

  // Handle document upload dialog open
  const handleOpenUploadDialog = (id: string) => {
    setCurrentAcquittalId(id);
    setSelectedFiles([]);
    setUploadDialogOpen(true);
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(filesArray);
    }
  };

  // Handle document submission
  const handleSubmitDocument = () => {
    if (!currentAcquittalId || selectedFiles.length === 0) {
      toast.error("No files selected");
      return;
    }

    // Update the acquittal status and add document info
    setAcquittals(prev => prev.map(acq => {
      if (acq.id === currentAcquittalId) {
        // Create document entries from selected files
        const newDocuments = selectedFiles.map(file => ({
          id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          date: new Date().toISOString().slice(0, 10),
          size: `${(file.size / 1024).toFixed(1)}KB`,
          type: file.type.split('/')[1] || 'document'
        }));
        
        return {
          ...acq,
          status: "initiated",
          documents: [...(acq.documents || []), ...newDocuments]
        };
      }
      return acq;
    }));

    toast.success("Documents submitted successfully", {
      description: "Acquittal has been initiated and is pending approval",
    });
    
    setUploadDialogOpen(false);
  };

  // Open approval dialog
  const handleOpenApproval = (id: string) => {
    // Check if user is a regulator
    if (userRole !== "regulator") {
      toast.error("Unauthorized", {
        description: "Only regulatory agency users can approve acquittals",
      });
      return;
    }
    
    setCurrentAcquittalId(id);
    setPassword("");
    setPasswordError("");
    setApprovalDialogOpen(true);
  };

  // Handle acquittal approval
  const handleApprove = () => {
    // Simple password check for demo - in real app would use secure authentication
    if (password !== "regulator123") {
      setPasswordError("Invalid password");
      return;
    }

    // Update acquittal status to completed
    setAcquittals(prev => prev.map(acq => 
      acq.id === currentAcquittalId ? { ...acq, status: "completed" } : acq
    ));

    toast.success("Acquittal verified successfully", {
      description: "The transaction has been marked as completed",
    });
    
    setApprovalDialogOpen(false);
  };

  // Handle view details
  const handleViewDetails = (id: string) => {
    toast.info("Viewing acquittal details", {
      description: `Showing details for acquittal ID: ${id}`,
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zicapi-primary">Acquittals</h1>
        <p className="text-muted-foreground">
          Manage and verify transaction acquittals
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction Acquittals</CardTitle>
          <CardDescription>
            Verify delivery for imports and payment for exports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Entity</TableHead>
                <TableHead>Transaction Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Documents</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {acquittals.map((acquittal) => (
                <TableRow key={acquittal.id}>
                  <TableCell className="font-medium">{acquittal.entity}</TableCell>
                  <TableCell>{acquittal.transactionDate}</TableCell>
                  <TableCell>{acquittal.transactionAmount}</TableCell>
                  <TableCell>
                    <Badge variant={acquittal.type === "import" ? "default" : "secondary"}>
                      {acquittal.type === "import" ? "Import" : "Export"}
                    </Badge>
                  </TableCell>
                  <TableCell>{acquittal.dueDate}</TableCell>
                  <TableCell>
                    {acquittal.status === "completed" && (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                        Completed
                      </Badge>
                    )}
                    {acquittal.status === "pending" && (
                      <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                        Pending
                      </Badge>
                    )}
                    {acquittal.status === "overdue" && (
                      <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
                        Overdue
                      </Badge>
                    )}
                    {acquittal.status === "initiated" && (
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                        Initiated
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {acquittal.documents && acquittal.documents.length > 0 ? (
                      <Badge variant="outline" className="bg-green-50">
                        {acquittal.documents.length} Document(s)
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-50">
                        No Documents
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {(acquittal.status === "pending" || acquittal.status === "overdue") && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenUploadDialog(acquittal.id)}
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        Submit Docs
                      </Button>
                    )}
                    
                    {acquittal.status === "initiated" && userRole === "regulator" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-green-500 text-green-600 hover:bg-green-50"
                        onClick={() => handleOpenApproval(acquittal.id)}
                      >
                        <FileCheck className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                    )}
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleViewDetails(acquittal.id)}
                    >
                      <Search className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Acquittal Process</CardTitle>
          <CardDescription>
            Overview of the acquittal verification process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center">
                  <div className="bg-zicapi-primary text-white rounded-full w-6 h-6 flex items-center justify-center mr-2">
                    1
                  </div>
                  Document Submission
                </h3>
                <p className="text-sm text-muted-foreground">
                  Upload supporting documents such as delivery receipts, payment confirmations, or other evidence.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center">
                  <div className="bg-zicapi-primary text-white rounded-full w-6 h-6 flex items-center justify-center mr-2">
                    2
                  </div>
                  Initiation
                </h3>
                <p className="text-sm text-muted-foreground">
                  The acquittal is marked as initiated after document submission and awaits regulatory approval.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center">
                  <div className="bg-zicapi-primary text-white rounded-full w-6 h-6 flex items-center justify-center mr-2">
                    3
                  </div>
                  Verification
                </h3>
                <p className="text-sm text-muted-foreground">
                  Regulatory officials review submitted documents to verify delivery for imports or payment for exports.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center">
                  <div className="bg-zicapi-primary text-white rounded-full w-6 h-6 flex items-center justify-center mr-2">
                    4
                  </div>
                  Clearance
                </h3>
                <p className="text-sm text-muted-foreground">
                  Once verified, the transaction is marked as completed and the entity is cleared for this transaction.
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                For assistance with the acquittal process, please contact the support team.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Supporting Documents</DialogTitle>
            <DialogDescription>
              Upload documents to verify your transaction acquittal
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-4 py-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <label htmlFor="documents" className="text-sm font-medium">
                Select Documents
              </label>
              <Input
                id="documents"
                type="file"
                multiple
                onChange={handleFileChange}
              />
              <p className="text-sm text-muted-foreground">
                Accepted formats: PDF, JPG, PNG, DOCX (Max size: 10MB per file)
              </p>
            </div>
            
            {selectedFiles.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Selected Files:</h4>
                <ul className="text-sm space-y-1">
                  {selectedFiles.map((file, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              type="submit"
              onClick={handleSubmitDocument}
              disabled={selectedFiles.length === 0}
            >
              Submit Documents
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Approve Acquittal</DialogTitle>
            <DialogDescription>
              Only regulatory agency officials can approve acquittals
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-4 py-4">
            <div className="flex items-center gap-2 bg-yellow-50 p-3 rounded-md">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                For security purposes, please enter your password to confirm approval
              </p>
            </div>
            
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  className="pl-10"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError("");
                  }}
                />
              </div>
              {passwordError && (
                <p className="text-sm text-red-500">{passwordError}</p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="submit"
              onClick={handleApprove}
              disabled={!password}
            >
              <Check className="h-4 w-4 mr-1" />
              Approve Acquittal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Acquittals;
