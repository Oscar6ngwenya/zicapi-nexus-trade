
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Plus } from "lucide-react";
import CSVImport from "./CSVImport";
import ManualEntryForm from "./ManualEntryForm";

interface ImportFormProps {
  onImportComplete: (data: any) => void;
}

const ImportForm: React.FC<ImportFormProps> = ({ onImportComplete }) => {
  const [activeTab, setActiveTab] = useState("csv");
  const [isUploading, setIsUploading] = useState(false);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Import Transaction Data</CardTitle>
        <CardDescription>
          Import foreign exchange transaction data via CSV or manual entry
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="csv" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="csv">
              <FileText className="h-4 w-4 mr-2" />
              CSV Import
            </TabsTrigger>
            <TabsTrigger value="manual">
              <Plus className="h-4 w-4 mr-2" />
              Manual Entry
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="csv" className="space-y-4">
            <CSVImport 
              onImportComplete={onImportComplete} 
              isUploading={isUploading}
              setIsUploading={setIsUploading}
            />
          </TabsContent>
          
          <TabsContent value="manual">
            <ManualEntryForm 
              onImportComplete={onImportComplete}
              isUploading={isUploading}
              setIsUploading={setIsUploading}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ImportForm;
