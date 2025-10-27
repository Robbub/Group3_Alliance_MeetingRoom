import React, { useState } from "react";
import { useNavigate } from "react-router";
import { PATHS } from "../../../constant";
import { Header } from "../../../views/components/Header/Header";
import { Footer } from "../../../views/components/Footer/Footer";
import "./Login.css";

interface User {
  id: number | string;
  username: string;
  password: string;
  role: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  avatar?: string;
  lastSeen?: string;
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
      
      const response = await fetch("http://localhost:3000/users");
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const users: User[] = await response.json();
      console.log("Retrieved users:", users);

      // Debug: Log all usernames and roles
      users.forEach(user => {
        console.log(`User: ${user.username}, Role: ${user.role}`);
      });

      const user = users.find(
        (u: User) => {
          console.log(`Checking: ${u.username} === ${formData.username} && ${u.password} === ${formData.password}`);
          return u.username === formData.username && u.password === formData.password;
        }
      );

      if (user) {
        console.log("Login successful for user:", user);
        
        try {
          // Update lastSeen timestamp
          await fetch(`http://localhost:3000/users/${user.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              lastSeen: new Date().toLocaleString() 
            }),
          });
        } catch (updateError) {
          console.error("Failed to update lastSeen:", updateError);
          // Continue with login even if lastSeen update fails
        }

        // Store user info in localStorage
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("username", formData.username);
        
        alert("Login successful!");
        
        // Navigate based on role
        console.log("User role:", user.role);
        if (user.role === "admin" || user.role === "super admin") {
          navigate("/usermanagement");
        } else {
          navigate(PATHS.HOMEPAGE.path);
        }
      } else {
        console.log("No matching user found");
        alert("Invalid username or password.");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      alert("Failed to log in. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
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
    </>
  );
};