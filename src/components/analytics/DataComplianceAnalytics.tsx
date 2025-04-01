
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ComplianceChart from "@/components/analytics/ComplianceChart";
import { Transaction } from "@/components/dashboard/TransactionTable";
import { ComplianceAnalysis } from "@/services/analyticsService";
import { Badge } from "@/components/ui/badge";
import { Check, AlertTriangle, Clock } from "lucide-react";

interface DataComplianceAnalyticsProps {
  analysis: ComplianceAnalysis;
}

const DataComplianceAnalytics: React.FC<DataComplianceAnalyticsProps> = ({ analysis }) => {
  // Format chart data
  const chartData = {
    barData: analysis.complianceByBank,
    pieData: analysis.statusDistribution,
    lineData: analysis.complianceByType,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compliance Analysis</CardTitle>
        <CardDescription>
          Analysis of imported transaction data compliance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div>
              <h4 className="text-sm font-medium text-green-800">Compliant</h4>
              <p className="text-2xl font-bold text-green-900">{analysis.compliantCount}</p>
            </div>
            <Check className="h-8 w-8 text-green-500" />
          </div>
          
          <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Pending Review</h4>
              <p className="text-2xl font-bold text-yellow-900">{analysis.pendingCount}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
          
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
            <div>
              <h4 className="text-sm font-medium text-red-800">Flagged</h4>
              <p className="text-2xl font-bold text-red-900">{analysis.flaggedCount}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Overall Compliance Rate</h3>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
              className={`h-4 rounded-full ${analysis.complianceRate > 80 ? 'bg-green-500' : analysis.complianceRate > 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${analysis.complianceRate}%` }}
            ></div>
          </div>
          <p className="text-right mt-1 text-sm text-gray-600">{analysis.complianceRate.toFixed(1)}%</p>
        </div>
        
        <Tabs defaultValue="charts" className="mt-6">
          <TabsList>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="flagged">Flagged Transactions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="charts">
            <div className="h-80">
              <ComplianceChart 
                data={chartData}
                title="Compliance Distribution"
                description="Compliance analysis by bank and transaction type"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="flagged">
            <div className="max-h-80 overflow-y-auto">
              {analysis.flaggedTransactions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No flagged transactions found
                </p>
              ) : (
                <div className="space-y-4">
                  {analysis.flaggedTransactions.map((transaction) => (
                    <div key={transaction.id} className="border border-red-100 bg-red-50 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{transaction.entity}</h4>
                          <p className="text-sm text-gray-600">{transaction.date} • {transaction.bank}</p>
                        </div>
                        <Badge variant="outline" className="bg-red-100 text-red-800">
                          Flagged
                        </Badge>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm">
                          <span className="font-medium">Amount:</span> {new Intl.NumberFormat('en-US', { style: 'currency', currency: transaction.currency }).format(transaction.amount)}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Product:</span> {transaction.product}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DataComplianceAnalytics;
