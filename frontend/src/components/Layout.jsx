import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import useInactivityTimeout from "../hooks/useInactivityTimeout";
import InactivityWarningModal from "./InactivityWarningModal";
import useLockScreen from "../hooks/useLockScreen";
import LockScreen from "./LockScreen";
import securityConfig from "../config/securityConfig";

const Layout = ({ children, currentPage, onPageChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Inactivity timeout configuration
  const { timeout, warningTime, enabled } = securityConfig.inactivityTimeout;
  const { showWarning, remainingTime, stayActive, logout } = useInactivityTimeout(
    enabled ? timeout : null,
    warningTime
  );

  // Lock screen functionality
  const { isLocked, lock, unlock } = useLockScreen();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Keyboard shortcut for locking screen (Ctrl+L) and block keys when locked
  useEffect(() => {
    const handleKeyDown = (e) => {
      // If screen is locked, block all keyboard shortcuts except in password field
      if (isLocked) {
        const target = e.target;
        const isPasswordInput = target?.type === 'password' || target?.getAttribute('type') === 'password';
        
        // Allow typing in password field only
        if (!isPasswordInput) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }
      
      // Allow Ctrl+L to lock screen when not locked
      if (e.ctrlKey && e.key === 'l' && !isLocked) {
        e.preventDefault();
        lock();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true); // Use capture phase
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [lock, isLocked]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Lock Screen */}
      <LockScreen open={isLocked} onUnlock={unlock} />

      {/* Inactivity Warning Modal */}
      <InactivityWarningModal
        open={showWarning && !isLocked}
        remainingTime={remainingTime}
        onStayActive={stayActive}
        onLogout={logout}
      />

      {/* Overlay to block interactions when locked */}
      {isLocked && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9998,
            pointerEvents: 'all',
            cursor: 'not-allowed',
          }}
          onClick={(e) => e.preventDefault()}
        />
      )}

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-transparent bg-opacity-10 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Content wrapper with blur effect when locked */}
      <div style={{ filter: isLocked ? 'blur(5px)' : 'none', pointerEvents: isLocked ? 'none' : 'auto' }}>
        {/* Sidebar */}
        <div className="print:hidden">
          <Sidebar
            isCollapsed={isCollapsed}
            onToggle={() => setIsCollapsed(!isCollapsed)}
            currentPage={currentPage}
            onPageChange={onPageChange}
            isMobile={isMobile}
            isMobileMenuOpen={isMobileMenuOpen}
            onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
          />
        </div>

        {/* Main content */}
        <div
          className={`
            transition-all duration-300 ease-in-out
            ${isCollapsed ? "lg:ml-20" : "lg:ml-72"}
          `}
        >
        {/* Fixed Header */}
        <div
          className="fixed top-0 z-30 bg-white shadow-sm border-b border-gray-200 print:hidden"
          style={{
            left: isMobile ? "0" : isCollapsed ? "5rem" : "18rem",
            right: "0",
            transition: "left 0.3s ease-in-out",
          }}
        >
          <Header
            isCollapsed={isCollapsed}
            onToggle={() =>
              isMobile
                ? setIsMobileMenuOpen(!isMobileMenuOpen)
                : setIsCollapsed(!isCollapsed)
            }
            onLock={lock}
          />
        </div>

        {/* Scrollable Page content */}
        <main className="pt-20 p-6 min-h-screen print:pt-0">
          <div className="max-w-screen-2xl mx-auto">{children}</div>
        </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
