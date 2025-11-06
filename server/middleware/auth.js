import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { roles } from "../config/roles.js";

// 🔹 Authenticate user via JWT from HTTP-only cookie
export const authenticate = async (req, res, next) => {
  try {
    // Get token from HTTP-only cookie
    const token = req.cookies.authToken;
    
    if (!token) {
      return res.status(401).json({ message: "No authentication token found" });
    }

    // Verify token
    const jwtSecret = process.env.JWT_SECRET || "your-super-secret-jwt-key-here-make-it-very-long-and-random-for-hipaa-compliance";
    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "Invalid token - user not found" });
    }

    if (!user.isVerified) {
      return res.status(401).json({ message: "Account not verified" });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: "Account is deactivated" });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    
    // Clear invalid cookie
    res.clearCookie('authToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Session expired. Please log in again." });
    }
    
    res.status(401).json({ message: "Unauthorized" });
  }
};

// 🔹 Authorize based on role(s) or permissions
export const authorize = (requiredRolesOrPermissions = []) => {
  return (req, res, next) => {
    if (!req.user || !roles[req.user.role]) {
      return res.status(403).json({ message: "Forbidden: role not recognized" });
    }

    // Ensure requiredRolesOrPermissions is an array
    let permissionsArray = [];
    if (Array.isArray(requiredRolesOrPermissions)) {
      permissionsArray = requiredRolesOrPermissions;
    } else if (typeof requiredRolesOrPermissions === 'string') {
      permissionsArray = [requiredRolesOrPermissions];
    } else {
      return res.status(500).json({ 
        message: "Internal server error",
        error: "Invalid authorization parameter - must be string or array"
      });
    }

    // Check if permissionsArray contains role names (SuperAdmin, Clinic, Doctor)
    const isRoleCheck = permissionsArray.some(item => 
      ['SuperAdmin', 'Clinic', 'Doctor'].includes(item)
    );

    if (isRoleCheck) {
      // Role-based authorization
      const allowed = permissionsArray.includes(req.user.role);
      if (!allowed) {
        return res.status(403).json({ 
          message: "Forbidden: insufficient rights",
          details: `Required roles: ${permissionsArray.join(', ')}, User role: ${req.user.role}`
        });
      }
    } else {
      // Permission-based authorization
      const allowed = roles[req.user.role].can.some(p => permissionsArray.includes(p));
      if (!allowed) {
        return res.status(403).json({ 
          message: "Forbidden: insufficient rights",
          details: `Required permissions: ${permissionsArray.join(', ')}, User permissions: ${roles[req.user.role].can.join(', ')}`
        });
      }
    }

    next();
  };
};
