import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ResearchPoster: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            ZiCapi Flight Management System: Enhancing Aviation Transaction Compliance
          </h1>
          <p className="text-xl text-slate-600 mb-4">
            A Comprehensive Digital Solution for Flight Operations and Financial Compliance Management
          </p>
          <div className="flex justify-center items-center gap-8 text-sm text-slate-500">
            <span>Research & Development Team</span>
            <span>Aviation Technology Institute</span>
            <span>2024</span>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Abstract */}
            <Card className="bg-orange-400 text-white">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 text-center">Abstract</h2>
                <p className="text-sm leading-relaxed">
                  This study describes the "ZiCapi Flight Management System", a 
                  web-based platform that helps aviation professionals navigate 
                  compliance challenges in flight operations. The system allows 
                  operators to log operational issues, track compliance status, and 
                  provides customized responses with recommendations and decision-trees to 
                  guide them through complex regulatory requirements.
                </p>
              </CardContent>
            </Card>

            {/* Statement of Problem */}
            <Card className="bg-orange-400 text-white">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 text-center">Statement of the Problem</h2>
                <p className="text-sm leading-relaxed">
                  Flight operations generate complex financial transactions and compliance 
                  requirements. Aviation professionals often face difficulties with:
                  <br/>• Transaction facilitator discrepancies
                  <br/>• Unknown financial institution identification
                  <br/>• Manual compliance tracking processes
                  <br/>• Real-time regulatory requirement management
                  <br/>• Data reconciliation across multiple systems
                </p>
              </CardContent>
            </Card>

            {/* Innovation */}
            <Card className="bg-orange-400 text-white">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 text-center">Innovation</h2>
                <p className="text-sm leading-relaxed">
                  The system's cutting-edge capabilities include:
                  <br/>• Automated compliance monitoring and alerting
                  <br/>• Real-time transaction validation and flagging
                  <br/>• Intelligent discrepancy detection algorithms
                  <br/>• Integrated financial institution verification
                  <br/>• Advanced audit trail generation
                  <br/>• Machine learning-based risk assessment
                  <br/>• Customizable compliance dashboards
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column */}
          <div className="space-y-6">
            {/* System Objectives */}
            <Card className="bg-orange-400 text-white">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 text-center">System Objectives</h2>
                <div className="text-sm space-y-2">
                  <p>1. Provide comprehensive flight operations management with real-time compliance monitoring</p>
                  <p>2. Automate transaction validation and discrepancy detection</p>
                  <p>3. Enable seamless integration with existing aviation systems</p>
                  <p>4. Generate detailed audit trails for regulatory compliance</p>
                  <p>5. Offer intelligent analytics for operational optimization</p>
                  <p>6. Ensure data security and regulatory compliance</p>
                </div>
              </CardContent>
            </Card>

            {/* System Practical Considerations */}
            <Card className="bg-orange-500 text-white">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 text-center">SYSTEM PRACTICAL CONSIDERATIONS</h2>
                <div className="text-sm space-y-2">
                  <p>1. <strong>Seamless Integration:</strong> Compatible with existing aviation management systems</p>
                  <p>2. <strong>Scalability:</strong> Designed to handle high-volume transaction processing</p>
                  <p>3. <strong>Security:</strong> Enterprise-grade encryption and access controls</p>
                  <p>4. <strong>Compliance:</strong> Built-in support for international aviation regulations</p>
                  <p>5. <strong>User Experience:</strong> Intuitive interface for aviation professionals</p>
                  <p>6. <strong>Real-time Processing:</strong> Instant validation and alerting capabilities</p>
                </div>
              </CardContent>
            </Card>

            {/* Functionalities */}
            <Card className="bg-orange-500 text-white">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 text-center">FUNCTIONALITIES</h2>
                <div className="bg-white p-4 rounded">
                  <div className="text-slate-800 text-center">
                    <div className="mb-4">
                      <div className="bg-blue-500 text-white px-4 py-2 rounded mb-2">Flight Data Input</div>
                      <div className="text-sm">↓</div>
                      <div className="bg-green-500 text-white px-4 py-2 rounded mb-2">Transaction Validation</div>
                      <div className="text-sm">↓</div>
                      <div className="bg-yellow-500 text-white px-4 py-2 rounded mb-2">Compliance Check</div>
                      <div className="text-sm">↓</div>
                      <div className="bg-purple-500 text-white px-4 py-2 rounded">Report Generation</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* System Screenshots */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">System Interface</h3>
                <div className="bg-slate-800 p-4 rounded mb-4">
                  <div className="text-green-400 text-xs font-mono">
                    <div>ZiCapi Flight Management Dashboard</div>
                    <div className="mt-2">█ Transaction Status: MONITORING</div>
                    <div>█ Compliance Rate: 98.7%</div>
                    <div>█ Active Flights: 247</div>
                    <div>█ Flagged Items: 3</div>
                  </div>
                </div>
                <p className="text-sm text-slate-600">
                  The administrative interface allows system administrators to 
                  monitor real-time operations, review compliance status, and manage 
                  reports for enhanced regulatory compliance.
                </p>
              </CardContent>
            </Card>

            {/* System Architecture */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">System Architecture</h3>
                <div className="bg-slate-800 p-4 rounded mb-4">
                  <div className="text-blue-400 text-xs font-mono">
                    <div>┌─ Web Interface ─┐</div>
                    <div>│                 │</div>
                    <div>├─ API Gateway ───┤</div>
                    <div>│                 │</div>
                    <div>├─ Core Engine ───┤</div>
                    <div>│                 │</div>
                    <div>└─ Database ──────┘</div>
                  </div>
                </div>
                <p className="text-sm text-slate-600">
                  Built on modern web technologies including React, TypeScript, 
                  and advanced data processing capabilities.
                </p>
              </CardContent>
            </Card>

            {/* Conclusion */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">Conclusion</h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  The ZiCapi Flight Management System stands out 
                  for its distinct features and capabilities. It 
                  continually adapts to regulatory requirements, 
                  and changing operational environments in order to 
                  enhance its recommendations and compliance monitoring. 
                  The system is specifically designed to respond 
                  to changing conditions guaranteeing that aviation 
                  operators obtain current and contextually appropriate advice.
                </p>
              </CardContent>
            </Card>

            {/* References */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">References</h3>
                <div className="text-xs text-slate-600 space-y-1">
                  <p>Aviation Compliance Standards (2024). International Aviation Authority.</p>
                  <p>Flight Operations Management (2023). Aviation Technology Institute.</p>
                  <p>Digital Transformation in Aviation (2024). Tech Aviation Journal.</p>
                </div>
              </CardContent>
            </Card>

            {/* Logo/Branding */}
            <Card className="bg-slate-800 text-white">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold mb-2">2024</div>
                <div className="text-sm">ZiCapi</div>
                <div className="text-xs opacity-75">Flight Management Solutions</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearchPoster;