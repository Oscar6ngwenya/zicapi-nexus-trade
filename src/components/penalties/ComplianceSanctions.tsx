import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle, CheckCircle, Ban, File } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { format } from "date-fns";

// Mock sanctioned companies data
const INITIAL_SANCTIONS = [
  {
    id: "S001",
    companyName: "International Trading LLC",
    registrationNumber: "REG54321",
    sanctionDate: "2023-05-15",
    expiryDate: "2023-08-15",
    reason: "Multiple transaction discrepancies exceeding permitted thresholds. Failure to provide adequate documentation after 3 formal requests.",
    status: "active",
    sanctionLevel: "severe",
  },
  {
    id: "S002",
    companyName: "Mineral Resources Corp",
    registrationNumber: "REG78901",
    sanctionDate: "2023-06-22",
    expiryDate: "2023-09-22",
    reason: "Under-invoicing of exports to evade foreign currency controls. Systematic discrepancies between declared and actual values.",
    status: "active",
    sanctionLevel: "moderate",
  },
  {
    id: "S003",
    companyName: "East-West Trading Co",
    registrationNumber: "REG45678",
    sanctionDate: "2023-04-10",
    expiryDate: "2023-07-10",
    reason: "Non-compliance with reporting requirements after multiple warnings. Evidence of structuring transactions to avoid monitoring thresholds.",
    status: "expired",
    sanctionLevel: "moderate",
  },
  {
    id: "S004",
    companyName: "Global Finance Ltd",
    registrationNumber: "REG23456",
    sanctionDate: "2023-07-05",
    expiryDate: "2023-10-05",
    reason: "Failure to acquit export receipts within stipulated timeframes. Persistent pattern of delayed repatriation of export proceeds.",
    status: "active",
    sanctionLevel: "light",
  }
];

interface SanctionFormData {
  companyName: string;
  registrationNumber: string;
  sanctionDate: Date | undefined;
  expiryDate: Date | undefined;
  reason: string;
  sanctionLevel: string;
}

