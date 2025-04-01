
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ImportForm from "@/components/data/ImportForm";
import TransactionTable, { Transaction } from "@/components/dashboard/TransactionTable";
import { toast } from "sonner";

const DataImport: React.FC = () => {
  const [importedData, setImportedData] = useState<Transaction[]>([]);

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

      <div className="grid grid-cols-1 gap-6">
        <ImportForm onImportComplete={handleImportComplete} />
        
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
      </div>
    </div>
  );
};

export default DataImport;
