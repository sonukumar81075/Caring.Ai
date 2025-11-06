// Professional Email Templates for Caring AI

export const createVerificationEmailTemplate = (username, verifyUrl) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Caring AI Account</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #315bf2 0%, #2547d9 100%); padding: 40px 30px; text-align: center;">
                <div style="margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                    <img src="https://caringai.bidvoty.space/logo/logo.svg" alt="CaringAI Logo" style="height: 60px; width: auto; max-width: 250px;" />
                </div>
            </div>

            <!-- Main Content -->
            <div style="padding: 40px 30px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h2 style="color: #1e293b; margin: 0 0 12px; font-size: 24px; font-weight: 600;">Welcome to Caring AI!</h2>
                    <p style="color: #64748b; margin: 0; font-size: 16px; line-height: 1.6;">Hi ${username || 'there'}, thank you for joining our clinical assessment platform.</p>
                </div>

                <div style="background-color: #f1f5f9; border-left: 4px solid #315bf2; padding: 20px; border-radius: 8px; margin: 30px 0;">
                    <p style="color: #334155; margin: 0; font-size: 16px; line-height: 1.6; font-weight: 500;">
                        To complete your account setup and start using our platform, please verify your email address by clicking the button below.
                    </p>
                </div>

                <!-- CTA Button -->
                <div style="text-align: center; margin: 40px 0;">
                    <a href="${verifyUrl}" 
                       style="display: inline-block; 
                              background: linear-gradient(135deg, #315bf2 0%, #2547d9 100%); 
                              color: #ffffff; 
                              text-decoration: none; 
                              padding: 16px 32px; 
                              border-radius: 8px; 
                              font-size: 16px; 
                              font-weight: 600; 
                              letter-spacing: 0.5px;
                              box-shadow: 0 4px 12px rgba(49, 91, 242, 0.3);
                              transition: all 0.3s ease;">
                        Verify My Account
                    </a>
                </div>

                <!-- Alternative Link -->
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 30px 0;">
                    <p style="color: #64748b; margin: 0 0 12px; font-size: 14px; font-weight: 500;">Button not working? Copy and paste this link:</p>
                    <p style="color: #315bf2; margin: 0; font-size: 14px; word-break: break-all; background-color: #ffffff; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0;">${verifyUrl}</p>
                </div>

                <!-- Security Notice -->
                <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 30px 0;">
                    <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.5;">
                        <strong>Security Notice:</strong> This verification link will expire in 24 hours for your security. If you didn't create this account, please ignore this email.
                    </p>
                </div>

                <!-- Features -->
                <div style="margin: 40px 0;">
                <h3 style="color: #1e293b; margin: 0 0 20px; font-size: 18px; font-weight: 600;">
                    What you can do with Caring AI:
                </h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tbody>
                    <tr>
                        <td style="width: 16px; vertical-align: middle;">
                        <div style="width: 8px; height: 8px; background-color: #315bf2; border-radius: 50%;"></div>
                        </td>
                        <td style="padding: 6px 0;">
                        <p style="color: #64748b; margin: 0; font-size: 14px;">
                            Manage patient assessments and clinical data
                        </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="width: 16px; vertical-align: middle;">
                        <div style="width: 8px; height: 8px; background-color: #315bf2; border-radius: 50%;"></div>
                        </td>
                        <td style="padding: 6px 0;">
                        <p style="color: #64748b; margin: 0; font-size: 14px;">
                            Track assessment results and generate reports
                        </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="width: 16px; vertical-align: middle;">
                        <div style="width: 8px; height: 8px; background-color: #315bf2; border-radius: 50%;"></div>
                        </td>
                        <td style="padding: 6px 0;">
                        <p style="color: #64748b; margin: 0; font-size: 14px;">
                            Access HIPAA-compliant secure platform
                        </p>
                        </td>
                    </tr>
                    </tbody>
                </table>
                </div>

            </div>

            <!-- Footer -->
            <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="color: #64748b; margin: 0 0 12px; font-size: 14px;">
                    Need help? Contact our support team at 
                    <a href="mailto:support@caringai.com" style="color: #315bf2; text-decoration: none; font-weight: 500;">support@caringai.com</a>
                </p>
                <p style="color: #94a3b8; margin: 0; font-size: 12px;">
                    © 2024 Caring AI. All rights reserved. | 
                    <a href="#" style="color: #94a3b8; text-decoration: none;">Privacy Policy</a> | 
                    <a href="#" style="color: #94a3b8; text-decoration: none;">Terms of Service</a>
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
};

