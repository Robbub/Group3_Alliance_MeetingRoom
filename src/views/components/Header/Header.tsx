// src/components/Header/Header.tsx
import React, { useEffect, useRef, useState } from "react";
import { FaBars, FaUserCircle } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import "./Header.css";

export const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // [NEW] Get current user from localStorage
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
        <Link to="/homepage">HOME</Link>
        <Link to="/browse">BROWSE ROOMS</Link>
        <Link to={currentUser?.username === "admin" ? "/admin" : "/upcoming"}>
          MANAGE MEETINGS
        </Link>
        <Link to="/bookingmanagement">CALENDAR</Link>
      </nav>
      <div className="user-menu" ref={dropdownRef}>
        <button className="dropdown-toggle" onClick={toggleDropdown}>
          <FaBars className="menu-icon" />
          <FaUserCircle className="user-icon" />
        </button>
        {isDropdownOpen && (
          <div className="dropdown-content">
            {/* [NEW] Show username if logged in */}
            {currentUser && (
              <div className="user-info">
                Logged in as: {currentUser.username}
              </div>
            )}
            <Link to="/notifications">Notifications</Link>
            <Link to="/preferences">Preferences</Link>
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