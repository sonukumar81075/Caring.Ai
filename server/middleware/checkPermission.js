import { roles } from '../config/roles.js';

// Permission checking middleware for role-based access control
export const checkPermission = (resource, action) => {
  return (req, res, next) => {
    try {
      // Check if user exists and has a valid role
      if (!req.user || !req.user.role) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: User role not found'
        });
      }

      const userRole = req.user.role;
      const roleConfig = roles[userRole];

      // Check if role exists in configuration
      if (!roleConfig) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Invalid user role'
        });
      }

      // Check if user has permission for the specific resource and action
      const permission = `${resource}:${action}`;
      const hasPermission = roleConfig.can.includes(permission);

      if (!hasPermission) {
        // Log unauthorized access attempt for audit
        console.log(`Unauthorized access attempt: User ${req.user._id} (${userRole}) tried to ${action} ${resource}`);
        
        return res.status(403).json({
          success: false,
          message: `Access denied: Insufficient permissions to ${action} ${resource}`,
          requiredPermission: permission,
          userRole: userRole
        });
      }

      // User has permission, proceed to next middleware
      next();

    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during permission check'
      });
    }
  };
};

// Alternative permission checking function for multiple permissions
export const checkAnyPermission = (permissions) => {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.role) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: User role not found'
        });
      }

      const userRole = req.user.role;
      const roleConfig = roles[userRole];

      if (!roleConfig) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Invalid user role'
        });
      }

      // Check if user has any of the required permissions
      const hasAnyPermission = permissions.some(permission => 
        roleConfig.can.includes(permission)
      );

      if (!hasAnyPermission) {
        console.log(`Unauthorized access attempt: User ${req.user._id} (${userRole}) tried to access with permissions: ${permissions.join(', ')}`);
        
        return res.status(403).json({
          success: false,
          message: 'Access denied: Insufficient permissions',
          requiredPermissions: permissions,
          userRole: userRole
        });
      }

      next();

    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during permission check'
      });
    }
  };
};

// Check if user has all required permissions
export const checkAllPermissions = (permissions) => {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.role) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: User role not found'
        });
      }

      const userRole = req.user.role;
      const roleConfig = roles[userRole];

      if (!roleConfig) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Invalid user role'
        });
      }

      // Check if user has all required permissions
      const hasAllPermissions = permissions.every(permission => 
        roleConfig.can.includes(permission)
      );

      if (!hasAllPermissions) {
        console.log(`Unauthorized access attempt: User ${req.user._id} (${userRole}) missing required permissions: ${permissions.join(', ')}`);
        
        return res.status(403).json({
          success: false,
          message: 'Access denied: Missing required permissions',
          requiredPermissions: permissions,
          userRole: userRole
        });
      }

      next();

    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during permission check'
      });
    }
  };
};
