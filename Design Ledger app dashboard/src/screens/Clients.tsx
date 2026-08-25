import { useState } from "react";
import { T } from "../tokens";
import { IcoSearch, IcoPlus, IcoChevronRight, IcoMoreHoriz } from "../components/Icons";
import { CLIENTS, type Client } from "../data";

function ClientCard({ client }: { client: Client }) {
  const hasOutstanding = client.outstandingRaw > 0;
  return (
    <div style={{ background: T.card, borderRadius: 20, padding: "16px 18px", boxShadow: T.cardShadow, cursor: "pointer", transition: "background 0.15s", display: "flex", alignItems: "center", gap: 14 }}>
      {/* Avatar */}
      <div style={{ width: 48, height: 48, borderRadius: 16, background: `${client.avatarColor}18`, border: `1.5px solid ${client.avatarColor}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: T.ff, fontSize: 16, fontWeight: 700, color: client.avatarColor, position: "relative" }}>
        {client.initials}
        {/* Online/active dot */}
        {client.status === "active" && (
          <div style={{ position: "absolute", bottom: -2, right: -2, width: 10, height: 10, borderRadius: "50%", background: T.green, border: `2px solid ${T.card}` }} />
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: T.cream, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{client.name}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: T.fm, fontSize: 10, color: T.muted }}>{client.activeProjects} project{client.activeProjects !== 1 ? "s" : ""}</span>
          {hasOutstanding && (
            <>
              <span style={{ width: 2, height: 2, borderRadius: "50%", background: T.muted, flexShrink: 0 }} />
              <span style={{ fontFamily: T.fm, fontSize: 10, color: T.amber }}>{client.outstanding} due</span>
            </>
          )}
        </div>
        <p style={{ fontSize: 10, color: "#3d3020", marginTop: 3 }}>{client.lastActivity}</p>
      </div>

      {/* Right side */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
        <span style={{ fontFamily: T.ff, fontSize: 15, fontWeight: 700, color: hasOutstanding ? T.amber : T.muted }}>
          {hasOutstanding ? client.outstanding : client.totalBilled}
        </span>
        <span style={{ fontSize: 9, color: T.muted, fontFamily: T.fm }}>
          {hasOutstanding ? "outstanding" : "total billed"}
        </span>
      </div>

      <IcoChevronRight color="#3d3020" size={14} />
    </div>
  );
}

export default function Clients() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  const filtered = CLIENTS.filter(c => {
    if (filter === "active" && c.status !== "active") return false;
    if (filter === "inactive" && c.status !== "inactive") return false;
    if (query && !c.name.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const totalOutstanding = CLIENTS.reduce((s, c) => s + c.outstandingRaw, 0);

  return (
    <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", paddingBottom: 112, scrollbarWidth: "none" as const }}>
      {/* Glow */}
      <div className="amber-glow" style={{ position: "absolute", top: 0, left: 0, right: 0, height: 280, pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ padding: "56px 20px 20px", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontFamily: T.fm, fontSize: 10, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: T.muted, marginBottom: 4 }}>Ledger</p>
            <h1 style={{ fontFamily: T.ff, fontSize: 30, fontWeight: 800, color: T.cream, lineHeight: 1.1 }}>Clients</h1>
          </div>
          <button className="pill-button" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 99, border: "none", cursor: "pointer", fontFamily: T.fb, fontSize: 13, fontWeight: 600, color: T.bg }}>
            <IcoPlus color={T.bg} size={14} />
            Add
          </button>
        </div>

        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "0 20px 20px" }}>
          <div style={{ background: T.card, borderRadius: 16, padding: "14px 16px", boxShadow: T.cardShadow }}>
            <p style={{ fontFamily: T.fm, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: T.muted, marginBottom: 6 }}>Total Clients</p>
            <span style={{ fontFamily: T.ff, fontSize: 34, fontWeight: 900, color: T.cream, lineHeight: 1 }}>{CLIENTS.length}</span>
            <p style={{ fontSize: 10, color: T.muted, marginTop: 4 }}>{CLIENTS.filter(c => c.status === "active").length} active</p>
          </div>
          <div style={{ background: T.card, borderRadius: 16, padding: "14px 16px", boxShadow: T.cardShadow }}>
            <p style={{ fontFamily: T.fm, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: T.muted, marginBottom: 6 }}>Outstanding</p>
            <span style={{ fontFamily: T.ff, fontSize: 26, fontWeight: 900, color: T.amber, lineHeight: 1, letterSpacing: "-0.01em" }}>${totalOutstanding.toLocaleString()}</span>
            <p style={{ fontSize: 10, color: T.muted, marginTop: 4 }}>{CLIENTS.filter(c => c.outstandingRaw > 0).length} clients owe</p>
          </div>
        </div>

        {/* Search bar */}
        <div style={{ padding: "0 20px 14px" }}>
          <div style={{ background: T.card, borderRadius: 14, border: `1px solid ${T.amberBorder}`, display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", boxShadow: T.cardShadow }}>
            <IcoSearch color={T.muted} size={16} />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search clients..." style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: 13, color: T.cream, fontFamily: T.fb }} />
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 8, padding: "0 20px 18px" }}>
          {(["all", "active", "inactive"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: "6px 16px", borderRadius: 99, border: "none", cursor: "pointer", fontFamily: T.fb, fontSize: 12, fontWeight: 500, background: filter === f ? T.amber : T.card, color: filter === f ? T.bg : T.muted, boxShadow: filter === f ? "0 0 14px rgba(245,158,11,0.3)" : T.cardShadow, transition: "all 0.18s", textTransform: "capitalize" as const }}>
              {f}
            </button>
          ))}
        </div>

        {/* Client list */}
        <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(client => <ClientCard key={client.id} client={client} />)}
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 0", color: T.muted, fontSize: 13 }}>No clients found</div>
          )}
        </div>
      </div>
    </div>
  );
}
