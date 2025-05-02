
// Defines the structure of an audit log entry
export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  username: string;
  userRole: string;
  action: string;
  module: string;
  details?: string;
  ipAddress?: string;
  deviceInfo?: string;
  sessionDuration?: number;
  riskLevel?: 'low' | 'medium' | 'high';
  isLoginAttempt?: boolean;
  loginSuccess?: boolean;
  isLogout?: boolean;
  signature?: string;
}

// Audit action types for consistent logging
export const AuditActions = {
  LOGIN: "User Login",
  LOGIN_FAILED: "Failed Login Attempt",
  LOGOUT: "User Logout",
  DATA_IMPORT: "Data Import",
  DATA_EXPORT: "Data Export",
  DATA_VIEW: "Data View",
  DATA_CREATE: "Data Creation",
  DATA_UPDATE: "Data Update",
  DATA_DELETE: "Data Deletion",
  EXTENSION_REQUEST: "Extension Request",
  EXTENSION_APPROVE: "Extension Approval",
  EXTENSION_REJECT: "Extension Rejection",
  ACQUITTAL_SUBMIT: "Acquittal Submission",
  ACQUITTAL_APPROVE: "Acquittal Approval", 
  ACQUITTAL_REJECT: "Acquittal Rejection",
  PENALTY_CALCULATE: "Penalty Calculation",
  REPORT_GENERATE: "Report Generation",
  USER_CREATE: "User Creation",
  USER_UPDATE: "User Update",
  USER_DELETE: "User Deletion",
  ACQUITTAL_VIEW: "Acquittal Details View",
  CONFIG_CHANGE: "System Configuration Change",
};

// Risk levels for actions
export const RiskLevels = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

// Module names for consistent logging
export const AuditModules = {
  AUTH: "Authentication",
  DASHBOARD: "Dashboard",
  DATA_IMPORT: "Data Import",
  EXTENSIONS: "Extensions",
  ACQUITTALS: "Acquittals",
  COMPLIANCE: "Compliance",
  REPORTS: "Reports",
  PENALTIES: "Penalties",
  USERS: "Users Management",
  FINANCIAL: "Financial Institutions",
  SYSTEM: "System Configuration",
};

/**
 * Get device information from the browser
 */
export const getDeviceInfo = (): string => {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;
  const browser = detectBrowser(userAgent);
  
  return `${browser} on ${platform}`;
};

/**
 * Simple browser detection function
 */
const detectBrowser = (userAgent: string): string => {
  if (userAgent.indexOf("Firefox") > -1) {
    return "Firefox";
  } else if (userAgent.indexOf("Edge") > -1) {
    return "Edge";
  } else if (userAgent.indexOf("Chrome") > -1) {
    return "Chrome";
  } else if (userAgent.indexOf("Safari") > -1) {
    return "Safari";
  } else if (userAgent.indexOf("MSIE") > -1 || userAgent.indexOf("Trident") > -1) {
    return "Internet Explorer";
  } else {
    return "Unknown Browser";
  }
};

/**
 * Generate a simple digital signature for log integrity
 * In a real implementation, this would use proper cryptography
 */
const generateSignature = (log: Omit<AuditLog, 'signature'>): string => {
  const data = JSON.stringify(log);
  // In a real system, this would be a proper HMAC or digital signature
  // For demo purposes, we're using a basic hash simulation
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `sig-${hash.toString(16)}`;
};

/**
 * Start session tracking
 */
export const startSession = (userId: string): void => {
  localStorage.setItem(`zicapi-session-${userId}`, Date.now().toString());
};

/**
 * End session tracking and return duration in seconds
 */
export const endSession = (userId: string): number => {
  const startTime = localStorage.getItem(`zicapi-session-${userId}`);
  if (!startTime) return 0;
  
  const duration = (Date.now() - parseInt(startTime)) / 1000; // convert to seconds
  localStorage.removeItem(`zicapi-session-${userId}`);
  return Math.round(duration);
};

/**
 * Creates a new audit log entry and saves it to localStorage
 */
