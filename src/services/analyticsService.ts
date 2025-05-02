
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
  // Tolerance levels for price comparison (percentage)
  PRICE_TOLERANCE: {
    GREEN: 0.05, // 5% tolerance - compliant
    YELLOW: 0.15, // 5-15% tolerance - suspicious
    RED: 0.15 // >15% - likely fraudulent
  },
  // Tolerance for string comparison (Levenshtein distance for fuzzy matching)
  STRING_TOLERANCE: 3, // Allow up to 3 character differences for string fields
  // Penalty rate for non-compliance (percentage of original amount)
  PENALTY_RATE: 1.0, // 100% penalty
  // Daily interest rate for continued non-compliance (percentage)
  DAILY_INTEREST_RATE: 0.05, // 5% daily interest
  // Number of days to consider for transaction matching
  DATE_MATCHING_WINDOW: 3
};

// Zimbabwe TIN format validation regex
const ZW_TIN_REGEX = /^\d{10}[A-Z]$/;

// Historical exchange rates (normally would be fetched from an API)
const EXCHANGE_RATES = {
  "2023-01-01": { "ZWL": 0.0031, "EUR": 1.09, "GBP": 1.24 },
  "2023-02-01": { "ZWL": 0.0028, "EUR": 1.08, "GBP": 1.22 },
  "2023-03-01": { "ZWL": 0.0027, "EUR": 1.07, "GBP": 1.21 },
  "2023-04-01": { "ZWL": 0.0026, "EUR": 1.09, "GBP": 1.23 },
  "2023-05-01": { "ZWL": 0.0024, "EUR": 1.10, "GBP": 1.25 },
  "2023-06-01": { "ZWL": 0.0022, "EUR": 1.08, "GBP": 1.27 },
  "2023-07-01": { "ZWL": 0.0020, "EUR": 1.10, "GBP": 1.28 },
  "2023-08-01": { "ZWL": 0.0019, "EUR": 1.09, "GBP": 1.27 },
  "2023-09-01": { "ZWL": 0.0017, "EUR": 1.07, "GBP": 1.26 },
  "2023-10-01": { "ZWL": 0.0016, "EUR": 1.06, "GBP": 1.22 },
  "2023-11-01": { "ZWL": 0.0015, "EUR": 1.08, "GBP": 1.25 },
  "2023-12-01": { "ZWL": 0.0014, "EUR": 1.09, "GBP": 1.26 },
  "2024-01-01": { "ZWL": 0.0013, "EUR": 1.10, "GBP": 1.27 },
  "2024-02-01": { "ZWL": 0.0012, "EUR": 1.08, "GBP": 1.26 },
  "2024-03-01": { "ZWL": 0.0011, "EUR": 1.09, "GBP": 1.28 },
  "2024-04-01": { "ZWL": 0.0010, "EUR": 1.08, "GBP": 1.25 },
  "2024-05-01": { "ZWL": 0.0009, "EUR": 1.07, "GBP": 1.24 }
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
  discrepancyType: string;
  customsValue?: any;
  financialValue?: any;
  percentageDifference: number;
  potentialCapitalFlight?: boolean;
  field?: string;
  severity?: 'high' | 'medium' | 'low';
  impact?: string;
  resolutionStatus?: 'unresolved' | 'investigating' | 'resolved';
  annotations?: string;
  matchConfidence?: number;
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
 * Validates a Zimbabwean TIN number
 */
export const isValidZimbabweanTIN = (tin: string): boolean => {
  if (!tin) return false;
  return ZW_TIN_REGEX.test(tin);
};

/**
 * Calculate the Levenshtein distance between two strings
 * for fuzzy matching company names
 */
export const levenshteinDistance = (a: string, b: string): number => {
  const matrix = [];

  // Increment along the first column of each row
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  // Increment each column in the first row
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
};

/**
 * Normalize a company name for better comparison
 * Handles abbreviations, case variations, and special characters
 */
export const normalizeCompanyName = (name: string): string => {
  if (!name) return '';
  
  // Convert to lowercase
  let normalized = name.toLowerCase();
  
  // Remove special characters and extra spaces
  normalized = normalized.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
  
  // Handle common abbreviations
  const abbreviations: Record<string, string> = {
    'private': 'pvt',
    'pvt': 'pvt',
    'limited': 'ltd',
    'ltd': 'ltd',
    'incorporated': 'inc',
    'inc': 'inc',
    'corporation': 'corp',
    'corp': 'corp',
    'company': 'co',
    'co': 'co'
  };
  
  Object.entries(abbreviations).forEach(([full, abbr]) => {
    normalized = normalized.replace(new RegExp(`\\b${full}\\b`, 'g'), abbr);
  });
  
  return normalized;
};

/**
 * Standardize date format to ISO 8601 (YYYY-MM-DD)
 * Accepts multiple input formats
 */
export const standardizeDate = (dateInput: string | number): string => {
  if (!dateInput) return '';
  
  // If it's already ISO format, just return it
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    return dateInput;
  }
  
  try {
    // Handle Excel numeric date
    if (typeof dateInput === 'number') {
      const excelDate = XLSX.SSF.parse_date_code(dateInput);
      return `${excelDate.y}-${String(excelDate.m).padStart(2, '0')}-${String(excelDate.d).padStart(2, '0')}`;
    }
    
    // Try to parse various date formats
    const formats = [
      // MM/DD/YYYY
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
      // DD/MM/YYYY
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
      // MM-DD-YYYY
      /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
      // DD-MM-YYYY
      /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
      // DD.MM.YYYY
      /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/
    ];
    
    for (const format of formats) {
      const match = dateInput.toString().match(format);
      if (match) {
        const [_, part1, part2, year] = match;
        
        // Determine if month-first or day-first format
        // This is a simplification - in a real app, you would use locale info
        const isMonthFirst = format.toString().includes('MM/DD') || format.toString().includes('MM-DD');
        
        const month = isMonthFirst ? part1 : part2;
        const day = isMonthFirst ? part2 : part1;
        
        // Validate month and day
        const monthNum = parseInt(month, 10);
        const dayNum = parseInt(day, 10);
        
        if (monthNum < 1 || monthNum > 12 || dayNum < 1 || dayNum > 31) {
          continue; // Invalid date, try next format
        }
        
        return `${year}-${String(monthNum).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      }
    }
    
    // If all else fails, try JavaScript's Date parsing
    const date = new Date(dateInput);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  } catch (error) {
    console.error("Error standardizing date:", error);
  }
  
  return typeof dateInput === 'string' ? dateInput : '';
};

/**
 * Validate Bill of Entry number format for Zimbabwe
 * Format: ZW-[YEAR]-[6-digit-number]
 */
export const isValidBillOfEntry = (billNumber: string): boolean => {
  if (!billNumber) return false;
  
  // Zimbabwe Bill of Entry format
  const zwFormat = /^ZW-\d{4}-\d{6}$/;
  
  return zwFormat.test(billNumber);
};

/**
 * Convert amount to USD based on exchange rates
 */
export const convertToUSD = (amount: number, currency: string, date: string): number => {
  if (!amount || !currency || currency === 'USD') return amount;
  
  // Find closest date in exchange rates
  const dateKeys = Object.keys(EXCHANGE_RATES).sort();
  let closestDate = dateKeys[0];
  
  for (const key of dateKeys) {
    if (key <= date) {
      closestDate = key;
    } else {
      break;
    }
  }
  
  const rates = EXCHANGE_RATES[closestDate];
  if (!rates || !rates[currency]) {
    // Default to 1:1 if rate not found
    return amount;
  }
  
  return amount * rates[currency];
};

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
 * Clean and standardize transaction data
 */
export const cleanTransactionData = (transactions: Transaction[]): Transaction[] => {
  // Create deep copy of transactions to avoid modifying originals
  const cleanedTransactions = transactions.map(tx => ({...tx}));
  
  // Process and standardize each transaction
  return cleanedTransactions.map(tx => {
    // Standardize dates
    tx.date = standardizeDate(tx.date);
    
    // Normalize company names
    tx.entity = normalizeCompanyName(tx.entity);
    
    // Fill missing values
    if (!tx.quantity && tx.amount && tx.unitPrice) {
      tx.quantity = tx.amount / tx.unitPrice;
    } else if (!tx.unitPrice && tx.amount && tx.quantity) {
      tx.unitPrice = tx.amount / tx.quantity;
    } else if (!tx.amount && tx.unitPrice && tx.quantity) {
      tx.amount = tx.unitPrice * tx.quantity;
    }
    
    // Ensure transaction type is standardized
    tx.type = tx.type?.toLowerCase() === 'export' ? 'export' : 'import';
    
    return tx;
  });
};

/**
 * Compare customs and financial transaction data to find discrepancies
 * Enhanced with fuzzy matching and multi-attribute matching algorithm
 */
export const compareTransactionData = (transactions: Transaction[]): DataDiscrepancy[] => {
  const discrepancies: DataDiscrepancy[] = [];
  
  // Clean and standardize the data first
  const cleanedTransactions = cleanTransactionData(transactions);
  
  // Separate customs and financial data
  const customsTransactions = cleanedTransactions.filter(t => t.source === 'customs');
  const financialTransactions = cleanedTransactions.filter(t => t.source === 'financial');
  
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

  // Track matched transaction IDs
  const matchedTransactions = new Set<string>();
  
  // First pass - match by PRIMARY KEY: Bill of Entry + TIN (highest confidence)
  customsTransactions.forEach(customsTx => {
    if (!customsTx.entryNumber || !customsTx.regNumber) return; // Skip if missing primary keys
    
    financialTransactions.forEach(financialTx => {
      if (!financialTx.entryNumber || !financialTx.regNumber) return; // Skip if missing primary keys
      
      // Exact match on primary keys
      if (customsTx.entryNumber === financialTx.entryNumber && 
          customsTx.regNumber === financialTx.regNumber) {
        
        compareTransactions(customsTx, financialTx, fieldsToCompare, discrepancies, 100); // 100% confidence
        matchedTransactions.add(customsTx.id);
        matchedTransactions.add(financialTx.id);
      }
    });
  });
  
  // Second pass - match by SECONDARY KEYS: Date ±3 days + Company Name + Total Cost ±10%
  const DATE_WINDOW = COMPLIANCE_RULES.DATE_MATCHING_WINDOW; // Days in either direction
  const COST_TOLERANCE = 0.1; // 10% tolerance
  
  customsTransactions
    .filter(tx => !matchedTransactions.has(tx.id))
    .forEach(customsTx => {
      const customsDate = new Date(customsTx.date);
      if (isNaN(customsDate.getTime())) return; // Skip if invalid date
      
      const matchCandidates = financialTransactions
        .filter(tx => !matchedTransactions.has(tx.id))
        .map(financialTx => {
          const financialDate = new Date(financialTx.date);
          if (isNaN(financialDate.getTime())) return null;
          
          // Calculate date difference in days
          const dateDiffMs = Math.abs(customsDate.getTime() - financialDate.getTime());
          const dateDiffDays = Math.floor(dateDiffMs / (1000 * 60 * 60 * 24));
          
          if (dateDiffDays > DATE_WINDOW) return null; // Date too far apart
          
          // Normalize company names and check similarity
          const customsName = normalizeCompanyName(customsTx.entity);
          const financialName = normalizeCompanyName(financialTx.entity);
          
          // Calculate similarity using Levenshtein distance
          const nameDistance = levenshteinDistance(customsName, financialName);
          const maxNameLength = Math.max(customsName.length, financialName.length);
          const nameSimilarity = maxNameLength > 0 ? 1 - (nameDistance / maxNameLength) : 0;
          
          if (nameSimilarity < 0.7) return null; // Names too different
          
          // Check amount similarity if both amounts exist
          let amountSimilarity = 0;
          if (customsTx.amount && financialTx.amount) {
            const minAmount = Math.min(customsTx.amount, financialTx.amount);
            const maxAmount = Math.max(customsTx.amount, financialTx.amount);
            amountSimilarity = minAmount / maxAmount;
            
            if (amountSimilarity < (1 - COST_TOLERANCE)) return null; // Amounts too different
          }
          
          // Calculate overall match confidence
          const dateScore = 1 - (dateDiffDays / (DATE_WINDOW + 1)); // 1.0 if same day, 0.0 if max days apart
          const overallConfidence = (dateScore * 0.3) + (nameSimilarity * 0.5) + (amountSimilarity * 0.2);
          
          return {
            financialTx,
            confidence: Math.round(overallConfidence * 100) // As percentage
          };
        })
        .filter(Boolean)
        .sort((a, b) => b!.confidence - a!.confidence);
      
      // Match with the highest confidence candidate, if above threshold
      const bestMatch = matchCandidates[0];
      if (bestMatch && bestMatch.confidence >= 70) { // At least 70% confident
        compareTransactions(customsTx, bestMatch.financialTx, fieldsToCompare, discrepancies, bestMatch.confidence);
        matchedTransactions.add(customsTx.id);
        matchedTransactions.add(bestMatch.financialTx.id);
      }
    });
  
  // Flag unmatched transactions - this could indicate completely missing declarations
  customsTransactions
    .filter(tx => !matchedTransactions.has(tx.id))
    .forEach(customsTx => {
      discrepancies.push({
        customsTransaction: customsTx,
        financialTransaction: undefined,
        discrepancyType: "missing transaction",
        customsValue: customsTx.amount,
        financialValue: undefined,
        percentageDifference: 100,
        potentialCapitalFlight: true,
        field: "Entire Transaction",
        severity: 'high',
        impact: "Potential unreported financial transaction - major compliance issue",
        resolutionStatus: 'unresolved',
        matchConfidence: 0
      });
    });
  
  financialTransactions
    .filter(tx => !matchedTransactions.has(tx.id))
    .forEach(financialTx => {
      discrepancies.push({
        customsTransaction: undefined,
        financialTransaction: financialTx,
        discrepancyType: "missing transaction",
        customsValue: undefined,
        financialValue: financialTx.amount,
        percentageDifference: 100,
        potentialCapitalFlight: true,
        field: "Entire Transaction",
        severity: 'high',
        impact: "Potential unreported customs declaration - major compliance issue",
        resolutionStatus: 'unresolved',
        matchConfidence: 0
      });
    });
  
  return discrepancies;
};

/**
 * Helper function to compare two transactions and add discrepancies
 */
const compareTransactions = (
  customsTx: Transaction, 
  financialTx: Transaction,
  fieldsToCompare: Array<{name: string, label: string, isNumeric: boolean, critical: boolean}>,
  discrepancies: DataDiscrepancy[],
  matchConfidence: number = 100
) => {
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
      
      // Determine severity based on field
      let severity: 'high' | 'medium' | 'low' = 'medium';
      let impact = `Missing ${field.label} data between customs and financial records`;
      
      if (field.name === 'amount' || field.name === 'currency' || field.name === 'entryNumber') {
        severity = 'high';
        impact = `Critical ${field.label} information missing - high risk of compliance violation`;
      }
      
      discrepancies.push({
        customsTransaction: customsTx,
        financialTransaction: financialTx,
        discrepancyType: "missing data",
        customsValue: customsValue,
        financialValue: financialValue,
        percentageDifference: 100, // 100% difference when data is missing
        field: field.label,
        potentialCapitalFlight: field.name === "amount" || field.name === "currency" ? true : false,
        severity,
        impact,
        resolutionStatus: 'unresolved',
        matchConfidence
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
        
        // Determine threshold based on field
        let threshold = COMPLIANCE_RULES.PRICE_TOLERANCE.GREEN * 100;
        if (field.name === 'unitPrice') {
          threshold = 5; // 5% threshold for unit price as specified in requirements
        }
        
        isDifferent = percentageDiff > threshold;
        
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
      // For non-numeric fields, check using appropriate matcher
      if (field.name === 'entity') {
        // Use fuzzy matching for company names
        const customsName = normalizeCompanyName(String(customsValue));
        const financialName = normalizeCompanyName(String(financialValue));
        const distance = levenshteinDistance(customsName, financialName);
        
        isDifferent = distance > COMPLIANCE_RULES.STRING_TOLERANCE;
        percentageDiff = isDifferent ? 100 : 0;
      } else {
        // For other string fields, exact match required
        isDifferent = String(customsValue).trim() !== String(financialValue).trim();
        percentageDiff = isDifferent ? 100 : 0;
      }
    }
    
    // Add discrepancy if difference detected
    if (isDifferent) {
      // Determine if this might indicate capital flight
      const potentialCapitalFlight = 
        (field.name === 'amount' && Number(financialValue) > Number(customsValue)) || 
        (field.name === 'unitPrice' && Number(financialValue) > Number(customsValue)) ||
        (field.name === 'currency' && customsValue !== financialValue);
      
      // Determine severity based on field importance and difference percentage
      let severity: 'high' | 'medium' | 'low';
      let impact = "";
      
      if (field.isNumeric) {
        // Use the variance thresholds from requirements
        if (percentageDiff <= 5) {
          severity = 'low';
          impact = `Minor ${field.label} difference (${percentageDiff.toFixed(2)}%), within acceptable range`;
        } else if (percentageDiff <= 15) {
          severity = 'medium';
          impact = `Significant ${field.label} difference (${percentageDiff.toFixed(2)}%) requires investigation`;
        } else {
          severity = 'high';
          impact = `Major ${field.label} difference (${percentageDiff.toFixed(2)}%) indicates possible financial fraud`;
        }
      } else {
        if (field.name === 'currency') {
          severity = 'high';
          impact = "Currency mismatch - high risk of fraudulent transaction or money laundering";
        } else if (field.name === 'entryNumber' || field.name === 'regNumber') {
          severity = 'high';
          impact = `Critical identifier mismatch in ${field.label} - possible fraudulent documentation`;
        } else {
          severity = 'medium';
          impact = `Discrepancy in ${field.label} data`;
        }
      }
      
      discrepancies.push({
        customsTransaction: customsTx,
        financialTransaction: financialTx,
        discrepancyType: field.isNumeric ? "value" : "data",
        customsValue: customsValue,
        financialValue: financialValue,
        percentageDifference: percentageDiff,
        potentialCapitalFlight,
        field: field.label,
        severity,
        impact,
        resolutionStatus: 'unresolved',
        matchConfidence
      });
    }
  });
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
      "Customs Value": d.customsValue !== undefined ? d.customsValue : "Missing",
      "Financial Value": d.financialValue !== undefined ? d.financialValue : "Missing",
      "Difference %": `${d.percentageDifference.toFixed(2)}%`,
      "Potential Capital Flight": d.potentialCapitalFlight ? "Yes" : "No",
      "Severity": d.severity || "Medium",
      "Impact": d.impact || "",
      "Match Confidence": `${d.matchConfidence || 0}%`,
      "Resolution Status": d.resolutionStatus || "Unresolved",
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
