import React, { useState } from "react";
import { FaBars, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router";
import "./Header.css";

export const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("user"); 
    navigate("/login"); 
  };

  return (
    <header className="header">
      <div className="logo">
        <a href="/homepage">
          <img src="/assets/summit-logo.png" alt="SUMMITFLOW" />
        </a>
      </div>
      <nav className="nav-links">
        <a href="/homepage">ABOUT US</a>
        <a href="/browse">BROWSE</a>
        <a href="/upcoming">MANAGE</a>
        <a href="/bookingmanagement">CALENDAR</a>
      </nav>
      <div className="user-menu">
        <button className="dropdown-toggle" onClick={toggleDropdown}>
          <FaBars className="menu-icon" />
          <FaUserCircle className="user-icon" />
        </button>
        {isDropdownOpen && (
          <div className="dropdown-content">
            <a href="/notifications">Notifications</a>
            <a href="/reservations">Reservations</a>
            <a href="/account">Account</a>
            <a href="/help-center">Help Center</a>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};