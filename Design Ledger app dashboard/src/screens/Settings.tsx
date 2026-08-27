import { useState } from "react";
import { T } from "../tokens";
import { IcoUser, IcoBell, IcoCreditCard, IcoMail, IcoChevronRight } from "../components/Icons";

interface ToggleProps {
  on: boolean;
  onChange: (v: boolean) => void;
}

function Toggle({ on, onChange }: ToggleProps) {
  return (
    <button
      onClick={() => onChange(!on)}
      style={{
        width: 44,
        height: 26,
        borderRadius: 99,
        background: on ? T.amber : "rgba(255,255,255,0.08)",
        border: "none",
        cursor: "pointer",
        position: "relative",
        transition: "background 0.22s",
        flexShrink: 0,
        boxShadow: on ? "0 0 12px rgba(245,158,11,0.4)" : "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 3,
          left: on ? 21 : 3,
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: on ? T.bg : T.muted,
          transition: "left 0.22s, background 0.22s",
          boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
        }}
      />
    </button>
  );
}

const THEMES = [
  { id: "warm", label: "Dark Warm", desc: "Amber on near-black", bg: "#13100c", accent: "#f59e0b" },
  { id: "cool", label: "Dark Cool", desc: "Blue on charcoal", bg: "#0f1117", accent: "#6d8ef5" },
  { id: "light", label: "Light", desc: "Clean and minimal", bg: "#f8f5f0", accent: "#d97706" },
];

const PLAN_FEATURES = [
  "Unlimited invoices",
  "Up to 20 clients",
  "Revenue analytics",
  "Custom branding",
];