export const createWelcomeEmailTemplate = (username, loginUrl) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Caring AI</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #315bf2 0%, #2547d9 100%); padding: 40px 30px; text-align: center;">
                <div style="margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                    <img src="https://caringai.bidvoty.space/logo/logo.svg" alt="CaringAI Logo" style="height: 60px; width: auto; max-width: 250px;" />
                </div>
            </div>

            <!-- Main Content -->
            <div style="padding: 40px 30px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h2 style="color: #1e293b; margin: 0 0 12px; font-size: 24px; font-weight: 600;">Account Verified Successfully!</h2>
                    <p style="color: #64748b; margin: 0; font-size: 16px; line-height: 1.6;">Hi ${username || 'there'}, your Caring AI account is now ready to use.</p>
                </div>

                <div style="background-color: #f0fdf4; border: 1px solid #22c55e; border-radius: 8px; padding: 20px; margin: 30px 0;">
                    <p style="color: #166534; margin: 0; font-size: 16px; line-height: 1.6; font-weight: 500;">
                        ✅ Your email has been verified and your account is now active. You can start using all the features of our clinical assessment platform.
                    </p>
                </div>

                <!-- CTA Button -->
                <div style="text-align: center; margin: 40px 0;">
                    <a href="${loginUrl}" 
                       style="display: inline-block; 
                              background: linear-gradient(135deg, #315bf2 0%, #2547d9 100%); 
                              color: #ffffff; 
                              text-decoration: none; 
                              padding: 16px 32px; 
                              border-radius: 8px; 
                              font-size: 16px; 
                              font-weight: 600; 
                              letter-spacing: 0.5px;
                              box-shadow: 0 4px 12px rgba(71, 85, 105, 0.3);
                              transition: all 0.3s ease;">
                        Access Your Dashboard
                    </a>
                </div>

                <!-- Getting Started -->
                <div style="margin: 40px 0;">
                <h3 style="color: #1e293b; margin: 0 0 20px; font-size: 18px; font-weight: 600;">
                    Getting Started:
                </h3>

                <table style="width: 100%; border-collapse: collapse;">
                    <tbody>

                    <!-- Step 1 -->
                    <tr>
                        <td style="width: 36px; vertical-align: top; padding-top: 4px;">
                        <div style="width: 24px; height: 24px; background-color: #315bf2; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                            <span style="color: #ffffff; font-size: 12px; font-weight: 600;">1</span>
                        </div>
                        </td>
                        <td style="padding: 0 0 16px 8px;">
                        <p style="color: #1e293b; margin: 0 0 4px; font-size: 16px; font-weight: 600;">
                            Complete Your Profile
                        </p>
                        <p style="color: #64748b; margin: 0; font-size: 14px; line-height: 1.5;">
                            Add your organization details and contact information.
                        </p>
                        </td>
                    </tr>

                    <!-- Step 2 -->
                    <tr>
                        <td style="width: 36px; vertical-align: top; padding-top: 4px;">
                        <div style="width: 24px; height: 24px; background-color: #315bf2; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                            <span style="color: #ffffff; font-size: 12px; font-weight: 600;">2</span>
                        </div>
                        </td>
                        <td style="padding: 0 0 16px 8px;">
                        <p style="color: #1e293b; margin: 0 0 4px; font-size: 16px; font-weight: 600;">
                            Explore the Dashboard
                        </p>
                        <p style="color: #64748b; margin: 0; font-size: 14px; line-height: 1.5;">
                            Familiarize yourself with the assessment tools and features.
                        </p>
                        </td>
                    </tr>

                    <!-- Step 3 -->
                    <tr>
                        <td style="width: 36px; vertical-align: top; padding-top: 4px;">
                        <div style="width: 24px; height: 24px; background-color: #315bf2; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                            <span style="color: #ffffff; font-size: 12px; font-weight: 600;">3</span>
                        </div>
                        </td>
                        <td style="padding: 0 0 0 8px;">
                        <p style="color: #1e293b; margin: 0 0 4px; font-size: 16px; font-weight: 600;">
                            Start Your First Assessment
                        </p>
                        <p style="color: #64748b; margin: 0; font-size: 14px; line-height: 1.5;">
                            Create and manage patient assessments with our intuitive tools.
                        </p>
                        </td>
                    </tr>

                    </tbody>
                </table>
                </div>

            </div>

            <!-- Footer -->
            <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="color: #64748b; margin: 0 0 12px; font-size: 14px;">
                    Need help? Contact our support team at 
                    <a href="mailto:support@caringai.com" style="color: #315bf2; text-decoration: none; font-weight: 500;">support@caringai.com</a>
                </p>
                <p style="color: #94a3b8; margin: 0; font-size: 12px;">
                    © 2024 Caring AI. All rights reserved. | 
                    <a href="#" style="color: #94a3b8; text-decoration: none;">Privacy Policy</a> | 
                    <a href="#" style="color: #94a3b8; text-decoration: none;">Terms of Service</a>
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
};

