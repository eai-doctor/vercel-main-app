// DataTable.jsx
import { useState } from "react";

const statusStyle = {
  active:   { bg: "#e6f9ee", color: "#1a7a40" },
  inactive: { bg: "#f1f1f4", color: "#6b7a99" },
  pending:  { bg: "#fff7e0", color: "#a06000" },
};

/**
 * DataTable
 *
 * Props:
 *   title       {string}    — header text
 *   viewAllLabel{string}    — label for "view all" button (default: "View all →")
 *   onViewAll   {function}  — called when "view all" is clicked; omit to hide the button
 *   columns     {Column[]}  — column definitions (see below)
 *   rows        {object[]}  — data rows; each row must have all keys referenced in columns
 *   actionLabel {string}    — label for the per-row action button (default: "Manage")
 *   onAction    {function}  — called with the row object when the action button is clicked
 *
 * Column shape:
 *   { label, key }                   — plain text cell
 *   { label, key, mono: true }       — monospace text
 *   { label, key, secondary: true }  — muted text color
 *   { label, key, render: (row) => <JSX /> } — custom cell renderer
 */
export default function DataTable({
  title,
  viewAllLabel = "View all →",
  onViewAll,
  columns = [],
  rows = [],
  actionLabel = "Manage",
  onAction,
}) {
  const [hovered, setHovered] = useState(null);

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <span style={styles.headerTitle}>{title}</span>
        {onViewAll && (
          <button onClick={onViewAll} style={styles.viewAllBtn}>
            {viewAllLabel}
          </button>
        )}
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={styles.th}>{col.label}</th>
            ))}
            <th style={styles.th} />
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  style={{
                    ...styles.td,
                    background: hovered === i ? "#f7f9fc" : "",
                    ...(col.mono  && { fontFamily: "monospace", fontSize: 12 }),
                    ...(col.secondary && { color: "#6b7a99" }),
                  }}
                >
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
              <td style={{ ...styles.td, background: hovered === i ? "#f7f9fc" : "" }}>
                <ActionButton label={actionLabel} onClick={() => onAction?.(row)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ActionButton({ label, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "5px 12px", borderRadius: 6, fontSize: 12, fontWeight: 500,
        cursor: "pointer", border: `1px solid ${hov ? "#277cc4" : "#e2e8f2"}`,
        background: "#fff", color: hov ? "#277cc4" : "#1a2340", transition: "all 0.12s",
      }}
    >
      {label}
    </button>
  );
}

// Pre-built renderers you can use in column definitions
export function AvatarCell({ name, email, initials, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: 30, height: 30, borderRadius: "50%", background: color,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0,
      }}>
        {initials}
      </div>
      <div>
        <div style={{ fontWeight: 500, fontSize: 13 }}>{name}</div>
        <div style={{ fontSize: 11.5, color: "#6b7a99" }}>{email}</div>
      </div>
    </div>
  );
}

export function StatusBadge({ status }) {
  const s = statusStyle[status] ?? { bg: "#eee", color: "#555" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "3px 9px", borderRadius: 20,
      fontSize: 11.5, fontWeight: 600, fontFamily: "monospace",
      background: s.bg, color: s.color,
    }}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

const styles = {
  wrap:        { background: "#fff", border: "1px solid #e2e8f2", borderRadius: 14, overflow: "hidden" },
  header:      { padding: "18px 22px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e2e8f2" },
  headerTitle: { fontSize: 14, fontWeight: 600 },
  viewAllBtn:  { fontSize: 12, fontWeight: 500, color: "#277cc4", background: "none", border: "none", cursor: "pointer" },
  table:       { width: "100%", borderCollapse: "collapse" },
  th:          { fontSize: 11, fontWeight: 600, color: "#6b7a99", textTransform: "uppercase", letterSpacing: 0.6, textAlign: "left", padding: "10px 22px", background: "#f7f9fc", borderBottom: "1px solid #e2e8f2" },
  td:          { padding: "12px 22px", borderBottom: "1px solid #e2e8f2" },
};