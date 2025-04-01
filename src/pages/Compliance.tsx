
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FlaggedTransactions, { FlaggedTransaction } from "@/components/compliance/FlaggedTransactions";
import ComplianceChart from "@/components/analytics/ComplianceChart";
import { AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";

const Compliance: React.FC = () => {
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

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zicapi-primary">Compliance Monitoring</h1>
        <p className="text-muted-foreground">
          Monitor and enforce compliance for foreign exchange transactions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <TabsTrigger value="analytics">Compliance Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="flagged" className="space-y-4">
          <FlaggedTransactions transactions={flaggedTransactions} />
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
