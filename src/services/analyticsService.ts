
import { Transaction } from "@/components/dashboard/TransactionTable";
import * as XLSX from "xlsx";

// Compliance rules
const COMPLIANCE_RULES = {
  // Threshold for transaction amount that requires extra scrutiny
  HIGH_VALUE_THRESHOLD: 50000,
  // Currency pairs that are considered high risk
  HIGH_RISK_CURRENCIES: ["USD", "EUR", "GBP"],
  // Banks that are flagged for extra monitoring
  MONITORED_BANKS: ["Commerce Bank", "International Finance"],
  // Tolerance for price comparison (percentage)
  PRICE_TOLERANCE: 0.02, // Lowered from 0.05 to 0.02 (2% tolerance) to catch more discrepancies
  // Penalty rate for non-compliance (percentage of original amount)
  PENALTY_RATE: 1.0, // 100% penalty
  // Daily interest rate for continued non-compliance (percentage)
  DAILY_INTEREST_RATE: 0.05 // 5% daily interest
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
  dataDiscrepancies?: DataDiscrepancy[];
}

export interface DataDiscrepancy {
  importedTransaction: Transaction;
  manualEntry: Transaction;
  discrepancyType: "price" | "quantity" | "total";
  importedValue: number;
  manualValue: number;
  percentageDifference: number;
}

export interface PenaltyCalculation {
  transaction: Transaction;
  daysLate: number;
  originalAmount: number;
  receivedAmount: number;
  outstandingAmount: number;
  penaltyAmount: number;
  interestAmount: number;
  totalDue: number;
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
      copy.flagReason = "High value transaction requires additional review";
    } else if (COMPLIANCE_RULES.MONITORED_BANKS.includes(transaction.bank)) {
      copy.status = "pending";
    } else {
      copy.status = "compliant";
    }
    
    return copy;
  });

  // Analyze for data discrepancies between imported and manual entries
  const dataDiscrepancies = compareTransactionData(analyzedTransactions);
  
  // Flag transactions with data discrepancies
  if (dataDiscrepancies.length > 0) {
    dataDiscrepancies.forEach(discrepancy => {
      const transaction = analyzedTransactions.find(
        t => t.id === discrepancy.importedTransaction.id
      );
      if (transaction) {
        transaction.status = "flagged";
        transaction.flagReason = `Data discrepancy: ${discrepancy.discrepancyType} values don't match (${discrepancy.percentageDifference.toFixed(2)}% difference)`;
      }
    });
  }

  // Count results
  const compliantCount = analyzedTransactions.filter(t => t.status === "compliant").length;
  const flaggedCount = analyzedTransactions.filter(t => t.status === "flagged").length;
  const pendingCount = analyzedTransactions.filter(t => t.status === "pending").length;
  const complianceRate = analyzedTransactions.length > 0 
    ? (compliantCount / analyzedTransactions.length) * 100
    : 0;

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
    compliance: data.total > 0 ? Math.round((data.compliant / data.total) * 100) : 0
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
    compliance: data.total > 0 ? Math.round((data.compliant / data.total) * 100) : 0
  }));

  // Status distribution
  const totalTransactions = analyzedTransactions.length;
  const statusDistribution = [
    { 
      name: "Compliant", 
      value: totalTransactions > 0 ? Math.round((compliantCount / totalTransactions) * 100) : 0, 
      color: "#4ade80" 
    },
    { 
      name: "Pending", 
      value: totalTransactions > 0 ? Math.round((pendingCount / totalTransactions) * 100) : 0, 
      color: "#facc15" 
    },
    { 
      name: "Flagged", 
      value: totalTransactions > 0 ? Math.round((flaggedCount / totalTransactions) * 100) : 0, 
      color: "#f87171" 
    }
  ];

  return {
    compliantCount,
    flaggedCount,
    pendingCount,
    complianceRate,
    flaggedTransactions: analyzedTransactions.filter(t => t.status === "flagged"),
    complianceByBank,
    complianceByType,
    statusDistribution,
    dataDiscrepancies: dataDiscrepancies.length > 0 ? dataDiscrepancies : undefined
  };
};

/**
 * Compare imported and manual entry transaction data to find discrepancies
 */
