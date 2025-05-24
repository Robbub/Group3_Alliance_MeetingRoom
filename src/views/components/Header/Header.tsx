import React, { useEffect, useRef, useState } from "react";
import { FaBars, FaUserCircle, FaBell } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import { User } from "./UserType";
import "./Header.css";

export const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const currentUser: User | null = JSON.parse(localStorage.getItem("user") || "null");

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleNotifications = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Node;
    if (dropdownRef.current && !dropdownRef.current.contains(target)) {
      setIsDropdownOpen(false);
    }
    if (notifRef.current && !notifRef.current.contains(target)) {
      setIsNotificationOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="header">
      <div className="logo">
        <Link to="/homepage">
          <img src="/assets/summit-logo.png" alt="SUMMITFLOW" />
        </Link>
      </div>

      <nav className="nav-links">
        <Link to="/homepage" className="nav-item">HOME</Link>
        <Link to="/browse" className="nav-item">BROWSE ROOMS</Link>

        <div className="manage-dropdown">
          <span className="manage-label">MANAGE ▾</span>
          <div className="manage-options">
            <Link to={
              currentUser?.role === "admin" || currentUser?.role === "super admin"
                ? "/admin"
                : "/upcoming"
            }>
              Manage Rooms
            </Link>
            {(currentUser?.role === "admin" || currentUser?.role === "super admin") && (
              <Link to="/usermanagement">Manage Users</Link>
            )}
          </div>
        </div>

        <Link to="/bookingmanagement" className="nav-item">CALENDAR</Link>
      </nav>

      <div className="icon-group">
        <div className="notification-icon" ref={notifRef}>
          <button onClick={toggleNotifications}>
            <FaBell className="menu-icon" />
          </button>
          {isNotificationOpen && (
            <div className="notification-dropdown">
              <h4>Notifications</h4>
              <ul className="notification-list">
                <li><span>🔔</span> You have an upcoming meeting at 3PM</li>
                <li><span>🔔</span> Reminder: 'Marketing Sync' starts in 15 minutes.</li>
                <li><span>✉️</span> You’ve been invited to 'Project Planning'</li>
                <li><span>✉️</span> Chris has invited you to a meeting</li>
                <li><span>❌</span> You missed your meeting: 'Q2 Budget Review'</li>
                <li><span>❌</span> No-show: 'Client Briefing' went unattended.</li>
                <li><span>✔️</span> You accepted 'Weekly Sync'</li>
              </ul>
              <Link className="view-all" to="/notifications">View All Notifications</Link>
            </div>
          )}
        </div>

        <div className="user-menu" ref={dropdownRef}>
          <button className="dropdown-toggle" onClick={toggleDropdown}>
            <FaBars className="menu-icon" />
            <FaUserCircle className="user-icon" />
          </button>
          {isDropdownOpen && (
            <div className="dropdown-content">
              {currentUser && (
                <div className="user-info">
                  Logged in as: {currentUser.username}
                </div>
              )}
              <Link to="/settings">Settings</Link>
              {currentUser && (
                <button onClick={handleLogout} className="logout-button">
                  Logout
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
