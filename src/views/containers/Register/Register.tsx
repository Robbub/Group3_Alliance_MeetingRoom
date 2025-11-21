import React, { useState } from "react";
import { useNavigate } from "react-router";
import { PATHS } from "../../../constant";
import { Header } from "../../../views/components/Header/Header";
import { Footer } from "../../../views/components/Footer/Footer";
import "./Register.css";

const API_BASE_URL = 'http://localhost:64508/api';

export const Register = () => {
  const [formData, setFormData] = useState({ 
    username: "", 
    password: "", 
    retypePassword: "",
    firstName: "",
    lastName: ""
  });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.retypePassword) {
      alert("Passwords do not match!");
      return;
    }

    if (!formData.firstName || !formData.lastName) {
      alert("First name and last name are required!");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/Account/Register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: formData.username, 
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: "user"
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registration successful!");
        navigate(PATHS.LOGIN.path);
      } else {
        alert(data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Error registering user:", error);
      alert("Failed to register. Please try again.");
    }
  };

  return (
    <div className="register-page">
      <Header />
      <div className="register-container">
        <div className="register-form-container">
          <h1 className="register-title">CREATE AN ACCOUNT</h1>
          <form className="register-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                placeholder="Enter your first name"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                placeholder="Enter your last name"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                placeholder="Enter your username"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Enter your password"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="retypePassword">Re-type Password</label>
              <input
                type="password"
                id="retypePassword"
                value={formData.retypePassword}
                onChange={(e) =>
                  setFormData({ ...formData, retypePassword: e.target.value })
                }
                placeholder="Re-type your password"
                required
              />
            </div>
            <button type="submit" className="register-button">
              Sign Up
            </button>
            <button className="company-email-button">
              Continue with Company Email
            </button>
          </form>
          <div className="login-link">
            Already have an account? <a href="/login">Log In</a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};
