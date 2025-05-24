import React, { JSX } from "react";
import { Navigate } from "react-router-dom";
import { User } from "./UserType";

interface ProtectedRouteProps {
  children: JSX.Element;
  adminOnly?: boolean;
  userOnly?: boolean;
}

export const ProtectedRoute = ({
  children,
  adminOnly = false,
  userOnly = false,
}: ProtectedRouteProps) => {
  const userString = localStorage.getItem("user");
  const user: User | null = userString ? JSON.parse(userString) : null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = user.role === "admin" || user.role === "super admin";

  if (adminOnly && !isAdmin) {
    return <Navigate to="/upcoming" replace />;
  }

  if (userOnly && isAdmin) {
    return <Navigate to="/manage" replace />;
  }

  return children;
};
