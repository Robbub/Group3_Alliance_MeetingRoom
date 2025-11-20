import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaThLarge, FaCalendarCheck, FaRedoAlt, FaDoorOpen, FaUsers, FaCog } from "react-icons/fa";
import "./Sidebar.css";

export const Sidebar = () => {
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
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <FaDoorOpen />
          </div>
          <div className="logo-text">
            <h3>RoomBook</h3>
            <p>Admin Dashboard</p>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <h4 className="nav-section-title">Management</h4>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </aside>
  );
};
