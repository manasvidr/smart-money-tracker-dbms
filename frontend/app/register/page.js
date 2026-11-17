"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// User registration page (all registered users get ANALYST role).
export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Registration failed");
    } else {
      setSuccess("Account created! Redirecting to login...");
      setTimeout(() => router.push("/login"), 1500);
    }
  };

  return (
    <div className="form-card">
      <h1>Register</h1>
      <p className="subtitle">Create an Analyst account</p>

      {error && <div className="alert-error">{error}</div>}
      {success && <div className="alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Username</label>
          <input
            className="form-input"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            className="form-input"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Password (min 6 characters)</label>
          <input
            className="form-input"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
          Create Account
        </button>
      </form>

      <p style={{ marginTop: 16, fontSize: "0.9rem", textAlign: "center" }}>
        Already have an account? <Link href="/login">Log In</Link>
      </p>
    </div>
  );
}
