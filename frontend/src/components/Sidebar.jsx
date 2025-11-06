import { FiLogOut } from "react-icons/fi";
import { useLocation, Link } from "react-router-dom"; // ✅ import navigate
import { User, UserCog, Users, BarChart3 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import React, { useState, useRef } from "react";
import { MdOutlineDashboard } from "react-icons/md";

// Tooltip component for collapsed sidebar
const NavItemTooltip = ({ children, itemName, isCollapsed, isMobile }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const navItemRef = useRef(null);

  const handleMouseEnter = () => {
    if (navItemRef.current && isCollapsed && !isMobile) {
      const rect = navItemRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.top + rect.height / 2,
        left: rect.right + 8
      });
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <>
      <div
        ref={navItemRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="w-full"
      >
        {children}
      </div>
      {isCollapsed && !isMobile && showTooltip && (
        <div
          className="pointer-events-none"
          style={{
            position: 'fixed',
            left: `${tooltipPosition.left}px`,
            top: `${tooltipPosition.top}px`,
            transform: 'translateY(-50%)',
            zIndex: 9999,
          }}
        >
          <div
            className="text-white px-4 py-2.5 rounded-lg shadow-xl whitespace-nowrap font-medium text-sm relative"
            style={{
              background: 'linear-gradient(135deg, #1f3044 0%, #192636 100%)',
            }}
          >
            {itemName}
          </div>
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full w-0 h-0"
            style={{
              borderTop: '6px solid transparent',
              borderBottom: '6px solid transparent',
              borderRight: '6px solid #1f3044'
            }}
          ></div>
        </div>
      )}
    </>
  );
};

const Sidebar = ({
  isCollapsed,
  onToggle,
  isMobile,
  isMobileMenuOpen,
  onCloseMobileMenu,
}) => {
  const location = useLocation();

  const { user } = useAuth();

  // SuperAdmin menu items
  const superAdminNavigationItems = [
    {
      id: "super-admin",
      name: "Dashboard",
      path: "/super-admin",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z"
          />
        </svg>
      ),
    },
    {
      id: "user-management",
      name: "User Management",
      path: "/user-management",
      icon: <Users className="h-5 w-5" />,
    },
    {
      id: "clinic-reports",
      name: "Clinic Reports",
      path: "/clinic-reports",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      id: "settings",
      name: "Settings",
      path: "/settings",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
  ];

  // Admin menu items
  const adminNavigationItems = [
    {
      id: "dashboard",
      name: "Dashboard",
      path: "/dashboard",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z"
          />
        </svg>
      ),
    },
    {
      id: "request-assessment",
      name: "Request Assessment",
      path: "/request-assessment",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      id: "assessment-results",
      name: "Assessment Results",
      path: "/assessment-results",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      id: "booking-queue",
      name: "Booking Queue",
      path: "/booking-queue",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      id: "doctors",
      name: "Doctors",
      path: "/doctors",
      icon: <UserCog className="h-5 w-5" />,
    },
    {
      id: "patients",
      name: "Patients",
      path: "/patients",
      icon: <User className="h-5 w-5" />,
    },
    {
      id: "settings",
      name: "Settings",
      path: "/settings",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
  ];

  // Doctor menu items (limited access)
  const doctorNavigationItems = [
    {
      id: "dashboard",
      name: "Dashboard",
      path: "/dashboard",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z"
          />
        </svg>
      ),
    },
    {
      id: "assessment-results",
      name: "Assessment Results",
      path: "/assessment-results",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      id: "booking-queue",
      name: "Booking Queue",
      path: "/booking-queue",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      id: "settings",
      name: "Settings",
      path: "/settings",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
  ];

  const navigationItems =
    user?.role === "SuperAdmin"
      ? superAdminNavigationItems
      : user?.role === "Doctor"
        ? doctorNavigationItems
        : adminNavigationItems;

  return (
    <>
      <style>{`
        .nav-link-group .nav-icon {
          transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1) 0s !important;
        }
        .nav-link-group .nav-icon svg {
          transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1) 0s !important;
          stroke: currentColor !important;
        }
        .nav-link-group:hover .nav-icon {
          color: #ffffff !important;
          transform: translateX(2px);
        }
        .nav-link-group:hover .nav-icon svg {
          stroke: #ffffff !important;
        }
        .nav-link-group:not(:hover) .nav-icon.text-gray-600 {
          color: #6b7280 !important;
        }
        .nav-link-group:not(:hover) .nav-icon.text-white {
          color: #ffffff !important;
        }
        .nav-link-group .nav-text {
          transition: color 200ms cubic-bezier(0.4, 0, 0.2, 1) 0s !important;
        }
        .nav-link-group:hover .nav-text {
          color: #ffffff !important;
        }
        .sidebar-gradient {
          background: linear-gradient(180deg, #1f3044 0%, #131c28 100%);
        }
        .nav-item-active {
          background: linear-gradient(135deg, #1f3044 0%, #192636 100%) !important;
          box-shadow: 0 4px 12px rgba(31, 48, 68, 0.4) !important;
        }
        .nav-item-hover {
          background: linear-gradient(135deg, #1f3044 0%, #192636 100%) !important;
          box-shadow: 0 2px 8px rgba(31, 48, 68, 0.3) !important;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div
        className={`
       fixed left-0 top-0 z-50 h-full sidebar-gradient shadow-2xl
      flex flex-col justify-between
      ease-in-out duration-300
      ${isCollapsed && !isMobile ? 'overflow-visible' : 'overflow-hidden'
          }
      ${isMobile
            ? `w-64 transform transition-transform duration-300 ${isMobileMenuOpen ? "translate-x-0 " : "-translate-x-full "
            }`
            : `transition-all duration-300 ${isCollapsed ? "w-20" : "w-72"}`
          }
    `}
        style={{
          overflow: isCollapsed && !isMobile ? 'visible' : 'hidden'
        }}
      >
        {/* Header Section */}
        <div className="flex flex-col overflow-visible">
          <div className="flex items-center justify-between p-5 border-b border-white/10">
            {(!isCollapsed || isMobile) && (
              <Link
                to="/dashboard"
                className="flex items-center space-x-3 cursor-pointer select-none"
              >
                <div className="rounded-lg p-2">
                  <img
                    src="/logo/logo.svg"
                    alt="CaringAI Logo"
                    className="h-7 w-auto"
                  />
                </div>

              </Link>
            )}
            {/* {isCollapsed && !isMobile && (
              <Link
                to="/dashboard"
                className="flex items-center justify-center cursor-pointer select-none w-full"
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
                  <img
                    src="/logo/logo.svg"
                    alt="CaringAI Logo"
                    className="h-8 w-auto"
                  />
                </div>
              </Link>
            )} */}
            <button
              onClick={isMobile ? onCloseMobileMenu : onToggle}
              className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 ease-in-out cursor-pointer"
              aria-label={isMobile ? "Close menu" : "Toggle sidebar"}
            >
              {isMobile ? (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={isCollapsed ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M11 19l-7-7 7-7m8 14l-7-7 7-7"}
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Navigation Section */}
          <div className="flex-1 overflow-visible relative">
            <nav className={`h-full p-4 space-y-1.5 ${isCollapsed && !isMobile
              ? 'overflow-y-auto scrollbar-hide'
              : 'overflow-y-auto'
              }`}>
              {navigationItems?.map((item) => {
                const isActive = location?.pathname === item?.path;
                return (
                  <NavItemTooltip
                    key={item.id}
                    itemName={item?.name}
                    isCollapsed={isCollapsed}
                    isMobile={isMobile}
                  >
                    <div className="relative transition-all duration-200 ease-in-out group">
                      <Link
                        to={item?.path}
                        onClick={() => {
                          if (isMobile) onCloseMobileMenu();
                        }}
                        className={`nav-link-group w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left text-sm cursor-pointer
                      transition-all duration-200 ease-in-out relative overflow-hidden
                      ${isActive
                            ? "nav-item-active text-white"
                            : "text-white/70 hover:nav-item-hover hover:text-white"
                          }
                      ${isCollapsed && !isMobile ? "justify-center px-3 py-3" : ""}
                      before:absolute before:inset-0 before:bg-white/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-200
                    `}
                      >
                        <span className={`flex items-center relative z-10 ${isCollapsed && !isMobile ? "justify-center" : "gap-3"
                          }`}>
                          <span
                            className={`nav-icon ${isActive ? "text-white" : "text-white/70"
                              }`}
                          >
                            {item?.icon}
                          </span>

                          {(!isCollapsed || isMobile) && (
                            <span className={`nav-text font-medium truncate relative z-10`}>
                              {item?.name}
                            </span>
                          )}
                        </span>
                      </Link>
                    </div>
                  </NavItemTooltip>
                );
              })}
            </nav>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-t border-white/10">
          <div
            className={`flex items-center gap-3 ${isCollapsed && !isMobile ? "justify-center" : ""
              }`}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white/20"
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)"
              }}
            >
              <span className="text-brand-600 font-bold text-sm">
                {user?.username?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
            {(!isCollapsed || isMobile) && (
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.username || "User"}
                </p>
                <p className="text-xs text-white/70 truncate">
                  {user?.role || "Administrator"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