export const createAuditLog = (
  userId: string,
  username: string,
  userRole: string,
  action: string,
  module: string,
  details?: string,
  options?: {
    riskLevel?: 'low' | 'medium' | 'high',
    isLoginAttempt?: boolean,
    loginSuccess?: boolean,
    isLogout?: boolean
  }
): AuditLog => {
  // Get IP address (would come from server in a real app)
  const ipAddress = "127.0.0.1"; 
  
  // Get device info
  const deviceInfo = getDeviceInfo();
  
  // Calculate session duration for logout events
  let sessionDuration: number | undefined;
  if (options?.isLogout) {
    sessionDuration = endSession(userId);
  }
  
  // Determine risk level based on action if not provided
  let riskLevel = options?.riskLevel;
  if (!riskLevel) {
    if (action.includes("Delete") || action === AuditActions.LOGIN_FAILED) {
      riskLevel = 'high';
    } else if (action.includes("Update") || action.includes("Create")) {
      riskLevel = 'medium';
    } else {
      riskLevel = 'low';
    }
  }

  const log: Omit<AuditLog, 'signature'> = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    timestamp: new Date().toISOString(),
    userId,
    username,
    userRole,
    action,
    module,
    details,
    ipAddress,
    deviceInfo,
    sessionDuration,
    riskLevel,
    isLoginAttempt: options?.isLoginAttempt,
    loginSuccess: options?.loginSuccess,
    isLogout: options?.isLogout
  };
  
  // Generate signature for log integrity
  const signature = generateSignature(log);
  
  const finalLog: AuditLog = {
    ...log,
    signature
  };

  // Retrieve existing logs or initialize empty array
  const existingLogs: AuditLog[] = JSON.parse(localStorage.getItem("zicapi-audit-logs") || "[]");
  
  // Add new log to the beginning of the array (newest first)
  existingLogs.unshift(finalLog);
  
  // Store back to localStorage (limit to 1000 entries to prevent storage issues)
  localStorage.setItem("zicapi-audit-logs", JSON.stringify(existingLogs.slice(0, 1000)));
  
  // Start session tracking for successful logins
  if (options?.isLoginAttempt && options?.loginSuccess) {
    startSession(userId);
  }
  
  return finalLog;
};

/**
 * Retrieves all audit logs with optional filtering
 */
export const getAuditLogs = (filters?: {
  userId?: string;
  username?: string;
  userRole?: string;
  module?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
  riskLevel?: 'low' | 'medium' | 'high';
  isLoginAttempt?: boolean;
  isLogout?: boolean;
}): AuditLog[] => {
  const logs: AuditLog[] = JSON.parse(localStorage.getItem("zicapi-audit-logs") || "[]");
  
  if (!filters) return logs;
  
  return logs.filter(log => {
    // Apply filters if provided
    if (filters.userId && log.userId !== filters.userId) return false;
    if (filters.username && !log.username.toLowerCase().includes(filters.username.toLowerCase())) return false;
    if (filters.userRole && log.userRole !== filters.userRole) return false;
    if (filters.module && log.module !== filters.module) return false;
    if (filters.action && log.action !== filters.action) return false;
    if (filters.riskLevel && log.riskLevel !== filters.riskLevel) return false;
    if (filters.isLoginAttempt !== undefined && log.isLoginAttempt !== filters.isLoginAttempt) return false;
    if (filters.isLogout !== undefined && log.isLogout !== filters.isLogout) return false;
    
    // Date range filtering
    if (filters.startDate) {
      const startDate = new Date(filters.startDate).getTime();
      const logDate = new Date(log.timestamp).getTime();
      if (logDate < startDate) return false;
    }
    
    if (filters.endDate) {
      const endDate = new Date(filters.endDate).getTime();
      const logDate = new Date(log.timestamp).getTime();
      if (logDate > endDate) return false;
    }
    
    return true;
  });
};

/**
 * Verifies the integrity of audit logs by checking signatures
 * Returns any logs that appear to be tampered with
 */
export const verifyAuditLogIntegrity = (): AuditLog[] => {
  const logs: AuditLog[] = JSON.parse(localStorage.getItem("zicapi-audit-logs") || "[]");
  
  return logs.filter(log => {
    const { signature, ...logWithoutSignature } = log;
    const expectedSignature = generateSignature(logWithoutSignature);
    return signature !== expectedSignature;
  });
};

/**
 * Clears all audit logs (admin only function)
 */
export const clearAuditLogs = (): void => {
  localStorage.setItem("zicapi-audit-logs", JSON.stringify([]));
};
