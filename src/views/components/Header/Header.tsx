// src/components/Header/Header.tsx
import React, { useEffect, useRef, useState } from "react";
import { FaBars, FaUserCircle } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import "./Header.css";

export const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
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
            <Link to={currentUser?.username === "admin" ? "/admin" : "/upcoming"}>Manage Rooms</Link>
            {currentUser?.username === "admin" && (
              <Link to="/usermanagement">Manage Users</Link>
            )}
          </div>
        </div>

        <Link to="/bookingmanagement" className="nav-item">CALENDAR</Link>
      </nav>

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
            <Link to="/notifications">Notifications</Link>
            <Link to="/settings">Settings</Link>
            {currentUser && (
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
