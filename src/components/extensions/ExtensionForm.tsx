
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CalendarIcon, Clock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ExtensionFormProps {
  onSubmit: (data: any) => void;
  transactions: any[];
}

const ExtensionForm: React.FC<ExtensionFormProps> = ({ onSubmit, transactions }) => {
  const [formData, setFormData] = useState({
    transactionId: "",
    requestedDays: 30,
    reason: "",
    documents: null,
    requestDate: new Date(),
    newDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days from now
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: string, value: any) => {
    if (field === "requestedDays") {
      // Recalculate the new deadline when requested days change
      const newDeadline = new Date();
      newDeadline.setDate(newDeadline.getDate() + Number(value));
      
      setFormData({
        ...formData,
        requestedDays: Number(value),
        newDeadline,
      });
    } else {
      setFormData({
        ...formData,
        [field]: value,
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFormData({
        ...formData,
        documents: files[0],
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.transactionId) {
      toast.error("Missing transaction", {
        description: "Please select a transaction for extension",
      });
      return;
    }
    
    if (!formData.reason) {
      toast.error("Missing reason", {
        description: "Please provide a reason for the extension request",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      // Find the transaction details
      const transaction = transactions.find(t => t.id === formData.transactionId);
      
      const extensionData = {
        id: `ext-${Date.now()}`,
        transactionId: formData.transactionId,
        transactionInfo: transaction,
        requestedDays: formData.requestedDays,
        reason: formData.reason,
        requestDate: format(formData.requestDate, "yyyy-MM-dd"),
        newDeadline: format(formData.newDeadline, "yyyy-MM-dd"),
        status: "pending",
        hasDocuments: !!formData.documents,
      };
      
      onSubmit(extensionData);
      
      toast.success("Extension request submitted", {
        description: `Your request for a ${formData.requestedDays}-day extension has been submitted for review`,
      });
      
      // Reset form
      setFormData({
        transactionId: "",
        requestedDays: 30,
        reason: "",
        documents: null,
        requestDate: new Date(),
        newDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
      
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Extension</CardTitle>
        <CardDescription>
          Request an extension for transaction delivery or payment period
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="transactionId">Select Transaction</Label>
            <Select
              value={formData.transactionId}
              onValueChange={(value) => handleChange("transactionId", value)}
            >
              <SelectTrigger id="transactionId">
                <SelectValue placeholder="Select a transaction" />
              </SelectTrigger>
              <SelectContent>
                {transactions.map((tx) => (
                  <SelectItem key={tx.id} value={tx.id}>
                    {tx.entity} - {tx.product.substring(0, 30)} (${tx.amount})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="requestDate">Request Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.requestDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.requestDate ? (
                      format(formData.requestDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.requestDate}
                    onSelect={(date) => handleChange("requestDate", date)}
                    disabled={(date) => date > new Date() || date < new Date("2020-01-01")}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="requestedDays">Extension Period (Days)</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="requestedDays"
                  type="number"
                  min="1"
                  max="180"
                  value={formData.requestedDays}
                  onChange={(e) => handleChange("requestedDays", e.target.value)}
                />
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="newDeadline">New Deadline</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.newDeadline && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.newDeadline ? (
                    format(formData.newDeadline, "PPP")
                  ) : (
                    <span>New deadline</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.newDeadline}
                  onSelect={(date) => handleChange("newDeadline", date)}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Extension</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => handleChange("reason", e.target.value)}
              placeholder="Explain why you need this extension..."
              rows={4}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="documents">Supporting Documents (Optional)</Label>
            <Input
              id="documents"
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.png,.doc,.docx"
            />
            <p className="text-xs text-muted-foreground">
              Upload any documents that support your extension request (max 5MB)
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" type="button" onClick={() => window.history.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ExtensionForm;
