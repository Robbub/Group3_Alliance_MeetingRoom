import React, { JSX } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: JSX.Element;
  adminOnly?: boolean;
  userOnly?: boolean;
}

export const ProtectedRoute = ({ 
  children, 
  adminOnly = false, 
  userOnly = false 
}: ProtectedRouteProps) => {
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // redirect non-admin users trying to access admin routes
  if (adminOnly && user.username !== "admin") {
    return <Navigate to="/upcoming" replace />; 
  }

  // redirect admin users trying to access user-only routes
  if (userOnly && user.username === "admin") {
    return <Navigate to="/manage" replace />;
  }

  return children;
};