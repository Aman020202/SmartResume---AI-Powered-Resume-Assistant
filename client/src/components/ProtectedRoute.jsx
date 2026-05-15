import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
    let userInfo = null;

    try {
        userInfo = JSON.parse(localStorage.getItem("userInfo"));
    } catch (error) {
        userInfo = null;
    }

    return userInfo && userInfo.token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;