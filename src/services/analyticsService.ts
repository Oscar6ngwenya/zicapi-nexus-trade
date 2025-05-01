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
  PRICE_TOLERANCE: 0.01, // Lowered to 1% tolerance to catch more discrepancies
  // Tolerance for string comparison
  STRING_TOLERANCE: 0, // No tolerance for string fields - must match exactly
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
  customsTransaction?: Transaction;
  financialTransaction?: Transaction;
  discrepancyType: string; // Changed from specific types to allow for more fields
  customsValue?: any; // Changed to any to support different value types
  financialValue?: any; // Changed to any to support different value types
  percentageDifference: number;
  potentialCapitalFlight?: boolean;
  field?: string; // Added field to identify which field has a discrepancy
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

  // Analyze for data discrepancies between customs and financial institutions
  const dataDiscrepancies = compareTransactionData(analyzedTransactions);
  
  // Flag transactions with data discrepancies
  if (dataDiscrepancies.length > 0) {
    dataDiscrepancies.forEach(discrepancy => {
      // Flag both customs and financial transactions if they have discrepancies
      if (discrepancy.customsTransaction) {
        const transaction = analyzedTransactions.find(
          t => t.id === discrepancy.customsTransaction?.id
        );
        if (transaction) {
          transaction.status = "flagged";
          transaction.flagReason = `Data discrepancy: ${discrepancy.field || discrepancy.discrepancyType} value differs from financial data by ${discrepancy.percentageDifference.toFixed(2)}%`;
        }
      }
      
      if (discrepancy.financialTransaction) {
        const transaction = analyzedTransactions.find(
          t => t.id === discrepancy.financialTransaction?.id
        );
        if (transaction) {
          transaction.status = "flagged";
          transaction.flagReason = `Data discrepancy: ${discrepancy.field || discrepancy.discrepancyType} value differs from customs data by ${discrepancy.percentageDifference.toFixed(2)}%`;
          if (discrepancy.potentialCapitalFlight) {
            transaction.flagReason += ". Potential capital flight detected.";
          }
        }
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
 * Compare customs and financial transaction data to find discrepancies
 */
export const compareTransactionData = (transactions: Transaction[]): DataDiscrepancy[] => {
  const discrepancies: DataDiscrepancy[] = [];
  
  // Separate customs and financial data
  const customsTransactions = transactions.filter(t => t.source === 'customs');
  const financialTransactions = transactions.filter(t => t.source === 'financial');
  
  // If we don't have both sources, return empty discrepancies
  if (customsTransactions.length === 0 || financialTransactions.length === 0) {
    return discrepancies;
  }
  
  // Fields that must be compared - ensuring ALL fields are strictly validated
  const fieldsToCompare = [
    { name: "date", label: "Date", isNumeric: false, critical: true },
    { name: "entity", label: "Trading Company Name", isNumeric: false, critical: true },
    { name: "regNumber", label: "Company Registration Number", isNumeric: false, critical: true },
    { name: "bank", label: "Bank Used", isNumeric: false, critical: true },
    { name: "entryNumber", label: "Bill of Entry Number", isNumeric: false, critical: true },
    { name: "product", label: "Import/Export Description", isNumeric: false, critical: true },
    { name: "currency", label: "Currency", isNumeric: false, critical: true },
    { name: "unitPrice", label: "Item Unit Price", isNumeric: true, critical: true },
    { name: "quantity", label: "Quantity", isNumeric: true, critical: true },
    { name: "amount", label: "Total Cost", isNumeric: true, critical: true },
    { name: "type", label: "Transaction Type", isNumeric: false, critical: true },
    { name: "facilitator", label: "Transaction Facilitator", isNumeric: false, critical: false }
  ];
  
  // For each customs transaction, find matching financial transactions with enhanced matching criteria
  customsTransactions.forEach(customsTx => {
    // Find matching financial transactions based on multiple matching fields
    const matchingFinancialTxs = financialTransactions.filter(financialTx => 
      // Match by multiple criteria to improve accuracy
      (customsTx.entity === financialTx.entity || 
       (customsTx.regNumber && financialTx.regNumber && customsTx.regNumber === financialTx.regNumber)) &&
      // Check date proximity
      customsTx.date === financialTx.date
    );
    
    // Compare with each matching financial transaction
    matchingFinancialTxs.forEach(financialTx => {
      // Compare each field with strict validation
      fieldsToCompare.forEach(field => {
        const customsValue = customsTx[field.name as keyof Transaction];
        const financialValue = financialTx[field.name as keyof Transaction];
        
        // Skip if both values are undefined or the field is not critical for comparison
        if ((customsValue === undefined && financialValue === undefined) || 
            (field.critical === false && (customsValue === undefined || financialValue === undefined))) {
          return;
        }
        
        // Flag as discrepancy if one value exists and the other doesn't
        if ((customsValue === undefined && financialValue !== undefined) ||
            (customsValue !== undefined && financialValue === undefined)) {
          discrepancies.push({
            customsTransaction: customsTx,
            financialTransaction: financialTx,
            discrepancyType: "missing data",
            customsValue: customsValue,
            financialValue: financialValue,
            percentageDifference: 100, // 100% difference when data is missing
            field: field.label,
            potentialCapitalFlight: field.name === "amount" ? true : false
          });
          return;
        }
        
        let percentageDiff = 0;
        let isDifferent = false;
        
        // Compare based on field type (numeric or string)
        if (field.isNumeric) {
          const numericCustomsValue = Number(customsValue);
          const numericFinancialValue = Number(financialValue);
          
          // Calculate percentage difference for numeric values
          if (!isNaN(numericCustomsValue) && !isNaN(numericFinancialValue)) {
            const diff = Math.abs(numericCustomsValue - numericFinancialValue);
            const max = Math.max(numericCustomsValue, numericFinancialValue);
            const min = Math.min(numericCustomsValue, numericFinancialValue);
            percentageDiff = min > 0 ? (diff / min) * 100 : (max > 0 ? 100 : 0);
            isDifferent = percentageDiff > COMPLIANCE_RULES.PRICE_TOLERANCE * 100;
            
            // Special handling for total amount - always flag difference in financial values
            if (field.name === "amount" && diff > 0) {
              isDifferent = true;
            }
          } else {
            // If one value can't be converted to number, it's different
            isDifferent = true;
            percentageDiff = 100;
          }
        } else {
          // For non-numeric fields, any difference is a discrepancy - strict string comparison
          isDifferent = customsValue !== financialValue;
          percentageDiff = isDifferent ? 100 : 0; // 100% different if strings don't match
        }
        
        // Add discrepancy if difference detected
        if (isDifferent) {
          // Determine if this might indicate capital flight
          const potentialCapitalFlight = 
            (field.name === 'amount' && Number(financialValue) > Number(customsValue)) || 
            (field.name === 'unitPrice' && Number(financialValue) > Number(customsValue)) ||
            (field.name === 'currency' && customsValue !== financialValue);
          
          discrepancies.push({
            customsTransaction: customsTx,
            financialTransaction: financialTx,
            discrepancyType: field.isNumeric ? "value" : "data",
            customsValue: customsValue,
            financialValue: financialValue,
            percentageDifference: percentageDiff,
            potentialCapitalFlight: potentialCapitalFlight,
            field: field.label
          });
        }
      });
    });
    
    // Flag customs transactions with no matching financial transaction
    if (matchingFinancialTxs.length === 0) {
      discrepancies.push({
        customsTransaction: customsTx,
        financialTransaction: undefined,
        discrepancyType: "missing transaction",
        customsValue: customsTx.amount,
        financialValue: undefined,
        percentageDifference: 100,
        potentialCapitalFlight: true,
        field: "Entire Transaction"
      });
    }
  });
  
  // Flag financial transactions with no matching customs transaction
  financialTransactions.forEach(financialTx => {
    const matchingCustomsTx = customsTransactions.find(customsTx => 
      (customsTx.entity === financialTx.entity || 
       (customsTx.regNumber && financialTx.regNumber && customsTx.regNumber === financialTx.regNumber)) &&
      customsTx.date === financialTx.date
    );
    
    if (!matchingCustomsTx) {
      discrepancies.push({
        customsTransaction: undefined,
        financialTransaction: financialTx,
        discrepancyType: "missing transaction",
        customsValue: undefined,
        financialValue: financialTx.amount,
        percentageDifference: 100,
        potentialCapitalFlight: true,
        field: "Entire Transaction"
      });
    }
  });
  
  return discrepancies;
};

/**
 * Determine if two transactions are related enough to compare
 */
const areRelatedTransactions = (tx1: Transaction, tx2: Transaction): boolean => {
  // Consider transactions related if:
  // 1. Same entity name
  // 2. Same transaction date or close (within 3 days)
  // 3. Same currency
  // 4. Similar product/description
  
  // Check entity name
  if (tx1.entity !== tx2.entity) return false;
  
  // Check currency
  if (tx1.currency !== tx2.currency) return false;
  
  // Check product similarity
  const productMatch = tx1.product === tx2.product || 
    (tx1.product && tx2.product && 
     (tx1.product.includes(tx2.product) || tx2.product.includes(tx1.product)));
  
  if (!productMatch) return false;
  
  // Check date proximity (simplistic implementation - in real app would use proper date comparison)
  // For this demo we'll just check if the date strings match
  return tx1.date === tx2.date;
};

/**
 * Format transaction data for Excel export
 */
export const formatTransactionsForExport = (transactions: Transaction[]): any[] => {
  return transactions.map(tx => ({
    ID: tx.id,
    Date: tx.date,
    "Trading Company Name": tx.entity,
    "Company Reg Number (TIN)": tx.regNumber || "N/A",
    "Bank Used": tx.bank,
    "Bill of Entry Number": tx.entryNumber || "N/A",
    Type: tx.type === 'import' ? 'Import' : 'Export',
    "Import/Export Description": tx.product,
    Currency: tx.currency,
    "Item Unit Price": tx.unitPrice || 0,
    Quantity: tx.quantity || 0,
    "Total Cost": tx.amount,
    Status: tx.status,
    "Flag Reason": tx.flagReason || '',
  }));
};

/**
 * Format discrepancy data for Excel report
 */
export const formatDiscrepanciesForExport = (discrepancies: DataDiscrepancy[]): any[] => {
  return discrepancies.map(d => {
    const customsTx = d.customsTransaction;
    const financialTx = d.financialTransaction;
    
    return {
      Date: customsTx?.date || financialTx?.date,
      "Company Name": customsTx?.entity || financialTx?.entity,
      "Company Reg Number": customsTx?.regNumber || financialTx?.regNumber || "N/A",
      "Field with Discrepancy": d.field || d.discrepancyType,
      "Customs Value": d.customsValue,
      "Financial Value": d.financialValue,
      "Difference %": `${d.percentageDifference.toFixed(2)}%`,
      "Potential Capital Flight": d.potentialCapitalFlight ? "Yes" : "No",
      "Bank Used": customsTx?.bank || financialTx?.bank,
      "Import/Export Description": customsTx?.product || financialTx?.product,
      "Currency": customsTx?.currency || financialTx?.currency,
    };
  });
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
