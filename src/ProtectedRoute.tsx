import React from "react";
import { Navigate } from "react-router-dom";
import { User } from "./constant/UserType";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  userOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  adminOnly = false, 
  userOnly = false 
}) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userDataString = localStorage.getItem("user");
  
  // Log authentication status
  console.log("Protected Route Check:");
  console.log("- Is Logged In:", isLoggedIn);
  console.log("- User Data:", userDataString);

  if (!isLoggedIn || !userDataString) {
    console.log("- Access Denied: Not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  const user: User = JSON.parse(userDataString);
  const isAdmin = user.role === "admin" || user.role === "super admin";

  console.log("- User Role:", user.role);
  console.log("- Is Admin:", isAdmin);
  console.log("- Admin Only Route:", adminOnly);
  console.log("- User Only Route:", userOnly);

  if (adminOnly && !isAdmin) {
    console.log("- Access Denied: Admin required, redirecting to /upcoming");
    return <Navigate to="/upcoming" replace />;
  }

  if (userOnly && isAdmin) {
    console.log("- Access Denied: User only, redirecting to /manage");
    return <Navigate to="/manage" replace />;
  }

  console.log("- Access Granted: User can access this route");
  return <>{children}</>;
};

export default ProtectedRoute;