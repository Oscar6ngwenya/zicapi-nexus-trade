
import { Transaction } from "@/components/dashboard/TransactionTable";

// Compliance rules
const COMPLIANCE_RULES = {
  // Threshold for transaction amount that requires extra scrutiny
  HIGH_VALUE_THRESHOLD: 50000,
  // Currency pairs that are considered high risk
  HIGH_RISK_CURRENCIES: ["USD", "EUR", "GBP"],
  // Banks that are flagged for extra monitoring
  MONITORED_BANKS: ["Commerce Bank", "International Finance"]
};

export interface ComplianceAnalysis {
  compliantCount: number;
  flaggedCount: number;
  pendingCount: number;
  complianceRate: number;
  flaggedTransactions: Transaction[];
  complianceByBank: { name: string; compliance: number }[];
  complianceByType: { name: string; compliance: number }[];
  statusDistribution: { name: string; value: number; color: string }[];
}

/**
 * Analyzes a list of transactions for compliance
 */
export const analyzeCompliance = (transactions: Transaction[]): ComplianceAnalysis => {
  if (!transactions.length) {
    return {
      compliantCount: 0,
      flaggedCount: 0,
      pendingCount: 0,
      complianceRate: 0,
      flaggedTransactions: [],
      complianceByBank: [],
      complianceByType: [],
      statusDistribution: [
        { name: "Compliant", value: 0, color: "#4ade80" },
        { name: "Pending", value: 0, color: "#facc15" },
        { name: "Flagged", value: 0, color: "#f87171" }
      ]
    };
  }

  // Deep copy and analyze transactions for compliance
  const analyzedTransactions = transactions.map(transaction => {
    const copy = { ...transaction };
    
    // Apply compliance rules
    if (transaction.amount > COMPLIANCE_RULES.HIGH_VALUE_THRESHOLD) {
      copy.status = "flagged";
    } else if (COMPLIANCE_RULES.MONITORED_BANKS.includes(transaction.bank)) {
      copy.status = "pending";
    } else {
      copy.status = "compliant";
    }
    
    return copy;
  });

  // Count results
  const compliantCount = analyzedTransactions.filter(t => t.status === "compliant").length;
  const flaggedCount = analyzedTransactions.filter(t => t.status === "flagged").length;
  const pendingCount = analyzedTransactions.filter(t => t.status === "pending").length;
  const complianceRate = (compliantCount / analyzedTransactions.length) * 100;

  // Bank compliance analysis
  const bankGroups = analyzedTransactions.reduce((acc, t) => {
    if (!acc[t.bank]) {
      acc[t.bank] = { total: 0, compliant: 0 };
    }
    acc[t.bank].total += 1;
    if (t.status === "compliant") {
      acc[t.bank].compliant += 1;
    }
    return acc;
  }, {} as Record<string, { total: number; compliant: number }>);

  const complianceByBank = Object.entries(bankGroups).map(([name, data]) => ({
    name,
    compliance: Math.round((data.compliant / data.total) * 100)
  }));

  // Type compliance analysis
  const typeGroups = analyzedTransactions.reduce((acc, t) => {
    if (!acc[t.type]) {
      acc[t.type] = { total: 0, compliant: 0 };
    }
    acc[t.type].total += 1;
    if (t.status === "compliant") {
      acc[t.type].compliant += 1;
    }
    return acc;
  }, {} as Record<string, { total: number; compliant: number }>);

  const complianceByType = Object.entries(typeGroups).map(([name, data]) => ({
    name: name === "import" ? "Imports" : "Exports",
    compliance: Math.round((data.compliant / data.total) * 100)
  }));

  // Status distribution
  const statusDistribution = [
    { name: "Compliant", value: Math.round((compliantCount / analyzedTransactions.length) * 100), color: "#4ade80" },
    { name: "Pending", value: Math.round((pendingCount / analyzedTransactions.length) * 100), color: "#facc15" },
    { name: "Flagged", value: Math.round((flaggedCount / analyzedTransactions.length) * 100), color: "#f87171" }
  ];

  return {
    compliantCount,
    flaggedCount,
    pendingCount,
    complianceRate,
    flaggedTransactions: analyzedTransactions.filter(t => t.status === "flagged"),
    complianceByBank,
    complianceByType,
    statusDistribution
  };
};
