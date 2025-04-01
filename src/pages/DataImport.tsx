
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ImportForm from "@/components/data/ImportForm";
import TransactionTable, { Transaction } from "@/components/dashboard/TransactionTable";
import DataComplianceAnalytics from "@/components/analytics/DataComplianceAnalytics";
import { analyzeCompliance } from "@/services/analyticsService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const DataImport: React.FC = () => {
  const [importedData, setImportedData] = useState<Transaction[]>([]);
  const [complianceAnalysis, setComplianceAnalysis] = useState(analyzeCompliance([]));
  const [activeTab, setActiveTab] = useState("import");

  // Update compliance analysis whenever imported data changes
  useEffect(() => {
    if (importedData.length > 0) {
      const analysis = analyzeCompliance(importedData);
      setComplianceAnalysis(analysis);
      
      // Switch to analytics tab after import
      setActiveTab("analytics");
      
      // Show compliance summary toast
      toast.info(
        `Compliance analysis: ${analysis.complianceRate.toFixed(1)}% compliant`,
        {
          description: `${analysis.compliantCount} compliant, ${analysis.pendingCount} pending, ${analysis.flaggedCount} flagged`,
        }
      );
    }
  }, [importedData]);

  const handleImportComplete = (data: Transaction[]) => {
    setImportedData((prevData) => [...data, ...prevData]);
  };

  const handleViewDetails = (id: string) => {
    toast.info(`Viewing details for transaction ${id}`);
    // In a real application, navigate to detail page
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zicapi-primary">Data Import</h1>
        <p className="text-muted-foreground">
          Import foreign exchange transaction data into the system
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="import">Import Data</TabsTrigger>
          <TabsTrigger value="analytics" disabled={importedData.length === 0}>
            Compliance Analytics
          </TabsTrigger>
          <TabsTrigger value="transactions" disabled={importedData.length === 0}>
            Imported Transactions
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="import">
          <ImportForm onImportComplete={handleImportComplete} />
        </TabsContent>
        
        <TabsContent value="analytics">
          {importedData.length > 0 && <DataComplianceAnalytics analysis={complianceAnalysis} />}
        </TabsContent>
        
        <TabsContent value="transactions">
          {importedData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Imported Transactions</CardTitle>
                <CardDescription>
                  Recently imported transactions that need processing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionTable
                  transactions={importedData}
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
