import React, { useState } from "react";
import { useNavigate, Link } from "react-router";
import { PATHS } from "../../../constant";
import { Header } from "../../../views/components/Header/Header";
import "./Homepage.css";

export const Homepage = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="homepage-container">
      <Header />
      <div className="hero-section">
      </div>
      <div className="content-section">
        <div className="content-card">
          <h2>Browse Meeting</h2>
          <h2>Rooms</h2>
          <p>Explore properties by their categories/types...</p>
          <button className="book-room-button" onClick={() => navigate('/browse')}>
            Book a room
          </button>
        </div>
      </div>
    </div>
  );
};
