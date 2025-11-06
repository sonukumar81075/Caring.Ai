import { useState } from "react";
import SecurityFeatures from "../components/SecurityFeatures";
import { useAuth } from "../contexts/AuthContext";
import {
  Settings as SettingsIcon,
  UserCog,
  Users,
  ClipboardList,
  VenusAndMars, // ✅ instead of GenderIntersex
  Globe2,
  Plug,
  FileSearch,
  FileText,
  Shield,
  Key,
} from "lucide-react";
import OrganizationDetails from "../components/Settings/Organization";
import AssessmentTypesMRT from "../components/Settings/AssessmentTypesMRT";
import EthnicitiesMRT from "../components/Settings/EthnicitiesMRT";
import GendersMRT from "../components/Settings/GendersMRT";
import AuditLogs from "../components/Settings/AuditLogs";
import ContractManagement from "../components/Settings/ContractManagement";
import TwoFactorAuth from "../components/Settings/TwoFactorAuth";
import ChangePassword from "../components/Settings/ChangePassword";
import { ApplicationConfigurationManagement } from "../DynamicData.js";
import CognitiveAssessmentdetails from "../components/requestAssessment/CognitiveAssessmentdetails.jsx";

const Settings = () => {
  const { user } = useAuth();
  // Set default tab based on user role
  const defaultTab = user?.role === "SuperAdmin" 
    ? "contracts" 
    : user?.role === "Doctor" 
    ? "password" 
    : "organization";
  const [activeTab, setActiveTab] = useState(defaultTab);

  const [formData, setFormData] = useState({
    displayName: "System Admin",
    email: "admin@caring.ai",
    role: "Administrator",
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    preferences: {
      theme: "system",
      language: "en",
      timezone: "UTC",
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNotificationChange = (type) => {
    setFormData((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: !prev.notifications[type],
      },
    }));
  };

  // Tabs for Admin users
  const adminTabs = [
    { id: "organization", name: "Organization", icon: SettingsIcon },
    { id: "password", name: "Change Password", icon: Key },
    { id: "security", name: "Security (2FA)", icon: Shield },
    { id: "auditlogs", name: "Audit Logs", icon: FileSearch }, // Admin can see their own logs
  ];

  // Tabs for Doctor users (limited access)
  const doctorTabs = [
    { id: "password", name: "Change Password", icon: Key },
    { id: "security", name: "Security (2FA)", icon: Shield },
  ];

  // Tabs for SuperAdmin users (system management + audit logs)
  const superAdminTabs = [
    { id: "contracts", name: "Contract Management", icon: FileText }, // Contract management for admins
    { id: "password", name: "Change Password", icon: Key },
    { id: "security", name: "Security (2FA)", icon: Shield },
    { id: "auditlogs", name: "Audit Logs", icon: FileSearch }, // SuperAdmin sees all logs
    { id: "assessmenttypes", name: "Assessment Types", icon: ClipboardList },
    { id: "genders", name: "Genders", icon: VenusAndMars },
    { id: "ethnicities", name: "Ethnicities", icon: Globe2 },
  ];

  // Select tabs based on user role
  const tabs = user?.role === "SuperAdmin" 
    ? superAdminTabs 
    : user?.role === "Doctor" 
    ? doctorTabs 
    : adminTabs;
  return (
    <div className="space-y-6">
      <CognitiveAssessmentdetails
        NewAssessment={ApplicationConfigurationManagement}
      />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:w-56  ">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={`
                  w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg cursor-pointer transition-colors duration-200
                  ${
                    activeTab === tab?.id
                      ? "  text-primary-700   bg-gray-200  "
                      : "text-gray-700   hover:bg-gray-100  "
                  }
                `}
              >
                <tab.icon className="mr-3 h-5 w-5 text-gray-600" />
                {tab?.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="bg-white  rounded-2xl border border-gray-200    ">
            {/* Organization Settings - Clinic Only */}
            {activeTab === "organization" && user?.role === "Clinic" && (
              <OrganizationDetails />
            )}

            {/* Change Password - Available for all users */}
            {activeTab === "password" && (
              <ChangePassword />
            )}

            {/* Security (2FA) - Available for all users */}
            {activeTab === "security" && (
              <TwoFactorAuth />
            )}

            {/* Notification Settings */}
            {activeTab === "doctors" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900  ">
                  Notification Preferences
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900  ">
                        Email Notifications
                      </h3>
                      <p className="text-sm text-gray-500  ">
                        Receive notifications via email
                      </p>
                    </div>
                    <button
                      onClick={() => handleNotificationChange("email")}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                        formData.notifications.email
                          ? "bg-primary-600"
                          : "bg-gray-200  "
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                          formData.notifications.email
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900  ">
                        Push Notifications
                      </h3>
                      <p className="text-sm text-gray-500  ">
                        Receive push notifications in browser
                      </p>
                    </div>
                    <button
                      onClick={() => handleNotificationChange("push")}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                        formData.notifications.push
                          ? "bg-primary-600"
                          : "bg-gray-200  "
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                          formData.notifications.push
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900  ">
                        SMS Notifications
                      </h3>
                      <p className="text-sm text-gray-500  ">
                        Receive notifications via SMS
                      </p>
                    </div>
                    <button
                      onClick={() => handleNotificationChange("sms")}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                        formData.notifications.sms
                          ? "bg-primary-600"
                          : "bg-gray-200  "
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                          formData.notifications.sms
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences */}
            {activeTab === "patients" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900  ">
                  Preferences
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700   mb-2">
                      Theme
                    </label>
                    <select
                      name="theme"
                      value={formData.preferences.theme}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300   rounded-lg bg-white   text-gray-900   focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700  mb-2">
                      Language
                    </label>
                    <select
                      name="language"
                      value={formData.preferences.language}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300   rounded-lg bg-white   text-gray-900   focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700   mb-2">
                      Timezone
                    </label>
                    <select
                      name="timezone"
                      value={formData.preferences.timezone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300   rounded-lg bg-white   text-gray-900   focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="UTC">UTC</option>
                      <option value="EST">Eastern Time</option>
                      <option value="PST">Pacific Time</option>
                      <option value="GMT">Greenwich Mean Time</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Assessment Types - SuperAdmin Only */}
            {activeTab === "assessmenttypes" && user?.role === "SuperAdmin" && (
              <AssessmentTypesMRT />
            )}

            {/* Ethnicities - SuperAdmin Only */}
            {activeTab === "ethnicities" && user?.role === "SuperAdmin" && (
              <EthnicitiesMRT />
            )}

            {/* Genders - SuperAdmin Only */}
            {activeTab === "genders" && user?.role === "SuperAdmin" && (
              <GendersMRT />
            )}

            {/* Contract Management - SuperAdmin Only */}
            {activeTab === "contracts" && user?.role === "SuperAdmin" && (
              <ContractManagement />
            )}

            {/* Audit Logs */}
            {activeTab === "auditlogs" && <AuditLogs />}

            {/* Access Denied Message for Non-SuperAdmin Users */}
            {(activeTab === "assessmenttypes" ||
              activeTab === "ethnicities" ||
              activeTab === "genders") &&
              user?.role !== "SuperAdmin" && (
                <div className="bg-white rounded-lg border border-gray-200 p-8">
                  <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                      <svg
                        className="h-6 w-6 text-red-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Access Denied
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      You don't have permission to access this section. Only
                      SuperAdmin users can manage system configurations.
                    </p>
                    <button
                      onClick={() => setActiveTab("organization")}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#BAA377] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Go to Organization Settings
                    </button>
                  </div>
                </div>
              )}

            {/* Save Button */}
            {/* <div className="pt-6 border-t border-gray-200  flex justify-end">
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors duration-200"
              >
                Save Changes
              </button>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
