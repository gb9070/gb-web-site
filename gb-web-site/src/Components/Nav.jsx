import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";

import "./Nav.css";

function NavBar({ user, logout }) {
    const [open, setOpen] = useState(false);
    const [theme, setTheme] = useState("dark");

    const isAdmin = user.roles.includes("admin");
    const isSupport = user.roles.includes("support");

    const closeMenu = () => setOpen(false);

    /* LOAD SAVED THEME */
    useEffect(() => {
        const saved = localStorage.getItem("theme");

        if (saved) {
            if (saved === "light") {
                document.body.classList.add("light");
                setTheme("light");
            } else {
                document.body.classList.remove("light");
                setTheme("dark");
            }
        } else {
            const systemPrefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;

            if (systemPrefersLight) {
                document.body.classList.add("light");
                setTheme("light");
            } else {
                document.body.classList.remove("light");
                setTheme("dark");
            }
        }
    }, []);

    /* TOGGLE THEME */
    const toggleTheme = () => {
        if (theme === "light") {
            document.body.classList.remove("light");
            localStorage.setItem("theme", "dark");
            setTheme("dark");
        } else {
            document.body.classList.add("light");
            localStorage.setItem("theme", "light");
            setTheme("light");
        }
    };

    return (
        <nav className="nav">
            <div className="nav-left">
                <div className="brand">GrønnBank AS</div>

                <button
                    className="menu-btn"
                    onClick={() => setOpen(!open)}
                >
                    ☰
                </button>

                <div className={`nav-links ${open ? "open" : ""}`}>
                    <NavLink onClick={closeMenu} to="/" className="nav-item">
                        Home
                    </NavLink>

                    <NavLink onClick={closeMenu} to="/userCase" className="nav-item">
                        My Cases
                    </NavLink>

                    {(isSupport || isAdmin) && (
                        <NavLink onClick={closeMenu} to="/supportCases" className="nav-item">
                            Support Cases
                        </NavLink>
                    )}

                    {isAdmin && (
                        <NavLink onClick={closeMenu} to="/admin" className="nav-item admin">
                            Admin
                        </NavLink>
                    )}
                </div>
            </div>

            <div className="nav-right">
                <button
                    className="btn-gray"
                    onClick={toggleTheme}
                    title="Toggle theme"
                >
                    {theme === "light" ? "🌙" : "☀️"}
                </button>

                <div className="user-pill">
                    {user.username}
                </div>

                <button className="logout-btn" onClick={logout}>
                    Logout
                </button>
            </div>
        </nav>
    );
}

export default NavBar;