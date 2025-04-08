
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { calculatePenaltyAndInterest } from "@/services/analyticsService";
import { differenceInDays } from "date-fns";
import { toast } from "sonner";

interface PenaltyFormData {
  entity: string;
  originalAmount: number;
  receivedAmount: number;
  currency: string;
  dueDate: Date | undefined;
  receiptDate: Date | undefined;
}

const PenaltyCalculator: React.FC = () => {
  const [formData, setFormData] = useState<PenaltyFormData>({
    entity: "",
    originalAmount: 0,
    receivedAmount: 0,
    currency: "USD",
    dueDate: undefined,
    receiptDate: undefined,
  });

  const [calculationResult, setCalculationResult] = useState<any>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name.includes("Amount") ? parseFloat(value) || 0 : value,
    });
  };

  const handleCurrencyChange = (value: string) => {
    setFormData({ ...formData, currency: value });
  };

  const handleDueDateChange = (date: Date | undefined) => {
    setFormData({ ...formData, dueDate: date });
  };

  const handleReceiptDateChange = (date: Date | undefined) => {
    setFormData({ ...formData, receiptDate: date });
  };

  const calculatePenalty = () => {
    // Validate form
    if (!formData.entity || !formData.originalAmount || !formData.dueDate || !formData.receiptDate) {
      toast.error("Missing required fields");
      return;
    }

    // Calculate days late
    const daysLate = differenceInDays(formData.receiptDate as Date, formData.dueDate as Date);
    
    if (daysLate <= 0) {
      toast.success("No penalties - payment received on time");
      setCalculationResult({
        daysLate: 0,
        originalAmount: formData.originalAmount,
        receivedAmount: formData.receivedAmount,
        outstandingAmount: formData.originalAmount - formData.receivedAmount,
        penaltyAmount: 0,
        interestAmount: 0,
        totalDue: formData.originalAmount - formData.receivedAmount,
      });
      return;
    }

    // Calculate penalty
    const mockTransaction = {
      id: "calc-" + Date.now(),
      date: formData.dueDate?.toISOString().split('T')[0] || "",
      entity: formData.entity,
      type: "import" as const, // Fixed: Explicitly set as "import" literal type
      currency: formData.currency,
      amount: formData.originalAmount,
      product: "Calculated penalty",
      status: "pending" as const, // Fixed: Explicitly set as "pending" literal type
      bank: "N/A",
      source: "manual" as const
    };

    const result = calculatePenaltyAndInterest(
      mockTransaction, 
      daysLate, 
      formData.receivedAmount
    );

    setCalculationResult(result);
    toast.info(`Penalty calculated for ${daysLate} days late`);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: formData.currency,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Penalty Calculator</CardTitle>
        <CardDescription>
          Calculate penalties and interest for late or partial payments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="entity">Company/Entity Name</Label>
            <Input
              id="entity"
              name="entity"
              value={formData.entity}
              onChange={handleInputChange}
              placeholder="Enter company name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select value={formData.currency} onValueChange={handleCurrencyChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD - US Dollar</SelectItem>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
                <SelectItem value="GBP">GBP - British Pound</SelectItem>
                <SelectItem value="ZWL">ZWL - Zimbabwe Dollar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="originalAmount">Original Amount Due</Label>
            <Input
              id="originalAmount"
              name="originalAmount"
              type="number"
              value={formData.originalAmount || ""}
              onChange={handleInputChange}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="receivedAmount">Amount Received</Label>
            <Input
              id="receivedAmount"
              name="receivedAmount"
              type="number"
              value={formData.receivedAmount || ""}
              onChange={handleInputChange}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label>Due Date</Label>
            <DatePicker 
              date={formData.dueDate} 
              setDate={handleDueDateChange} 
            />
          </div>

          <div className="space-y-2">
            <Label>Receipt Date</Label>
            <DatePicker 
              date={formData.receiptDate} 
              setDate={handleReceiptDateChange} 
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={calculatePenalty}>Calculate Penalty</Button>
        </div>

        {calculationResult && (
          <Card className="mt-6 bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Calculation Results</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-y-2">
                <p className="text-sm text-muted-foreground">Days Late:</p>
                <p className="text-sm font-medium">{calculationResult.daysLate} days</p>
                
                <p className="text-sm text-muted-foreground">Original Amount:</p>
                <p className="text-sm font-medium">{formatCurrency(calculationResult.originalAmount)}</p>
                
                <p className="text-sm text-muted-foreground">Amount Received:</p>
                <p className="text-sm font-medium">{formatCurrency(calculationResult.receivedAmount)}</p>
                
                <p className="text-sm text-muted-foreground">Outstanding Amount:</p>
                <p className="text-sm font-medium">{formatCurrency(calculationResult.outstandingAmount)}</p>
                
                <p className="text-sm text-muted-foreground">Penalty (100%):</p>
                <p className="text-sm font-medium text-red-600">{formatCurrency(calculationResult.penaltyAmount)}</p>
                
                <p className="text-sm text-muted-foreground">Interest (5% per day):</p>
                <p className="text-sm font-medium text-red-600">{formatCurrency(calculationResult.interestAmount)}</p>
                
                <p className="text-sm text-muted-foreground font-semibold">Total Due:</p>
                <p className="text-sm font-bold text-red-700">{formatCurrency(calculationResult.totalDue)}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default PenaltyCalculator;
