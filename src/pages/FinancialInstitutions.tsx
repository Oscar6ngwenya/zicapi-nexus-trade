
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { BuildingBank, Plus, RefreshCw } from "lucide-react";
import InstitutionTable from "@/components/institutions/InstitutionTable";

const FinancialInstitutions: React.FC = () => {
  const [institutions, setInstitutions] = useState<{
    id: string;
    name: string;
    code: string;
    type: string;
    status: string;
    address: string;
  }[]>([
    {
      id: "1",
      name: "First National Bank",
      code: "FNB001",
      type: "commercial",
      status: "active",
      address: "123 Main St, Capital City",
    },
    {
      id: "2",
      name: "Commerce Bank",
      code: "COM002",
      type: "commercial",
      status: "active",
      address: "456 Market St, Capital City",
    },
    {
      id: "3",
      name: "Central Reserve Bank",
      code: "CRB001",
      type: "central",
      status: "active",
      address: "789 Central Ave, Capital City",
    },
  ]);

  const [newInstitution, setNewInstitution] = useState({
    name: "",
    code: "",
    type: "",
    address: "",
  });

  const handleAddInstitution = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!newInstitution.name || !newInstitution.code || !newInstitution.type || !newInstitution.address) {
      toast.error("Please fill in all fields");
      return;
    }
    
    // Create new institution
    const id = (institutions.length + 1).toString();
    setInstitutions([
      ...institutions,
      {
        id,
        name: newInstitution.name,
        code: newInstitution.code,
        type: newInstitution.type,
        status: "active",
        address: newInstitution.address,
      },
    ]);
    
    // Reset form
    setNewInstitution({
      name: "",
      code: "",
      type: "",
      address: "",
    });
    
    toast.success("Financial institution added successfully");
  };

  const handleStatusChange = (institutionId: string, newStatus: string) => {
    setInstitutions(
      institutions.map((institution) =>
        institution.id === institutionId ? { ...institution, status: newStatus } : institution
      )
    );
    
    toast.success(`Institution status updated to ${newStatus}`);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zicapi-primary">Financial Institutions</h1>
        <p className="text-muted-foreground">
          Register and manage financial institutions in the system
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Registered Institutions</CardTitle>
              <CardDescription>
                Financial institutions registered in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InstitutionTable institutions={institutions} onStatusChange={handleStatusChange} />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Add New Institution</CardTitle>
              <CardDescription>
                Register a new financial institution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddInstitution} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Institution Name</Label>
                  <Input
                    id="name"
                    value={newInstitution.name}
                    onChange={(e) =>
                      setNewInstitution({ ...newInstitution, name: e.target.value })
                    }
                    placeholder="Enter institution name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="code">Institution Code</Label>
                  <Input
                    id="code"
                    value={newInstitution.code}
                    onChange={(e) =>
                      setNewInstitution({ ...newInstitution, code: e.target.value })
                    }
                    placeholder="Enter unique code"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="type">Institution Type</Label>
                  <Select
                    value={newInstitution.type}
                    onValueChange={(value) =>
                      setNewInstitution({ ...newInstitution, type: value })
                    }
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="commercial">Commercial Bank</SelectItem>
                      <SelectItem value="central">Central Bank</SelectItem>
                      <SelectItem value="microfinance">Microfinance</SelectItem>
                      <SelectItem value="investment">Investment Bank</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={newInstitution.address}
                    onChange={(e) =>
                      setNewInstitution({ ...newInstitution, address: e.target.value })
                    }
                    placeholder="Enter physical address"
                  />
                </div>
                
                <Button type="submit" className="w-full">
                  <BuildingBank className="h-4 w-4 mr-2" />
                  Register Institution
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FinancialInstitutions;
