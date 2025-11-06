/**
 * Security Configuration
 * Centralized configuration for security-related features
 */

const securityConfig = {
    /**
     * Inactivity Timeout Settings
     * Controls automatic logout after user inactivity
     */
    inactivityTimeout: {
        // Total inactivity time before logout (in milliseconds)
        // Default: 60000ms = 1 minute
        // Common options:
        // - 5 minutes: 300000
        // - 10 minutes: 600000
        // - 15 minutes: 900000
        // - 30 minutes: 1800000
        timeout: 6000000,

        // Warning time before logout (in milliseconds)
        // User will see a warning modal this many seconds before automatic logout
        // Default: 13200ms = 15 seconds
        warningTime: 13200,

        // Enable/disable the inactivity timeout feature
        // Set to false to disable auto-logout
        enabled: true,
    },

    /**
     * Session Configuration
     */
    session: {
        // Check user status interval (in milliseconds)
        // Default: 30000ms = 30 seconds
        statusCheckInterval: 30000,
    },
};

export default securityConfig;