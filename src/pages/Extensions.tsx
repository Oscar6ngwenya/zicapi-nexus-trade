
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Check, X, Calendar, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ExtensionForm from "@/components/extensions/ExtensionForm";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Transaction } from "@/components/dashboard/TransactionTable";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

interface Extension {
  id: string;
  transactionId: string;
  transactionInfo: Transaction;
  requestedDays: number;
  reason: string;
  requestDate: string;
  newDeadline: string;
  status: "pending" | "approved" | "rejected";
  hasDocuments: boolean;
}

const Extensions: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("list");
  const [extensions, setExtensions] = useState<Extension[]>([
    {
      id: "ext-1",
      transactionId: "1",
      transactionInfo: {
        id: "1",
        date: "2023-05-01",
        entity: "Global Imports Ltd",
        type: "import",
        currency: "USD",
        amount: 25000,
        product: "Industrial machinery",
        status: "pending",
        bank: "First National Bank",
      },
      requestedDays: 30,
      reason: "Delay in shipping due to port congestion",
      requestDate: "2023-05-25",
      newDeadline: "2023-06-30",
      status: "pending",
      hasDocuments: true,
    },
    {
      id: "ext-2",
      transactionId: "3",
      transactionInfo: {
        id: "3",
        date: "2023-05-10",
        entity: "Agro Exports Co",
        type: "export",
        currency: "USD",
        amount: 35000,
        product: "Agricultural produce",
        status: "flagged",
        bank: "First National Bank",
      },
      requestedDays: 45,
      reason: "Buyer requested payment extension due to administrative issues",
      requestDate: "2023-05-30",
      newDeadline: "2023-07-15",
      status: "approved",
      hasDocuments: true,
    },
    {
      id: "ext-3",
      transactionId: "5",
      transactionInfo: {
        id: "5",
        date: "2023-05-18",
        entity: "Auto Parts Ltd",
        type: "export",
        currency: "USD",
        amount: 18500,
        product: "Automotive components",
        status: "pending",
        bank: "Commerce Bank",
      },
      requestedDays: 15,
      reason: "Shipment delayed due to customs inspection",
      requestDate: "2023-06-01",
      newDeadline: "2023-06-20",
      status: "rejected",
      hasDocuments: false,
    },
  ]);

  // Mock data - transactions eligible for extension
  const mockTransactions: Transaction[] = [
    {
      id: "1",
      date: "2023-05-01",
      entity: "Global Imports Ltd",
      type: "import",
      currency: "USD",
      amount: 25000,
      product: "Industrial machinery",
      status: "pending",
      bank: "First National Bank",
    },
    {
      id: "2",
      date: "2023-05-05",
      entity: "Tech Solutions Inc",
      type: "import",
      currency: "EUR",
      amount: 15000,
      product: "Computer equipment",
      status: "compliant",
      bank: "Commerce Bank",
    },
    {
      id: "5",
      date: "2023-05-18",
      entity: "Auto Parts Ltd",
      type: "export",
      currency: "USD",
      amount: 18500,
      product: "Automotive components",
      status: "pending",
      bank: "Commerce Bank",
    },
  ];

  const handleSubmitExtension = (extensionData: Extension) => {
    setExtensions((prev) => [extensionData, ...prev]);
    setActiveTab("list");
  };

  const handleApprove = (id: string) => {
    setExtensions((prev) =>
      prev.map((ext) =>
        ext.id === id ? { ...ext, status: "approved" } : ext
      )
    );
    toast.success("Extension approved", {
      description: "The extension request has been approved",
    });
  };

  const handleReject = (id: string) => {
    setExtensions((prev) =>
      prev.map((ext) =>
        ext.id === id ? { ...ext, status: "rejected" } : ext
      )
    );
    toast.success("Extension rejected", {
      description: "The extension request has been rejected",
    });
  };

  const getStatusBadge = (status: Extension["status"]) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Rejected</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zicapi-primary">Extensions</h1>
          <p className="text-muted-foreground">
            Manage extension requests for transaction deadlines
          </p>
        </div>
        <Button onClick={() => setActiveTab("request")}>
          <Plus className="h-4 w-4 mr-2" />
          New Extension Request
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Extension Requests</TabsTrigger>
          <TabsTrigger value="request">Request Extension</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Extension Requests</CardTitle>
              <CardDescription>
                View and manage requests for extending transaction deadlines
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Transaction</TableHead>
                    <TableHead>Requested Days</TableHead>
                    <TableHead>New Deadline</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {extensions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        No extension requests found
                      </TableCell>
                    </TableRow>
                  ) : (
                    extensions.map((extension) => (
                      <TableRow key={extension.id}>
                        <TableCell>{extension.requestDate}</TableCell>
                        <TableCell>
                          {extension.transactionInfo.entity}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate" title={extension.transactionInfo.product}>
                            {extension.transactionInfo.product}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {extension.transactionInfo.currency}{" "}
                            {extension.transactionInfo.amount.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                            {extension.requestedDays} days
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                            {extension.newDeadline}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(extension.status)}</TableCell>
                        <TableCell className="text-right space-x-2">
                          {extension.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-green-500 text-green-600 hover:bg-green-50"
                                onClick={() => handleApprove(extension.id)}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-500 text-red-600 hover:bg-red-50"
                                onClick={() => handleReject(extension.id)}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          {extension.status !== "pending" && (
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="request">
          <ExtensionForm
            onSubmit={handleSubmitExtension}
            transactions={mockTransactions}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Extensions;
