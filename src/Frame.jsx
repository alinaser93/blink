import React from "react";
import { Link } from "react-router-dom";
import { LayoutGrid } from "lucide-react";

export default function Frame({ children }) {
  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      {children}
      <Link
        to="/"
        title="كل الشاشات"
        style={{
          position: "fixed", bottom: 134, insetInlineEnd: 14, zIndex: 9999,
          width: 44, height: 44, borderRadius: 999, background: "#0C831F", color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 8px 22px rgba(12,131,31,.45)", textDecoration: "none", opacity: 0.92,
        }}
      >
        <LayoutGrid size={20} />
      </Link>
    </div>
  );
}
