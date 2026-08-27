import { useState, useRef } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { T } from "../tokens";
import { IcoBell, IcoSearch, IcoFilter, IcoChevronRight } from "../components/Icons";

const revenueData = [
  { month: "Mar", value: 6200 },
  { month: "Apr", value: 8100 },
  { month: "May", value: 7400 },
  { month: "Jun", value: 9300 },
  { month: "Jul", value: 8800 },
  { month: "Aug", value: 10900 },
];

const WEEK_DAYS = [
  { day: "Sun", date: 24 },
  { day: "Mon", date: 25 },
  { day: "Tue", date: 26 },
  { day: "Wed", date: 27 },
  { day: "Thu", date: 28 },
  { day: "Fri", date: 29 },
  { day: "Sat", date: 30 },
];

const CLIENT_CARDS = [
  { client: "Meridian Studio", initials: "MS", amount: "$3,200", invoiceRef: "INV-0041", status: "overdue", gradient: "linear-gradient(135deg, #1f1810 0%, #2a1e0f 60%, #1a1208 100%)", accent: "#ef4444" },
  { client: "Nova Agency", initials: "NA", amount: "$4,750", invoiceRef: "INV-0040", status: "pending", gradient: "linear-gradient(135deg, #171410 0%, #221b0d 60%, #141008 100%)", accent: "#f59e0b" },
  { client: "Archform Co.", initials: "AC", amount: "$2,950", invoiceRef: "INV-0038", status: "pending", gradient: "linear-gradient(135deg, #13110f 0%, #1e1a0e 60%, #111009 100%)", accent: "#f59e0b" },
];

const INVOICES_TODAY = [
  { client: "Meridian Studio", initials: "MS", avatarColor: "#f59e0b", ref: "INV-0041", amount: "$3,200", status: "overdue", category: "Brand Identity", due: "14d overdue" },
  { client: "Nova Agency", initials: "NA", avatarColor: "#7c9ef5", ref: "INV-0040", amount: "$4,750", status: "pending", category: "Web Development", due: "Due Aug 29" },
];

const INVOICES_UPCOMING = [
  { client: "Archform Co.", initials: "AC", avatarColor: "#5cb88a", ref: "INV-0038", amount: "$2,950", status: "pending", category: "UI/UX Design", due: "Due Sep 3" },
];

function ChartTooltip({ active, payload }: { active?: boolean; payload?: Array<{ value: number }> }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: T.cardRaised, border: `1px solid ${T.amberBorder}`, borderRadius: 10, padding: "6px 12px", fontFamily: T.fm, fontSize: 12, color: T.amber, boxShadow: "0 4px 16px rgba(0,0,0,0.5)" }}>
      ${payload[0].value.toLocaleString()}
    </div>
  );
}

function InvoiceRow({ inv }: { inv: typeof INVOICES_TODAY[0] }) {
  const isOverdue = inv.status === "overdue";
  const accent = isOverdue ? T.red : T.amber;
  const bg = isOverdue ? T.redMuted : T.amberMuted;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", background: T.card, borderRadius: 16, boxShadow: T.cardShadow, cursor: "pointer" }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: bg, border: `1px solid ${accent}22`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: T.ff, fontSize: 13, fontWeight: 700, color: accent }}>
        {inv.initials}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: T.cream, marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{inv.client}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontFamily: T.fm, fontSize: 10, color: T.muted }}>{inv.ref}</span>
          <span style={{ width: 2, height: 2, borderRadius: "50%", background: T.muted, flexShrink: 0 }} />
          <span style={{ fontSize: 10, color: T.muted }}>{inv.category}</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
        <span style={{ fontFamily: T.ff, fontSize: 15, fontWeight: 700, color: T.cream }}>{inv.amount}</span>
        <span style={{ fontSize: 9, fontWeight: 600, fontFamily: T.fm, letterSpacing: "0.06em", textTransform: "uppercase" as const, padding: "2px 7px", borderRadius: 99, background: bg, color: accent }}>
          {isOverdue ? "Overdue" : inv.due}
        </span>
      </div>
      <IcoChevronRight color="#3d3020" size={14} />
    </div>
  );
}

