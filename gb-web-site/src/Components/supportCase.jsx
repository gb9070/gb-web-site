import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./supportCase.css";

function getPriorityClass(priority) {
    if (priority >= 8) return "high";
    if (priority >= 4) return "medium";
    return "low";
}

function CaseList({ cases }) {
    const navigate = useNavigate();

    return (
        <div className="card case-card">
            <h3>All Cases</h3>

            {!cases.length && <p>No cases found.</p>}

            <div className="case-grid">
                {cases.map((c) => (
                    <div
                        key={c.uuid}
                        className="case-item clickable"
                        onClick={() => navigate(`/case/${c.uuid}`)}
                    >
                        <div className="case-top">
                            <strong>{c.name}</strong>
                        </div>

                        <p>{c.description}</p>

                        <div className="case-meta">
                            <span className={`badge ${getPriorityClass(c.priority)}`}>
                                Priority: {c.priority}
                            </span>

                            <span className="badge">
                                {c.status}
                            </span>
                        </div>

                        <div className="case-users">
                            <div>
                                <strong>Created By:</strong>{" "}
                                {c.recipientAccount?.username ?? "None"}
                            </div>

                            <div>
                                <strong>Assigned To:</strong>{" "}
                                {c.ownerAccount?.username ?? "None"}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function CasesPage() {
    const [cases, setCases] = useState([]);
    const [sortBy, setSortBy] = useState("priority-desc");

    const fetchCases = async () => {
        const token = localStorage.getItem("token");

        const res = await fetch(
            `${import.meta.env.VITE_API_URL}/case`,
            {
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                }
            }
        );

        const data = await res.json();
        setCases(Array.isArray(data) ? data : []);
    };

    useEffect(() => {
        fetchCases();
    }, []);

    const sortedCases = useMemo(() => {
        const copy = [...cases];

        switch (sortBy) {
            case "priority-asc":
                return copy.sort((a, b) => a.priority - b.priority);

            case "priority-desc":
                return copy.sort((a, b) => b.priority - a.priority);

            case "name-asc":
                return copy.sort((a, b) =>
                    a.name.localeCompare(b.name)
                );

            case "name-desc":
                return copy.sort((a, b) =>
                    b.name.localeCompare(a.name)
                );

            case "status":
                return copy.sort((a, b) =>
                    (a.status || "").localeCompare(b.status || "")
                );

            default:
                return copy;
        }
    }, [cases, sortBy]);

    return (
        <div className="cases-page">
            <h2>Cases</h2>

            {/* SORT UI */}
            <div className="sort-bar">
                <label>Sort by:</label>

                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                >
                    <option value="priority-desc">Priority (High → Low)</option>
                    <option value="priority-asc">Priority (Low → High)</option>
                    <option value="name-asc">Name (A → Z)</option>
                    <option value="name-desc">Name (Z → A)</option>
                    <option value="status">Status</option>
                </select>
            </div>

            <CaseList cases={sortedCases} />
        </div>
    );
}