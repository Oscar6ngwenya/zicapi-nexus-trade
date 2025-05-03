import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, AlertTriangle, Download } from "lucide-react";
import ComplianceChart from "@/components/analytics/ComplianceChart";
import DataComplianceAnalytics from "@/components/analytics/DataComplianceAnalytics";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Transaction as DashboardTransaction } from "@/components/dashboard/TransactionTable";

// Define a compatible transaction type that matches what's expected in ComplianceAnalysis
type Transaction = {
  id: string;
  entity: string;
  date: string;
  amount: number;
  currency: string;
  type: "import" | "export"; 
  product: string;
  bank: string;
  reason: string;
  severity: "high" | "medium" | "low";
  status?: "pending" | "compliant" | "flagged" | "initiated";
  source?: string;
  flagReason?: string;
};

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
  flaggedTransactions: [
    {
      id: "1",
      entity: "Tech Solutions Inc",
      date: "2023-05-15",
      amount: 85000,
      currency: "USD",
      type: "import" as "import", 
      product: "Computer Equipment",
      bank: "First National Bank",
      reason: "Value discrepancy between customs and financial declaration",
      severity: "high" as "high",
      status: "flagged" as "flagged", // Add proper status
      flagReason: "Value discrepancy between customs and financial declaration"
    },
    {
      id: "2",
      entity: "Global Imports Ltd",
      date: "2023-05-18",
      amount: 45000,
      currency: "EUR",
      type: "import" as "import", 
      product: "Automotive Parts",
      bank: "Commerce Bank",
      reason: "Multiple smaller transactions on the same day totaling EUR 45,000",
      severity: "medium" as "medium",
      status: "flagged" as "flagged", // Add proper status
      flagReason: "Multiple smaller transactions on the same day totaling EUR 45,000"
    }
  ] as Transaction[], // Type assertion to Transaction array
  dataDiscrepancies: [], 
};

