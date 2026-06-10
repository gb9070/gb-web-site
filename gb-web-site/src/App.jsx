import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import "./App.css";

import Login from "./Components/Login.jsx";
import Home from "./Components/Home.jsx";
import AdminPanel from "./Components/Admin.jsx";
import NavBar from "./Components/Nav.jsx";

function RequireAuth({ user, children }) {
    if (!user) return <Navigate to="/login" replace />;
    return children;
}

function RequireRole({ user, roles, children }) {
    const ok = roles.some(r => user.roles.includes(r));
    if (!ok) return <Navigate to="/" replace />;
    return children;
}

export default function App() {
    const [user, setUser] = useState(null);

    const logout = async () => {
        try {
          localStorage.removeItem("token");
        } catch (err) {
            console.error("Logout failed:", err);
        } finally {
            setUser(null);
        }
    };

    return (
        <BrowserRouter>
            <div className="app-layout">
                {user && <NavBar user={user} logout={logout} />}

                <main className="container">
                    <Routes>
                        <Route path="/login" element={<Login setUser={setUser} />} />

                        <Route
                            path="/"
                            element={
                                <RequireAuth user={user}>
                                    <Home user={user} />
                                </RequireAuth>
                            }
                        />

                        <Route
                            path="/admin"
                            element={
                                <RequireAuth user={user}>
                                    <RequireRole user={user} roles={["admin"]}>
                                        <AdminPanel user={user} />
                                    </RequireRole>
                                </RequireAuth>
                            }
                        />

                        <Route
                            path="*"
                            element={<Navigate to={user ? "/" : "/login"} />}
                        />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}