const ComplianceSanctions: React.FC = () => {
  const [sanctions, setSanctions] = useState(INITIAL_SANCTIONS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<SanctionFormData>({
    companyName: "",
    registrationNumber: "",
    sanctionDate: new Date(),
    expiryDate: undefined,
    reason: "",
    sanctionLevel: "moderate",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSanctionLevelChange = (value: string) => {
    setFormData({ ...formData, sanctionLevel: value });
  };

  const handleSanctionDateChange = (date: Date | undefined) => {
    setFormData({ ...formData, sanctionDate: date });
    
    // If we have a new sanction date and no expiry date yet, set a default expiry date (3 months later)
    if (date && !formData.expiryDate) {
      const expiryDate = new Date(date);
      expiryDate.setMonth(expiryDate.getMonth() + 3);
      setFormData(prev => ({ ...prev, sanctionDate: date, expiryDate }));
    }
  };

  const handleExpiryDateChange = (date: Date | undefined) => {
    setFormData({ ...formData, expiryDate: date });
  };

  const handleAddSanction = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.companyName || !formData.registrationNumber || !formData.sanctionDate || !formData.expiryDate || !formData.reason) {
      toast.error("Please fill all required fields");
      return;
    }

    // Validate that expiry date is after sanction date
    if (formData.expiryDate && formData.sanctionDate && formData.expiryDate < formData.sanctionDate) {
      toast.error("Expiry date must be after sanction date");
      return;
    }

    // Create new sanction
    const newSanction = {
      id: `S${Math.floor(Math.random() * 900) + 100}`,
      companyName: formData.companyName,
      registrationNumber: formData.registrationNumber,
      sanctionDate: format(formData.sanctionDate, "yyyy-MM-dd"),
      expiryDate: format(formData.expiryDate, "yyyy-MM-dd"),
      reason: formData.reason,
      status: "active",
      sanctionLevel: formData.sanctionLevel,
    };

    // Add to sanctions list
    setSanctions([newSanction, ...sanctions]);
    
    // Reset form and close dialog
    setFormData({
      companyName: "",
      registrationNumber: "",
      sanctionDate: new Date(),
      expiryDate: undefined,
      reason: "",
      sanctionLevel: "moderate",
    });
    setDialogOpen(false);
    
    toast.success(`Sanction added for ${formData.companyName}`, {
      description: "The company has been added to the sanctions list"
    });
  };

  const handleRevokeSanction = (id: string) => {
    const updatedSanctions = sanctions.map(sanction => 
      sanction.id === id 
        ? { ...sanction, status: "revoked" } 
        : sanction
    );
    
    setSanctions(updatedSanctions);
    toast.success("Sanction revoked", {
      description: "The sanction has been removed from active status"
    });
  };

  const exportSanctionsList = () => {
    // Prepare data for export
    const exportData = sanctions.map(s => ({
      "Sanction ID": s.id,
      "Company Name": s.companyName,
      "Registration Number": s.registrationNumber,
      "Sanction Date": s.sanctionDate,
      "Expiry Date": s.expiryDate,
      "Status": s.status.toUpperCase(),
      "Sanction Level": s.sanctionLevel.toUpperCase(),
      "Reason": s.reason
    }));
    
    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sanctions");

    // Generate download
    XLSX.writeFile(wb, `sanctions-list-${new Date().toISOString().slice(0, 10)}.xlsx`);
    
    toast.success("Sanctions list exported successfully");
  };

  const getSanctionLevelBadge = (level: string) => {
    switch (level) {
      case "severe":
        return <Badge variant="destructive">SEVERE</Badge>;
      case "moderate":
        return <Badge variant="outline" className="bg-amber-100 text-amber-800">MODERATE</Badge>;
      case "light":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">LIGHT</Badge>;
      default:
        return <Badge>{level.toUpperCase()}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="outline" className="bg-red-100 text-red-800">ACTIVE</Badge>;
      case "expired":
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">EXPIRED</Badge>;
      case "revoked":
        return <Badge variant="outline" className="bg-green-100 text-green-800">REVOKED</Badge>;
      default:
        return <Badge>{status.toUpperCase()}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Sanctions Management</CardTitle>
            <CardDescription>
              Manage sanctions for non-compliant entities
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={exportSanctionsList}
            >
              <File className="h-4 w-4" />
              Export List
            </Button>
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex items-center gap-2">
                  <Ban className="h-4 w-4" />
                  Add Sanction
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Sanction</DialogTitle>
                  <DialogDescription>
                    Add a company to the sanctions list for non-compliance with regulations
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleAddSanction} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        placeholder="Enter company name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="registrationNumber">Registration Number</Label>
                      <Input
                        id="registrationNumber"
                        name="registrationNumber"
                        value={formData.registrationNumber}
                        onChange={handleInputChange}
                        placeholder="Enter registration number"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Sanction Date</Label>
                      <DatePicker 
                        date={formData.sanctionDate} 
                        setDate={handleSanctionDateChange} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Expiry Date</Label>
                      <DatePicker 
                        date={formData.expiryDate} 
                        setDate={handleExpiryDateChange} 
                        fromDate={formData.sanctionDate}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="sanctionLevel">Sanction Level</Label>
                      <Select value={formData.sanctionLevel} onValueChange={handleSanctionLevelChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="severe">Severe</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="light">Light</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason for Sanction</Label>
                    <Textarea
                      id="reason"
                      name="reason"
                      value={formData.reason}
                      onChange={handleInputChange}
                      placeholder="Provide detailed reason for the sanction"
                      rows={3}
                    />
                  </div>
                  
                  <DialogFooter>
                    <Button type="submit">Save Sanction</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Registration</TableHead>
                <TableHead>Date Range</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sanctions.map((sanction) => {
                const isActive = sanction.status === "active";
                return (
                  <TableRow 
                    key={sanction.id}
                    className={isActive ? "bg-red-50" : ""}
                  >
                    <TableCell className="font-medium">{sanction.companyName}</TableCell>
                    <TableCell>{sanction.registrationNumber}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>From: {sanction.sanctionDate}</p>
                        <p>To: {sanction.expiryDate}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getSanctionLevelBadge(sanction.sanctionLevel)}</TableCell>
                    <TableCell>{getStatusBadge(sanction.status)}</TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Sanction Details</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-sm font-medium mb-1">Company</h3>
                              <p>{sanction.companyName}</p>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium mb-1">Registration</h3>
                              <p>{sanction.registrationNumber}</p>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium mb-1">Status</h3>
                              <p>{getStatusBadge(sanction.status)}</p>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium mb-1">Date Range</h3>
                              <p>From: {sanction.sanctionDate} to {sanction.expiryDate}</p>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium mb-1">Reason for Sanction</h3>
                              <p className="text-sm">{sanction.reason}</p>
                            </div>
                          </div>
                          <DialogFooter>
                            {isActive && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleRevokeSanction(sanction.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Revoke Sanction
                              </Button>
                            )}
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>About Sanctions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <div>
                <h3 className="font-medium">Purpose of Sanctions</h3>
                <p className="text-sm text-muted-foreground">
                  Sanctions are penalties imposed on entities that fail to comply with the capital flight management regulations in Zimbabwe. They aim to enforce compliance and deter future violations.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 border rounded-md">
                <h4 className="font-medium mb-1 text-red-800">Severe Sanctions</h4>
                <p className="text-sm">
                  Complete restriction from foreign exchange transactions for the duration of the sanction. Referral to legal authorities for potential prosecution.
                </p>
              </div>
              
              <div className="p-3 border rounded-md">
                <h4 className="font-medium mb-1 text-amber-800">Moderate Sanctions</h4>
                <p className="text-sm">
                  Limited access to foreign exchange. Additional documentation requirements and mandatory pre-approval for all transactions.
                </p>
              </div>
              
              <div className="p-3 border rounded-md">
                <h4 className="font-medium mb-1 text-blue-800">Light Sanctions</h4>
                <p className="text-sm">
                  Enhanced monitoring and reporting requirements. May include temporary restrictions on transaction volumes.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplianceSanctions;
