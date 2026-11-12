import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Smart Money Tracker",
  description: "DBMS Project - Insider Transactions, SEC Filings & Institutional Ownership",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
