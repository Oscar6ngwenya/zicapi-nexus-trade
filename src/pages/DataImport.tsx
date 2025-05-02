
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ImportForm from "@/components/data/ImportForm";
import TransactionTable, { Transaction } from "@/components/dashboard/TransactionTable";
import DataComplianceAnalytics from "@/components/analytics/DataComplianceAnalytics";
import { 
  analyzeCompliance, 
  compareTransactionData, 
  formatDiscrepanciesForExport,
  DataDiscrepancy 
} from "@/services/analyticsService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";
import { createAuditLog, AuditActions, AuditModules } from "@/services/auditService";

const DataImport: React.FC = () => {
  const [customsData, setCustomsData] = useState<Transaction[]>([]);
  const [financialData, setFinancialData] = useState<Transaction[]>([]);
  const [comparisonResults, setComparisonResults] = useState(analyzeCompliance([]));
  const [activeTab, setActiveTab] = useState("import");
  const [userRole, setUserRole] = useState<string>("regulator");
  const [userName, setUserName] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [discrepancies, setDiscrepancies] = useState<DataDiscrepancy[]>([]);

  // Get user info from localStorage if available
  useEffect(() => {
    const storedUser = localStorage.getItem("zicapi-user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserRole(user.role);
      setUserName(user.username);
      setUserId(user.id);
    }
  }, []);

  // Update comparison analysis whenever either data source changes
  useEffect(() => {
    if (customsData.length > 0 || financialData.length > 0) {
      console.log("Analyzing data - Customs:", customsData.length, "Financial:", financialData.length);
      
      // Merge data for compliance analysis
      const allData = [...customsData, ...financialData];
      const analysis = analyzeCompliance(allData);
      setComparisonResults(analysis);
      
      // Get detailed discrepancies with enhanced matching
      if (customsData.length > 0 && financialData.length > 0) {
        const detailedDiscrepancies = compareTransactionData(allData);
        setDiscrepancies(detailedDiscrepancies);
        
        // Switch to analytics tab after import if we have enough data to compare
        console.log("Both data sources available, showing comparison");
        setActiveTab("analytics");
        
        // Show detailed summary of the comparison
        const discrepancyCount = detailedDiscrepancies.length || 0;
        
        if (discrepancyCount > 0) {
          toast.warning(
            `Data comparison complete: ${discrepancyCount} discrepancies found!`,
            {
              description: `Compliance rate: ${analysis.complianceRate.toFixed(1)}%. Review the discrepancies in the Analytics tab.`,
            }
          );
          
          // Log this event to audit trail
          if (userId) {
            createAuditLog(
              userId,
              userName,
              userRole,
              "Data Discrepancies Detected",
              AuditModules.DATA_IMPORT,
              `${discrepancyCount} data discrepancies found with compliance rate of ${analysis.complianceRate.toFixed(1)}%`
            );
          }
        } else {
          toast.info(
            `Data comparison complete: ${analysis.complianceRate.toFixed(1)}% match rate`,
            {
              description: `No discrepancies found between customs and financial data`,
            }
          );
          
          // Log this event to audit trail
          if (userId) {
            createAuditLog(
              userId,
              userName,
              userRole,
              "Data Match Confirmed",
              AuditModules.DATA_IMPORT,
              `No discrepancies found, 100% compliance rate between customs and financial data`
            );
          }
        }
      }
    }
  }, [customsData, financialData, userId, userName, userRole]);

  const handleImportComplete = (data: Transaction[]) => {
    console.log("Import complete, received data:", data);
    
    // Determine which data source to update based on the source field
    if (data[0]?.source === "customs") {
      setCustomsData(prevData => [...data, ...prevData]);
      toast.success("Customs data imported", {
        description: `${data.length} customs records added to the system`,
      });
      
      // Log this event to audit trail
      if (userId) {
        createAuditLog(
          userId,
          userName,
          userRole,
          AuditActions.DATA_IMPORT,
          AuditModules.DATA_IMPORT,
          `Imported ${data.length} customs transactions`
        );
      }
    } else {
      setFinancialData(prevData => [...data, ...prevData]);
      toast.success("Financial institution data imported", {
        description: `${data.length} financial records added to the system`,
      });
      
      // Log this event to audit trail
      if (userId) {
        createAuditLog(
          userId,
          userName,
          userRole,
          AuditActions.DATA_IMPORT,
          AuditModules.DATA_IMPORT,
          `Imported ${data.length} financial transactions`
        );
      }
    }
  };

  const handleViewDetails = (id: string) => {
    toast.info(`Viewing details for transaction ${id}`);
    // In a real application, navigate to detail page
    
    // Log this event to audit trail
    if (userId) {
      createAuditLog(
        userId,
        userName,
        userRole,
        AuditActions.DATA_VIEW,
        AuditModules.DATA_IMPORT,
        `Viewed transaction details for ID: ${id}`
      );
    }
  };

  // Handle discrepancy update from reconciliation interface
  const handleDiscrepancyUpdate = (updatedDiscrepancy: DataDiscrepancy) => {
    // Update the discrepancies state with the updated item
    const updatedDiscrepancies = discrepancies.map(d => 
      (d.customsTransaction?.id === updatedDiscrepancy.customsTransaction?.id && 
       d.financialTransaction?.id === updatedDiscrepancy.financialTransaction?.id)
        ? updatedDiscrepancy
        : d
    );
    
    setDiscrepancies(updatedDiscrepancies);
    
    // Update the comparisonResults state to include the updated discrepancies
    setComparisonResults(prev => ({
      ...prev,
      dataDiscrepancies: updatedDiscrepancies
    }));
    
    // Log this event to audit trail
    if (userId) {
      createAuditLog(
        userId,
        userName,
        userRole,
        AuditActions.DATA_UPDATE,
        AuditModules.DATA_IMPORT,
        `Updated discrepancy resolution status to '${updatedDiscrepancy.resolutionStatus}' for ${updatedDiscrepancy.customsTransaction?.entity || updatedDiscrepancy.financialTransaction?.entity}`
      );
    }
  };

  const exportVarianceReport = () => {
    if (!discrepancies || discrepancies.length === 0) {
      toast.error("No discrepancies to export");
      return;
    }

    // Format data for export using the utility function
    const exportData = formatDiscrepanciesForExport(discrepancies);

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Variance Report");

    // Generate download
    const filename = `data-variance-report-${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, filename);
    
    toast.success("Variance report exported successfully");
    
    // Log this event to audit trail
    if (userId) {
      createAuditLog(
        userId,
        userName,
        userRole,
        AuditActions.DATA_EXPORT,
        AuditModules.DATA_IMPORT,
        `Exported variance report with ${discrepancies.length} discrepancies to file: ${filename}`
      );
    }
  };
  
  // Force comparison reanalysis
  const reanalyzeData = () => {
    if (customsData.length === 0 || financialData.length === 0) {
      toast.error("Cannot reanalyze - need both customs and financial data");
      return;
    }
    
    toast.info("Reanalyzing data...");
    
    // Re-run the analysis with fresh data
    const allData = [...customsData, ...financialData];
    const analysis = analyzeCompliance(allData);
    const detailedDiscrepancies = compareTransactionData(allData);
    
    setComparisonResults(analysis);
    setDiscrepancies(detailedDiscrepancies);
    
    const discrepancyCount = detailedDiscrepancies.length;
    toast.success(
      `Data reanalysis complete: ${discrepancyCount} discrepancies found`,
      {
        description: `Compliance rate: ${analysis.complianceRate.toFixed(1)}%`,
      }
    );
    
    // Log this event to audit trail
    if (userId) {
      createAuditLog(
        userId,
        userName,
        userRole,
        "Data Reanalysis",
        AuditModules.DATA_IMPORT,
        `Manually triggered reanalysis of ${allData.length} transactions, found ${discrepancyCount} discrepancies`
      );
    }
  };

  // Set up comparisonResults with discrepancies
  useEffect(() => {
    if (discrepancies.length > 0) {
      setComparisonResults(prev => ({
        ...prev,
        dataDiscrepancies: discrepancies
      }));
    }
  }, [discrepancies]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-zicapi-primary">Data Import & Comparison</h1>
          <p className="text-muted-foreground">
            Import transaction data from customs and financial institutions for capital flight monitoring
          </p>
        </div>
        
        <div className="flex gap-2">
          {(customsData.length > 0 && financialData.length > 0) && (
            <Button variant="outline" onClick={reanalyzeData} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Reanalyze Data
            </Button>
          )}
          
          {discrepancies.length > 0 && (
            <Button variant="outline" onClick={exportVarianceReport} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Variance Report
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="import">Import Data</TabsTrigger>
          <TabsTrigger value="analytics" disabled={customsData.length === 0 && financialData.length === 0}>
            Data Comparison
          </TabsTrigger>
          <TabsTrigger value="customs" disabled={customsData.length === 0}>
            Customs Data ({customsData.length})
          </TabsTrigger>
          <TabsTrigger value="financial" disabled={financialData.length === 0}>
            Financial Data ({financialData.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="import">
          <ImportForm onImportComplete={handleImportComplete} />
          
          {customsData.length > 0 && financialData.length === 0 && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Customs data imported</AlertTitle>
              <AlertDescription>
                Please import financial institution data to enable cross-comparison.
              </AlertDescription>
            </Alert>
          )}
          
          {financialData.length > 0 && customsData.length === 0 && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Financial data imported</AlertTitle>
              <AlertDescription>
                Please import customs data to enable cross-comparison.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
        
        <TabsContent value="analytics">
          {(customsData.length > 0 || financialData.length > 0) && (
            <DataComplianceAnalytics 
              analysis={{
                ...comparisonResults,
                dataDiscrepancies: discrepancies
              }} 
              userRole={userRole}
              onDiscrepancyUpdate={handleDiscrepancyUpdate}
            />
          )}
        </TabsContent>
        
        <TabsContent value="customs">
          {customsData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Customs Department Data</CardTitle>
                <CardDescription>
                  Transaction data reported by customs authorities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionTable
                  transactions={customsData}
                  title=""
                  onViewDetails={handleViewDetails}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="financial">
          {financialData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Financial Institution Data</CardTitle>
                <CardDescription>
                  Transaction data reported by financial institutions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionTable
                  transactions={financialData}
                  title=""
                  onViewDetails={handleViewDetails}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataImport;
