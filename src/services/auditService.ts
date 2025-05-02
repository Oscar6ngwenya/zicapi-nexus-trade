
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
}

// Audit action types for consistent logging
export const AuditActions = {
  LOGIN: "User Login",
  LOGOUT: "User Logout",
  DATA_IMPORT: "Data Import",
  DATA_EXPORT: "Data Export",
  DATA_VIEW: "Data View",
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
  details?: string
): AuditLog => {
  const log: AuditLog = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    timestamp: new Date().toISOString(),
    userId,
    username,
    userRole,
    action,
    module,
    details,
    ipAddress: "127.0.0.1" // In a real app, this would come from the server
  };

  // Retrieve existing logs or initialize empty array
  const existingLogs: AuditLog[] = JSON.parse(localStorage.getItem("zicapi-audit-logs") || "[]");
  
  // Add new log to the beginning of the array (newest first)
  existingLogs.unshift(log);
  
  // Store back to localStorage (limit to 1000 entries to prevent storage issues)
  localStorage.setItem("zicapi-audit-logs", JSON.stringify(existingLogs.slice(0, 1000)));
  
  return log;
};

/**
 * Retrieves all audit logs with optional filtering
 */
export const getAuditLogs = (filters?: {
  userId?: string;
  userRole?: string;
  module?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
}): AuditLog[] => {
  const logs: AuditLog[] = JSON.parse(localStorage.getItem("zicapi-audit-logs") || "[]");
  
  if (!filters) return logs;
  
  return logs.filter(log => {
    // Apply filters if provided
    if (filters.userId && log.userId !== filters.userId) return false;
    if (filters.userRole && log.userRole !== filters.userRole) return false;
    if (filters.module && log.module !== filters.module) return false;
    if (filters.action && log.action !== filters.action) return false;
    
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
 * Clears all audit logs (admin only function)
 */
export const clearAuditLogs = (): void => {
  localStorage.setItem("zicapi-audit-logs", JSON.stringify([]));
};
