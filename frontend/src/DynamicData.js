export const RequestNewAssessment = [{
    id: 1,
    title: "Schedule New Cognitive Assessment",
    description: "Complete this multi-step form to schedule an automated cognitive assessment call for a patient",
    details: "This comprehensive form allows you to schedule AI-powered cognitive assessments with complete patient information:",
    steps: [{
            label: "Patient Information:",
            text: "Enter or select existing patient details with automatic ID generation",
        },
        {
            label: "Assessment Configuration:",
            text: "Choose test type, doctor, and specific assessment parameters",
        },
        {
            label: "Scheduling:",
            text: "Select date, time, and timezone with availability validation",
        },
        {
            label: "Contact Details:",
            text: "Configure phone number and language preferences for the AI call",
        },
        {
            label: "Progress Tracking:",
            text: "Form sections are validated step-by-step to ensure completeness",
        },
    ],
    footer: "The assessment will be automatically queued and the patient will receive a call at the scheduled time.",
}, ];
export const ApplicationConfigurationManagement = [{
    id: 1,
    title: "Application Configuration & Management",
    description: "Configure system settings, manage users, and customize application behavior",
    details: "This settings page provides comprehensive system administration and configuration options:",
    steps: [{
            label: "Organization Settings:",
            text: "Configure clinic information, contact details, and branding",
        },
        {
            label: "Assessment Configuration:",
            text: "Manage test types, genders, ethnicities, and other dropdown options",
        },
        {
            label: "Doctor Management:",
            text: "Add, edit, and manage doctor profiles and specializations",
        },
        {
            label: "Patient Database:",
            text: "Access patient management tools and duplicate detection",
        },
        {
            label: "AI Integration:",
            text: "Configure Retell.AI settings and API connections",
        },
        {
            label: "User Management:",
            text: "Control user access, roles, and permissions (admin only)",
        },
        {
            label: "System Monitoring:",
            text: "View audit logs and track system changes",
        },
        {
            label: "Data Management:",
            text: "MongoDB integration and field mapping configuration",
        },
    ],
    footer: "Admin privileges are required to access most configuration options. Contact your system administrator if you need additional access.",
}, ];
export const AssessmentResultsManagement = [{
    id: 1,
    title: "Assessment Results & Management",
    description: "View, filter, and manage cognitive assessment results with detailed analysis tools",
    details: "This page displays all completed cognitive assessments with comprehensive filtering and analysis options:",
    steps: [{
            label: "Advanced Filtering:",
            text: " Filter by status, date range, test type, patient, doctor, and scores",
        },
        {
            label: "Status Management:",
            text: " Mark assessments as read/unread, star important ones, or snooze for later review",
        },
        {
            label: "Detailed Results:",
            text: " View full transcripts, audio recordings, and assessment analysis",
        },
        {
            label: "Export Options:",
            text: " Generate printable reports and export assessment data",
        },
        {
            label: "Score Analysis:",
            text: " Review cognitive scores with color-coded severity indicators",
        },
        {
            label: "Quick Actions:",
            text: " Bulk operations and direct access to patient management",
        },
    ],
    footer: "Use the Refresh Data button to sync the latest assessment results from the AI system.",
}, ];
export const AssessmentResultsList = [{
        assessmentId: "#171",
        patientName: "Bharat Singh",
        patientId: "KJF2K5DF",
        assignedTest: "MoCA Screening",
        scheduledTime: "Sep 30 2025, 11:15 AM",
        currentStatus: "Scheduled",
        awazCallId: "68dc021ce44eaf98d95c87fa",
        awazScheduledId: "68dbf32ae44eaf98d95bb581",
        report: "View Report",
        // Full log string with many entries for scrolling demo
        logs: `[2025-09-30 15:11:38] Scheduled: Call scheduled with Retell.AI (ID: 68dbf32ae44eaf98d95bb581) for 2025-09-30T16:15:00-00 | [2025-09-30 15:39:27] MongoDB: Document not found - No matching document for scheduled ID 68dbf32ae44eaf98d95bb581 | [2025-09-30 15:52:41] Call started: Retell.AI outbound call initiated. | [2025-09-30 16:14:50] Call completed: Patient hung up after 5 minutes. | [2025-09-30 16:18:22] scheduled -> waiting_for_updates | [2025-09-30 16:19:25] MongoDB: Schedule ID Found - found schedule ID 68dbf32ae44eaf98d95bb581 in MongoDB | [2025-09-30 16:19:25] Updated transcript - Refreshed from MongoDB | [2025-09-30 16:19:25] Status changed from waiting_for_updates to data_found | [2025-09-30 16:20:22] Sync started - found matching document for scheduled ID 68dbf32ae44eaf98d95bb581 | [2025-09-30 16:20:22] Final Report Generated: Report available for viewing. | [2025-09-30 16:22:15] System Cleanup: Temporary files removed.`,
    },
    {
        assessmentId: "#171",
        patientName: "Bharat Singh",
        patientId: "KJF2K5DF",
        assignedTest: "MoCA Screening",
        scheduledTime: "Sep 30 2025, 11:15 AM",
        currentStatus: "Scheduled",
        awazCallId: "68dc021ce44eaf98d95c87fa",
        awazScheduledId: "68dbf32ae44eaf98d95bb581",
        report: "View Report",
        // Full log string with many entries for scrolling demo
        logs: `[2025-09-30 15:11:38] Scheduled: Call scheduled with Retell.AI (ID: 68dbf32ae44eaf98d95bb581) for 2025-09-30T16:15:00-00 | [2025-09-30 15:39:27] MongoDB: Document not found - No matching document for scheduled ID 68dbf32ae44eaf98d95bb581 | [2025-09-30 15:52:41] Call started: Retell.AI outbound call initiated. | [2025-09-30 16:14:50] Call completed: Patient hung up after 5 minutes. | [2025-09-30 16:18:22] scheduled -> waiting_for_updates | [2025-09-30 16:19:25] MongoDB: Schedule ID Found - found schedule ID 68dbf32ae44eaf98d95bb581 in MongoDB | [2025-09-30 16:19:25] Updated transcript - Refreshed from MongoDB | [2025-09-30 16:19:25] Status changed from waiting_for_updates to data_found | [2025-09-30 16:20:22] Sync started - found matching document for scheduled ID 68dbf32ae44eaf98d95bb581 | [2025-09-30 16:20:22] Final Report Generated: Report available for viewing. | [2025-09-30 16:22:15] System Cleanup: Temporary files removed.`,
    },
    {
        assessmentId: "#171",
        patientName: "Bharat Singh",
        patientId: "KJF2K5DF",
        assignedTest: "MoCA Screening",
        scheduledTime: "Sep 30 2025, 11:15 AM",
        currentStatus: "Data Found",
        awazCallId: "68dc021ce44eaf98d95c87fa",
        awazScheduledId: "68dbf32ae44eaf98d95bb581",
        report: "View Report",
        // Full log string with many entries for scrolling demo
        logs: `[2025-09-30 15:11:38] Scheduled: Call scheduled with Retell.AI (ID: 68dbf32ae44eaf98d95bb581) for 2025-09-30T16:15:00-00 | [2025-09-30 15:39:27] MongoDB: Document not found - No matching document for scheduled ID 68dbf32ae44eaf98d95bb581 | [2025-09-30 15:52:41] Call started: Retell.AI outbound call initiated. | [2025-09-30 16:14:50] Call completed: Patient hung up after 5 minutes. | [2025-09-30 16:18:22] scheduled -> waiting_for_updates | [2025-09-30 16:19:25] MongoDB: Schedule ID Found - found schedule ID 68dbf32ae44eaf98d95bb581 in MongoDB | [2025-09-30 16:19:25] Updated transcript - Refreshed from MongoDB | [2025-09-30 16:19:25] Status changed from waiting_for_updates to data_found | [2025-09-30 16:20:22] Sync started - found matching document for scheduled ID 68dbf32ae44eaf98d95bb581 | [2025-09-30 16:20:22] Final Report Generated: Report available for viewing. | [2025-09-30 16:22:15] System Cleanup: Temporary files removed.`,
    },
    {
        assessmentId: "#171",
        patientName: "Bharat Singh",
        patientId: "KJF2K5DF",
        assignedTest: "MoCA Screening",
        scheduledTime: "Sep 30 2025, 11:15 AM",
        currentStatus: "Data Found",
        awazCallId: "68dc021ce44eaf98d95c87fa",
        awazScheduledId: "68dbf32ae44eaf98d95bb581",
        report: "View Report",
        // Full log string with many entries for scrolling demo
        logs: `[2025-09-30 15:11:38] Scheduled: Call scheduled with Retell.AI (ID: 68dbf32ae44eaf98d95bb581) for 2025-09-30T16:15:00-00 | [2025-09-30 15:39:27] MongoDB: Document not found - No matching document for scheduled ID 68dbf32ae44eaf98d95bb581 | [2025-09-30 15:52:41] Call started: Retell.AI outbound call initiated. | [2025-09-30 16:14:50] Call completed: Patient hung up after 5 minutes. | [2025-09-30 16:18:22] scheduled -> waiting_for_updates | [2025-09-30 16:19:25] MongoDB: Schedule ID Found - found schedule ID 68dbf32ae44eaf98d95bb581 in MongoDB | [2025-09-30 16:19:25] Updated transcript - Refreshed from MongoDB | [2025-09-30 16:19:25] Status changed from waiting_for_updates to data_found | [2025-09-30 16:20:22] Sync started - found matching document for scheduled ID 68dbf32ae44eaf98d95bb581 | [2025-09-30 16:20:22] Final Report Generated: Report available for viewing. | [2025-09-30 16:22:15] System Cleanup: Temporary files removed.`,
    },
    {
        assessmentId: "#171",
        patientName: "Bharat Singh",
        patientId: "KJF2K5DF",
        assignedTest: "MoCA Screening",
        scheduledTime: "Sep 30 2025, 11:15 AM",
        currentStatus: "Data Missing",
        awazCallId: "68dc021ce44eaf98d95c87fa",
        awazScheduledId: "68dbf32ae44eaf98d95bb581",
        report: "View Report",
        // Full log string with many entries for scrolling demo
        logs: `[2025-09-30 15:11:38] Scheduled: Call scheduled with Retell.AI (ID: 68dbf32ae44eaf98d95bb581) for 2025-09-30T16:15:00-00 | [2025-09-30 15:39:27] MongoDB: Document not found - No matching document for scheduled ID 68dbf32ae44eaf98d95bb581 | [2025-09-30 15:52:41] Call started: Retell.AI outbound call initiated. | [2025-09-30 16:14:50] Call completed: Patient hung up after 5 minutes. | [2025-09-30 16:18:22] scheduled -> waiting_for_updates | [2025-09-30 16:19:25] MongoDB: Schedule ID Found - found schedule ID 68dbf32ae44eaf98d95bb581 in MongoDB | [2025-09-30 16:19:25] Updated transcript - Refreshed from MongoDB | [2025-09-30 16:19:25] Status changed from waiting_for_updates to data_found | [2025-09-30 16:20:22] Sync started - found matching document for scheduled ID 68dbf32ae44eaf98d95bb581 | [2025-09-30 16:20:22] Final Report Generated: Report available for viewing. | [2025-09-30 16:22:15] System Cleanup: Temporary files removed.`,
    },
    {
        assessmentId: "#171",
        patientName: "Bharat Singh",
        patientId: "KJF2K5DF",
        assignedTest: "MoCA Screening",
        scheduledTime: "Sep 30 2025, 11:15 AM",
        currentStatus: "Waiting for Updates",
        awazCallId: "68dc021ce44eaf98d95c87fa",
        awazScheduledId: "68dbf32ae44eaf98d95bb581",
        report: "View Report",
        // Full log string with many entries for scrolling demo
        logs: `[2025-09-30 15:11:38] Scheduled: Call scheduled with Retell.AI (ID: 68dbf32ae44eaf98d95bb581) for 2025-09-30T16:15:00-00 | [2025-09-30 15:39:27] MongoDB: Document not found - No matching document for scheduled ID 68dbf32ae44eaf98d95bb581 | [2025-09-30 15:52:41] Call started: Retell.AI outbound call initiated. | [2025-09-30 16:14:50] Call completed: Patient hung up after 5 minutes. | [2025-09-30 16:18:22] scheduled -> waiting_for_updates | [2025-09-30 16:19:25] MongoDB: Schedule ID Found - found schedule ID 68dbf32ae44eaf98d95bb581 in MongoDB | [2025-09-30 16:19:25] Updated transcript - Refreshed from MongoDB | [2025-09-30 16:19:25] Status changed from waiting_for_updates to data_found | [2025-09-30 16:20:22] Sync started - found matching document for scheduled ID 68dbf32ae44eaf98d95bb581 | [2025-09-30 16:20:22] Final Report Generated: Report available for viewing. | [2025-09-30 16:22:15] System Cleanup: Temporary files removed.`,
    },
    {
        assessmentId: "#171",
        patientName: "Bharat Singh",
        patientId: "KJF2K5DF",
        assignedTest: "MoCA Screening",
        scheduledTime: "Sep 30 2025, 11:15 AM",
        currentStatus: "Data Found",
        awazCallId: "68dc021ce44eaf98d95c87fa",
        awazScheduledId: "68dbf32ae44eaf98d95bb581",
        report: "View Report",
        // Full log string with many entries for scrolling demo
        logs: `[2025-09-30 15:11:38] Scheduled: Call scheduled with Retell.AI (ID: 68dbf32ae44eaf98d95bb581) for 2025-09-30T16:15:00-00 | [2025-09-30 15:39:27] MongoDB: Document not found - No matching document for scheduled ID 68dbf32ae44eaf98d95bb581 | [2025-09-30 15:52:41] Call started: Retell.AI outbound call initiated. | [2025-09-30 16:14:50] Call completed: Patient hung up after 5 minutes. | [2025-09-30 16:18:22] scheduled -> waiting_for_updates | [2025-09-30 16:19:25] MongoDB: Schedule ID Found - found schedule ID 68dbf32ae44eaf98d95bb581 in MongoDB | [2025-09-30 16:19:25] Updated transcript - Refreshed from MongoDB | [2025-09-30 16:19:25] Status changed from waiting_for_updates to data_found | [2025-09-30 16:20:22] Sync started - found matching document for scheduled ID 68dbf32ae44eaf98d95bb581 | [2025-09-30 16:20:22] Final Report Generated: Report available for viewing. | [2025-09-30 16:22:15] System Cleanup: Temporary files removed.`,
    },
    {
        assessmentId: "#171",
        patientName: "Bharat Singh",
        patientId: "KJF2K5DF",
        assignedTest: "MoCA Screening",
        scheduledTime: "Sep 30 2025, 11:15 AM",
        currentStatus: "Data Found",
        awazCallId: "68dc021ce44eaf98d95c87fa",
        awazScheduledId: "68dbf32ae44eaf98d95bb581",
        report: "View Report",
        // Full log string with many entries for scrolling demo
        logs: `[2025-09-30 15:11:38] Scheduled: Call scheduled with Retell.AI (ID: 68dbf32ae44eaf98d95bb581) for 2025-09-30T16:15:00-00 | [2025-09-30 15:39:27] MongoDB: Document not found - No matching document for scheduled ID 68dbf32ae44eaf98d95bb581 | [2025-09-30 15:52:41] Call started: Retell.AI outbound call initiated. | [2025-09-30 16:14:50] Call completed: Patient hung up after 5 minutes. | [2025-09-30 16:18:22] scheduled -> waiting_for_updates | [2025-09-30 16:19:25] MongoDB: Schedule ID Found - found schedule ID 68dbf32ae44eaf98d95bb581 in MongoDB | [2025-09-30 16:19:25] Updated transcript - Refreshed from MongoDB | [2025-09-30 16:19:25] Status changed from waiting_for_updates to data_found | [2025-09-30 16:20:22] Sync started - found matching document for scheduled ID 68dbf32ae44eaf98d95bb581 | [2025-09-30 16:20:22] Final Report Generated: Report available for viewing. | [2025-09-30 16:22:15] System Cleanup: Temporary files removed.`,
    },
    {
        assessmentId: "#171",
        patientName: "Bharat Singh",
        patientId: "KJF2K5DF",
        assignedTest: "MoCA Screening",
        scheduledTime: "Sep 30 2025, 11:15 AM",
        currentStatus: "Data Found",
        awazCallId: "68dc021ce44eaf98d95c87fa",
        awazScheduledId: "68dbf32ae44eaf98d95bb581",
        report: "View Report",
        // Full log string with many entries for scrolling demo
        logs: `[2025-09-30 15:11:38] Scheduled: Call scheduled with Retell.AI (ID: 68dbf32ae44eaf98d95bb581) for 2025-09-30T16:15:00-00 | [2025-09-30 15:39:27] MongoDB: Document not found - No matching document for scheduled ID 68dbf32ae44eaf98d95bb581 | [2025-09-30 15:52:41] Call started: Retell.AI outbound call initiated. | [2025-09-30 16:14:50] Call completed: Patient hung up after 5 minutes. | [2025-09-30 16:18:22] scheduled -> waiting_for_updates | [2025-09-30 16:19:25] MongoDB: Schedule ID Found - found schedule ID 68dbf32ae44eaf98d95bb581 in MongoDB | [2025-09-30 16:19:25] Updated transcript - Refreshed from MongoDB | [2025-09-30 16:19:25] Status changed from waiting_for_updates to data_found | [2025-09-30 16:20:22] Sync started - found matching document for scheduled ID 68dbf32ae44eaf98d95bb581 | [2025-09-30 16:20:22] Final Report Generated: Report available for viewing. | [2025-09-30 16:22:15] System Cleanup: Temporary files removed.`,
    },
    {
        assessmentId: "#174",
        patientName: "Aman Meena",
        patientId: "O9U5G3",
        assignedTest: "MoCA Screening",
        scheduledTime: "Sep 30 2025, 12:15 PM",
        currentStatus: "Waiting for Updates",
        awazCallId: "68dc021ce44eaf98d95c87f3",
        awazScheduledId: "68dbf5f9e44eaf98d95bd6ba",
        report: "View Report",
        logs: "[2025-09-30 15:23:37] Scheduled: Call scheduled with Retell.AI | [2025-09-30 15:39:27] MongoDB: Document not found | [2025-09-30 15:40:01] Log 3: Just enough logs to show 'More'",
    },
    {
        assessmentId: "#174",
        patientName: "Aman Meena",
        patientId: "O9U5G3",
        assignedTest: "MoCA Screening",
        scheduledTime: "Sep 30 2025, 12:15 PM",
        currentStatus: "Waiting for Updates",
        awazCallId: "68dc021ce44eaf98d95c87f3",
        awazScheduledId: "68dbf5f9e44eaf98d95bd6ba",
        report: "View Report",
        logs: "[2025-09-30 15:23:37] Scheduled: Call scheduled with Retell.AI | [2025-09-30 15:39:27] MongoDB: Document not found | [2025-09-30 15:40:01] Log 3: Just enough logs to show 'More'",
    },
    {
        assessmentId: "#174",
        patientName: "Aman Meena",
        patientId: "O9U5G3",
        assignedTest: "MoCA Screening",
        scheduledTime: "Sep 30 2025, 12:15 PM",
        currentStatus: "Waiting for Updates",
        awazCallId: "68dc021ce44eaf98d95c87f3",
        awazScheduledId: "68dbf5f9e44eaf98d95bd6ba",
        report: "View Report",
        logs: "[2025-09-30 15:23:37] Scheduled: Call scheduled with Retell.AI | [2025-09-30 15:39:27] MongoDB: Document not found | [2025-09-30 15:40:01] Log 3: Just enough logs to show 'More'",
    },
];

