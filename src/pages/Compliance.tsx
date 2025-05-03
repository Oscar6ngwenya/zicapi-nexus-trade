import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FlaggedTransactions, { FlaggedTransaction } from "@/components/compliance/FlaggedTransactions";
import ComplianceChart from "@/components/analytics/ComplianceChart";
import { AlertTriangle, CheckCircle, FileSearch, Building, Calendar, FileText } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { toast } from "sonner";
import InvestigationGenerator from "@/components/compliance/InvestigationGenerator";
import { createAuditLog, AuditActions, AuditModules, RiskLevels } from "@/services/auditService";
import { useNavigate } from "react-router-dom";

interface Investigation {
  id: string;
  company: string;
  companyRegNumber: string;
  startDate: string;
  reason: string;
  status: "active" | "completed" | "pending";
  assignedTo: string;
  severity: "high" | "medium" | "low";
  lastUpdated: string;
}

const Compliance: React.FC = () => {
  // State for investigations
  const [investigations, setInvestigations] = useState<Investigation[]>([
    {
      id: "inv-1",
      company: "Global Imports Ltd",
      companyRegNumber: "TIN12345678",
      startDate: "2023-05-10",
      reason: "Multiple discrepancies between customs declarations and financial transactions",
      status: "active",
      assignedTo: "John Smith",
      severity: "high",
      lastUpdated: "2023-06-01",
    },
    {
      id: "inv-2",
      company: "Tech Solutions Inc",
      companyRegNumber: "TIN87654321",
      startDate: "2023-05-15",
      reason: "Suspected under-invoicing on computer equipment imports",
      status: "pending",
      assignedTo: "Maria Johnson",
      severity: "medium",
      lastUpdated: "2023-05-20",
    },
    {
      id: "inv-3",
      company: "Mineral Resources Corp",
      companyRegNumber: "TIN23456789",
      startDate: "2023-04-25",
      reason: "Price per unit significantly below market value on mineral exports",
      status: "active",
      assignedTo: "Robert Wilson",
      severity: "high",
      lastUpdated: "2023-05-30",
    },
    {
      id: "inv-4",
      company: "International Trading LLC",
      companyRegNumber: "TIN34567890",
      startDate: "2023-05-02",
      reason: "Transaction with entity based in high-risk jurisdiction with insufficient documentation",
      status: "completed",
      assignedTo: "Sarah Brown",
      severity: "medium",
      lastUpdated: "2023-05-28",
    },
  ]);

  // Mock flagged transactions data
  const [flaggedTransactions] = useState<FlaggedTransaction[]>([
    {
      id: "1",
      date: "2023-05-15",
      entity: "Tech Solutions Inc",
      type: "import",
      currency: "USD",
      amount: 85000,
      bank: "First National Bank",
      product: "Computer Equipment",
      reason: "Value declared to customs (USD 65,000) does not match bank transaction amount (USD 85,000). Potential under-declaration for duty avoidance.",
      severity: "high",
    },
    {
      id: "2",
      date: "2023-05-18",
      entity: "Global Imports Ltd",
      type: "import",
      currency: "EUR",
      amount: 45000,
      bank: "Commerce Bank",
      product: "Automotive Parts",
      reason: "Multiple smaller transactions on the same day totaling EUR 45,000, possible structuring to avoid reporting requirements.",
      severity: "medium",
    },
    {
      id: "3",
      date: "2023-05-22",
      entity: "Agro Exports Co",
      type: "export",
      currency: "USD",
      amount: 120000,
      bank: "First National Bank",
      product: "Agricultural Produce",
      reason: "Export quantity appears unusually high compared to entity's historical patterns. Possible over-invoicing to move capital abroad.",
      severity: "medium",
    },
    {
      id: "4",
      date: "2023-05-25",
      entity: "International Trading LLC",
      type: "import",
      currency: "USD",
      amount: 250000,
      bank: "Commerce Bank",
      product: "Luxury Goods",
      reason: "Transaction with entity based in high-risk jurisdiction. Insufficient documentation provided for source of funds.",
      severity: "high",
    },
    {
      id: "5",
      date: "2023-05-30",
      entity: "Mineral Resources Corp",
      type: "export",
      currency: "USD",
      amount: 180000,
      bank: "First National Bank",
      product: "Mineral Ore",
      reason: "Price per unit significantly below market value. Potential transfer pricing issue or capital flight through under-invoicing.",
      severity: "high",
    },
  ]);

  // Compliance statistics
  const complianceStats = [
    {
      title: "Flagged Transactions",
      value: "5",
      description: "Transactions requiring review",
      icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
      color: "bg-red-50 text-red-700",
    },
    {
      title: "Compliance Rate",
      value: "94%",
      description: "Overall system compliance",
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      color: "bg-green-50 text-green-700",
    },
    {
      title: "Active Investigations",
      value: `${investigations.filter(i => i.status === "active").length}`,
      description: "Companies under investigation",
      icon: <FileSearch className="h-5 w-5 text-amber-500" />,
      color: "bg-amber-50 text-amber-700",
    }
  ];

  // Mock data for the compliance chart
  const chartData = {
    barData: [
      { name: "Jan", compliance: 92 },
      { name: "Feb", compliance: 88 },
      { name: "Mar", compliance: 91 },
      { name: "Apr", compliance: 87 },
      { name: "May", compliance: 94 },
      { name: "Jun", compliance: 93 },
    ],
    pieData: [
      { name: "Compliant", value: 94, color: "#4ade80" },
      { name: "Non-Compliant", value: 6, color: "#f87171" },
    ],
    lineData: [
      { name: "Jan", compliance: 92 },
      { name: "Feb", compliance: 88 },
      { name: "Mar", compliance: 91 },
      { name: "Apr", compliance: 87 },
      { name: "May", compliance: 94 },
      { name: "Jun", compliance: 93 },
    ],
  };

  const navigate = useNavigate();
  const [selectedTransaction, setSelectedTransaction] = useState<FlaggedTransaction | null>(null);

  // Handle starting a new investigation
  const handleStartInvestigation = (transaction: FlaggedTransaction) => {
    // Check if company is already under investigation
    const existingInvestigation = investigations.find(
      inv => inv.company === transaction.entity && inv.status !== "completed"
    );

    if (existingInvestigation) {
      toast.info("Investigation already exists", {
        description: `${transaction.entity} is already under investigation (ID: ${existingInvestigation.id})`,
      });
      return;
    }

    // Ensure severity is one of the allowed values
    let severity: "high" | "medium" | "low";
    
    // Explicitly check transaction severity and ensure it matches one of our allowed values
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

    // Create new investigation with proper type for severity
    const newInvestigation: Investigation = {
      id: `inv-${Date.now()}`,
      company: transaction.entity,
      companyRegNumber: "TIN" + Math.floor(10000000 + Math.random() * 90000000),
      startDate: format(new Date(), "yyyy-MM-dd"),
      reason: transaction.reason,
      status: "pending",
      assignedTo: "Unassigned",
      severity: severity, // Now properly typed
      lastUpdated: format(new Date(), "yyyy-MM-dd"),
    };

    // Add to investigations list
    setInvestigations(prev => [newInvestigation, ...prev]);
    
    // Set selected transaction for PDF generation
    setSelectedTransaction(transaction);
    
    // Create audit log entry
    createAuditLog(
      "user123", // In a real app, this would come from the auth context
      "John Doe", // In a real app, this would come from the auth context
      "Compliance Officer",
      AuditActions.DATA_CREATE,
      AuditModules.COMPLIANCE,
      `Started investigation for ${transaction.entity} due to compliance concerns`,
      { riskLevel: RiskLevels.MEDIUM }
    );

    toast.success("Investigation initiated", {
      description: `A new investigation has been started for ${transaction.entity}`,
    });
    
    // Trigger PDF generation after a short delay to ensure UI updates first
    setTimeout(() => {
      const pdfButton = document.getElementById("generate-investigation-pdf");
      if (pdfButton) pdfButton.click();
    }, 500);
  };

  // Handle viewing investigation details
  const handleViewInvestigation = (id: string) => {
    toast.info("Investigation details", {
      description: `Viewing details for investigation ${id}`,
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zicapi-primary">Compliance Monitoring</h1>
        <p className="text-muted-foreground">
          Monitor and enforce compliance for foreign exchange transactions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {complianceStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className={`${stat.color} bg-opacity-20`}>
              <CardTitle className="flex items-center text-lg">
                {stat.icon}
                <span className="ml-2">{stat.title}</span>
              </CardTitle>
              <CardDescription>{stat.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-3xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="flagged" className="space-y-4">
        <TabsList>
          <TabsTrigger value="flagged">Flagged Transactions</TabsTrigger>
          <TabsTrigger value="investigations">Investigations</TabsTrigger>
          <TabsTrigger value="analytics">Compliance Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="flagged" className="space-y-4">
          <FlaggedTransactions 
            transactions={flaggedTransactions} 
            onInvestigate={handleStartInvestigation} 
          />
          {selectedTransaction && (
            <InvestigationGenerator transaction={selectedTransaction} />
          )}
        </TabsContent>
        
        <TabsContent value="investigations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Companies Under Investigation</CardTitle>
              <CardDescription>
                List of companies currently under investigation for compliance issues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Registration Number</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {investigations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4">
                        No active investigations
                      </TableCell>
                    </TableRow>
                  ) : (
                    investigations.map((investigation) => (
                      <TableRow key={investigation.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            {investigation.company}
                          </div>
                        </TableCell>
                        <TableCell>{investigation.companyRegNumber}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {investigation.startDate}
                          </div>
                        </TableCell>
                        <TableCell>
                          {investigation.status === "active" && (
                            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                              Active
                            </Badge>
                          )}
                          {investigation.status === "completed" && (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                              Completed
                            </Badge>
                          )}
                          {investigation.status === "pending" && (
                            <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {investigation.severity === "high" && (
                            <Badge variant="outline" className="border-red-500 text-red-700 bg-red-50">
                              High
                            </Badge>
                          )}
                          {investigation.severity === "medium" && (
                            <Badge variant="outline" className="border-amber-500 text-amber-700 bg-amber-50">
                              Medium
                            </Badge>
                          )}
                          {investigation.severity === "low" && (
                            <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50">
                              Low
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{investigation.assignedTo}</TableCell>
                        <TableCell>{investigation.lastUpdated}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewInvestigation(investigation.id)}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Trends</CardTitle>
              <CardDescription>
                Monthly compliance rates and flagged transaction trends
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 h-[400px]">
              <ComplianceChart 
                data={chartData}
                title="Compliance Performance"
                description="Monthly compliance rates and trends"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Compliance;
