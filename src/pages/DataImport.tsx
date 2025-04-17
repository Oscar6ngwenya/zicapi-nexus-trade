import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ImportForm from "@/components/data/ImportForm";
import TransactionTable, { Transaction } from "@/components/dashboard/TransactionTable";
import DataComplianceAnalytics from "@/components/analytics/DataComplianceAnalytics";
import { analyzeCompliance, compareTransactionData } from "@/services/analyticsService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const DataImport: React.FC = () => {
  const [customsData, setCustomsData] = useState<Transaction[]>([]);
  const [financialData, setFinancialData] = useState<Transaction[]>([]);
  const [comparisonResults, setComparisonResults] = useState(analyzeCompliance([]));
  const [activeTab, setActiveTab] = useState("import");

  // Update comparison analysis whenever either data source changes
  useEffect(() => {
    if (customsData.length > 0 || financialData.length > 0) {
      // Merge data for comparison
      const allData = [...customsData, ...financialData];
      const analysis = analyzeCompliance(allData);
      setComparisonResults(analysis);
      
      // Switch to analytics tab after import if we have enough data to compare
      if (customsData.length > 0 && financialData.length > 0) {
        setActiveTab("analytics");
        
        // Show compliance summary toast
        toast.info(
          `Data comparison complete: ${analysis.complianceRate.toFixed(1)}% match rate`,
          {
            description: `${analysis.dataDiscrepancies?.length || 0} discrepancies found between customs and financial data`,
          }
        );
      }
    }
  }, [customsData, financialData]);

  const handleImportComplete = (data: Transaction[]) => {
    // Determine which data source to update based on the source field
    if (data[0]?.source === "customs") {
      setCustomsData(prevData => [...data, ...prevData]);
      toast.success("Customs data imported", {
        description: `${data.length} customs records added to the system`,
      });
    } else {
      setFinancialData(prevData => [...data, ...prevData]);
      toast.success("Financial institution data imported", {
        description: `${data.length} financial records added to the system`,
      });
    }
  };

  const handleViewDetails = (id: string) => {
    toast.info(`Viewing details for transaction ${id}`);
    // In a real application, navigate to detail page
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zicapi-primary">Data Import & Comparison</h1>
        <p className="text-muted-foreground">
          Import transaction data from customs and financial institutions for capital flight monitoring
        </p>
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
            <DataComplianceAnalytics analysis={comparisonResults} />
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
