
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileUp, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { Transaction } from "@/components/dashboard/TransactionTable";

interface CSVImportProps {
  onImportComplete: (data: any) => void;
  isUploading: boolean;
  setIsUploading: React.Dispatch<React.SetStateAction<boolean>>;
  dataSource: "customs" | "financial";
}

const CSVImport: React.FC<CSVImportProps> = ({ 
  onImportComplete, 
  isUploading, 
  setIsUploading,
  dataSource
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

  // Parse CSV/Excel file and extract data
  const parseFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const parsedData = XLSX.utils.sheet_to_json(worksheet);
          
          resolve(parsedData);
        } catch (err) {
          console.error("Error parsing file:", err);
          reject(err);
        }
      };
      
      reader.onerror = (err) => {
        console.error("Error reading file:", err);
        reject(err);
      };
      
      reader.readAsBinaryString(file);
    });
  };

  // Convert parsed data to our Transaction format
  const convertToTransactions = (parsedData: any[]): Transaction[] => {
    return parsedData.map((row, index) => {
      // Try to extract fields from the CSV data
      // This mapping may need to be adjusted based on your actual CSV column headers
      return {
        id: `${dataSource}-${Date.now()}-${index}`,
        date: row.Date || row.date || new Date().toISOString().split('T')[0],
        entity: row.Entity || row.entity || row.ENTITY || row.Organization || row.company || "Unknown",
        type: (row.Type || row.type || "import").toLowerCase(),
        currency: row.Currency || row.currency || "USD",
        amount: Number(row.Amount || row.amount || row.AMOUNT || row.Value || row.value || 0),
        quantity: Number(row.Quantity || row.quantity || row.QUANTITY || 1),
        unitPrice: Number(row.UnitPrice || row["Unit Price"] || row.unitPrice || row["Unit_Price"] || 0),
        product: row.Product || row.product || row.PRODUCT || row.Description || row.description || "Unknown",
        status: "pending",
        bank: row.Bank || row.bank || row.Institution || row.institution || "Unknown",
        source: dataSource,
        facilitator: dataSource === "customs" ? "Customs Department" : row.Bank || row.bank || row.Institution || "Unknown Financial Institution"
      };
    });
  };

  // Handle CSV file upload
  const handleCsvUpload = async () => {
    if (!file) {
      toast.error("No file selected", {
        description: "Please select a file to upload",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Parse the file
      const parsedData = await parseFile(file);
      
      if (parsedData.length === 0) {
        throw new Error("No data found in the file");
      }
      
      console.log("Parsed data:", parsedData);
      
      // Convert to our Transaction format
      const transactions = convertToTransactions(parsedData);
      
      console.log("Converted transactions:", transactions);
      
      toast.success("Data imported successfully", {
        description: `${transactions.length} records imported from ${file.name}`,
      });
      
      onImportComplete(transactions);
      setFile(null);
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("Error processing file", {
        description: "Please ensure the file format is correct",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const sourceLabel = dataSource === "customs" ? "Customs" : "Financial Institution";

  return (
    <>
      <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 bg-muted/50">
        <FileUp className="h-10 w-10 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground mb-2">
          Upload {sourceLabel} data in CSV or Excel format
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
          {isUploading ? "Importing..." : `Import ${sourceLabel} Data`}
        </Button>
      </div>
    </>
  );
};

export default CSVImport;
