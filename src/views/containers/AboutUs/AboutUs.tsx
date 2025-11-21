import React from "react";
import { Header } from "../../components/Header/Header";
import { Footer } from "../../../views/components/Footer/Footer";
import { useNavigate } from "react-router-dom";
import "./AboutUs.css";

export const AboutUs = () => {
  const navigate = useNavigate();

  return (
    <div className="aboutus-container">
      <Header />
      <div className="aboutus-hero">
      </div>
      <div className="aboutus-content">

          <section className="aboutus-section mission-section">
            <div className="section-header">
              <h2>Our Mission</h2>
              <div className="divider"></div>
            </div>
            <p className="mission-text">
              SummitFlow is dedicated to revolutionizing the way organizations manage their meeting spaces. 
              We provide an intuitive, efficient platform that makes booking and managing meeting rooms seamless and stress-free.
            </p>
          </section>

          <section className="aboutus-section features-section">
            <div className="section-header">
              <h2>What We Offer</h2>
              <div className="divider"></div>
            </div>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">📅</div>
                <h3>Easy Booking</h3>
                <p>Browse and book meeting rooms with just a few clicks. Our intuitive interface makes scheduling effortless.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">⚡</div>
                <h3>Real-time Availability</h3>
                <p>See which rooms are available instantly and avoid double bookings with our live update system.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📊</div>
                <h3>Comprehensive Management</h3>
                <p>Admins can easily manage rooms, view bookings, and maintain optimal resource utilization.</p>
              </div>
            </div>
          </section>

          <section className="aboutus-section benefits-section">
            <div className="section-header">
              <h2>Why Choose SummitFlow?</h2>
              <div className="divider"></div>
            </div>
            <div className="benefits-grid">
              <div className="benefit-item">
                <span className="check-icon">✓</span>
                <span>Intuitive and modern interface</span>
              </div>
              <div className="benefit-item">
                <span className="check-icon">✓</span>
                <span>Secure authentication and data protection</span>
              </div>
              <div className="benefit-item">
                <span className="check-icon">✓</span>
                <span>Real-time room availability updates</span>
              </div>
              <div className="benefit-item">
                <span className="check-icon">✓</span>
                <span>Efficient resource management</span>
              </div>
              <div className="benefit-item">
                <span className="check-icon">✓</span>
                <span>Responsive design for any device</span>
              </div>
              <div className="benefit-item">
                <span className="check-icon">✓</span>
                <span>Comprehensive booking history</span>
              </div>
            </div>
          </section>

          <section className="aboutus-section cta-section">
            <h2>Get Started Today</h2>
            <p>
              Ready to streamline your meeting room management? Sign up now and experience the difference SummitFlow can make for your organization.
            </p>
            <div className="cta-buttons">
              <button className="primary-button" onClick={() => navigate('/register')}>
                Get Started
              </button>
              <button className="secondary-button" onClick={() => navigate('/browse')}>
                Browse Rooms
              </button>
            </div>
          </section>
        </div>
      
    </div>
  );
};
