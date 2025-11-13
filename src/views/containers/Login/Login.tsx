import React, { useState } from "react";
import { useNavigate } from "react-router";
import { PATHS } from "../../../constant";
import { Header } from "../../../views/components/Header/Header";
import { Footer } from "../../../views/components/Footer/Footer";
import "./Login.css";

interface User {
  id: number | string;
  userId: string;
  role: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

interface LoginResponse {
  loginResult: number;
  message: string;
  access_token: string;
  expires_in: number;
  userData: User;
}

export const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("https://localhost:3150/api/Account/Login", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          UserId: formData.username,
          Password: formData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const result = await response.json();
      
      if (result.success) {
        // Store user data
        localStorage.setItem("username", result.user.userId);
        localStorage.setItem("userRole", result.user.role);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("user", JSON.stringify(result.user));
        
        console.log("Login successful! User data:", result.user);
        console.log("User role:", result.user.role);
        console.log("Authentication status: LOGGED IN");
        
        alert("Login successful!");
        
        // Redirect based on user role
        const isAdmin = result.user.role === "admin" || result.user.role === "super admin";
        
        if (isAdmin) {
          // Admin and super admin go to user management page
          navigate("/UserManagement"); // Changed from "/manage"
        } else {
          // Regular users go to browse page
          navigate("/browse");
        }
      } else {
        throw new Error(result.message || "Login failed");
      }

    } catch (error) {
      console.error("Error logging in:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to login. Please try again.";
      alert(errorMessage);
    }
  };

  return (
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
              disabled={isLoading}
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
              disabled={isLoading}
            />
          </div>
          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="signup-link">
          New User? <a href="/register">Sign Up</a>
        </div>
      </div>
      <Footer />
    </div>
  );
};