export const createForgotPasswordEmailTemplate = (username, resetUrl) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password - Caring AI</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #315bf2 0%, #2547d9 100%); padding: 40px 30px; text-align: center;">
                <div style="margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                    <img src="https://caringai.bidvoty.space/logo/logo.svg" alt="CaringAI Logo" style="height: 60px; width: auto; max-width: 250px;" />
                </div>
            </div>

            <!-- Main Content -->
            <div style="padding: 40px 30px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <div style="background-color: #fef3c7; width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <h2 style="color: #1e293b; margin: 0 0 12px; font-size: 24px; font-weight: 600;">Password Reset Request</h2>
                    <p style="color: #64748b; margin: 0; font-size: 16px; line-height: 1.6;">Hi ${username || 'there'}, we received a request to reset your password.</p>
                </div>

                <div style="background-color: #f1f5f9; border-left: 4px solid #315bf2; padding: 20px; border-radius: 8px; margin: 30px 0;">
                    <p style="color: #334155; margin: 0; font-size: 16px; line-height: 1.6; font-weight: 500;">
                        Click the button below to reset your password. This link will expire in 1 hour for security reasons.
                    </p>
                </div>

                <!-- CTA Button -->
                <div style="text-align: center; margin: 40px 0;">
                    <a href="${resetUrl}" 
                       style="display: inline-block; 
                              background: linear-gradient(135deg, #315bf2 0%, #2547d9 100%); 
                              color: #ffffff; 
                              text-decoration: none; 
                              padding: 16px 32px; 
                              border-radius: 8px; 
                              font-size: 16px; 
                              font-weight: 600; 
                              letter-spacing: 0.5px;
                              box-shadow: 0 4px 12px rgba(71, 85, 105, 0.3);
                              transition: all 0.3s ease;">
                        Reset My Password
                    </a>
                </div>

                <!-- Alternative Link -->
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 30px 0;">
                    <p style="color: #64748b; margin: 0 0 12px; font-size: 14px; font-weight: 500;">Button not working? Copy and paste this link:</p>
                    <p style="color: #315bf2; margin: 0; font-size: 14px; word-break: break-all; background-color: #ffffff; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0;">${resetUrl}</p>
                </div>

                <!-- Security Notice -->
                <div style="background-color: #fef2f2; border: 1px solid #ef4444; border-radius: 8px; padding: 16px; margin: 30px 0;">
                    <p style="color: #991b1b; margin: 0; font-size: 14px; line-height: 1.5;">
                        <strong>⚠️ Security Notice:</strong> If you didn't request a password reset, please ignore this email or contact support if you have concerns. Your password will not be changed unless you click the link above and create a new password.
                    </p>
                </div>

                <!-- Tips -->
                <div style="margin: 40px 0;">
                <h3 style="color: #1e293b; margin: 0 0 20px; font-size: 18px; font-weight: 600;">
                    Password Security Tips:
                </h3>

                <table style="width: 100%; border-collapse: collapse;">
                    <tbody>

                    <!-- Tip 1 -->
                    <tr>
                        <td style="width: 16px; vertical-align: middle;">
                        <div style="width: 8px; height: 8px; background-color: #315bf2; border-radius: 50%;"></div>
                        </td>
                        <td style="padding: 6px 0;">
                        <p style="color: #64748b; margin: 0; font-size: 14px;">
                            Use at least 8 characters with a mix of letters, numbers, and symbols
                        </p>
                        </td>
                    </tr>

                    <!-- Tip 2 -->
                    <tr>
                        <td style="width: 16px; vertical-align: middle;">
                        <div style="width: 8px; height: 8px; background-color: #315bf2; border-radius: 50%;"></div>
                        </td>
                        <td style="padding: 6px 0;">
                        <p style="color: #64748b; margin: 0; font-size: 14px;">
                            Avoid using personal information or common words
                        </p>
                        </td>
                    </tr>

                    <!-- Tip 3 -->
                    <tr>
                        <td style="width: 16px; vertical-align: middle;">
                        <div style="width: 8px; height: 8px; background-color: #315bf2; border-radius: 50%;"></div>
                        </td>
                        <td style="padding: 6px 0;">
                        <p style="color: #64748b; margin: 0; font-size: 14px;">
                            Never share your password with anyone
                        </p>
                        </td>
                    </tr>

                    </tbody>
                </table>
                </div>

            </div>

            <!-- Footer -->
            <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="color: #64748b; margin: 0 0 12px; font-size: 14px;">
                    Need help? Contact our support team at 
                    <a href="mailto:support@caringai.com" style="color: #315bf2; text-decoration: none; font-weight: 500;">support@caringai.com</a>
                </p>
                <p style="color: #94a3b8; margin: 0; font-size: 12px;">
                    © 2024 Caring AI. All rights reserved. | 
                    <a href="#" style="color: #94a3b8; text-decoration: none;">Privacy Policy</a> | 
                    <a href="#" style="color: #94a3b8; text-decoration: none;">Terms of Service</a>
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
};

