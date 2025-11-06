import AuditLog from "../models/AuditLog.js";
import { encrypt } from "../utils/fieldEncryption.js";
import { getUserIP, getUserIPWithRealFallback } from "../utils/getUserIP.js";

// Enhanced audit logger with action and targetType
export const auditLogger = (action, targetType) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    const startTime = Date.now();

    res.send = async function (body) {
      try {
        const duration = Date.now() - startTime;
        // console.log("auditLogger", req.user);
        // Create audit log entry with real public IP fallback
        const clientIP = await getUserIPWithRealFallback(req);
        const auditData = {
          user: req.user?.id ? req.user.id.toString() : null,
          userId: req.user?.id || null, // User ID reference (null if not logged in)
          createdBy: req.user?.id || null, // Who created this log entry (null if not logged in)
          action,
          recordType: targetType,
          recordId: res.locals?.targetId || req.params?.id || null,
          ip: clientIP,
          userAgent: req.headers["user-agent"] || "unknown",
          meta: {
            role: req.user?.role || "unknown",
            userName: req.user?.name || req.user?.email || "anonymous",
            status: res.statusCode >= 400 ? "FAILURE" : "SUCCESS",
            duration,
            requestMethod: req.method,
            requestPath: req.path,
            responseCode: res.statusCode,
            timestamp: new Date()
          }
        };
        
        await AuditLog.create(auditData);
        
        // Log security events
        if (res.statusCode >= 400) {
          console.warn(`Security Event: ${action} failed for user ${req.user?.email || 'anonymous'} from IP ${clientIP}`);
        }
      } catch (err) {
        console.error("Audit log failed:", err);
        // Don't fail the request if audit logging fails
      }

      return originalSend.apply(this, arguments);
    };

    next();
  };
};

// Enhanced audit logger for authentication events
export const authAuditLogger = () => {
  return async (req, res, next) => {
    const originalSend = res.send;
    const startTime = Date.now();

    res.send = async function (body) {
      try {
        const duration = Date.now() - startTime;
        let action = "UNKNOWN";
        
        // Determine action based on request path
        if (req.path.includes('/login')) {
          action = res.statusCode === 200 ? "LOGIN_SUCCESS" : "LOGIN_FAILED";
        } else if (req.path.includes('/logout')) {
          action = "LOGOUT";
        } else if (req.path.includes('/signup')) {
          action = res.statusCode === 201 ? "SIGNUP_SUCCESS" : "SIGNUP_FAILED";
        } else if (req.path.includes('/verify')) {
          action = res.statusCode === 200 ? "EMAIL_VERIFIED" : "EMAIL_VERIFICATION_FAILED";
        } else if (req.path.includes('/forgot-password')) {
          action = res.statusCode === 200 ? "PASSWORD_RESET_REQUESTED" : "PASSWORD_RESET_REQUEST_FAILED";
        } else if (req.path.includes('/reset-password')) {
          action = res.statusCode === 200 ? "PASSWORD_RESET_SUCCESS" : "PASSWORD_RESET_FAILED";
        }

        const clientIP = await getUserIPWithRealFallback(req);
        const auditData = {
          user: req.user?.id ? req.user.id.toString() : null,
          userId: req.user?.id || null, // Null for failed login, signup, etc.
          createdBy: req.user?.id || null, // Null for actions before authentication
          action,
          recordType: "AUTHENTICATION",
          recordId: null,
          ip: clientIP,
          userAgent: req.headers["user-agent"] || "unknown",
          meta: {
            role: req.user?.role || "unknown",
            userName: req.user?.name || req.user?.email || req.body?.email || "anonymous",
            status: res.statusCode >= 400 ? "FAILURE" : "SUCCESS",
            duration,
            requestMethod: req.method,
            requestPath: req.path,
            responseCode: res.statusCode,
            timestamp: new Date(),
            email: req.body?.email ? encrypt(req.body.email) : null
          }
        };

        await AuditLog.create(auditData);
        
        // Log critical security events
        if (action.includes("FAILED") || action.includes("FAILURE")) {
          console.warn(`Security Alert: ${action} from IP ${clientIP} at ${new Date().toISOString()}`);
        }
      } catch (err) {
        console.error("Auth audit log failed:", err);
      }

      return originalSend.apply(this, arguments);
    };

    next();
  };
};

