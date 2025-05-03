
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PenaltyCalculator from "@/components/penalties/PenaltyCalculator";
import ComplianceInvestigation from "@/components/penalties/ComplianceInvestigation";
import ComplianceSanctions from "@/components/penalties/ComplianceSanctions";
import { FileText, AlertTriangle, Ban, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { createAuditLog, AuditActions, AuditModules } from "@/services/auditService";

const Penalties: React.FC = () => {
  const [activeTab, setActiveTab] = useState("calculator");
  const navigate = useNavigate();

  const handleSettingsClick = () => {
    // Log the navigation to settings
    createAuditLog(
      "user123", // In a real app, this would come from auth context
      "John Doe", // In a real app, this would come from auth context
      "Administrator",
      AuditActions.DATA_VIEW,
      AuditModules.SYSTEM,
      "Accessed system audit trail settings"
    );
    
    // Navigate to settings page or show settings UI
    // This would typically link to a settings page or open a modal
    // For demonstration, we'll show a toast notification
    navigate("/settings");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zicapi-primary">Penalties & Compliance</h1>
          <p className="text-muted-foreground">
            Calculate penalties, conduct investigations, and manage sanctions for non-compliant entities
          </p>
        </div>
        <Button variant="outline" onClick={handleSettingsClick} className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          System Settings
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="calculator">
            <FileText className="h-4 w-4 mr-2" />
            Penalty Calculator
          </TabsTrigger>
          <TabsTrigger value="investigation">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Compliance Investigation
          </TabsTrigger>
          <TabsTrigger value="sanctions">
            <Ban className="h-4 w-4 mr-2" />
            Sanctions Management
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="calculator" className="space-y-4">
          <PenaltyCalculator />
        </TabsContent>
        
        <TabsContent value="investigation" className="space-y-4">
          <ComplianceInvestigation />
        </TabsContent>
        
        <TabsContent value="sanctions" className="space-y-4">
          <ComplianceSanctions />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Penalties;
