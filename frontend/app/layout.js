import "./globals.css";
import { Suspense } from "react";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Smart Money Tracker",
  description: "DBMS Project - Insider Transactions, SEC Filings & Institutional Ownership",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={<nav className="navbar" />}>
          <Navbar />
        </Suspense>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