const Reports: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("compliance");

  const chartData = {
    barData: mockComplianceAnalysis.complianceByBank,
    pieData: mockComplianceAnalysis.statusDistribution,
    lineData: mockComplianceAnalysis.complianceByType,
  };

  // Export compliance report to Excel
  const exportComplianceReport = () => {
    // Prepare data for export
    const summaryData = [
      { 
        "Metric": "Compliance Rate", 
        "Value": `${mockComplianceAnalysis.complianceRate}%` 
      },
      { 
        "Metric": "Compliant Transactions", 
        "Value": mockComplianceAnalysis.compliantCount 
      },
      { 
        "Metric": "Pending Review", 
        "Value": mockComplianceAnalysis.pendingCount 
      },
      { 
        "Metric": "Flagged Transactions", 
        "Value": mockComplianceAnalysis.flaggedCount 
      },
    ];
    
    const bankComplianceData = mockComplianceAnalysis.complianceByBank.map(item => ({
      "Bank": item.name,
      "Compliance Rate": `${item.compliance}%`
    }));
    
    // Create workbook and worksheets
    const wb = XLSX.utils.book_new();
    
    // Add summary sheet
    const summaryWS = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWS, "Summary");
    
    // Add bank compliance sheet
    const bankWS = XLSX.utils.json_to_sheet(bankComplianceData);
    XLSX.utils.book_append_sheet(wb, bankWS, "Bank Compliance");
    
    // Add flagged transactions if available
    if (mockComplianceAnalysis.flaggedTransactions.length > 0) {
      const flaggedData = mockComplianceAnalysis.flaggedTransactions.map(tx => ({
        "Entity": tx.entity,
        "Date": tx.date,
        "Amount": tx.amount,
        "Currency": tx.currency,
        "Product": tx.product,
        "Bank": tx.bank,
        "Type": tx.type,
        "Reason Flagged": tx.flagReason || tx.reason
      }));
      
      const flaggedWS = XLSX.utils.json_to_sheet(flaggedData);
      XLSX.utils.book_append_sheet(wb, flaggedWS, "Flagged Transactions");
    }
    
    // Generate filename with current date
    const filename = `compliance-report-${format(new Date(), "yyyy-MM-dd")}.xlsx`;
    
    // Export file
    XLSX.writeFile(wb, filename);
    
    toast.success("Compliance report exported successfully");
  };

  // Export transaction summary to Excel
  const exportTransactionSummary = () => {
    // Create sample transaction data for the summary
    const transactionData = [
      { type: "Import", count: 125, totalValue: 3450000, currency: "USD", avgValue: 27600 },
      { type: "Export", count: 93, totalValue: 2875000, currency: "USD", avgValue: 30914 },
      { type: "Local", count: 42, totalValue: 950000, currency: "USD", avgValue: 22619 }
    ];
    
    const bankData = [
      { bank: "First National Bank", count: 87, totalValue: 2350000, currency: "USD" },
      { bank: "Commerce Bank", count: 64, totalValue: 1875000, currency: "USD" },
      { bank: "Merchant Bank", count: 53, totalValue: 1450000, currency: "USD" },
      { bank: "Other Banks", count: 56, totalValue: 1600000, currency: "USD" }
    ];
    
    const summarySheet = transactionData.map(item => ({
      "Transaction Type": item.type,
      "Count": item.count,
      "Total Value": new Intl.NumberFormat('en-US', { style: 'currency', currency: item.currency }).format(item.totalValue),
      "Average Value": new Intl.NumberFormat('en-US', { style: 'currency', currency: item.currency }).format(item.avgValue)
    }));
    
    const bankSheet = bankData.map(item => ({
      "Bank": item.bank,
      "Transaction Count": item.count,
      "Total Value": new Intl.NumberFormat('en-US', { style: 'currency', currency: item.currency }).format(item.totalValue)
    }));
    
    // Create workbook and worksheets
    const wb = XLSX.utils.book_new();
    
    const transactionWS = XLSX.utils.json_to_sheet(summarySheet);
    XLSX.utils.book_append_sheet(wb, transactionWS, "Transaction Summary");
    
    const bankWS = XLSX.utils.json_to_sheet(bankSheet);
    XLSX.utils.book_append_sheet(wb, bankWS, "Bank Summary");
    
    // Generate filename with current date
    const filename = `transaction-summary-${format(new Date(), "yyyy-MM-dd")}.xlsx`;
    
    // Export file
    XLSX.writeFile(wb, filename);
    
    toast.success("Transaction summary exported successfully");
  };

  // Export flagged transactions to PDF
  const exportFlaggedTransactions = () => {
    if (mockComplianceAnalysis.flaggedTransactions.length === 0) {
      toast.error("No flagged transactions to export");
      return;
    }
    
    // Create new PDF document
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text("Flagged Transactions Report", 14, 22);
    
    // Add report date
    doc.setFontSize(11);
    doc.text(`Generated on: ${format(new Date(), "yyyy-MM-dd HH:mm")}`, 14, 30);
    
    // Prepare data for table
    const tableData = mockComplianceAnalysis.flaggedTransactions.map(tx => [
      tx.entity,
      tx.date,
      new Intl.NumberFormat('en-US', { style: 'currency', currency: tx.currency }).format(tx.amount),
      tx.product,
      tx.bank,
      tx.type,
      tx.flagReason || tx.reason
    ]);
    
    // Add table to document
    autoTable(doc, {
      startY: 40,
      head: [['Entity', 'Date', 'Amount', 'Product', 'Bank', 'Type', 'Reason']],
      body: tableData,
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 30 },
        6: { cellWidth: 40 }
      }
    });
    
    // Add summary at the bottom
    const finalY = (doc as any).lastAutoTable.finalY || 150;
    doc.text(`Total Flagged Transactions: ${mockComplianceAnalysis.flaggedTransactions.length}`, 14, finalY + 10);
    doc.text(`System Compliance Rate: ${mockComplianceAnalysis.complianceRate}%`, 14, finalY + 18);
    
    // Save PDF
    doc.save(`flagged-transactions-${format(new Date(), "yyyy-MM-dd")}.pdf`);
    
    toast.success("Flagged transactions exported to PDF");
  };

  // Export compliance trend report
  const exportComplianceTrendReport = () => {
    // Create sample monthly trend data
    const trendData = [
      { month: "January", complianceRate: 75, flaggedCount: 15, totalTransactions: 120 },
      { month: "February", complianceRate: 78, flaggedCount: 12, totalTransactions: 110 },
      { month: "March", complianceRate: 82, flaggedCount: 10, totalTransactions: 115 },
      { month: "April", complianceRate: 80, flaggedCount: 11, totalTransactions: 105 },
      { month: "May", complianceRate: 84, flaggedCount: 9, totalTransactions: 112 },
      { month: "June", complianceRate: 85, flaggedCount: 10, totalTransactions: 125 }
    ];
    
    // Create workbook and worksheets
    const wb = XLSX.utils.book_new();
    
    // Trend data sheet
    const trendSheet = trendData.map(item => ({
      "Month": item.month,
      "Compliance Rate": `${item.complianceRate}%`,
      "Flagged Transactions": item.flaggedCount,
      "Total Transactions": item.totalTransactions
    }));
    
    const trendWS = XLSX.utils.json_to_sheet(trendSheet);
    XLSX.utils.book_append_sheet(wb, trendWS, "Compliance Trends");
    
    // Summary statistics
    const averageCompliance = trendData.reduce((sum, item) => sum + item.complianceRate, 0) / trendData.length;
    const totalFlagged = trendData.reduce((sum, item) => sum + item.flaggedCount, 0);
    const totalTransactions = trendData.reduce((sum, item) => sum + item.totalTransactions, 0);
    
    const summaryData = [
      { "Metric": "Average Compliance Rate", "Value": `${averageCompliance.toFixed(1)}%` },
      { "Metric": "Total Flagged Transactions", "Value": totalFlagged },
      { "Metric": "Total Transactions", "Value": totalTransactions },
      { "Metric": "Report Period", "Value": `${trendData[0].month} - ${trendData[trendData.length - 1].month}` }
    ];
    
    const summaryWS = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWS, "Summary");
    
    // Generate filename with current date
    const filename = `compliance-trend-report-${format(new Date(), "yyyy-MM-dd")}.xlsx`;
    
    // Export file
    XLSX.writeFile(wb, filename);
    
    toast.success("Compliance trend report exported successfully");
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
                <Button 
                  variant="outline" 
                  onClick={exportComplianceReport}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export Compliance Report
                </Button>
                <Button 
                  variant="outline" 
                  onClick={exportTransactionSummary}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export Transaction Summary
                </Button>
                <Button 
                  variant="outline" 
                  onClick={exportFlaggedTransactions}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export Flagged Transactions
                </Button>
                <Button 
                  variant="outline" 
                  onClick={exportComplianceTrendReport}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
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
