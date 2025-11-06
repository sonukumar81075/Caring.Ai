import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';

/**
 * Generate a new 2FA secret for a user
 */
export const generateTwoFactorSecret = (userEmail) => {
    const secret = speakeasy.generateSecret({
        name: `Caring AI (${userEmail})`,
        issuer: 'Caring AI',
        length: 32
    });
    
    return {
        secret: secret.base32,
        qrCodeUrl: secret.otpauth_url
    };
};

/**
 * Generate QR code for 2FA setup
 */
export const generateQRCode = async (secretUrl) => {
    try {
        const qrCodeUrl = await QRCode.toDataURL(secretUrl);
        return qrCodeUrl;
    } catch (error) {
        console.error('Error generating QR code:', error);
        throw new Error('Failed to generate QR code');
    }
};

/**
 * Verify 2FA token
 */
export const verifyTwoFactorToken = (secret, token) => {
    return speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
        window: 2 // Allow 2 time steps (60 seconds) tolerance
    });
};

/**
 * Generate backup codes for 2FA
 */
export const generateBackupCodes = (count = 10) => {
    const codes = [];
    for (let i = 0; i < count; i++) {
        const code = crypto.randomBytes(4).toString('hex').toUpperCase();
        codes.push(code);
    }
    return codes;
};

/**
 * Verify backup code
 */
export const verifyBackupCode = (backupCodes, code) => {
    const index = backupCodes.indexOf(code.toUpperCase());
    if (index !== -1) {
        // Remove used backup code
        backupCodes.splice(index, 1);
        return true;
    }
    return false;
};

/**
 * Get client IP address
 */
export const getClientIP = (req) => {
    return req.headers['x-forwarded-for'] || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress ||
           (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
           req.ip;
};

/**
 * Get user agent
 */
export const getUserAgent = (req) => {
    return req.headers['user-agent'] || 'Unknown';
};
