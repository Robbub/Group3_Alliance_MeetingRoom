import React, { useState } from "react";
import { FaBars, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router";
import "./Header.css";
import { Link } from "react-router-dom";

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
        <Link to="/homepage">
          <img src="/assets/summit-logo.png" alt="SUMMITFLOW" />
        </Link>
      </div>
      <nav className="nav-links">
        <Link to="/homepage">HOME</Link>
        <Link to="/browse">BROWSE ROOMS</Link>
        <Link to="/upcoming">MANAGE MEETINGS</Link>
      </nav>
      <div className="user-menu">
        <button className="dropdown-toggle" onClick={toggleDropdown}>
          <FaBars className="menu-icon" />
          <FaUserCircle className="user-icon" />
        </button>
        {isDropdownOpen && (
          <div className="dropdown-content">
            <Link to="/notifications">Notifications</Link>
            <Link to="/reservations">Settings</Link>
            {/* <a to="/account">Account</a>
            <a to="/help-center">Help Center</a> */}
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};