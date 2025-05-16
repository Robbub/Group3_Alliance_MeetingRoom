import React, { useEffect, useRef, useState } from "react";
import { FaBars, FaUserCircle } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import "./Header.css";

export const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

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
        <a href="/homepage">
          <img src="/assets/summit-logo.png" alt="SUMMITFLOW" />
        </a>
      </div>
      <nav className="nav-links">
        <Link to="/homepage">ABOUT US</Link>
        <Link to="/browse">BROWSE</Link>
        <Link to="/upcoming">MANAGE</Link>
      </nav>
      <div className="user-menu" ref={dropdownRef}>
        <button className="dropdown-toggle" onClick={toggleDropdown}>
          <FaBars className="menu-icon" />
          <FaUserCircle className="user-icon" />
        </button>
        {isDropdownOpen && (
          <div className="dropdown-content">
            <Link to="/notifications">Notifications</Link>
            <hr />
            <Link to="/help-center">Help Center</Link>
            <Link to="/preferences">Preferences</Link>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};