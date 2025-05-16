import React, { useState } from "react";
import { useNavigate } from "react-router";
import { PATHS } from "../../../constant";
import { Header } from "../../../views/components/Header/Header";
import { Footer } from "../../../views/components/Footer/Footer";
import "./Login.css";

export const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/users");
      const users = await response.json();

      const user = users.find(
        (u) => u.username === formData.username && u.password === formData.password
      );

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        alert("Login successful!");
        navigate(PATHS.HOMEPAGE.path);
      } else {
        alert("Invalid username or password.");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      alert("Failed to log in. Please try again.");
    }
  };

  return (
    <>
    <div className="login-page">
      <Header />
      <div className="login-container">
        <h1 className="login-title">LOG IN</h1>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              placeholder="Enter your username or email address"
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
          {/* <div className="form-options">
            <label>
              <input type="checkbox" /> Remember for 30 days
            </label>
            <a href="/forgot-password" className="forgot-password">
              Forget password?
            </a>
          </div> */}
          <button type="submit" className="login-button">
            Log In
          </button>
          {/* <button className="company-email-button">
            Continue with Company Email
          </button> */}
        </form>
        <div className="signup-link">
          New User? <a href="/register">Sign Up</a>
        </div>
      </div>
      <Footer />
    </div>
    </>
  );
};