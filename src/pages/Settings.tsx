
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings as SettingsIcon, FileText, AlertTriangle, User, History } from "lucide-react";
import AuditTrailSettings from "@/components/settings/AuditTrailSettings";
import { createAuditLog, AuditActions, AuditModules } from "@/services/auditService";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState("audit");
  const navigate = useNavigate();
  
  // Log tab changes for auditing purposes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
    // Create audit log entry for tab navigation
    const tabModuleMap: Record<string, string> = {
      "audit": "Audit Trail",
      "security": "Security Settings",
      "general": "General Settings"
    };
    
    createAuditLog(
      "user123", // In a real app, this would come from auth context
      "John Doe", // In a real app, this would come from auth context
      "Administrator",
      AuditActions.DATA_VIEW,
      AuditModules.SYSTEM,
      `Viewed ${tabModuleMap[tab] || tab} settings`
    );
  };

  const navigateToAuditTrail = () => {
    navigate("/audit-trail");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zicapi-primary">System Settings</h1>
          <p className="text-muted-foreground">
            Configure system-wide settings and view audit information
          </p>
        </div>
        <Button 
          onClick={navigateToAuditTrail} 
          className="flex items-center gap-2"
        >
          <History className="h-4 w-4" />
          View Full Audit Trail
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList>
          <TabsTrigger value="audit">
            <FileText className="h-4 w-4 mr-2" />
            Audit Trail
          </TabsTrigger>
          <TabsTrigger value="security">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Security Settings
          </TabsTrigger>
          <TabsTrigger value="general">
            <SettingsIcon className="h-4 w-4 mr-2" />
            General Settings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="audit" className="space-y-4">
          <AuditTrailSettings />
        </TabsContent>
        
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure system security policies and authentication settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                Security settings configuration will be implemented in a future update.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure general system behavior and appearance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                General settings configuration will be implemented in a future update.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