export default function Dashboard() {
  const [activeDay, setActiveDay] = useState(25);
  const [showSearch, setShowSearch] = useState(false);
  const cardScrollRef = useRef<HTMLDivElement>(null);

  return (
    <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", paddingBottom: 112, scrollbarWidth: "none" as const }}>
      {/* Ambient glow */}
      <div className="amber-glow" style={{ position: "absolute", top: 0, left: 0, right: 0, height: 360, pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ padding: "56px 20px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: "50%", background: "linear-gradient(135deg, #f59e0b 0%, #92610a 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.ff, fontSize: 17, fontWeight: 700, color: T.bg, border: "2px solid rgba(245,158,11,0.25)", boxShadow: "0 0 20px rgba(245,158,11,0.2)", flexShrink: 0 }}>J</div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 11, color: T.muted, fontWeight: 500, letterSpacing: "0.04em", marginBottom: 1 }}>Welcome back</p>
            <h1 style={{ fontFamily: T.ff, fontSize: 20, fontWeight: 700, color: T.cream, lineHeight: 1.1 }}>Jordan Reeves</h1>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setShowSearch(!showSearch)} style={{ width: 38, height: 38, borderRadius: "50%", background: T.card, border: `1px solid ${T.amberBorder}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>
              <IcoSearch color={T.mutedMid} size={18} />
            </button>
            <button style={{ width: 38, height: 38, borderRadius: "50%", background: T.card, border: `1px solid ${T.amberBorder}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.4)", position: "relative" as const }}>
              <IcoBell color={T.mutedMid} size={18} />
              <div style={{ position: "absolute", top: 8, right: 8, width: 7, height: 7, borderRadius: "50%", background: T.red, border: `1.5px solid ${T.bg}` }} />
            </button>
          </div>
        </div>

        {/* Search */}
        {showSearch && (
          <div style={{ padding: "0 20px 12px" }}>
            <div style={{ background: T.card, borderRadius: 14, border: `1px solid ${T.amberBorder}`, display: "flex", alignItems: "center", gap: 10, padding: "10px 14px" }}>
              <IcoSearch color={T.muted} size={16} />
              <input autoFocus placeholder="Search invoices, clients..." style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: 13, color: T.cream, fontFamily: T.fb }} />
              <IcoFilter color={T.muted} size={16} />
            </div>
          </div>
        )}

        {/* Hero stat */}
        <div style={{ padding: "4px 20px 0", textAlign: "center" }}>
          <p style={{ fontFamily: T.fm, fontSize: 10, fontWeight: 500, letterSpacing: "0.16em", textTransform: "uppercase" as const, color: T.muted, marginBottom: 6 }}>Outstanding Balance</p>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", gap: 2 }}>
            <span style={{ fontFamily: T.ff, fontSize: 18, fontWeight: 700, color: T.amber, marginTop: 10 }}>$</span>
            <span style={{ fontFamily: T.ff, fontSize: 62, fontWeight: 900, color: T.amber, lineHeight: 1, letterSpacing: "-0.03em" }}>10,900</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 8 }}>
            <div style={{ background: T.amberMuted, borderRadius: 99, padding: "3px 12px", fontSize: 11, fontWeight: 500, color: T.amber, fontFamily: T.fm }}>3 invoices</div>
            <span style={{ fontSize: 11, color: T.muted }}>across 3 clients</span>
          </div>
        </div>

        {/* Week date filter */}
        <div style={{ padding: "18px 0 0" }}>
          <div style={{ display: "flex", gap: 6, padding: "0 20px", overflowX: "auto", scrollbarWidth: "none" as const }}>
            {WEEK_DAYS.map(({ day, date }) => {
              const isActive = date === activeDay;
              return (
                <button key={date} onClick={() => setActiveDay(date)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "8px 14px", borderRadius: 99, border: "none", cursor: "pointer", background: isActive ? T.amber : "transparent", transition: "all 0.18s", flexShrink: 0, boxShadow: isActive ? "0 0 20px rgba(245,158,11,0.4)" : "none" }}>
                  <span style={{ fontFamily: T.fm, fontSize: 9, fontWeight: 500, letterSpacing: "0.08em", color: isActive ? T.bg : T.muted, textTransform: "uppercase" as const }}>{day}</span>
                  <span style={{ fontFamily: T.ff, fontSize: 16, fontWeight: 700, color: isActive ? T.bg : "#8a7050" }}>{date}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Client card carousel */}
        <div style={{ paddingTop: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", marginBottom: 12 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: T.cream }}>Client Balances</p>
            <button style={{ fontSize: 12, color: T.amber, fontWeight: 500, background: "none", border: "none", cursor: "pointer", fontFamily: T.fb }}>View all</button>
          </div>
          <div ref={cardScrollRef} style={{ display: "flex", gap: 12, padding: "0 20px", overflowX: "auto", scrollbarWidth: "none" as const, scrollSnapType: "x mandatory" }}>
            {CLIENT_CARDS.map((card, i) => (
              <div key={i} style={{ minWidth: 220, height: 130, borderRadius: 20, background: card.gradient, border: `1px solid ${card.accent}18`, padding: "18px 20px", position: "relative", overflow: "hidden", scrollSnapAlign: "start", flexShrink: 0, boxShadow: `0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px ${card.accent}0a`, cursor: "pointer" }}>
                <div style={{ position: "absolute", top: -40, right: -40, width: 120, height: 120, borderRadius: "50%", border: `1px solid ${card.accent}15`, pointerEvents: "none" }} />
                <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", border: `1px solid ${card.accent}10`, pointerEvents: "none" }} />
                <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: card.status === "overdue" ? "rgba(239,68,68,0.15)" : T.amberMuted, borderRadius: 99, padding: "2px 8px", marginBottom: 10 }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: card.accent }} />
                  <span style={{ fontFamily: T.fm, fontSize: 9, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: card.accent }}>{card.status}</span>
                </div>
                <p style={{ fontSize: 13, fontWeight: 600, color: T.cream, marginBottom: 2 }}>{card.client}</p>
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: T.ff, fontSize: 26, fontWeight: 900, color: card.status === "overdue" ? "#ef9999" : T.cream, letterSpacing: "-0.02em", lineHeight: 1 }}>{card.amount}</span>
                  <span style={{ fontFamily: T.fm, fontSize: 10, color: T.muted, letterSpacing: "0.06em" }}>{card.invoiceRef}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "20px 20px 0" }}>
          <div style={{ background: T.card, borderRadius: 20, padding: 16, boxShadow: T.cardShadow }}>
            <p style={{ fontFamily: T.fm, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: T.muted, marginBottom: 10, fontWeight: 500 }}>Active Projects</p>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
              <span style={{ fontFamily: T.ff, fontSize: 44, fontWeight: 900, color: T.cream, lineHeight: 1 }}>7</span>
              <div style={{ width: 30, height: 30, borderRadius: 10, background: T.amberMuted, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.amber} strokeWidth="2.2" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h12" /></svg>
              </div>
            </div>
            <p style={{ fontSize: 10, color: T.muted, marginTop: 6 }}>2 due this week</p>
          </div>
          <div style={{ background: T.card, borderRadius: 20, padding: 16, boxShadow: T.cardShadow }}>
            <p style={{ fontFamily: T.fm, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: T.muted, marginBottom: 10, fontWeight: 500 }}>Paid This Month</p>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
              <span style={{ fontFamily: T.ff, fontSize: 26, fontWeight: 900, color: T.green, lineHeight: 1, letterSpacing: "-0.01em" }}>$8,340</span>
              <div style={{ width: 30, height: 30, borderRadius: 10, background: T.greenMuted, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
            </div>
            <p style={{ fontSize: 10, color: T.green, marginTop: 6, opacity: 0.8 }}>↑ 12% vs last month</p>
          </div>
        </div>

        {/* Revenue chart */}
        <div style={{ padding: "16px 20px 0" }}>
          <div style={{ background: T.card, borderRadius: 20, padding: "18px 16px 12px", boxShadow: T.cardShadow }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, padding: "0 4px" }}>
              <div>
                <p style={{ fontFamily: T.fm, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: T.muted, fontWeight: 500, marginBottom: 3 }}>Revenue</p>
                <p style={{ fontFamily: T.ff, fontSize: 18, fontWeight: 700, color: T.cream }}>Last 6 Months</p>
              </div>
              <div style={{ background: T.greenMuted, borderRadius: 99, padding: "4px 12px", fontSize: 11, fontWeight: 600, color: T.green, fontFamily: T.fm }}>+24.6%</div>
            </div>
            <div style={{ height: 110 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 4, right: 4, left: -32, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={T.amber} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={T.amber} stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: T.muted, fontSize: 10, fontFamily: T.fm }} dy={8} />
                  <YAxis hide />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(245,158,11,0.15)", strokeWidth: 1, strokeDasharray: "4 4" }} />
                  <Area type="monotone" dataKey="value" stroke={T.amber} strokeWidth={1.8} fill="url(#ag)" dot={false} activeDot={{ r: 4, fill: T.amber, stroke: T.bg, strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Invoice rows */}
        <div style={{ padding: "20px 20px 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <p style={{ fontFamily: T.fm, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: T.muted, fontWeight: 500 }}>Today</p>
            <button style={{ fontSize: 11, color: T.amber, fontWeight: 500, background: "none", border: "none", cursor: "pointer", fontFamily: T.fb }}>See All</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {INVOICES_TODAY.map((inv, i) => <InvoiceRow key={i} inv={inv} />)}
          </div>
          <p style={{ fontFamily: T.fm, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: T.muted, fontWeight: 500, marginBottom: 10 }}>Upcoming</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {INVOICES_UPCOMING.map((inv, i) => <InvoiceRow key={i} inv={inv} />)}
          </div>
        </div>

        {/* CTA */}
        <div style={{ padding: "20px 20px 0" }}>
          <button className="pill-button" style={{ width: "100%", padding: 14, borderRadius: 99, border: "none", cursor: "pointer", fontFamily: T.fb, fontSize: 14, fontWeight: 600, color: T.bg, letterSpacing: "0.01em", transition: "all 0.15s" }}>
            Send Payment Reminders
          </button>
        </div>
      </div>
    </div>
  );
}
