// crypto-utils.js
import crypto from "crypto";

// Generate a default key if not provided (for development only)
const defaultKey = "FycXEwZaFnuF7LQ4qEqdpnoQbMY6lScOUO/AlsAWAW8=";
const keyString = process.env.FIELD_ENC_KEY || defaultKey;

const key = Buffer.from(keyString, "base64"); // expect 32 bytes
if (key.length !== 32) {
    throw new Error("FIELD_ENC_KEY must be 32 bytes (base64)");
}

// Warn if using default key in production
if (process.env.NODE_ENV === 'production' && !process.env.FIELD_ENC_KEY) {
    console.warn("WARNING: Using default encryption key in production. Set FIELD_ENC_KEY environment variable.");
}

export function encrypt(text) {
    if (text === null || text === undefined) {
        return text;
    }
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    const encrypted = Buffer.concat([
        cipher.update(String(text), "utf8"),
        cipher.final(),
    ]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

export function decrypt(data) {
    if (data === null || data === undefined) {
        return data;
    }
    
    try {
        const b = Buffer.from(data, "base64");
        
        // Check if the buffer is long enough for IV + tag + encrypted data
        if (b.length < 28) {
            console.warn('Encrypted data too short, returning as-is');
            return data;
        }
        
        const iv = b.slice(0, 12);
        const tag = b.slice(12, 28);
        const encrypted = b.slice(28);
        const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
        decipher.setAuthTag(tag);
        const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
        return decrypted.toString("utf8");
    } catch (error) {
        console.warn('Decryption failed, returning original data:', error.message);
        return data; // Return original data if decryption fails
    }
}