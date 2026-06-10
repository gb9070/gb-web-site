import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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

    return (
        <div className="cases-page">
            <h2>Cases</h2>
            <CaseList cases={cases} />
        </div>
    );
}