import React, { useEffect, useRef, useState } from "react";
import { FaBars, FaUserCircle, FaBell } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import { User } from "./UserType";
import "./Header.css";

export const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // [get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  
  // check if on login/register page
  const isAuthPage = window.location.pathname === '/login' || window.location.pathname === '/register';

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
        <Link to="/">
          <img src="/assets/summit-logo.png" alt="SUMMITFLOW" />
        </Link>
      </div>
      <nav className="nav-links">
        <Link to="/about">ABOUT US</Link>
        <Link to="/browse">BROWSE</Link>
        <Link to={currentUser?.username === "admin" ? "/dashboard" : "/upcoming"}>
          MANAGE
        </Link>
      </nav>
      
      {/* show Login button if not logged in (and not on auth pages), otherwise show user menu */}
      {!currentUser && !isAuthPage ? (
        <button className="login-button" onClick={() => navigate("/login")}>
          Log-in
        </button>
      ) : currentUser ? (
        <div className="user-menu" ref={dropdownRef}>
          <button className="dropdown-toggle" onClick={toggleDropdown}>
            <FaBars className="menu-icon" />
            <FaUserCircle className="user-icon" />
          </button>
          {isDropdownOpen && (
            <div className="dropdown-content">
              {/* show username if logged in */}
              <div className="user-info">
                Logged in as: {currentUser.username}
              </div>
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
      ) : null}
    </header>
  );
};