
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart4, FileText, AlertTriangle } from "lucide-react";
import ComplianceChart from "@/components/analytics/ComplianceChart";
import DataComplianceAnalytics from "@/components/analytics/DataComplianceAnalytics";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

// Mock data - ideally replace with actual data fetching logic
const mockComplianceAnalysis = {
  compliantCount: 72,
  pendingCount: 18,
  flaggedCount: 10,
  complianceRate: 85,
  complianceByBank: [
    { name: "Bank A", compliance: 78 },
    { name: "Bank B", compliance: 92 },
    { name: "Bank C", compliance: 85 },
  ],
  statusDistribution: [
    { name: "Compliant", value: 72, color: "#2ecc71" },
    { name: "Pending", value: 18, color: "#f39c12" },
    { name: "Flagged", value: 10, color: "#e74c3c" },
  ],
  complianceByType: [
    { name: "Q1", compliance: 65 },
    { name: "Q2", compliance: 68 },
    { name: "Q3", compliance: 72 },
    { name: "Q4", compliance: 85 },
  ],
  flaggedTransactions: [], // Add mock flagged transactions if needed
  dataDiscrepancies: [], // Add mock data discrepancies if needed
};

const Reports: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("compliance");

  const chartData = {
    barData: mockComplianceAnalysis.complianceByBank,
    pieData: mockComplianceAnalysis.statusDistribution,
    lineData: mockComplianceAnalysis.complianceByType,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zicapi-primary">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into transaction compliance and performance
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="compliance">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Compliance Analytics
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileText className="h-4 w-4 mr-2" />
            Transaction Reports
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="compliance" className="space-y-4">
          <DataComplianceAnalytics analysis={mockComplianceAnalysis} />
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Reports</CardTitle>
              <CardDescription>
                Generate and download comprehensive transaction reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline">
                  Export Compliance Report
                </Button>
                <Button variant="outline">
                  Export Transaction Summary
                </Button>
                <Button variant="outline">
                  Export Flagged Transactions
                </Button>
                <Button variant="outline">
                  Export Compliance Trend Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
