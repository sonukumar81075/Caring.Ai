# Caring AI Server Setup Guide

## Environment Variables

Create a `.env` file in the server directory with the following variables:

```env
# Server Configuration
PORT=3200
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/caring_ai

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-very-long-and-random

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Client Configuration
CLIENT_URL=http://localhost:5173

# Field Encryption Key (32 bytes base64 encoded)
FIELD_ENC_KEY=your-32-byte-base64-encoded-encryption-key-here

# Security Configuration
BCRYPT_ROUNDS=12
SESSION_TIMEOUT=86400000
MAX_LOGIN_ATTEMPTS=5
LOGIN_LOCKOUT_TIME=900000

# HIPAA Compliance
AUDIT_LOG_RETENTION_DAYS=2555
ENCRYPTION_ALGORITHM=aes-256-gcm
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Generate encryption key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

3. Start the server:
```bash
npm run dev
```

## HIPAA Compliance Features

- HTTP-only cookies for authentication
- Field-level encryption for sensitive data
- Audit logging for all user actions
- Session timeout management
- Rate limiting for login attempts
- Secure password hashing (bcrypt)
- Email verification for new accounts
- CORS configuration for secure cross-origin requests
