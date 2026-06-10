import { useEffect, useState } from "react";

import "./userCase.css";

const getPriorityClass = (priority) => {
    if (priority >= 8) return "high";
    if (priority >= 4) return "medium";
    return "low";
};

function CreateCase({ user, refreshCases }) {
    const [form, setForm] = useState({
        name: "",
        description: "",
        priority: 1,
        ownerAccountUuid: null,
        status: "open"
    });

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("token");

            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/case`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token
                            ? { Authorization: `Bearer ${token}` }
                            : {})
                    },
                    body: JSON.stringify({
                        ...form,
                        priority: Number(form.priority),
                        recipientAccountUuid: user.uuid
                    })
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to create case");
            }

            setForm({
                name: "",
                description: "",
                priority: 1,
                ownerAccountUuid: null,
                status: "open"
            });

            refreshCases();

            alert("Case created");
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="card case-card">
            <h3>Create Case</h3>

            <form onSubmit={handleSubmit} className="case-form">
                <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Case name"
                />

                <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Description"
                />

                <input
                    type="number"
                    min="1"
                    max="10"
                    name="priority"
                    value={form.priority}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            priority: Number(e.target.value)
                        })
                    }
                    placeholder="Priority"
                />

                <button className="btn-green full">
                    Create Case
                </button>
            </form>
        </div>
    );
}

function CaseList({ title, cases }) {
    return (
        <div className="card case-card">
            <h3>{title}</h3>

            {!cases.length && (
                <p>No cases found.</p>
            )}

            <div className="case-grid">
                {cases.map((c) => (
                    <div key={c.uuid} className="case-item">
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

export default function CasesPanel({ user }) {
    const [ownedCases, setOwnedCases] = useState([]);
    const [receivedCases, setReceivedCases] = useState([]);
    const [loading, setLoading] = useState(true);

    const isSupport = user.roles.includes("support");
    const isAdmin = user.roles.includes("admin");

    const fetchCases = async () => {
        try {
            setLoading(true);

            const token = localStorage.getItem("token");

            const headers = {
                "Content-Type": "application/json",
                ...(token
                    ? { Authorization: `Bearer ${token}` }
                    : {})
            };

            const [ownerRes, recipientRes] = await Promise.all([
                fetch(
                    `${import.meta.env.VITE_API_URL}/case/owner/${user.uuid}`,
                    { headers }
                ),
                fetch(
                    `${import.meta.env.VITE_API_URL}/case/recipient/${user.uuid}`,
                    { headers }
                )
            ]);

            const ownerData = await ownerRes.json();
            const recipientData = await recipientRes.json();

            setOwnedCases(recipientData|| []);
            setReceivedCases(ownedCases || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.uuid) {
            fetchCases();
        }
    }, [user?.uuid]);

    if (loading) {
        return <div>Loading cases...</div>;
    }

    return (
        <div className="cases-layout">
            <div className="cases-header">
                <h2>Cases</h2>
                <p>
                    Logged in as <b>{user.username}</b>
                </p>
            </div>

            <div className="cases-grid">
                <CreateCase
                    user={user}
                    refreshCases={fetchCases}
                />

                <CaseList
                    title="Cases I Created"
                    cases={ownedCases}
                />

                {(isSupport || isAdmin) && (
                    <CaseList
                        title="Cases Assigned To Me"
                        cases={receivedCases}
                    />
                )}
            </div>
        </div>
    );
}