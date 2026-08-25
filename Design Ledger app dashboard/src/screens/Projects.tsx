import { useState } from "react";
import { T } from "../tokens";
import { IcoChevronLeft, IcoChevronRight, IcoPlus, IcoCheck, IcoClip, IcoSend } from "../components/Icons";
import { PROJECTS, type Project, type Milestone } from "../data";

function projectStatusColor(status: string) {
  if (status === "completed") return T.green;
  if (status === "on-hold") return "#f97316";
  return T.amber;
}

function projectStatusBg(status: string) {
  if (status === "completed") return T.greenMuted;
  if (status === "on-hold") return "rgba(249,115,22,0.12)";
  return T.amberMuted;
}

function projectStatusLabel(status: string) {
  if (status === "on-hold") return "On Hold";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

// ─── Progress ring ────────────────────────────────────────────────────────────

function ProgressRing({ pct, color, size = 64 }: { pct: number; color: string; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={5} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" strokeDasharray={`${dash} ${circ - dash}`} style={{ filter: `drop-shadow(0 0 4px ${color}80)` }} />
    </svg>
  );
}

// ─── Project Card ─────────────────────────────────────────────────────────────

function ProjectCard({ project, onSelect }: { project: Project; onSelect: () => void }) {
  const color = projectStatusColor(project.status);
  const bg = projectStatusBg(project.status);
  return (
    <div onClick={onSelect} style={{ background: T.card, borderRadius: 20, padding: "16px 18px", boxShadow: T.cardShadow, cursor: "pointer", display: "flex", gap: 14, alignItems: "center" }}>
      {/* Progress ring with initials */}
      <div style={{ position: "relative", flexShrink: 0, width: 52, height: 52 }}>
        <ProgressRing pct={project.progress} color={color} size={52} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: T.ff, fontSize: 11, fontWeight: 700, color }}>{project.progress}%</span>
        </div>
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: T.cream, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{project.name}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 16, height: 16, borderRadius: 5, background: `${project.avatarColor}20`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.ff, fontSize: 7, fontWeight: 700, color: project.avatarColor }}>{project.initials}</div>
          <span style={{ fontSize: 11, color: T.muted }}>{project.client}</span>
          <span style={{ width: 2, height: 2, borderRadius: "50%", background: T.muted }} />
          <span style={{ fontSize: 10, color: T.muted }}>Due {project.deadline.split(",")[0]}</span>
        </div>
        {/* Progress bar */}
        <div style={{ marginTop: 10, height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
          <div style={{ width: `${project.progress}%`, height: "100%", background: color, borderRadius: 99, boxShadow: `0 0 6px ${color}60`, transition: "width 0.4s ease" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 5 }}>
          <span style={{ fontSize: 9, color: T.muted, fontFamily: T.fm }}>{project.milestonesDone}/{project.milestoneCount} milestones</span>
          <div style={{ fontSize: 9, fontFamily: T.fm, letterSpacing: "0.06em", textTransform: "uppercase" as const, padding: "2px 7px", borderRadius: 99, background: bg, color }}>
            {projectStatusLabel(project.status)}
          </div>
        </div>
      </div>

      <IcoChevronRight color="#3d3020" size={14} />
    </div>
  );
}

// ─── Project Detail ───────────────────────────────────────────────────────────

