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
    setIsLoading(true);

    try {
      console.log("Attempting login with:", formData.username);

      const response = await fetch("https://localhost:50552/api/Account/Login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: formData.username,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const msg = await response.text();
        alert(msg || "Invalid login credentials.");
        return;
      }

      const result: LoginResponse = await response.json();
      console.log("Login response:", result);

      // Check login success
      if (result.loginResult !== 0) {
        alert(result.message || "Login failed.");
        return;
      }

      const user = result.userData;

      // Save user and token to localStorage
      localStorage.setItem("token", result.access_token);
      localStorage.setItem("user", JSON.stringify(user));

      alert("Login successful!");

      // Redirect user based on role
      if (user.role === "admin" || user.role === "super admin") {
        navigate("/usermanagement");
      } else {
        navigate(PATHS.HOMEPAGE.path);
      }

    } catch (error) {
      console.error("Error logging in:", error);
      alert("Failed to log in. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
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
