
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { toast } from "sonner";
import { AlertTriangle, FileSearch, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FlaggedTransactions, { FlaggedTransaction } from "@/components/compliance/FlaggedTransactions";
import { createAuditLog, AuditActions, AuditModules } from "@/services/auditService";

interface Investigation {
  id: string;
  transactionId: string;
  entity: string;
  date: string;
  amount: number;
  currency: string;
  type: string;
  reason: string;
  status: "pending" | "in-progress" | "completed" | "closed";
  assignedTo: string;
  severity: "high" | "medium" | "low";
  lastUpdated: string;
  notes?: string;
  resolution?: string;
}

const Compliance: React.FC = () => {
  const [activeTab, setActiveTab] = useState("flagged");
  const [flaggedTransactions, setFlaggedTransactions] = useState<FlaggedTransaction[]>([]);
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvestigation, setSelectedInvestigation] = useState<Investigation | null>(null);
  const [notes, setNotes] = useState("");
  const [resolution, setResolution] = useState("");
  const [status, setStatus] = useState<"pending" | "in-progress" | "completed" | "closed">("pending");
  const [assignedTo, setAssignedTo] = useState("");
  const [isInvestigating, setIsInvestigating] = useState(false);

  // Load data on component mount
  useEffect(() => {
    // Load flagged transactions
    const storedTransactions = localStorage.getItem("zicapi-flagged-transactions");
    if (storedTransactions) {
      setFlaggedTransactions(JSON.parse(storedTransactions));
    } else {
      // Generate sample data if none exists
      const sampleTransactions: FlaggedTransaction[] = [
        {
          id: "FT-001",
          date: "2023-05-15",
          entity: "Global Imports Ltd",
          type: "Import Payment",
          currency: "USD",
          amount: 250000,
          bank: "First National Bank",
          product: "Industrial Equipment",
          reason: "Payment exceeds threshold for industrial equipment imports",
          severity: "medium"
        },
        {
          id: "FT-002",
          date: "2023-05-18",
          entity: "Tech Solutions Inc",
          type: "Service Payment",
          currency: "EUR",
          amount: 75000,
          bank: "Commerce Bank",
          product: "IT Consulting",
          reason: "Multiple fragmented payments to same beneficiary within 24 hours",
          severity: "high"
        },
        {
          id: "FT-003",
          date: "2023-05-20",
          entity: "Luxury Goods Exports",
          type: "Export Payment",
          currency: "USD",
          amount: 120000,
          bank: "International Trade Bank",
          product: "Jewelry",
          reason: "Destination country is high-risk jurisdiction",
          severity: "high"
        },
        {
          id: "FT-004",
          date: "2023-05-22",
          entity: "Farm Supplies Co",
          type: "Import Payment",
          currency: "USD",
          amount: 45000,
          bank: "Agricultural Credit Union",
          product: "Fertilizer",
          reason: "Discrepancy between declared value and market price",
          severity: "low"
        },
        {
          id: "FT-005",
          date: "2023-05-25",
          entity: "Medical Supplies Ltd",
          type: "Import Payment",
          currency: "EUR",
          amount: 85000,
          bank: "Healthcare Finance",
          product: "Medical Equipment",
          reason: "Incomplete documentation for regulated medical products",
          severity: "medium"
        }
      ];
      
      setFlaggedTransactions(sampleTransactions);
      localStorage.setItem("zicapi-flagged-transactions", JSON.stringify(sampleTransactions));
    }
    
    // Load investigations
    const storedInvestigations = localStorage.getItem("zicapi-investigations");
    if (storedInvestigations) {
      setInvestigations(JSON.parse(storedInvestigations));
    }
  }, []);

  // Handle investigation of flagged transaction
  const handleInvestigate = (transaction: FlaggedTransaction) => {
    // Show loading
    setIsInvestigating(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setIsInvestigating(false);
      
      toast.success(`Investigation initiated for transaction ${transaction.id}`, {
        description: `A compliance officer will review this ${transaction.type} transaction.`
      });
      
      // Log to audit trail
      createAuditLog(
        "user123", // In a real app, this would come from auth context
        "John Doe", // In a real app, this would come from auth context
        "Administrator",
        AuditActions.DATA_VIEW,
        AuditModules.COMPLIANCE,
        `Initiated investigation for transaction ${transaction.id} (${transaction.entity})`
      );
      
      // Add to investigations list
      const existingInvestigations = JSON.parse(localStorage.getItem("zicapi-investigations") || "[]");

      // Ensure severity is one of the allowed values
      let severity: "high" | "medium" | "low";
      
      // Map the incoming severity to a valid value
      if (transaction.severity === "high") {
        severity = "high";
      } else if (transaction.severity === "medium") {
        severity = "medium";
      } else if (transaction.severity === "low") {
        severity = "low";
      } else {
        // Default to medium if the value is not one of the expected ones
        severity = "medium";
      }
      
      // Create investigation object with explicitly typed status
      const investigation: Investigation = {
        id: `inv-${Date.now()}`,
        transactionId: transaction.id,
        entity: transaction.entity,
        date: transaction.date,
        amount: transaction.amount,
        currency: transaction.currency,
        type: transaction.type,
        reason: transaction.reason,
        status: "pending", // Explicitly use a valid literal value from the union type
        assignedTo: "Unassigned",
        severity: severity,
        lastUpdated: format(new Date(), "yyyy-MM-dd"),
      };
      
      // Add to investigations and save to localStorage
      existingInvestigations.push(investigation);
      localStorage.setItem("zicapi-investigations", JSON.stringify(existingInvestigations));
      
      // Update UI with new investigation
      setInvestigations(prev => [...prev, investigation]);
      setIsModalOpen(true);
      setSelectedInvestigation(investigation);
    }, 1500);
  };

  // Handle opening investigation details
  const handleViewInvestigation = (investigation: Investigation) => {
    setSelectedInvestigation(investigation);
    setNotes(investigation.notes || "");
    setResolution(investigation.resolution || "");
    setStatus(investigation.status);
    setAssignedTo(investigation.assignedTo);
    setIsModalOpen(true);
  };

  // Handle updating investigation
  const handleUpdateInvestigation = () => {
    if (!selectedInvestigation) return;
    
    // Update investigation
    const updatedInvestigation: Investigation = {
      ...selectedInvestigation,
      notes,
      resolution,
      status,
      assignedTo,
      lastUpdated: format(new Date(), "yyyy-MM-dd")
    };
    
    // Update in state and localStorage
    const updatedInvestigations = investigations.map(inv => 
      inv.id === updatedInvestigation.id ? updatedInvestigation : inv
    );
    
    setInvestigations(updatedInvestigations);
    localStorage.setItem("zicapi-investigations", JSON.stringify(updatedInvestigations));
    
    // Log to audit trail
    createAuditLog(
      "user123", // In a real app, this would come from auth context
      "John Doe", // In a real app, this would come from auth context
      "Administrator",
      AuditActions.DATA_UPDATE,
      AuditModules.COMPLIANCE,
      `Updated investigation ${updatedInvestigation.id} for ${updatedInvestigation.entity}`
    );
    
    // Close modal and show success message
    setIsModalOpen(false);
    toast.success("Investigation updated successfully");
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
      case "in-progress":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">In Progress</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Completed</Badge>;
      case "closed":
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">Closed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Get severity badge
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high":
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">High</Badge>;
      case "medium":
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">Medium</Badge>;
      case "low":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Low</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zicapi-primary">Compliance Monitoring</h1>
        <p className="text-muted-foreground">
          Monitor and investigate transactions flagged for potential compliance issues
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="flagged">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Flagged Transactions
          </TabsTrigger>
          <TabsTrigger value="investigations">
            <FileSearch className="h-4 w-4 mr-2" />
            Active Investigations
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="flagged" className="space-y-4">
          <FlaggedTransactions 
            transactions={flaggedTransactions} 
            onInvestigate={handleInvestigate} 
          />
        </TabsContent>
        
        <TabsContent value="investigations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSearch className="h-5 w-5 text-blue-500" />
                Active Investigations
              </CardTitle>
              <CardDescription>
                Ongoing compliance investigations for flagged transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {investigations.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No Active Investigations</h3>
                  <p className="text-muted-foreground mt-2">
                    There are currently no active compliance investigations.
                  </p>
                </div>
              ) : (
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left p-2 pl-4">ID</th>
                        <th className="text-left p-2">Entity</th>
                        <th className="text-left p-2">Type</th>
                        <th className="text-left p-2">Amount</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Severity</th>
                        <th className="text-left p-2">Last Updated</th>
                        <th className="text-right p-2 pr-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {investigations.map((investigation) => (
                        <tr key={investigation.id} className="border-t">
                          <td className="p-2 pl-4 font-mono text-sm">{investigation.id}</td>
                          <td className="p-2 font-medium">{investigation.entity}</td>
                          <td className="p-2">{investigation.type}</td>
                          <td className="p-2">
                            {investigation.currency} {investigation.amount.toLocaleString()}
                          </td>
                          <td className="p-2">{getStatusBadge(investigation.status)}</td>
                          <td className="p-2">{getSeverityBadge(investigation.severity)}</td>
                          <td className="p-2">{investigation.lastUpdated}</td>
                          <td className="p-2 pr-4 text-right">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="gap-1"
                              onClick={() => handleViewInvestigation(investigation)}
                            >
                              <FileSearch className="h-4 w-4" />
                              View Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Investigation Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Investigation Details</DialogTitle>
            <DialogDescription>
              {selectedInvestigation?.id} - {selectedInvestigation?.entity}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Transaction ID</Label>
              <Input value={selectedInvestigation?.transactionId || ""} readOnly className="bg-muted/50" />
            </div>
            <div>
              <Label>Date</Label>
              <Input value={selectedInvestigation?.date || ""} readOnly className="bg-muted/50" />
            </div>
            <div>
              <Label>Amount</Label>
              <Input 
                value={selectedInvestigation ? 
                  `${selectedInvestigation.currency} ${selectedInvestigation.amount.toLocaleString()}` : 
                  ""
                } 
                readOnly 
                className="bg-muted/50" 
              />
            </div>
            <div>
              <Label>Type</Label>
              <Input value={selectedInvestigation?.type || ""} readOnly className="bg-muted/50" />
            </div>
            <div className="col-span-2">
              <Label>Reason for Flag</Label>
              <Textarea value={selectedInvestigation?.reason || ""} readOnly className="bg-muted/50 resize-none" />
            </div>
            <div>
              <Label>Severity</Label>
              <Select value={selectedInvestigation?.severity} disabled>
                <SelectTrigger className="bg-muted/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus as any}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Assigned To</Label>
              <Input 
                value={assignedTo} 
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="Enter name of assigned investigator"
              />
            </div>
            <div className="col-span-2">
              <Label>Investigation Notes</Label>
              <Textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter investigation notes here"
                className="min-h-[100px]"
              />
            </div>
            <div className="col-span-2">
              <Label>Resolution</Label>
              <Textarea 
                value={resolution} 
                onChange={(e) => setResolution(e.target.value)}
                placeholder="Enter resolution details here"
                className="min-h-[100px]"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateInvestigation} className="gap-1">
              <CheckCircle className="h-4 w-4" />
              Update Investigation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Compliance;
