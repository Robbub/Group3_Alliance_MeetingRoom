import React from "react";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import "./Footer.css";

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section_logo-section">
          <img src="/assets/summit-logo.png" alt="SUMMITFLOW" className="footer-logo" />
          <p>
            Lorem ipsum dolor sit amet, consectetur 
            adipiscing elit, sed do eiusmod el dorado call me baby love me right
            thinder leet me in
          </p>
        </div>
        <div className="footer-section">
          <h3>COMPANY</h3>
          <ul>
            <li><a href="/about">About Us</a></li>
            <li><a href="/legal">Legal Information</a></li>
            <li><a href="/contact">Contact Us</a></li>
            <li><a href="/blogs">Blogs</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>HELP CENTER</h3>
          <ul>
            <li><a href="/find-property">Find a Property</a></li>
            <li><a href="/how-to-host">How To Host?</a></li>
            <li><a href="/why-us">Why Us?</a></li>
            <li><a href="/faqs">FAQs</a></li>
            <li><a href="/rental-guides">Rental Guides</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>CONTACT INFO</h3>
          <ul>
            <li>Phone: 1234567890</li>
            <li>Email: company@email.com</li>
            <li>Location: 100 Smart Street, LA, USA</li>
          </ul>
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <FaFacebookF />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <FaTwitter />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <FaInstagram />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              <FaLinkedinIn />
            </a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2025 SUMMITFLOW | All rights reserved.</p>
        <p>Elevate your vision, one meeting at a time.</p>
      </div>
    </footer>
  );
};