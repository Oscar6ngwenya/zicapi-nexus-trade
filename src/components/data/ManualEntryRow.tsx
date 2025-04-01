
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { XCircle } from "lucide-react";
import { ManualEntry } from "./ManualEntryForm";

interface ManualEntryRowProps {
  entry: ManualEntry;
  index: number;
  showRemoveButton: boolean;
  onChange: (index: number, field: keyof ManualEntry, value: string) => void;
  onRemove: (index: number) => void;
}

const ManualEntryRow: React.FC<ManualEntryRowProps> = ({
  entry,
  index,
  showRemoveButton,
  onChange,
  onRemove
}) => {
  return (
    <div className="space-y-4 p-4 border rounded-lg relative">
      {showRemoveButton && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
          onClick={() => onRemove(index)}
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
            onChange={(e) => onChange(index, "date", e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor={`entity-${index}`}>Importer/Exporter</Label>
          <Input
            id={`entity-${index}`}
            value={entry.entity}
            onChange={(e) => onChange(index, "entity", e.target.value)}
            placeholder="Entity name"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor={`currency-${index}`}>Currency</Label>
          <Select
            value={entry.currency}
            onValueChange={(value) => onChange(index, "currency", value)}
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
            onChange={(e) => onChange(index, "bank", e.target.value)}
            placeholder="Bank name"
            required
          />
        </div>
        
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor={`description-${index}`}>Product Description</Label>
          <Textarea
            id={`description-${index}`}
            value={entry.description}
            onChange={(e) => onChange(index, "description", e.target.value)}
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
            onChange={(e) => onChange(index, "quantity", e.target.value)}
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
            onChange={(e) => onChange(index, "unitPrice", e.target.value)}
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
            onChange={(e) => onChange(index, "totalPrice", e.target.value)}
            placeholder="Total price"
            required
          />
        </div>
      </div>
    </div>
  );
};

export default ManualEntryRow;
