
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileCheck, Upload, Search } from "lucide-react";
import { toast } from "sonner";

const Acquittals: React.FC = () => {
  // Mock data for acquittals
  const mockAcquittals = [
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
      status: "pending",
      type: "import",
    },
  ];

  const handleSubmitDocument = (id: string) => {
    toast.info("Document upload initiated", {
      description: "Upload functionality would be implemented here",
    });
  };

  const handleVerify = (id: string) => {
    toast.success("Acquittal verified successfully", {
      description: "The transaction has been marked as completed",
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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockAcquittals.map((acquittal) => (
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
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {acquittal.status !== "completed" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSubmitDocument(acquittal.id)}
                        >
                          <Upload className="h-4 w-4 mr-1" />
                          Submit Docs
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-500 text-green-600 hover:bg-green-50"
                          onClick={() => handleVerify(acquittal.id)}
                        >
                          <FileCheck className="h-4 w-4 mr-1" />
                          Verify
                        </Button>
                      </>
                    )}
                    {acquittal.status === "completed" && (
                      <Button size="sm" variant="outline">
                        <Search className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    )}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  Verification
                </h3>
                <p className="text-sm text-muted-foreground">
                  Officials review submitted documents to verify delivery for imports or payment for exports.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center">
                  <div className="bg-zicapi-primary text-white rounded-full w-6 h-6 flex items-center justify-center mr-2">
                    3
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
    </div>
  );
};

export default Acquittals;
