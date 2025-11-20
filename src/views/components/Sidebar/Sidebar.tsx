import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaThLarge, FaCalendarCheck, FaRedoAlt, FaDoorOpen, FaUsers, FaCog } from "react-icons/fa";
import "./Sidebar.css";

interface SidebarProps {
  collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed = false }) => {
  const location = useLocation();

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: <FaThLarge /> },
    { path: "/booking-requests", label: "Booking Requests", icon: <FaCalendarCheck /> },
    { path: "/recurring-meetings", label: "Recurring Meetings", icon: <FaRedoAlt /> },
    { path: "/roommanagement", label: "Meeting Rooms", icon: <FaDoorOpen /> },
    { path: "/users", label: "Users", icon: <FaUsers /> },
    { path: "/settings", label: "Settings", icon: <FaCog /> },
  ];

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <FaDoorOpen />
          </div>
          {!collapsed && (
            <div className="logo-text">
              <h3>Bookings</h3>
              <p>Admin Dashboard</p>
            </div>
          )}
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          {!collapsed && <h4 className="nav-section-title">Management</h4>}
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
              title={collapsed ? item.label : ""}
            >
              <span className="nav-icon">{item.icon}</span>
              {!collapsed && <span className="nav-label">{item.label}</span>}
            </Link>
          ))}
        </div>
      </nav>
    </aside>
  );
};