function ProjectDetail({ project, onBack }: { project: Project; onBack: () => void }) {
  const [milestones, setMilestones] = useState<Milestone[]>(project.milestones);
  const [msgText, setMsgText] = useState("");
  const color = projectStatusColor(project.status);
  const done = milestones.filter(m => m.done).length;
  const pct = Math.round((done / milestones.length) * 100);

  const toggleMilestone = (id: string) => {
    setMilestones(prev => prev.map(m => m.id === id ? { ...m, done: !m.done } : m));
  };

  function fileTypeIcon(type: string) {
    const colors: Record<string, string> = { pdf: "#ef4444", fig: "#a78bfa", zip: "#f97316", img: "#5cb88a" };
    return (
      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${colors[type] ?? T.amber}18`, border: `1px solid ${colors[type] ?? T.amber}28`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.fm, fontSize: 8, fontWeight: 700, color: colors[type] ?? T.amber, letterSpacing: "0.04em", textTransform: "uppercase" as const }}>
        {type}
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: "auto", paddingBottom: 120, scrollbarWidth: "none" as const }}>
      <div className="amber-glow" style={{ position: "absolute", top: 0, left: 0, right: 0, height: 240, pointerEvents: "none", zIndex: 0 }} />

      {/* Header */}
      <div style={{ padding: "56px 20px 16px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: "50%", background: T.card, border: `1px solid ${T.amberBorder}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: T.cardShadow, flexShrink: 0 }}>
            <IcoChevronLeft color={T.mutedMid} size={18} />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 11, color: T.muted, marginBottom: 2 }}>{project.client}</p>
            <h2 style={{ fontFamily: T.ff, fontSize: 18, fontWeight: 700, color: T.cream, lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{project.name}</h2>
          </div>
        </div>

        {/* Hero progress card */}
        <div style={{ background: T.card, borderRadius: 24, padding: "20px 22px", boxShadow: T.cardShadowRaised, overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${color}50 40%, ${color}50 60%, transparent)` }} />
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <ProgressRing pct={pct} color={color} size={80} />
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: T.ff, fontSize: 20, fontWeight: 900, color, lineHeight: 1 }}>{pct}%</span>
                <span style={{ fontFamily: T.fm, fontSize: 8, color: T.muted }}>done</span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                <div>
                  <p style={{ fontFamily: T.fm, fontSize: 9, color: T.muted, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 2 }}>Deadline</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: T.cream }}>{project.deadline}</p>
                </div>
                <div>
                  <p style={{ fontFamily: T.fm, fontSize: 9, color: T.muted, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 2 }}>Status</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color }}>{projectStatusLabel(project.status)}</p>
                </div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 99, height: 5, overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 99, boxShadow: `0 0 8px ${color}60` }} />
              </div>
              <p style={{ fontFamily: T.fm, fontSize: 10, color: T.muted, marginTop: 5 }}>{done} of {milestones.length} milestones complete</p>
            </div>
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div style={{ padding: "0 20px 16px" }}>
        <p style={{ fontFamily: T.fm, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: T.muted, marginBottom: 12, fontWeight: 500 }}>Milestones</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {milestones.map((m) => (
            <div key={m.id} onClick={() => toggleMilestone(m.id)} style={{ background: T.card, borderRadius: 14, padding: "13px 16px", boxShadow: T.cardShadow, display: "flex", alignItems: "center", gap: 12, cursor: "pointer", transition: "background 0.15s" }}>
              <div style={{ width: 24, height: 24, borderRadius: 8, background: m.done ? color : "rgba(255,255,255,0.04)", border: `1.5px solid ${m.done ? color : "rgba(255,255,255,0.1)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s", boxShadow: m.done ? `0 0 8px ${color}50` : "none" }}>
                {m.done && <IcoCheck color={T.bg} size={13} />}
              </div>
              <p style={{ fontSize: 13, color: m.done ? T.muted : T.cream, textDecoration: m.done ? "line-through" : "none", flex: 1, lineHeight: 1.3, textDecorationColor: T.muted }}>{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Attachments */}
      {project.attachments.length > 0 && (
        <div style={{ padding: "0 20px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <p style={{ fontFamily: T.fm, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: T.muted, fontWeight: 500 }}>Attachments</p>
            <button style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: T.amber, background: "none", border: "none", cursor: "pointer", fontFamily: T.fb }}>
              <IcoClip color={T.amber} size={13} /> Add
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {project.attachments.map(att => (
              <div key={att.id} style={{ background: T.card, borderRadius: 14, padding: "11px 16px", boxShadow: T.cardShadow, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                {fileTypeIcon(att.type)}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: T.cream, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{att.name}</p>
                  <p style={{ fontFamily: T.fm, fontSize: 10, color: T.muted, marginTop: 1 }}>{att.size}</p>
                </div>
                <IcoChevronRight color="#3d3020" size={14} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      {project.messages.length > 0 && (
        <div style={{ padding: "0 20px 16px" }}>
          <p style={{ fontFamily: T.fm, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: T.muted, marginBottom: 14, fontWeight: 500 }}>Messages</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {project.messages.map(msg => (
              <div key={msg.id} style={{ display: "flex", gap: 10, flexDirection: msg.self ? "row-reverse" : "row", alignItems: "flex-end" }}>
                {!msg.self && (
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: `${msg.avatarColor}20`, border: `1px solid ${msg.avatarColor}30`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.ff, fontSize: 11, fontWeight: 700, color: msg.avatarColor, flexShrink: 0 }}>{msg.initials}</div>
                )}
                <div style={{ maxWidth: "72%", background: msg.self ? T.amber : T.cardRaised, borderRadius: msg.self ? "18px 18px 4px 18px" : "18px 18px 18px 4px", padding: "10px 14px", boxShadow: msg.self ? "0 0 16px rgba(245,158,11,0.25)" : T.cardShadow }}>
                  <p style={{ fontSize: 13, color: msg.self ? T.bg : T.cream, lineHeight: 1.45, marginBottom: 4 }}>{msg.text}</p>
                  <p style={{ fontFamily: T.fm, fontSize: 9, color: msg.self ? "rgba(19,16,12,0.55)" : T.muted }}>{msg.time}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Message input */}
          <div style={{ marginTop: 14, background: T.card, borderRadius: 14, border: `1px solid ${T.amberBorder}`, display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", boxShadow: T.cardShadow }}>
            <input value={msgText} onChange={e => setMsgText(e.target.value)} placeholder="Write a message..." style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: 13, color: T.cream, fontFamily: T.fb }} />
            <button style={{ width: 32, height: 32, borderRadius: "50%", background: msgText ? T.amber : T.cardRaised, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background 0.2s", flexShrink: 0 }}>
              <IcoSend color={msgText ? T.bg : T.muted} size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Projects Screen ──────────────────────────────────────────────────────────

export default function Projects() {
  const [selected, setSelected] = useState<Project | null>(null);

  if (selected) {
    return (
      <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", position: "relative" }}>
        <ProjectDetail project={selected} onBack={() => setSelected(null)} />
      </div>
    );
  }

  const groups: { label: string; status: Project["status"]; projects: Project[] }[] = [
    { label: "Active", status: "active", projects: PROJECTS.filter(p => p.status === "active") },
    { label: "On Hold", status: "on-hold", projects: PROJECTS.filter(p => p.status === "on-hold") },
    { label: "Completed", status: "completed", projects: PROJECTS.filter(p => p.status === "completed") },
  ];

  return (
    <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", paddingBottom: 112, scrollbarWidth: "none" as const }}>
      <div className="amber-glow" style={{ position: "absolute", top: 0, left: 0, right: 0, height: 280, pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ padding: "56px 20px 20px", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontFamily: T.fm, fontSize: 10, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: T.muted, marginBottom: 4 }}>Ledger</p>
            <h1 style={{ fontFamily: T.ff, fontSize: 30, fontWeight: 800, color: T.cream, lineHeight: 1.1 }}>Projects</h1>
          </div>
          <button className="pill-button" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 99, border: "none", cursor: "pointer", fontFamily: T.fb, fontSize: 13, fontWeight: 600, color: T.bg }}>
            <IcoPlus color={T.bg} size={14} />
            New
          </button>
        </div>

        {/* Status summary */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, padding: "0 20px 20px" }}>
          {groups.map(g => (
            <div key={g.status} style={{ background: T.card, borderRadius: 14, padding: "12px 14px", boxShadow: T.cardShadow }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: projectStatusColor(g.status), marginBottom: 8, boxShadow: `0 0 6px ${projectStatusColor(g.status)}80` }} />
              <p style={{ fontFamily: T.ff, fontSize: 28, fontWeight: 900, color: T.cream, lineHeight: 1, marginBottom: 3 }}>{g.projects.length}</p>
              <p style={{ fontSize: 9, color: T.muted, fontFamily: T.fm, letterSpacing: "0.06em" }}>{g.label}</p>
            </div>
          ))}
        </div>

        {/* Groups */}
        {groups.filter(g => g.projects.length > 0).map(g => (
          <div key={g.status} style={{ padding: "0 20px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: projectStatusColor(g.status), boxShadow: `0 0 6px ${projectStatusColor(g.status)}80` }} />
              <p style={{ fontFamily: T.fm, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: T.muted, fontWeight: 500 }}>
                {g.label} · {g.projects.length}
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {g.projects.map(p => <ProjectCard key={p.id} project={p} onSelect={() => setSelected(p)} />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
