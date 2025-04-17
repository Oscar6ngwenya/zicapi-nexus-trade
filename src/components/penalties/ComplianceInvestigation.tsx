import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, FileText, Download, AlertTriangle, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import * as XLSX from "xlsx";
import { DataDiscrepancy } from "@/services/analyticsService";
import { Transaction } from "@/components/dashboard/TransactionTable";

// Mock data for company profiles
const MOCK_COMPANIES = [
  {
    id: "1",
    name: "Global Imports Ltd",
    registrationNumber: "REG12345",
    directors: ["John Smith", "Mary Johnson"],
    riskLevel: "medium",
    complianceHistory: [
      { date: "2023-01-15", status: "compliant", note: "Annual compliance review" },
      { date: "2023-05-20", status: "flagged", note: "Transaction discrepancy identified" },
      { date: "2023-06-10", status: "resolved", note: "Discrepancy documentation provided" },
    ],
    discrepancyCount: 3,
    complianceRate: 87,
  },
  {
    id: "2",
    name: "Tech Solutions Inc",
    registrationNumber: "REG67890",
    directors: ["David Williams", "Lisa Chen"],
    riskLevel: "low",
    complianceHistory: [
      { date: "2023-02-05", status: "compliant", note: "Annual compliance review" },
      { date: "2023-07-15", status: "compliant", note: "Quarterly review" },
    ],
    discrepancyCount: 0,
    complianceRate: 99,
  },
  {
    id: "3",
    name: "International Trading LLC",
    registrationNumber: "REG54321",
    directors: ["Michael Brown", "Sarah Davis", "Robert Zhao"],
    riskLevel: "high",
    complianceHistory: [
      { date: "2023-03-10", status: "flagged", note: "Multiple high-value transactions" },
      { date: "2023-04-22", status: "flagged", note: "Documentation discrepancies" },
      { date: "2023-05-15", status: "sanctioned", note: "Failure to provide required documentation" },
      { date: "2023-08-01", status: "under review", note: "Appeal submitted" },
    ],
    discrepancyCount: 8,
    complianceRate: 42,
  }
];

// Mock discrepancies data
const MOCK_DISCREPANCIES: DataDiscrepancy[] = [
  {
    customsTransaction: {
      id: "imp-1",
      date: "2023-05-15",
      entity: "Global Imports Ltd",
      type: "import",
      currency: "USD",
      amount: 85000,
      bank: "First National Bank",
      product: "Computer Equipment",
      status: "flagged",
      source: "customs"
    },
    financialTransaction: {
      id: "man-1",
      date: "2023-05-15",
      entity: "Global Imports Ltd",
      type: "import",
      currency: "USD",
      amount: 65000,
      bank: "First National Bank",
      product: "Computer Equipment",
      status: "flagged",
      source: "financial"
    },
    discrepancyType: "total",
    customsValue: 85000,
    financialValue: 65000,
    percentageDifference: 30.77
  },
  {
    customsTransaction: {
      id: "imp-2",
      date: "2023-06-22",
      entity: "International Trading LLC",
      type: "import",
      currency: "EUR",
      amount: 120000,
      bank: "Commerce Bank",
      product: "Luxury Goods",
      status: "flagged",
      source: "customs",
      quantity: 500,
      unitPrice: 240
    },
    financialTransaction: {
      id: "man-2",
      date: "2023-06-22",
      entity: "International Trading LLC",
      type: "import",
      currency: "EUR",
      amount: 75000,
      bank: "Commerce Bank",
      product: "Luxury Goods",
      status: "flagged",
      source: "financial",
      quantity: 500,
      unitPrice: 150
    },
    discrepancyType: "price",
    customsValue: 240,
    financialValue: 150,
    percentageDifference: 60
  },
  {
    customsTransaction: {
      id: "imp-3",
      date: "2023-07-05",
      entity: "International Trading LLC",
      type: "export",
      currency: "USD",
      amount: 95000,
      bank: "First National Bank",
      product: "Electronic Components",
      status: "flagged",
      source: "customs",
      quantity: 2000,
      unitPrice: 47.5
    },
    financialTransaction: {
      id: "man-3",
      date: "2023-07-05",
      entity: "International Trading LLC",
      type: "export",
      currency: "USD",
      amount: 95000,
      bank: "First National Bank",
      product: "Electronic Components",
      status: "flagged",
      source: "financial",
      quantity: 5000,
      unitPrice: 19
    },
    discrepancyType: "quantity",
    customsValue: 2000,
    financialValue: 5000,
    percentageDifference: 150
  }
];

