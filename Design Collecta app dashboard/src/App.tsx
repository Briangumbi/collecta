import { useState } from "react";
import { T } from "./tokens";
import { IcoDashboard, IcoClients, IcoInvoices, IcoProjects, IcoSettings } from "./components/Icons";
import Dashboard from "./screens/Dashboard";
import Clients from "./screens/Clients";
import Invoices from "./screens/Invoices";
import Projects from "./screens/Projects";
import Settings from "./screens/Settings";

const TABS = [
  { id: "dashboard", label: "Dashboard", Ico: IcoDashboard, Screen: Dashboard },
  { id: "clients", label: "Clients", Ico: IcoClients, Screen: Clients },
  { id: "invoices", label: "Invoices", Ico: IcoInvoices, Screen: Invoices },
  { id: "projects", label: "Projects", Ico: IcoProjects, Screen: Projects },
  { id: "settings", label: "Settings", Ico: IcoSettings, Screen: Settings },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const ActiveScreen = TABS.find(t => t.id === activeTab)!.Screen;

  return (
    <div
      style={{
        background: T.bg,
        minHeight: "100dvh",
        maxWidth: 430,
        margin: "0 auto",
        fontFamily: T.fb,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Grain overlay */}
      <div className="grain-overlay" />

      {/* Active screen */}
      <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", position: "relative" }}>
        <ActiveScreen />
      </div>

      {/* Bottom tab bar */}
      <div style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: 430,
        background: "rgba(16,13,9,0.94)",
        backdropFilter: "blur(20px)",
        borderTop: `1px solid rgba(245,158,11,0.06)`,
        boxShadow: "0 -8px 40px rgba(0,0,0,0.7)",
        paddingBottom: "env(safe-area-inset-bottom, 10px)",
        zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", padding: "10px 8px 8px" }}>
          {TABS.map(({ id, label, Ico }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", padding: "0 6px", minWidth: 52, transition: "all 0.2s" }}
              >
                <div style={{ width: 44, height: 30, borderRadius: 99, background: isActive ? T.amber : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", boxShadow: isActive ? "0 0 16px rgba(245,158,11,0.5)" : "none" }}>
                  <Ico color={isActive ? T.bg : "#4a3a26"} size={20} />
                </div>
                <span style={{ fontFamily: T.fb, fontSize: 9, fontWeight: isActive ? 600 : 400, color: isActive ? T.amber : "#4a3a26", letterSpacing: "0.02em", transition: "color 0.2s" }}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
