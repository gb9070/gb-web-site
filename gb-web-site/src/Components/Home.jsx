import { Link } from "react-router-dom";

import "./Home.css";

function Home({ user }) {
    const isAdmin = user?.roles?.includes("admin");
    const isManagement = user?.roles?.includes("management");

    return (
        <div className="home">
            <div className="card">
                <h1>Dashboard</h1>

                <p className="small">
                    Welcome back, <strong>{user?.username}</strong>
                </p>

                <div className="role-badges">
                    {user?.roles?.map((r, i) => (
                        <span key={i} className={`badge badge-${r}`}>
                            {r}
                        </span>
                    ))}
                </div>
            </div>

            <div className="home-grid">
                <Link to="/userCase" className="home-card">
                    <h3>My Case</h3>
                    <p>Create and manage your cases</p>
                </Link>
                
                {isAdmin && (
                    <Link to="/admin" className="home-card">
                        <h3>Admin Panel</h3>
                        <p>Manage users and roles</p>
                    </Link>
                )}
            </div>
        </div>
    );
}

export default Home;