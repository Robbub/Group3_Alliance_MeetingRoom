import React, { useState } from "react";
import { useNavigate } from "react-router";
import { PATHS } from "../../../constant";
import { Header } from "../../../views/components/Header/Header";
import { Footer } from "../../../views/components/Footer/Footer";
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
          <button className="book-room-button">
                <a href="/browse">Book a room</a>
            </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};