export const OrganizationInformationManagement = [{
    id: 1,
    title: "Organization Information",
    description: "Manage your organization's information, including contact details and contract information.",
    steps: [{
        label: "HIPAA Compliance Notice:",
        text: "All organization's information is encrypted at rest and in transit. Access is logged and monitored for security compliance",
    }, ],
}, ];
export const OrganizationCreateManagement = [{
    id: 1,
    title: "Create Your Organization",
    description: "Set up your organization to get started. You can edit these details later.",
    steps: [{
        label: "HIPAA Compliance Notice:",
        text: "All organization's information is encrypted at rest and in transit. Access is logged and monitored for security compliance",
    }, ],
}, ];
export const AssessmentTypesManagement = [{
    id: 1,
    title: "Assessment Types Management",
    description: "Manage assessment types with their names, agent IDs, descriptions, and status.",
    steps: [{
        label: "HIPAA Compliance Notice:",
        text: "All Assessment Types Management is encrypted at rest and in transit. Access is logged and monitored for security compliance",
    }, ],
}, ];
export const GendersManagement = [{
    id: 1,
    title: "Genders Management",
    description: "Manage gender options with their names, descriptions, and status.",
    steps: [{
        label: "HIPAA Compliance Notice:",
        text: "All Manage gender options is encrypted at rest and in transit. Access is logged and monitored for security compliance",
    }, ],
}, ];
export const EthnicitiesManagement = [{
    id: 1,
    title: "Ethnicities  Management",
    description: "Manage ethnicity options with their names, descriptions, and status.",
    steps: [{
        label: "HIPAA Compliance Notice:",
        text: "All Manage ethnicity options is encrypted at rest and in transit. Access is logged and monitored for security compliance",
    }, ],
}, ];
export const PatientManagement = [{
    id: 1,
    title: "Patient Management",
    description: "Manage patient records with HIPAA-compliant data protection. All patient information is encrypted and securely stored.",
    steps: [{
        label: "HIPAA Compliance Notice:",
        text: "All patient data is encrypted at rest and in transit. Access is logged and monitored for security compliance",
    }, ],
}, ];