export const createAssessmentNotificationEmailTemplate = (patientName, doctorName, assessmentType, assessmentDate, assessmentDetails) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Assessment Request - Caring AI</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #315bf2 0%, #2547d9 100%); padding: 40px 30px; text-align: center;">
                <div style="margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                    <img src="https://caringai.bidvoty.space/logo/logo.svg" alt="CaringAI Logo" style="height: 60px; width: auto; max-width: 250px;" />
                </div>
            </div>

            <!-- Main Content -->
            <div style="padding: 40px 30px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <div style="background-color: #dbeafe; width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 11l3 3L22 4" stroke="#BAA377" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="#BAA377" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <h2 style="color: #1e293b; margin: 0 0 12px; font-size: 24px; font-weight: 600;">New Assessment Request</h2>
                    <p style="color: #64748b; margin: 0; font-size: 16px; line-height: 1.6;">Dear ${patientName || 'Patient'}, a clinical assessment has been scheduled for you.</p>
                </div>

                <div style="background-color: #f0fdf4; border: 1px solid #22c55e; border-radius: 8px; padding: 20px; margin: 30px 0;">
                    <p style="color: #166534; margin: 0; font-size: 16px; line-height: 1.6; font-weight: 500;">
                        ✅ Your assessment request has been created and is ready for review. Please find the details below.
                    </p>
                </div>

                <!-- Assessment Details -->
                <table style="width: 100%; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin: 30px 0;" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="padding: 24px;">
                            <h3 style="color: #1e293b; margin: 0 0 20px; font-size: 18px; font-weight: 600; border-bottom: 2px solid #315bf2; padding-bottom: 12px;">Assessment Details</h3>
                            
                            <table style="width: 100%;" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                                        <table style="width: 100%;" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="color: #64748b; font-size: 13px; font-weight: 500; padding-bottom: 6px;">Patient Name</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #1e293b; font-size: 15px; font-weight: 600;">${patientName || 'N/A'}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                                        <table style="width: 100%;" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="color: #64748b; font-size: 13px; font-weight: 500; padding-bottom: 6px;">Doctor Name</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #1e293b; font-size: 15px; font-weight: 600;">${doctorName || 'N/A'}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                                        <table style="width: 100%;" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="color: #64748b; font-size: 13px; font-weight: 500; padding-bottom: 6px;">Assessment Type</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #1e293b; font-size: 15px; font-weight: 600;">${assessmentType || 'N/A'}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 0;">
                                        <table style="width: 100%;" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="color: #64748b; font-size: 13px; font-weight: 500; padding-bottom: 6px;">Scheduled Date</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #1e293b; font-size: 15px; font-weight: 600;">${assessmentDate || 'To be scheduled'}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>

                ${assessmentDetails ? `
                <div style="background-color: #f1f5f9; border-left: 4px solid #315bf2; padding: 20px; border-radius: 8px; margin: 30px 0;">
                    <h4 style="color: #1e293b; margin: 0 0 12px; font-size: 16px; font-weight: 600;">Additional Information:</h4>
                    <p style="color: #334155; margin: 0; font-size: 14px; line-height: 1.6;">${assessmentDetails}</p>
                </div>
                ` : ''}

                <!-- Important Information -->
                <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 30px 0;">
                    <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.5;">
                        <strong>📋 Important:</strong> Please arrive 15 minutes before your scheduled assessment time. If you need to reschedule or have any questions, please contact your healthcare provider.
                    </p>
                </div>

                <!-- What to Bring -->
                <div style="margin: 40px 0;">
                    <h3 style="color: #1e293b; margin: 0 0 20px; font-size: 18px; font-weight: 600;">What to Bring:</h3>
                    <table style="width: 100%;" cellpadding="0" cellspacing="0">
                        <tr>
                            <td style="padding: 6px 0;">
                                <table style="width: 100%;" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="width: 20px; vertical-align: top; padding-top: 3px;">
                                            <div style="width: 8px; height: 8px; background-color: #315bf2; border-radius: 50%;"></div>
                                        </td>
                                        <td style="color: #64748b; font-size: 14px; padding-left: 12px;">Valid photo identification</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0;">
                                <table style="width: 100%;" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="width: 20px; vertical-align: top; padding-top: 3px;">
                                            <div style="width: 8px; height: 8px; background-color: #315bf2; border-radius: 50%;"></div>
                                        </td>
                                        <td style="color: #64748b; font-size: 14px; padding-left: 12px;">Insurance card and/or payment method</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0;">
                                <table style="width: 100%;" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="width: 20px; vertical-align: top; padding-top: 3px;">
                                            <div style="width: 8px; height: 8px; background-color: #315bf2; border-radius: 50%;"></div>
                                        </td>
                                        <td style="color: #64748b; font-size: 14px; padding-left: 12px;">List of current medications (if applicable)</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0;">
                                <table style="width: 100%;" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="width: 20px; vertical-align: top; padding-top: 3px;">
                                            <div style="width: 8px; height: 8px; background-color: #315bf2; border-radius: 50%;"></div>
                                        </td>
                                        <td style="color: #64748b; font-size: 14px; padding-left: 12px;">Any relevant medical records or previous assessment results</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </div>
            </div>

            <!-- Footer -->
            <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="color: #64748b; margin: 0 0 12px; font-size: 14px;">
                    Questions about your assessment? Contact us at 
                    <a href="mailto:support@caringai.com" style="color: #315bf2; text-decoration: none; font-weight: 500;">support@caringai.com</a>
                </p>
                <p style="color: #94a3b8; margin: 0; font-size: 12px;">
                    © 2024 Caring AI. All rights reserved. | 
                    <a href="#" style="color: #94a3b8; text-decoration: none;">Privacy Policy</a> | 
                    <a href="#" style="color: #94a3b8; text-decoration: none;">Terms of Service</a>
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
};

