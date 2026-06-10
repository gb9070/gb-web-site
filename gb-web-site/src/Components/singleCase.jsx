import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import "./singleCase.css";

function getPriorityClass(priority) {
    if (priority >= 8) return "high";
    if (priority >= 4) return "medium";
    return "low";
}

export default function CasePage({ user }) {
    const { uuid } = useParams();
    const navigate = useNavigate();

    const [c, setC] = useState(null);
    const [form, setForm] = useState({
        name: "",
        description: "",
        priority: 1,
        status: ""
    });

    const isAdmin = user.roles.includes("admin");

    const fetchCase = async () => {
        const token = localStorage.getItem("token");

        const res = await fetch(
            `${import.meta.env.VITE_API_URL}/case/${uuid}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                }
            }
        );

        const data = await res.json();

        setC(data);
        setForm({
            name: data.name || "",
            description: data.description || "",
            priority: data.priority || 1,
            status: data.status || ""
        });
    };

    useEffect(() => {
        fetchCase();
    }, [uuid]);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]:
                e.target.name === "priority"
                    ? Number(e.target.value)
                    : e.target.value
        });
    };

    const updateCase = async () => {
        const token = localStorage.getItem("token");

        await fetch(
            `${import.meta.env.VITE_API_URL}/case/${uuid}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify(form)
            }
        );

        fetchCase();
    };

    const deleteCase = async () => {
        const token = localStorage.getItem("token");

        await fetch(
            `${import.meta.env.VITE_API_URL}/case/${uuid}`,
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                }
            }
        );

        navigate("/cases");
    };

    const assignToSelf = async () => {
        const token = localStorage.getItem("token");

        if (c.ownerAccountUuid === user.uuid) return;

        await fetch(
            `${import.meta.env.VITE_API_URL}/case/${uuid}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    ownerAccountUuid: user.uuid
                })
            }
        );

        fetchCase();
    };

    if (!c) return <div>Loading case...</div>;

    const isCreator = c.recipientAccountUuid === user.uuid;

    return (
        <div className="case-page">
            <button onClick={() => navigate("/cases")}>
                ← Back
            </button>

            <h2>{c.name}</h2>

            <div className="case-meta">
                <span className={`badge ${getPriorityClass(c.priority)}`}>
                    Priority: {c.priority}
                </span>

                <span className="badge">{c.status}</span>
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

            {/* UPDATE FORM */}
            <div className="card case-card">
                <h3>Edit Case</h3>

                <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Name"
                />

                <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Description"
                />

                <input
                    type="number"
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                />

                <input
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    placeholder="Status"
                />

                <button onClick={updateCase} className="btn-green">
                    Save Changes
                </button>
            </div>

            {/* ACTIONS */}
            <div className="card case-card">
                <h3>Actions</h3>

                <button
                    onClick={assignToSelf}
                    disabled={isCreator}
                    className="btn-blue"
                >
                    Assign to me
                </button>

                {isCreator && (
                    <p className="hint">
                        You cannot assign your own case to yourself.
                    </p>
                )}

                {isAdmin && (
                    <button onClick={deleteCase} className="btn-red">
                        Delete Case
                    </button>                    
                )}
            </div>
        </div>
    );
}