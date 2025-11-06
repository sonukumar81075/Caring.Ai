# Caring AI Frontend Setup Guide

## Environment Variables

Create a `.env` file in the frontend directory with the following variables:

```env
# API Configuration
VITE_API_URL=http://localhost:3200/api

# Application Configuration
VITE_APP_NAME=Caring AI
VITE_APP_VERSION=1.0.0

# Security Configuration
VITE_SESSION_TIMEOUT=1800000
VITE_WARNING_TIME=300000

# HIPAA Compliance
VITE_HIPAA_COMPLIANT=true
VITE_AUDIT_ENABLED=true
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

## Features

- Cookie-based authentication (no localStorage)
- Protected routes with role-based access
- Session timeout management
- HIPAA compliance features
- Responsive design
- Real-time notifications
- Secure form validation
