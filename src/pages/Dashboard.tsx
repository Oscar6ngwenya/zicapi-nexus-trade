
import React, { useState } from "react";
import StatCard from "@/components/dashboard/StatCard";
import TransactionTable, { Transaction } from "@/components/dashboard/TransactionTable";
import ComplianceChart from "@/components/analytics/ComplianceChart";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowUpDown, BarChart4, Check, Clock, DollarSign, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Mock data for demo purposes
  const recentTransactions: Transaction[] = [
    {
      id: "1",
      date: "2023-05-01",
      entity: "Global Imports Ltd",
      type: "import",
      currency: "USD",
      amount: 25000,
      product: "Industrial machinery - Heavy equipment for mining operations",
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
      product: "Computer equipment - Servers and networking hardware",
      status: "compliant",
      bank: "Commerce Bank",
    },
    {
      id: "3",
      date: "2023-05-10",
      entity: "Agro Exports Co",
      type: "export",
      currency: "USD",
      amount: 35000,
      product: "Agricultural produce - Organic coffee beans",
      status: "flagged",
      bank: "First National Bank",
    },
    {
      id: "4",
      date: "2023-05-15",
      entity: "Pharma Global",
      type: "import",
      currency: "CHF",
      amount: 42000,
      product: "Pharmaceutical ingredients - Raw materials for medicine production",
      status: "compliant",
      bank: "Central Bank",
    },
    {
      id: "5",
      date: "2023-05-18",
      entity: "Auto Parts Ltd",
      type: "export",
      currency: "USD",
      amount: 18500,
      product: "Automotive components - Engine parts and accessories",
      status: "pending",
      bank: "Commerce Bank",
    },
  ];

  // Mock compliance chart data
  const complianceChartData = {
    barData: [
      { name: "Imports", compliance: 78 },
      { name: "Exports", compliance: 85 },
      { name: "Bank Transfers", compliance: 92 },
      { name: "Customs Declarations", compliance: 81 },
    ],
    pieData: [
      { name: "Compliant", value: 72, color: "#2ecc71" },
      { name: "Pending", value: 18, color: "#f39c12" },
      { name: "Flagged", value: 10, color: "#e74c3c" },
    ],
    lineData: [
      { name: "Jan", compliance: 65 },
      { name: "Feb", compliance: 68 },
      { name: "Mar", compliance: 72 },
      { name: "Apr", compliance: 75 },
      { name: "May", compliance: 82 },
      { name: "Jun", compliance: 78 },
    ],
  };

  // Mock transaction statistics
  const stats = {
    totalValue: "$2.45M",
    totalCount: "156",
    pendingExtensions: "12",
    complianceRate: "85%",
    flaggedTransactions: "7",
    pendingAcquittals: "18",
  };

  // View transaction details (just a demo action)
  const handleViewDetails = (id: string) => {
    toast.info(`Viewing details for transaction ${id}`);
    // In a real application, you would navigate to a details page
    // navigate(`/transactions/${id}`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zicapi-primary">Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor foreign exchange transactions and compliance metrics
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => navigate("/data-import")}
          >
            <FileText className="h-4 w-4 mr-2" />
            Import Data
          </Button>
          <Button
            onClick={() => navigate("/reports")}
          >
            <BarChart4 className="h-4 w-4 mr-2" />
            View Reports
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              title="Total Transaction Value"
              value={stats.totalValue}
              icon={<DollarSign />}
              trend="up"
              trendValue="↑ 12% from last month"
            />
            <StatCard
              title="Total Transactions"
              value={stats.totalCount}
              icon={<ArrowUpDown />}
              trend="up"
              trendValue="↑ 8% from last month"
            />
            <StatCard
              title="Compliance Rate"
              value={stats.complianceRate}
              icon={<Check />}
              trend="up"
              trendValue="↑ 5% from last month"
            />
            <StatCard
              title="Pending Extensions"
              value={stats.pendingExtensions}
              icon={<Clock />}
              trend="down"
              trendValue="↓ 3% from last month"
            />
            <StatCard
              title="Pending Acquittals"
              value={stats.pendingAcquittals}
              icon={<FileText />}
              trend="neutral"
              trendValue="No change from last month"
            />
            <StatCard
              title="Flagged Transactions"
              value={stats.flaggedTransactions}
              icon={<AlertTriangle />}
              trend="down"
              trendValue="↓ 2% from last month"
              className="border-amber-200 bg-amber-50"
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>
                  Latest foreign exchange transactions in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionTable
                  transactions={recentTransactions.slice(0, 3)}
                  title=""
                  onViewDetails={handleViewDetails}
                />
                <div className="mt-4 flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("transactions")}
                  >
                    View All Transactions
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <ComplianceChart
              data={complianceChartData}
              title="Compliance Overview"
              description="Percentage of transactions meeting regulatory requirements"
            />
          </div>
        </TabsContent>
        
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Monitor foreign exchange transactions and their statuses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionTable
                transactions={recentTransactions}
                title=""
                onViewDetails={handleViewDetails}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="compliance">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ComplianceChart
              data={complianceChartData}
              title="Compliance by Category"
              description="Breakdown of compliance rates by transaction categories"
            />
            
            <Card>
              <CardHeader>
                <CardTitle>Compliance Status Distribution</CardTitle>
                <CardDescription>
                  Current distribution of transaction compliance statuses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {/* You could add another visualization here */}
                  <ComplianceChart
                    data={{
                      barData: [
                        { name: "Q1", compliance: 70 },
                        { name: "Q2", compliance: 75 },
                        { name: "Q3", compliance: 82 },
                        { name: "Q4", compliance: 85 },
                      ],
                      pieData: complianceChartData.pieData,
                      lineData: complianceChartData.lineData,
                    }}
                    title=""
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