export const createDoctorCredentialsEmailTemplate = (doctorName, username, password, verifyUrl) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Caring AI Doctor Account - Credentials</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #315bf2 0%, #2547d9 100%); padding: 40px 30px; text-align: center;">
                <div style="margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                    <img src="https://caringai.bidvoty.space/logo/logo.svg" alt="CaringAI Logo" style="height: 60px; width: auto; max-width: 250px;" />
                </div>
            </div>

            <!-- Main Content -->
            <div style="padding: 40px 30px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h2 style="color: #1e293b; margin: 0 0 12px; font-size: 24px; font-weight: 600;">Welcome to Caring AI, Dr. ${doctorName || 'Doctor'}!</h2>
                    <p style="color: #64748b; margin: 0; font-size: 16px; line-height: 1.6;">Your doctor account has been created and you can now access the clinical assessment platform.</p>
                </div>

                <div style="background-color: #f0fdf4; border: 1px solid #22c55e; border-radius: 8px; padding: 20px; margin: 30px 0;">
                    <p style="color: #166534; margin: 0; font-size: 16px; line-height: 1.6; font-weight: 500;">
                        ✅ Your account has been successfully created with Doctor role privileges. Please find your login credentials below.
                    </p>
                </div>

                <!-- Login Credentials -->
                <table style="width: 100%; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin: 30px 0;" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="padding: 24px;">
                            <h3 style="color: #1e293b; margin: 0 0 20px; font-size: 18px; font-weight: 600; border-bottom: 2px solid #315bf2; padding-bottom: 12px;">Your Login Credentials</h3>
                            
                            <table style="width: 100%;" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                                        <table style="width: 100%;" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="color: #64748b; font-size: 13px; font-weight: 500; padding-bottom: 6px;">Username</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #1e293b; font-size: 15px; font-weight: 600; background-color: #ffffff; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0; font-family: 'Courier New', monospace;">${username || 'N/A'}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                                        <table style="width: 100%;" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="color: #64748b; font-size: 13px; font-weight: 500; padding-bottom: 6px;">Password</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #1e293b; font-size: 15px; font-weight: 600; background-color: #ffffff; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0; font-family: 'Courier New', monospace;">${password || 'N/A'}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 0;">
                                        <table style="width: 100%;" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="color: #64748b; font-size: 13px; font-weight: 500; padding-bottom: 6px;">Role</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #1e293b; font-size: 15px; font-weight: 600;">Doctor</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>

                <!-- Security Notice -->
                <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 30px 0;">
                    <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.5;">
                        <strong>🔒 Security Notice:</strong> Please change your password after your first login for security purposes. Keep your credentials secure and do not share them with anyone.
                    </p>
                </div>

                <!-- CTA Button -->
                <div style="text-align: center; margin: 40px 0;">
                    <a href="${verifyUrl}" 
                       style="display: inline-block; 
                              background: linear-gradient(135deg, #315bf2 0%, #2547d9 100%); 
                              color: #ffffff; 
                              text-decoration: none; 
                              padding: 16px 32px; 
                              border-radius: 8px; 
                              font-size: 16px; 
                              font-weight: 600; 
                              letter-spacing: 0.5px;
                              box-shadow: 0 4px 12px rgba(71, 85, 105, 0.3);
                              transition: all 0.3s ease;">
                        Verify Account & Login
                    </a>
                </div>

                <!-- Alternative Link -->
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 30px 0;">
                    <p style="color: #64748b; margin: 0 0 12px; font-size: 14px; font-weight: 500;">Button not working? Copy and paste this link:</p>
                    <p style="color: #315bf2; margin: 0; font-size: 14px; word-break: break-all; background-color: #ffffff; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0;">${verifyUrl}</p>
                </div>

                <!-- Doctor Features -->
                <div style="margin: 40px 0;">
                <h3 style="color: #1e293b; margin: 0 0 20px; font-size: 18px; font-weight: 600;">
                    What you can do as a Doctor:
                </h3>

                <table style="width: 100%; border-collapse: collapse;">
                    <tbody>

                    <!-- Point 1 -->
                    <tr>
                        <td style="width: 16px; vertical-align: middle;">
                        <div style="width: 8px; height: 8px; background-color: #315bf2; border-radius: 50%;"></div>
                        </td>
                        <td style="padding: 6px 0;">
                        <p style="color: #64748b; margin: 0; font-size: 14px;">
                            Access patient assessment data and medical records
                        </p>
                        </td>
                    </tr>

                    <!-- Point 2 -->
                    <tr>
                        <td style="width: 16px; vertical-align: middle;">
                        <div style="width: 8px; height: 8px; background-color: #315bf2; border-radius: 50%;"></div>
                        </td>
                        <td style="padding: 6px 0;">
                        <p style="color: #64748b; margin: 0; font-size: 14px;">
                            Conduct clinical assessments and document findings
                        </p>
                        </td>
                    </tr>

                    <!-- Point 3 -->
                    <tr>
                        <td style="width: 16px; vertical-align: middle;">
                        <div style="width: 8px; height: 8px; background-color: #315bf2; border-radius: 50%;"></div>
                        </td>
                        <td style="padding: 6px 0;">
                        <p style="color: #64748b; margin: 0; font-size: 14px;">
                            Generate assessment reports and recommendations
                        </p>
                        </td>
                    </tr>

                    <!-- Point 4 -->
                    <tr>
                        <td style="width: 16px; vertical-align: middle;">
                        <div style="width: 8px; height: 8px; background-color: #315bf2; border-radius: 50%;"></div>
                        </td>
                        <td style="padding: 6px 0;">
                        <p style="color: #64748b; margin: 0; font-size: 14px;">
                            Collaborate with clinic staff on patient care
                        </p>
                        </td>
                    </tr>

                    </tbody>
                </table>
                </div>

            </div>

            <!-- Footer -->
            <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="color: #64748b; margin: 0 0 12px; font-size: 14px;">
                    Need help? Contact our support team at 
                    <a href="mailto:support@caringai.com" style="color: #315bf2; text-decoration: none; font-weight: 500;">support@caringai.com</a>
                </p>
                <p style="color: #94a3b8; margin: 0; font-size: 12px;">
                    © 2024 Caring AI. All rights reserved. | 
                    <a href="#" style="color: #94a3b8; text-decoration: none;">Privacy Policy</a> | 
                    <a href="#" style="color: #94a3b8; text-decoration: none;">Terms of Service</a>
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
};