export const DoctorManagement = [{
    id: 1,
    title: "Doctor Management",
    description: "Manage doctor records with HIPAA-compliant data protection. All doctor information is encrypted and securely stored.",
    steps: [{
        label: "HIPAA Compliance Notice:",
        text: " All doctor data is encrypted at rest and in transit. Access is logged and monitored for security compliance. ",
    }, ],
}, ];
export const BookingQueueManagement = [{
    id: 1,
    title: "Booking Queue Management",
    description: "Manage and track assessment requests",
    steps: [{
        label: "HIPAA Compliance Notice:",
        text: " All Booking Queue data is encrypted at rest and in transit. Access is logged and monitored for security compliance. ",
    }, ],
}, ];

export const mockInitialData = {
    organizationName: "Caring AI - Test Clinic",
    emailAddress: "clinic@caringai.com",
    phoneNumber: "(123) 456-7890",
    address: "123 Health Ave, Suite 100, Wellness City, CA 90210",
    contractStartDate: "2023-01-15",
    contractEndDate: "2024-01-15",
    contactPersonName: "Sarah Connor",
    contactPersonEmail: "sarah.c@test.com",
    contactPersonPhone: "(555) 123-4567",
    superAdminName: "Dr. Robert Smith",
    superAdminEmail: "robert.s@admin.com",
    superAdminPhone: "(555) 987-6543",
};