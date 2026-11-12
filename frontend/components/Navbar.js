"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

// Global navigation bar with role-based links and user session display.
export default function Navbar() {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Fetch current user from /api/auth/me
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data))
      .catch(() => setUser(null));
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
  };

  const isAdmin = user?.roles?.includes("ADMIN");

  return (
    <nav className="navbar">
      <Link href="/" className="nav-brand">
        Smart Money Tracker
      </Link>
      <div className="nav-links">
        {user ? (
          <>
            <Link href="/">Dashboard</Link>
            <Link href="/companies">Companies</Link>
            <Link href="/insider-transactions">Insider Trades</Link>
            <Link href="/institutions">Institutions</Link>
            <Link href="/watchlist">Watchlist</Link>
            <Link href="/filings">SEC Filings</Link>
            {isAdmin && <Link href="/audit-logs">Audit Log</Link>}
            <span className="nav-user">
              {user.username} ({user.roles?.join(", ")})
            </span>
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login">Login</Link>
            <Link href="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