export const createPhysicianAssessmentNotificationEmailTemplate = (physicianName, patientName, assessmentType, assessmentDate, communicationNotes) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Assessment Assignment - Caring AI</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #315bf2 0%, #2547d9 100%); padding: 40px 30px; text-align: center;">
                <div style="margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                    <img src="https://caringai.bidvoty.space/logo/logo.svg" alt="CaringAI Logo" style="height: 60px; width: auto; max-width: 250px;" />
                </div>
            </div>

            <!-- Main Content -->
            <div style="padding: 40px 30px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <div style="background-color: #dbeafe; width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="#BAA377" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <circle cx="8.5" cy="7" r="4" stroke="#BAA377" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M20 8v6M23 11h-6" stroke="#BAA377" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <h2 style="color: #1e293b; margin: 0 0 12px; font-size: 24px; font-weight: 600;">New Assessment Assignment</h2>
                    <p style="color: #64748b; margin: 0; font-size: 16px; line-height: 1.6;">Dr. ${physicianName || 'Doctor'}, you have been assigned to a new patient assessment.</p>
                </div>

                <div style="background-color: #f0fdf4; border: 1px solid #22c55e; border-radius: 8px; padding: 20px; margin: 30px 0;">
                    <p style="color: #166534; margin: 0; font-size: 16px; line-height: 1.6; font-weight: 500;">
                        ✅ A new assessment request has been created and assigned to you. Please review the patient details below.
                    </p>
                </div>

                <!-- Assessment Details -->
                <table style="width: 100%; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin: 30px 0;" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="padding: 24px;">
                            <h3 style="color: #1e293b; margin: 0 0 20px; font-size: 18px; font-weight: 600; border-bottom: 2px solid #315bf2; padding-bottom: 12px;">Assessment Details</h3>
                            
                            <table style="width: 100%;" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                                        <table style="width: 100%;" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="color: #64748b; font-size: 13px; font-weight: 500; padding-bottom: 6px;">Patient Name</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #1e293b; font-size: 15px; font-weight: 600;">${patientName || 'N/A'}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                                        <table style="width: 100%;" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="color: #64748b; font-size: 13px; font-weight: 500; padding-bottom: 6px;">Assigned Physician</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #1e293b; font-size: 15px; font-weight: 600;">Dr. ${physicianName || 'N/A'}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                                        <table style="width: 100%;" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="color: #64748b; font-size: 13px; font-weight: 500; padding-bottom: 6px;">Assessment Type</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #1e293b; font-size: 15px; font-weight: 600;">${assessmentType || 'N/A'}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 0;">
                                        <table style="width: 100%;" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="color: #64748b; font-size: 13px; font-weight: 500; padding-bottom: 6px;">Scheduled Date</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #1e293b; font-size: 15px; font-weight: 600;">${assessmentDate || 'To be scheduled'}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>

                ${communicationNotes ? `
                <div style="background-color: #f1f5f9; border-left: 4px solid #315bf2; padding: 20px; border-radius: 8px; margin: 30px 0;">
                    <h4 style="color: #1e293b; margin: 0 0 12px; font-size: 16px; font-weight: 600;">Communication Notes:</h4>
                    <p style="color: #334155; margin: 0; font-size: 14px; line-height: 1.6;">${communicationNotes}</p>
                </div>
                ` : ''}

                <!-- Important Information -->
                <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 30px 0;">
                    <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.5;">
                        <strong>📋 Action Required:</strong> Please log in to the Caring AI portal to review the full patient information and prepare for the scheduled assessment. Contact the patient if you need to reschedule or require additional information.
                    </p>
                </div>

                <!-- Next Steps -->
                <div style="margin: 40px 0;">
                    <h3 style="color: #1e293b; margin: 0 0 20px; font-size: 18px; font-weight: 600;">Next Steps:</h3>
                    <table style="width: 100%;" cellpadding="0" cellspacing="0">
                        <tr>
                            <td style="padding: 6px 0;">
                                <table style="width: 100%;" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="width: 36px; vertical-align: top; padding-top: 2px;">
                                            <div style="width: 24px; height: 24px; background-color: #315bf2; border-radius: 50%; text-align: center; line-height: 24px;">
                                                <span style="color: #ffffff; font-size: 12px; font-weight: 600;">1</span>
                                            </div>
                                        </td>
                                        <td style="color: #64748b; font-size: 14px; padding-left: 12px; vertical-align: top; padding-top: 2px;">Log in to Caring AI portal to review complete patient information</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0;">
                                <table style="width: 100%;" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="width: 36px; vertical-align: top; padding-top: 2px;">
                                            <div style="width: 24px; height: 24px; background-color: #315bf2; border-radius: 50%; text-align: center; line-height: 24px;">
                                                <span style="color: #ffffff; font-size: 12px; font-weight: 600;">2</span>
                                            </div>
                                        </td>
                                        <td style="color: #64748b; font-size: 14px; padding-left: 12px; vertical-align: top; padding-top: 2px;">Review patient history and prepare assessment materials</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0;">
                                <table style="width: 100%;" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="width: 36px; vertical-align: top; padding-top: 2px;">
                                            <div style="width: 24px; height: 24px; background-color: #315bf2; border-radius: 50%; text-align: center; line-height: 24px;">
                                                <span style="color: #ffffff; font-size: 12px; font-weight: 600;">3</span>
                                            </div>
                                        </td>
                                        <td style="color: #64748b; font-size: 14px; padding-left: 12px; vertical-align: top; padding-top: 2px;">Confirm appointment with patient if necessary</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0;">
                                <table style="width: 100%;" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="width: 36px; vertical-align: top; padding-top: 2px;">
                                            <div style="width: 24px; height: 24px; background-color: #315bf2; border-radius: 50%; text-align: center; line-height: 24px;">
                                                <span style="color: #ffffff; font-size: 12px; font-weight: 600;">4</span>
                                            </div>
                                        </td>
                                        <td style="color: #64748b; font-size: 14px; padding-left: 12px; vertical-align: top; padding-top: 2px;">Conduct assessment and document findings in the system</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </div>
            </div>

            <!-- Footer -->
            <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="color: #64748b; margin: 0 0 12px; font-size: 14px;">
                    Questions or need support? Contact us at 
                    <a href="mailto:support@caringai.com" style="color: #315bf2; text-decoration: none; font-weight: 500;">support@caringai.com</a>
                </p>
                <p style="color: #94a3b8; margin: 0; font-size: 12px;">
                    © 2024 Caring AI. All rights reserved. | 
                    <a href="#" style="color: #94a3b8; text-decoration: none;">Privacy Policy</a> | 
                    <a href="#" style="color: #94a3b8; text-decoration: none;">Terms of Service</a>
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
};