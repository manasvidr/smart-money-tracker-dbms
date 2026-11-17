"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// User login page.
export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Login failed");
    } else {
      router.push("/");
    }
  };

  return (
    <div className="form-card">
      <h1>Log In</h1>
      <p className="subtitle">Sign in to your Smart Money Tracker account</p>

      {error && <div className="alert-error">{error}</div>}

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
          <label>Password</label>
          <input
            className="form-input"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
          Log In
        </button>
      </form>

      <p style={{ marginTop: 16, fontSize: "0.9rem", textAlign: "center" }}>
        Don&apos;t have an account? <Link href="/register">Register</Link>
      </p>
    </div>
  );
}
