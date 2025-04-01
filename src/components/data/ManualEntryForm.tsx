
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import ManualEntryRow from "./ManualEntryRow";

interface ManualEntryFormProps {
  onImportComplete: (data: any) => void;
  isUploading: boolean;
  setIsUploading: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface ManualEntry {
  date: string;
  entity: string;
  currency: string;
  bank: string;
  description: string;
  quantity: string;
  unitPrice: string;
  totalPrice: string;
}

const emptyEntry: ManualEntry = {
  date: "",
  entity: "",
  currency: "USD",
  bank: "",
  description: "",
  quantity: "",
  unitPrice: "",
  totalPrice: "",
};

const ManualEntryForm: React.FC<ManualEntryFormProps> = ({ 
  onImportComplete, 
  isUploading, 
  setIsUploading 
}) => {
  const [manualEntries, setManualEntries] = useState<ManualEntry[]>([{ ...emptyEntry }]);

  // Handle adding a new manual entry row
  const handleAddManualEntry = () => {
    setManualEntries([...manualEntries, { ...emptyEntry }]);
  };

  // Handle updating manual entry fields
  const handleManualEntryChange = (
    index: number,
    field: keyof ManualEntry,
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
      setManualEntries([{ ...emptyEntry }]);
      return;
    }
    
    const updatedEntries = [...manualEntries];
    updatedEntries.splice(index, 1);
    setManualEntries(updatedEntries);
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
      setManualEntries([{ ...emptyEntry }]);
    }, 1500);
  };

  return (
    <form onSubmit={handleManualSubmit} className="space-y-6">
      {manualEntries.map((entry, index) => (
        <ManualEntryRow
          key={index}
          entry={entry}
          index={index}
          showRemoveButton={manualEntries.length > 1}
          onChange={handleManualEntryChange}
          onRemove={handleRemoveManualEntry}
        />
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
  );
};

export default ManualEntryForm;
