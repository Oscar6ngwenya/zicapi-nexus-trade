
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUp, FileText, Plus, AlertCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

interface ImportFormProps {
  onImportComplete: (data: any) => void;
}

const ImportForm: React.FC<ImportFormProps> = ({ onImportComplete }) => {
  const [activeTab, setActiveTab] = useState("csv");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [manualEntries, setManualEntries] = useState([
    {
      date: "",
      entity: "",
      currency: "USD",
      bank: "",
      description: "",
      quantity: "",
      unitPrice: "",
      totalPrice: "",
    },
  ]);

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

  // Handle manual form submission
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const isValid = manualEntries.every(
      (entry) =>
        entry.date &&
        entry.entity &&
        entry.currency &&
        entry.bank &&
        entry.description &&
        entry.totalPrice
    );

    if (!isValid) {
      toast.error("Incomplete form", {
        description: "Please fill in all required fields",
      });
      return;
    }

    setIsUploading(true);

    // Simulate processing
    setTimeout(() => {
      const processedEntries = manualEntries.map((entry, index) => ({
        id: `manual-${Date.now()}-${index}`,
        date: entry.date,
        entity: entry.entity,
        type: "import", // Default as import, can be modified in a real app
        currency: entry.currency,
        amount: parseFloat(entry.totalPrice),
        product: entry.description,
        status: "pending",
        bank: entry.bank,
      }));

      setIsUploading(false);
      toast.success("Data added successfully", {
        description: `${processedEntries.length} records added manually`,
      });
      
      onImportComplete(processedEntries);
      
      // Reset form
      setManualEntries([
        {
          date: "",
          entity: "",
          currency: "USD",
          bank: "",
          description: "",
          quantity: "",
          unitPrice: "",
          totalPrice: "",
        },
      ]);
    }, 1500);
  };

  // Handle adding a new manual entry row
  const handleAddManualEntry = () => {
    setManualEntries([
      ...manualEntries,
      {
        date: "",
        entity: "",
        currency: "USD",
        bank: "",
        description: "",
        quantity: "",
        unitPrice: "",
        totalPrice: "",
      },
    ]);
  };

  // Handle updating manual entry fields
  const handleManualEntryChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const updatedEntries = [...manualEntries];
    updatedEntries[index] = {
      ...updatedEntries[index],
      [field]: value,
    };
    
    // Auto-calculate total price if quantity and unit price are set
    if (field === "quantity" || field === "unitPrice") {
      const quantity = parseFloat(field === "quantity" ? value : updatedEntries[index].quantity);
      const unitPrice = parseFloat(field === "unitPrice" ? value : updatedEntries[index].unitPrice);
      
      if (!isNaN(quantity) && !isNaN(unitPrice)) {
        updatedEntries[index].totalPrice = (quantity * unitPrice).toFixed(2);
      }
    }
    
    setManualEntries(updatedEntries);
  };

  // Handle removing a manual entry
  const handleRemoveManualEntry = (index: number) => {
    if (manualEntries.length === 1) {
      // Don't remove the last entry, just clear it
      setManualEntries([
        {
          date: "",
          entity: "",
          currency: "USD",
          bank: "",
          description: "",
          quantity: "",
          unitPrice: "",
          totalPrice: "",
        },
      ]);
      return;
    }
    
    const updatedEntries = [...manualEntries];
    updatedEntries.splice(index, 1);
    setManualEntries(updatedEntries);
  };

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
          </TabsContent>
          
          <TabsContent value="manual">
            <form onSubmit={handleManualSubmit} className="space-y-6">
              {manualEntries.map((entry, index) => (
                <div key={index} className="space-y-4 p-4 border rounded-lg relative">
                  {manualEntries.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveManualEntry(index)}
                    >
                      <XCircle className="h-5 w-5" />
                    </Button>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`date-${index}`}>Transaction Date</Label>
                      <Input
                        id={`date-${index}`}
                        type="date"
                        value={entry.date}
                        onChange={(e) =>
                          handleManualEntryChange(index, "date", e.target.value)
                        }
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`entity-${index}`}>Importer/Exporter</Label>
                      <Input
                        id={`entity-${index}`}
                        value={entry.entity}
                        onChange={(e) =>
                          handleManualEntryChange(index, "entity", e.target.value)
                        }
                        placeholder="Entity name"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`currency-${index}`}>Currency</Label>
                      <Select
                        value={entry.currency}
                        onValueChange={(value) =>
                          handleManualEntryChange(index, "currency", value)
                        }
                      >
                        <SelectTrigger id={`currency-${index}`}>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                          <SelectItem value="GBP">GBP - British Pound</SelectItem>
                          <SelectItem value="CNY">CNY - Chinese Yuan</SelectItem>
                          <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`bank-${index}`}>Bank Used</Label>
                      <Input
                        id={`bank-${index}`}
                        value={entry.bank}
                        onChange={(e) =>
                          handleManualEntryChange(index, "bank", e.target.value)
                        }
                        placeholder="Bank name"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor={`description-${index}`}>Product Description</Label>
                      <Textarea
                        id={`description-${index}`}
                        value={entry.description}
                        onChange={(e) =>
                          handleManualEntryChange(index, "description", e.target.value)
                        }
                        placeholder="Describe the product or service"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                      <Input
                        id={`quantity-${index}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={entry.quantity}
                        onChange={(e) =>
                          handleManualEntryChange(index, "quantity", e.target.value)
                        }
                        placeholder="Quantity"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`unitPrice-${index}`}>Unit Price</Label>
                      <Input
                        id={`unitPrice-${index}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={entry.unitPrice}
                        onChange={(e) =>
                          handleManualEntryChange(index, "unitPrice", e.target.value)
                        }
                        placeholder="Unit price"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`totalPrice-${index}`}>Total Price</Label>
                      <Input
                        id={`totalPrice-${index}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={entry.totalPrice}
                        onChange={(e) =>
                          handleManualEntryChange(index, "totalPrice", e.target.value)
                        }
                        placeholder="Total price"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddManualEntry}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Entry
                </Button>
                
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? "Submitting..." : "Submit Data"}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ImportForm;
