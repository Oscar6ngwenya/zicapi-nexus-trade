
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Database } from "lucide-react";
import CSVImport from "./CSVImport";

interface ImportFormProps {
  onImportComplete: (data: any) => void;
}

const ImportForm: React.FC<ImportFormProps> = ({ onImportComplete }) => {
  const [activeTab, setActiveTab] = useState("customs");
  const [isUploading, setIsUploading] = useState(false);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Import Transaction Data</CardTitle>
        <CardDescription>
          Import and compare data from Customs and Financial Institutions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="customs" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="customs">
              <Database className="h-4 w-4 mr-2" />
              Customs Data
            </TabsTrigger>
            <TabsTrigger value="financial">
              <FileText className="h-4 w-4 mr-2" />
              Financial Institution Data
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="customs" className="space-y-4">
            <CSVImport 
              onImportComplete={(data) => onImportComplete(data.map(item => ({...item, source: "customs"})))}
              isUploading={isUploading}
              setIsUploading={setIsUploading}
              dataSource="customs"
            />
          </TabsContent>
          
          <TabsContent value="financial" className="space-y-4">
            <CSVImport 
              onImportComplete={(data) => onImportComplete(data.map(item => ({...item, source: "financial"})))}
              isUploading={isUploading}
              setIsUploading={setIsUploading}
              dataSource="financial"
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ImportForm;
