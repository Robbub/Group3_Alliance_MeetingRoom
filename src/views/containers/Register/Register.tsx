import React, { useState } from "react";
import { useNavigate } from "react-router";
import { PATHS } from "../../../constant";
import { Header } from "../../../views/components/Header/Header";
import "./Register.css";

export const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "", 
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

<<<<<<< HEAD
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      alert("Please enter a valid email address!");
      return;
    }

    try {
      console.log("Attempting to register at: http://localhost:64508/api/Account/Register");
      const response = await fetch("http://localhost:64508/api/Account/Register", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          UserId: formData.username,    // Username only
          Password: formData.password, 
          FirstName: formData.firstName, 
          LastName: formData.lastName,  
          Email: formData.email || ""   // Separate email field
        }),
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        const msg = await response.text();
        console.error("Registration failed:", msg);
        alert(msg || "Failed to register.");
        return;
      }

      const result = await response.json();
      console.log("Registration successful:", result);
      alert("Registration successful!");
      navigate(PATHS.LOGIN.path);
    } catch (error) {
      console.error("Registration error:", error);
      console.error("Error type:", error instanceof Error ? error.constructor.name : typeof error);
      console.error("Error message:", error instanceof Error ? error.message : String(error));
      
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        alert("Cannot connect to server. Please check:\n1. Backend is running at http://localhost:64508\n2. CORS is enabled for localhost:8081\n3. Check browser console for details");
      } else {
        alert(`Registration failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
=======
    const response = await fetch("https://localhost:50552/api/Account/Register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: formData.username,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName
      }),
    });

    if (!response.ok) {
      const msg = await response.text();
      alert(msg || "Failed to register.");
      return;
>>>>>>> 98aecedf226ae26a53d0b4714f91f5c68499318f
    }

    alert("Registration successful!");
    navigate(PATHS.LOGIN.path);
  };

  return (
    <div className="register-page">
      <Header />
      <div className="register-container">
        <div className="register-form-container">
          <h1 className="register-title">CREATE AN ACCOUNT</h1>
          <form className="register-form" onSubmit={handleSubmit}>
            
            {/* Username Field - SEPARATE from email */}
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

            {/* Email Field - SEPARATE input */}
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Enter your email address"
                required
              />
            </div>

            {/* First & Last Name Fields */}
            <div className="form-group name-fields">
              <div>
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  placeholder="First Name"
                  required
                />
              </div>
              <div>
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  placeholder="Last Name"
                  required
                />
              </div>
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
          </form>
        </div>
      </div>
    </div>
  );
};