const compareTransactionData = (transactions: Transaction[]): DataDiscrepancy[] => {
  const discrepancies: DataDiscrepancy[] = [];
  
  // Group transactions by entity and similar dates for comparison
  const transactionGroups = groupSimilarTransactions(transactions);
  
  // For each group, compare imported vs manual entries
  Object.values(transactionGroups).forEach(group => {
    const importedTransactions = group.filter(t => t.source === 'imported');
    const manualTransactions = group.filter(t => t.source === 'manual');
    
    // Compare each imported transaction with relevant manual entries
    importedTransactions.forEach(importedTx => {
      manualTransactions.forEach(manualTx => {
        // If products/descriptions match, compare financial values
        if (areRelatedTransactions(importedTx, manualTx)) {
          // Compare amounts (assuming this represents total price)
          const amountDifference = Math.abs(importedTx.amount - manualTx.amount);
          const percentageDiff = importedTx.amount > 0 
            ? (amountDifference / importedTx.amount) * 100
            : 0;
          
          if (percentageDiff > COMPLIANCE_RULES.PRICE_TOLERANCE * 100) {
            discrepancies.push({
              importedTransaction: importedTx,
              manualEntry: manualTx,
              discrepancyType: "total",
              importedValue: importedTx.amount,
              manualValue: manualTx.amount,
              percentageDifference: percentageDiff
            });
          }
          
          // If transaction has quantity and unit price data, compare those too
          if (importedTx.quantity && manualTx.quantity && 
              importedTx.unitPrice && manualTx.unitPrice) {
            
            // Check quantity
            const quantityDiff = Math.abs(importedTx.quantity - manualTx.quantity);
            const quantityPercentageDiff = importedTx.quantity > 0
              ? (quantityDiff / importedTx.quantity) * 100
              : 0;
            
            if (quantityPercentageDiff > COMPLIANCE_RULES.PRICE_TOLERANCE * 100) {
              discrepancies.push({
                importedTransaction: importedTx,
                manualEntry: manualTx,
                discrepancyType: "quantity",
                importedValue: importedTx.quantity,
                manualValue: manualTx.quantity,
                percentageDifference: quantityPercentageDiff
              });
            }
            
            // Check unit price
            const priceDiff = Math.abs(importedTx.unitPrice - manualTx.unitPrice);
            const pricePercentageDiff = importedTx.unitPrice > 0
              ? (priceDiff / importedTx.unitPrice) * 100
              : 0;
            
            if (pricePercentageDiff > COMPLIANCE_RULES.PRICE_TOLERANCE * 100) {
              discrepancies.push({
                importedTransaction: importedTx,
                manualEntry: manualTx,
                discrepancyType: "price",
                importedValue: importedTx.unitPrice,
                manualValue: manualTx.unitPrice,
                percentageDifference: pricePercentageDiff
              });
            }
          }
        }
      });
    });
  });
  
  return discrepancies;
};

/**
 * Group transactions by entity and approximate date
 */
const groupSimilarTransactions = (transactions: Transaction[]) => {
  const groups: Record<string, Transaction[]> = {};
  
  transactions.forEach(transaction => {
    // Create a key based on entity and date (simplified for this implementation)
    const key = `${transaction.entity}-${transaction.date.substring(0, 7)}`; // Group by month
    
    if (!groups[key]) {
      groups[key] = [];
    }
    
    groups[key].push(transaction);
  });
  
  return groups;
};

/**
 * Determine if two transactions are related enough to compare
 */
const areRelatedTransactions = (tx1: Transaction, tx2: Transaction): boolean => {
  // Related if same entity, currency and similar product/description
  return tx1.entity === tx2.entity && 
         tx1.currency === tx2.currency &&
         (tx1.product === tx2.product || 
          (tx1.product && tx2.product && 
           (tx1.product.includes(tx2.product) || tx2.product.includes(tx1.product))));
};

/**
 * Format transaction data for Excel export
 */
export const formatTransactionsForExport = (transactions: Transaction[]): any[] => {
  return transactions.map(tx => ({
    ID: tx.id,
    Date: tx.date,
    Entity: tx.entity,
    Type: tx.type === 'import' ? 'Import' : 'Export',
    Currency: tx.currency,
    Amount: tx.amount,
    Product: tx.product,
    Bank: tx.bank,
    Status: tx.status,
    'Flag Reason': tx.flagReason || '',
    'Quantity': tx.quantity || '',
    'Unit Price': tx.unitPrice || '',
  }));
};

/**
 * Calculate penalties and interest for overdue transactions
 */
export const calculatePenaltyAndInterest = (
  transaction: Transaction, 
  daysLate: number,
  receivedAmount: number = 0
): PenaltyCalculation => {
  const outstandingAmount = transaction.amount - receivedAmount;
  
  // Apply penalty (100% of outstanding amount)
  const penaltyAmount = outstandingAmount * COMPLIANCE_RULES.PENALTY_RATE;
  
  // Calculate interest (5% per day on outstanding amount, simple interest)
  const interestAmount = outstandingAmount * COMPLIANCE_RULES.DAILY_INTEREST_RATE * daysLate;
  
  // Total amount due
  const totalDue = outstandingAmount + penaltyAmount + interestAmount;
  
  return {
    transaction,
    daysLate,
    originalAmount: transaction.amount,
    receivedAmount,
    outstandingAmount,
    penaltyAmount,
    interestAmount,
    totalDue
  };
};
