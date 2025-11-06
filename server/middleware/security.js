import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

// Enhanced rate limiting for different endpoints
export const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { message },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    handler: (req, res) => {
      res.status(429).json({
        message,
        retryAfter: Math.round(windowMs / 1000)
      });
    }
  });
};

// Security headers middleware
export const securityHeaders = helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "http://localhost:*", "https://localhost:*"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: process.env.NODE_ENV === 'production' ? {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  } : false, // Disable HSTS in development
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
});

// Request sanitization middleware
export const sanitizeRequest = (req, res, next) => {
  // Remove any potentially dangerous characters from request body
  if (req.body) {
    const sanitizeObject = (obj) => {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          // Remove script tags and other potentially dangerous content
          obj[key] = obj[key]
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '');
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key]);
        }
      }
    };
    sanitizeObject(req.body);
  }
  next();
};

// IP whitelist middleware (optional)
// export const ipWhitelist = (allowedIPs = []) => {
//   return (req, res, next) => {
//     if (allowedIPs.length === 0) {
//       return next(); // No whitelist configured
//     }
    
//     const clientIP = req.ip || req.connection.remoteAddress;
//     if (allowedIPs.includes(clientIP)) {
//       next();
//     } else {
//       res.status(403).json({ message: 'Access denied from this IP address' });
//     }
//   };
// };

// Session security middleware
export const sessionSecurity = (req, res, next) => {
  // Add security headers for session management
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Log security events
  if (req.path.includes('/auth/')) {
    // console.log(`Security Event: ${req.method} ${req.path} from IP: ${req.ip} at ${new Date().toISOString()}`);
  }
  
  next();
};
