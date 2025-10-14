import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import { AuthProvider, useAuth } from "./auth.jsx";
import Layout from "./shell/Layout.jsx";
import Login from "./Login.jsx";
import Dashboard from "./Pages/Dashboard.jsx";
import Requests from "./Pages/Requests.jsx";
import PayBills from "./Pages/PayBills.jsx";
import "./styles.css";

function PrivateRoute() {
  const { user } = useAuth();
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* Prefer env var; falls back to literal if not set */}
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "383140041753-27r0n3fltegclnlqc6fc762fp7t0phki.apps.googleusercontent.com"}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<PrivateRoute />}>
              <Route element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="requests" element={<Requests />} />
                <Route path="paybills" element={<PayBills />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