export default function Settings() {
  const [notifications, setNotifications] = useState({
    invoicePaid: true,
    paymentReminders: true,
    weeklyReport: false,
    projectUpdates: true,
    marketing: false,
  });
  const [theme, setTheme] = useState("warm");

  const toggle = (key: keyof typeof notifications) => (v: boolean) => setNotifications(prev => ({ ...prev, [key]: v }));

  const settingsRow = (label: string, desc: string, right: React.ReactNode) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: `1px solid rgba(245,158,11,0.05)` }}>
      <div style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: T.cream, marginBottom: 2 }}>{label}</p>
        <p style={{ fontSize: 11, color: T.muted }}>{desc}</p>
      </div>
      {right}
    </div>
  );

  return (
    <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", paddingBottom: 112, scrollbarWidth: "none" as const }}>
      <div className="amber-glow" style={{ position: "absolute", top: 0, left: 0, right: 0, height: 280, pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ padding: "56px 20px 24px" }}>
          <p style={{ fontFamily: T.fm, fontSize: 10, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: T.muted, marginBottom: 4 }}>Collecta</p>
          <h1 style={{ fontFamily: T.ff, fontSize: 30, fontWeight: 800, color: T.cream }}>Settings</h1>
        </div>

        {/* Profile card */}
        <div style={{ margin: "0 20px 20px" }}>
          <div style={{ background: T.card, borderRadius: 24, padding: "20px 20px 16px", boxShadow: T.cardShadowRaised, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.4) 40%, rgba(245,158,11,0.4) 60%, transparent)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #f59e0b 0%, #92610a 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.ff, fontSize: 26, fontWeight: 700, color: T.bg, border: "2px solid rgba(245,158,11,0.3)", boxShadow: "0 0 24px rgba(245,158,11,0.25)", flexShrink: 0 }}>J</div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontFamily: T.ff, fontSize: 20, fontWeight: 700, color: T.cream, marginBottom: 3 }}>Jordan Reeves</h2>
                <p style={{ fontSize: 12, color: T.muted }}>jordan@reeves.design</p>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: T.amberMuted, borderRadius: 99, padding: "2px 10px", marginTop: 6 }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: T.amber }} />
                  <span style={{ fontFamily: T.fm, fontSize: 9, color: T.amber, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>Pro Plan</span>
                </div>
              </div>
            </div>
            <button style={{ width: "100%", padding: "11px", borderRadius: 12, border: `1px solid ${T.amberBorder}`, background: "rgba(245,158,11,0.06)", cursor: "pointer", fontFamily: T.fb, fontSize: 13, fontWeight: 600, color: T.amber, display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
              <IcoUser color={T.amber} size={15} />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Theme picker */}
        <div style={{ padding: "0 20px 20px" }}>
          <p style={{ fontFamily: T.fm, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: T.muted, marginBottom: 12, fontWeight: 500 }}>Appearance</p>
          <div style={{ display: "flex", gap: 10 }}>
            {THEMES.map(t => (
              <button key={t.id} onClick={() => setTheme(t.id)} style={{ flex: 1, borderRadius: 16, border: `1.5px solid ${theme === t.id ? T.amber : "rgba(255,255,255,0.06)"}`, background: theme === t.id ? T.amberMuted : T.card, cursor: "pointer", padding: "12px 10px 10px", boxShadow: theme === t.id ? `0 0 16px rgba(245,158,11,0.25)` : T.cardShadow, transition: "all 0.2s", position: "relative" as const, overflow: "hidden" }}>
                {/* Mini preview */}
                <div style={{ width: "100%", height: 36, borderRadius: 10, background: t.bg, marginBottom: 8, position: "relative", overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ position: "absolute", bottom: 6, left: 6, right: 6, height: 4, borderRadius: 99, background: t.accent, opacity: 0.8 }} />
                  <div style={{ position: "absolute", top: 8, left: 6, width: 20, height: 4, borderRadius: 99, background: t.id === "light" ? "#1a1a1a" : "rgba(255,255,255,0.6)" }} />
                </div>
                <p style={{ fontSize: 11, fontWeight: 600, color: theme === t.id ? T.amber : T.cream, marginBottom: 1 }}>{t.label}</p>
                {theme === t.id && (
                  <div style={{ position: "absolute", top: 8, right: 8, width: 16, height: 16, borderRadius: "50%", background: T.amber, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={T.bg} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Notification prefs */}
        <div style={{ margin: "0 20px 20px" }}>
          <p style={{ fontFamily: T.fm, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: T.muted, marginBottom: 12, fontWeight: 500 }}>Notifications</p>
          <div style={{ background: T.card, borderRadius: 20, overflow: "hidden", boxShadow: T.cardShadow }}>
            {settingsRow("Invoice Paid", "Alert when a client pays an invoice", <Toggle on={notifications.invoicePaid} onChange={toggle("invoicePaid")} />)}
            {settingsRow("Payment Reminders", "Auto-reminders for overdue invoices", <Toggle on={notifications.paymentReminders} onChange={toggle("paymentReminders")} />)}
            {settingsRow("Weekly Report", "Revenue summary every Monday", <Toggle on={notifications.weeklyReport} onChange={toggle("weeklyReport")} />)}
            {settingsRow("Project Updates", "Alerts on project milestones", <Toggle on={notifications.projectUpdates} onChange={toggle("projectUpdates")} />)}
            <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ flex: 1, marginRight: 12 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: T.cream, marginBottom: 2 }}>Marketing</p>
                <p style={{ fontSize: 11, color: T.muted }}>Tips, updates and product news</p>
              </div>
              <Toggle on={notifications.marketing} onChange={toggle("marketing")} />
            </div>
          </div>
        </div>

        {/* Subscription plan */}
        <div style={{ margin: "0 20px 20px" }}>
          <p style={{ fontFamily: T.fm, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: T.muted, marginBottom: 12, fontWeight: 500 }}>Subscription</p>
          <div style={{ background: T.card, borderRadius: 20, padding: "18px 20px", boxShadow: T.cardShadowRaised, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.3) 40%, rgba(245,158,11,0.3) 60%, transparent)" }} />
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <IcoCreditCard color={T.amber} size={18} />
                  <p style={{ fontFamily: T.ff, fontSize: 18, fontWeight: 700, color: T.cream }}>Pro Plan</p>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
                  <span style={{ fontFamily: T.ff, fontSize: 30, fontWeight: 900, color: T.amber, lineHeight: 1 }}>$29</span>
                  <span style={{ fontSize: 12, color: T.muted }}>/ month</span>
                </div>
                <p style={{ fontFamily: T.fm, fontSize: 10, color: T.muted, marginTop: 3 }}>Renews Oct 1, 2026</p>
              </div>
              <button className="pill-button" style={{ padding: "7px 16px", borderRadius: 99, border: "none", cursor: "pointer", fontFamily: T.fb, fontSize: 12, fontWeight: 600, color: T.bg }}>Manage</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {PLAN_FEATURES.map(f => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 16, height: 16, borderRadius: "50%", background: T.amberMuted, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke={T.amber} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                  <span style={{ fontSize: 12, color: T.muted }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Account actions */}
        <div style={{ margin: "0 20px 20px" }}>
          <p style={{ fontFamily: T.fm, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: T.muted, marginBottom: 12, fontWeight: 500 }}>Account</p>
          <div style={{ background: T.card, borderRadius: 20, overflow: "hidden", boxShadow: T.cardShadow }}>
            {[
              { label: "Email & Password", icon: <IcoMail color={T.mutedMid} size={16} /> },
              { label: "Privacy & Data", icon: <IcoUser color={T.mutedMid} size={16} /> },
            ].map(({ label, icon }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderBottom: `1px solid rgba(245,158,11,0.05)`, cursor: "pointer" }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: T.amberMuted, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
                <span style={{ fontSize: 13, fontWeight: 500, color: T.cream, flex: 1 }}>{label}</span>
                <IcoChevronRight color="#3d3020" size={14} />
              </div>
            ))}
          </div>
        </div>

        {/* Sign out */}
        <div style={{ padding: "0 20px" }}>
          <button style={{ width: "100%", padding: "13px", borderRadius: 99, border: `1px solid rgba(239,68,68,0.2)`, background: "rgba(239,68,68,0.07)", cursor: "pointer", fontFamily: T.fb, fontSize: 14, fontWeight: 600, color: T.red, letterSpacing: "0.01em", transition: "all 0.15s" }}>
            Sign Out
          </button>
        </div>

        {/* Version */}
        <p style={{ textAlign: "center", fontFamily: T.fm, fontSize: 10, color: "#2d2318", padding: "16px 0" }}>Collecta v2.4.1 · © 2026</p>
      </div>
    </div>
  );
}
