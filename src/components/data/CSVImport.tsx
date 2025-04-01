
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileUp, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface CSVImportProps {
  onImportComplete: (data: any) => void;
  isUploading: boolean;
  setIsUploading: React.Dispatch<React.SetStateAction<boolean>>;
}

const CSVImport: React.FC<CSVImportProps> = ({ 
  onImportComplete, 
  isUploading, 
  setIsUploading 
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [hasError, setHasError] = useState(false);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check file type
      if (!selectedFile.name.endsWith(".csv") && !selectedFile.name.endsWith(".xlsx")) {
        toast.error("Invalid file type", {
          description: "Please upload a CSV or Excel file",
        });
        setFile(null);
        setHasError(true);
        return;
      }
      
      setFile(selectedFile);
      setHasError(false);
    }
  };

  // Handle CSV file upload
  const handleCsvUpload = () => {
    if (!file) {
      toast.error("No file selected", {
        description: "Please select a file to upload",
      });
      return;
    }

    setIsUploading(true);

    // Simulate file processing
    setTimeout(() => {
      // Mock successful import
      const mockImportedData = [
        {
          id: "1",
          date: "2023-05-01",
          entity: "Global Imports Ltd",
          type: "import",
          currency: "USD",
          amount: 25000,
          product: "Industrial machinery",
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
          product: "Computer equipment",
          status: "pending",
          bank: "Commerce Bank",
        },
        {
          id: "3",
          date: "2023-05-10",
          entity: "Agro Exports Co",
          type: "export",
          currency: "USD",
          amount: 35000,
          product: "Agricultural produce",
          status: "pending",
          bank: "First National Bank",
        },
      ];

      setIsUploading(false);
      toast.success("Data imported successfully", {
        description: `${mockImportedData.length} records imported from ${file.name}`,
      });
      
      onImportComplete(mockImportedData);
      setFile(null);
    }, 2000);
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 bg-muted/50">
        <FileUp className="h-10 w-10 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground mb-2">
          Drag and drop your CSV file here, or click to browse
        </p>
        <Input
          type="file"
          accept=".csv,.xlsx"
          className="max-w-sm"
          onChange={handleFileChange}
        />
        {file && !hasError && (
          <p className="text-sm font-medium mt-2">
            Selected file: {file.name}
          </p>
        )}
      </div>
      
      {hasError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Invalid file format. Please upload a CSV or Excel file with the correct format.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex justify-end">
        <Button 
          type="button" 
          onClick={handleCsvUpload} 
          disabled={!file || isUploading || hasError}
        >
          {isUploading ? "Importing..." : "Import Data"}
        </Button>
      </div>
    </>
  );
};

export default CSVImport;
