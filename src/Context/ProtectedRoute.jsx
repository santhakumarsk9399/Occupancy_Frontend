import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../Context/ContextProvider";
import UnauthorizedPage from "../Pages/UnauthorizedPage";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  console.log(user)
  if (!user) return <Navigate to="/login" />;
  if (!allowedRoles.includes(user.role))
    return <Navigate to="/not-found" replace />;
  
//  if (!allowedRoles.includes(role)) return <Navigate to="/login" />; 

  return children;
};

export default ProtectedRoute;
