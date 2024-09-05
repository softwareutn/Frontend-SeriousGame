import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Cargando...</div>; 
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