// Global audit logger - logs ALL requests automatically
export const globalAuditLogger = () => {
  return async (req, res, next) => {
    const originalSend = res.send;
    const startTime = Date.now();

    res.send = async function (body) {
      try {
        const duration = Date.now() - startTime;
        
        // Determine action based on HTTP method and path
        let action = "UNKNOWN";
        let recordType = "SYSTEM";
        
        // Skip audit log routes to avoid infinite loops
        if (req.path.includes('/audit-logs')) {
          return originalSend.apply(this, arguments);
        }

        // Auto-detect action from method and path
        const method = req.method.toUpperCase();
        const path = req.path;
        
        // Enhanced path detection with better action mapping
        if (path.includes('/auth')) {
          // Auth routes fallback (authAuditLogger should handle most of these)
          if (path.includes('/login')) {
            action = res.statusCode === 200 ? "LOGIN_SUCCESS" : "LOGIN_FAILED";
          } else if (path.includes('/logout')) {
            action = "LOGOUT";
          } else if (path.includes('/signup')) {
            action = res.statusCode === 201 ? "SIGNUP_SUCCESS" : "SIGNUP_FAILED";
          } else if (path.includes('/verify')) {
            action = res.statusCode === 200 ? "EMAIL_VERIFIED" : "EMAIL_VERIFICATION_FAILED";
          } else if (path.includes('/forgot-password')) {
            action = res.statusCode === 200 ? "PASSWORD_RESET_REQUESTED" : "PASSWORD_RESET_REQUEST_FAILED";
          } else if (path.includes('/reset-password')) {
            action = res.statusCode === 200 ? "PASSWORD_RESET_SUCCESS" : "PASSWORD_RESET_FAILED";
          } else if (path.includes('/me')) {
            action = "USER_PROFILE_VIEW";
            recordType = "USER";
          } else {
            action = `AUTH_${method}`;
          }
          if (!recordType || recordType === "SYSTEM") {
            recordType = "AUTHENTICATION";
          }
        } else if (path.includes('/superadmin')) {
          if (path.includes('/users')) {
            if (method === 'GET') action = "USER_MANAGEMENT_LIST";
            else if (method === 'POST') action = "USER_MANAGEMENT_CREATE";
            else if (method === 'PUT') action = "USER_MANAGEMENT_UPDATE";
            else if (method === 'PATCH') action = "USER_MANAGEMENT_STATUS_TOGGLE";
            else if (method === 'DELETE') action = "USER_MANAGEMENT_DELETE";
            recordType = "USER_MANAGEMENT";
          } else if (path.includes('/dashboard-stats')) {
            action = "SUPERADMIN_DASHBOARD_VIEW";
            recordType = "SUPERADMIN";
          } else if (path.includes('/activity-logs')) {
            action = "ACTIVITY_LOGS_VIEW";
            recordType = "SUPERADMIN";
          } else {
            action = `SUPERADMIN_${method}`;
            recordType = "SUPERADMIN";
          }
        } else if (path.includes('/dashboard')) {
          if (path.includes('/stats')) {
            action = "DASHBOARD_STATS_VIEW";
          } else if (path.includes('/activity')) {
            action = "DASHBOARD_ACTIVITY_VIEW";
          } else {
            action = `DASHBOARD_${method === 'GET' ? 'VIEW' : method}`;
          }
          recordType = "DASHBOARD";
        } else if (path.includes('/organizations') || path.includes('/organization')) {
          if (method === 'GET' && path.includes('/my-organization')) action = "ORGANIZATION_VIEW";
          else if (method === 'GET') action = "ORGANIZATION_LIST";
          else if (method === 'POST') action = "ORGANIZATION_CREATE";
          else if (method === 'PUT' && path.includes('/contract')) action = "ORGANIZATION_CONTRACT_UPDATE";
          else if (method === 'PUT') action = "ORGANIZATION_UPDATE";
          else if (method === 'DELETE') action = "ORGANIZATION_DELETE";
          recordType = "ORGANIZATION";
        } else if (path.includes('/patients')) {
          if (path.includes('/export')) action = "PATIENT_EXPORT";
          else if (path.includes('/statistics')) action = "PATIENT_STATISTICS_ACCESS";
          else if (path.includes('/search')) action = "PATIENT_SEARCH";
          else if (path.includes('/reactivate')) action = "PATIENT_REACTIVATE";
          else if (method === 'POST') action = "PATIENT_CREATE";
          else if (method === 'GET' && req.params.id) action = "PATIENT_VIEW";
          else if (method === 'GET') action = "PATIENT_LIST_ACCESS";
          else if (method === 'PUT') action = "PATIENT_UPDATE";
          else if (method === 'DELETE') action = "PATIENT_DELETE";
          recordType = "PATIENT";
        } else if (path.includes('/doctors')) {
          if (path.includes('/export')) action = "DOCTOR_EXPORT";
          else if (path.includes('/stats')) action = "DOCTOR_STATS_ACCESS";
          else if (path.includes('/reactivate')) action = "DOCTOR_REACTIVATE";
          else if (method === 'POST') action = "DOCTOR_CREATE";
          else if (method === 'GET' && req.params.id) action = "DOCTOR_VIEW";
          else if (method === 'GET') action = "DOCTOR_LIST_ACCESS";
          else if (method === 'PUT') action = "DOCTOR_UPDATE";
          else if (method === 'DELETE') action = "DOCTOR_DELETE";
          recordType = "DOCTOR";
        } else if (path.includes('/request-assessment')) {
          if (path.includes('/stats')) action = "ASSESSMENT_REQUEST_STATS";
          else if (method === 'POST') action = "ASSESSMENT_REQUEST_CREATE";
          else if (method === 'GET' && req.params.id) action = "ASSESSMENT_REQUEST_VIEW";
          else if (method === 'GET') action = "ASSESSMENT_REQUEST_LIST";
          else if (method === 'PUT' || method === 'PATCH') action = "ASSESSMENT_REQUEST_UPDATE";
          else if (method === 'DELETE') action = "ASSESSMENT_REQUEST_DELETE";
          recordType = "ASSESSMENT_REQUEST";
        } else if (path.includes('/assessment-types')) {
          if (path.includes('/toggle-status')) action = "ASSESSMENT_TYPE_STATUS_TOGGLE";
          else if (method === 'POST') action = "ASSESSMENT_TYPE_CREATE";
          else if (method === 'GET' && req.params.id) action = "ASSESSMENT_TYPE_VIEW";
          else if (method === 'GET') action = "ASSESSMENT_TYPE_LIST";
          else if (method === 'PUT') action = "ASSESSMENT_TYPE_UPDATE";
          else if (method === 'DELETE') action = "ASSESSMENT_TYPE_DELETE";
          recordType = "ASSESSMENT_TYPE";
        } else if (path.includes('/assessment')) {
          if (method === 'POST') action = "ASSESSMENT_CREATE";
          else if (method === 'GET' && req.params.id) action = "ASSESSMENT_VIEW";
          else if (method === 'GET') action = "ASSESSMENT_LIST";
          else if (method === 'PUT') action = "ASSESSMENT_UPDATE";
          else if (method === 'DELETE') action = "ASSESSMENT_DELETE";
          recordType = "ASSESSMENT";
        } else if (path.includes('/ethnicities')) {
          if (path.includes('/toggle-status')) action = "ETHNICITY_STATUS_TOGGLE";
          else if (method === 'POST') action = "ETHNICITY_CREATE";
          else if (method === 'GET' && req.params.id) action = "ETHNICITY_VIEW";
          else if (method === 'GET') action = "ETHNICITY_LIST";
          else if (method === 'PUT') action = "ETHNICITY_UPDATE";
          else if (method === 'DELETE') action = "ETHNICITY_DELETE";
          recordType = "ETHNICITY";
        } else if (path.includes('/genders')) {
          if (path.includes('/toggle-status')) action = "GENDER_STATUS_TOGGLE";
          else if (method === 'POST') action = "GENDER_CREATE";
          else if (method === 'GET' && req.params.id) action = "GENDER_VIEW";
          else if (method === 'GET') action = "GENDER_LIST";
          else if (method === 'PUT') action = "GENDER_UPDATE";
          else if (method === 'DELETE') action = "GENDER_DELETE";
          recordType = "GENDER";
        } else {
          // Generic action for unmatched routes
          const pathSegment = path.split('/')[2]?.toUpperCase() || 'UNKNOWN';
          action = `${method}_${pathSegment}`;
          recordType = "GENERAL";
        }

        const clientIP = await getUserIPWithRealFallback(req);
        const auditData = {
          user: req.user?.id ? req.user.id.toString() : null,
          userId: req.user?.id || null,
          createdBy: req.user?.id || null,
          action,
          recordType,
          recordId: req.params?.id || req.params?.userId || res.locals?.targetId || null,
          ip: clientIP,
          userAgent: req.headers["user-agent"] || "unknown",
          meta: {
            role: req.user?.role || "unknown",
            userName: req.user?.name || req.user?.email || "anonymous",
            status: res.statusCode >= 400 ? "FAILURE" : "SUCCESS",
            duration,
            requestMethod: req.method,
            requestPath: req.path,
            responseCode: res.statusCode,
            timestamp: new Date(),
            queryParams: req.query || {},
            routeParams: req.params || {}
          }
        };

        await AuditLog.create(auditData);
        
        // Log important events
        if (res.statusCode >= 400) {
          console.warn(`Action Failed: ${action} - ${res.statusCode} from IP ${clientIP}`);
        } else {
          console.log(`Action Logged: ${action} by ${req.user?.email || 'anonymous'}`);
        }
      } catch (err) {
        console.error("Global audit log failed:", err);
        // Don't fail the request if audit logging fails
      }

      return originalSend.apply(this, arguments);
    };

    next();
  };
};