const ComplianceInvestigation: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [companyDiscrepancies, setCompanyDiscrepancies] = useState<DataDiscrepancy[]>([]);

  // Handle search
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a search term");
      return;
    }
    
    const found = MOCK_COMPANIES.find(
      company => company.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (found) {
      setSelectedCompany(found);
      // Filter discrepancies for this company
      const relevantDiscrepancies = MOCK_DISCREPANCIES.filter(
        d => (d.customsTransaction?.entity === found.name || d.financialTransaction?.entity === found.name)
      );
      setCompanyDiscrepancies(relevantDiscrepancies);
      toast.success(`Found company: ${found.name}`);
    } else {
      toast.error("No company found with that name");
      setSelectedCompany(null);
      setCompanyDiscrepancies([]);
    }
  };

  // Handle export to Excel
  const exportToExcel = () => {
    if (!selectedCompany) {
      toast.error("No company selected");
      return;
    }

    // Prepare company profile data
    const companyProfileData = {
      "Company Name": selectedCompany.name,
      "Registration Number": selectedCompany.registrationNumber,
      "Directors": selectedCompany.directors.join(", "),
      "Risk Level": selectedCompany.riskLevel.toUpperCase(),
      "Compliance Rate": `${selectedCompany.complianceRate}%`,
      "Discrepancy Count": selectedCompany.discrepancyCount
    };
    
    // Prepare discrepancy data
    const discrepancyData = companyDiscrepancies.map(d => {
      const entity = d.customsTransaction?.entity || d.financialTransaction?.entity || "";
      const date = d.customsTransaction?.date || d.financialTransaction?.date || "";
      const product = d.customsTransaction?.product || d.financialTransaction?.product || "";
      const currency = d.customsTransaction?.currency || d.financialTransaction?.currency || "USD";
      
      return {
        "Date": date,
        "Product": product,
        "Discrepancy Type": d.discrepancyType.charAt(0).toUpperCase() + d.discrepancyType.slice(1),
        "Customs Value": d.discrepancyType === "quantity" 
          ? d.customsValue 
          : new Intl.NumberFormat("en-US", { style: "currency", currency }).format(d.customsValue || 0),
        "Financial Value": d.discrepancyType === "quantity"
          ? d.financialValue
          : new Intl.NumberFormat("en-US", { style: "currency", currency }).format(d.financialValue || 0),
        "Difference %": `${d.percentageDifference.toFixed(2)}%`,
        "Risk Assessment": d.percentageDifference > 50 ? "HIGH RISK" : d.percentageDifference > 20 ? "MEDIUM RISK" : "LOW RISK"
      };
    });

    // Prepare compliance history data
    const complianceHistoryData = selectedCompany.complianceHistory.map((h: any) => ({
      "Date": h.date,
      "Status": h.status.toUpperCase(),
      "Note": h.note
    }));
    
    // Create workbook with multiple sheets
    const wb = XLSX.utils.book_new();
    
    // Add company profile sheet
    const profileWS = XLSX.utils.json_to_sheet([companyProfileData]);
    XLSX.utils.book_append_sheet(wb, profileWS, "Company Profile");
    
    // Add discrepancy sheet
    if (discrepancyData.length > 0) {
      const discrepancyWS = XLSX.utils.json_to_sheet(discrepancyData);
      XLSX.utils.book_append_sheet(wb, discrepancyWS, "Discrepancies");
    }
    
    // Add compliance history sheet
    const historyWS = XLSX.utils.json_to_sheet(complianceHistoryData);
    XLSX.utils.book_append_sheet(wb, historyWS, "Compliance History");
    
    // Generate download
    XLSX.writeFile(wb, `compliance-report-${selectedCompany.name.replace(/\s+/g, '-')}.xlsx`);
    
    toast.success("Exported investigation report");
  };

  // Get risk level badge variant
  const getRiskBadge = (level: string) => {
    switch (level) {
      case "high":
        return <Badge variant="destructive">HIGH RISK</Badge>;
      case "medium":
        return <Badge variant="outline" className="bg-amber-100 text-amber-800">MEDIUM RISK</Badge>;
      case "low":
        return <Badge variant="outline" className="bg-green-100 text-green-800">LOW RISK</Badge>;
      default:
        return <Badge>{level}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compliance Investigation</CardTitle>
        <CardDescription>
          Investigate companies for compliance and due diligence
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search by company name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch}>Search</Button>
        </div>

        {selectedCompany && (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">{selectedCompany.name}</h2>
                <p className="text-sm text-muted-foreground">
                  Registration: {selectedCompany.registrationNumber}
                </p>
              </div>
              <div className="flex flex-col items-end">
                {getRiskBadge(selectedCompany.riskLevel)}
                <p className="text-sm mt-1">
                  Compliance Rate: {selectedCompany.complianceRate}%
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Directors</h3>
              <ul className="list-disc list-inside text-sm">
                {selectedCompany.directors.map((director: string, index: number) => (
                  <li key={index}>{director}</li>
                ))}
              </ul>
            </div>

            <Tabs defaultValue="history">
              <TabsList>
                <TabsTrigger value="history">
                  <FileText className="h-4 w-4 mr-2" />
                  Compliance History
                </TabsTrigger>
                <TabsTrigger value="discrepancies">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Data Discrepancies
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="history">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Note</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedCompany.complianceHistory.map((item: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{item.date}</TableCell>
                        <TableCell>
                          {item.status === "compliant" && (
                            <Badge variant="outline" className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" /> Compliant
                            </Badge>
                          )}
                          {item.status === "flagged" && (
                            <Badge variant="outline" className="bg-amber-100 text-amber-800">
                              <AlertTriangle className="h-3 w-3 mr-1" /> Flagged
                            </Badge>
                          )}
                          {item.status === "sanctioned" && (
                            <Badge variant="destructive">
                              Sanctioned
                            </Badge>
                          )}
                          {item.status === "resolved" && (
                            <Badge variant="outline" className="bg-blue-100 text-blue-800">
                              Resolved
                            </Badge>
                          )}
                          {item.status === "under review" && (
                            <Badge variant="outline">Under Review</Badge>
                          )}
                        </TableCell>
                        <TableCell>{item.note}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              
              <TabsContent value="discrepancies">
                {companyDiscrepancies.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No discrepancies found for this company
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Imported Value</TableHead>
                        <TableHead className="text-right">Manual Value</TableHead>
                        <TableHead className="text-right">Difference</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {companyDiscrepancies.map((d, index) => (
                        <TableRow key={index} className={
                          d.percentageDifference > 50 ? "bg-red-50" : 
                          d.percentageDifference > 20 ? "bg-amber-50" : ""
                        }>
                          <TableCell>{d.customsTransaction?.date || d.financialTransaction?.date}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {d.discrepancyType === "total" ? "Amount" : 
                               d.discrepancyType === "price" ? "Unit Price" : "Quantity"}
                            </Badge>
                          </TableCell>
                          <TableCell>{d.customsTransaction?.product || d.financialTransaction?.product}</TableCell>
                          <TableCell className="text-right">
                            {d.discrepancyType === "quantity" 
                              ? (d.customsValue || 0).toLocaleString()
                              : new Intl.NumberFormat("en-US", { 
                                  style: "currency", 
                                  currency: d.customsTransaction?.currency || d.financialTransaction?.currency || "USD"
                                }).format(d.customsValue || 0)
                            }
                          </TableCell>
                          <TableCell className="text-right">
                            {d.discrepancyType === "quantity" 
                              ? (d.financialValue || 0).toLocaleString()
                              : new Intl.NumberFormat("en-US", { 
                                  style: "currency", 
                                  currency: d.customsTransaction?.currency || d.financialTransaction?.currency || "USD"
                                }).format(d.financialValue || 0)
                            }
                          </TableCell>
                          <TableCell className="text-right font-semibold text-red-700">
                            {d.percentageDifference.toFixed(2)}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            </Tabs>

            <div className="flex justify-end">
              <Button 
                variant="outline"
                className="gap-2"
                onClick={exportToExcel}
              >
                <Download className="h-4 w-4" />
                Export Investigation Report
              </Button>
            </div>
          </div>
        )}

        {!selectedCompany && (
          <div className="p-8 text-center text-muted-foreground">
            Search for a company to view compliance information and conduct investigations
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ComplianceInvestigation;
