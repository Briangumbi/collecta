import { useState } from "react";
import { T, statusColor, statusBg, statusLabel } from "../tokens";
import { IcoChevronLeft, IcoChevronRight, IcoPlus, IcoSend, IcoCheck, IcoMail } from "../components/Icons";
import { INVOICES, type Invoice } from "../data";

const STATUS_FILTERS = ["all", "draft", "sent", "paid", "overdue"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

// ─── Invoice List ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  return (
    <span style={{ fontSize: 9, fontWeight: 600, fontFamily: T.fm, letterSpacing: "0.07em", textTransform: "uppercase" as const, padding: "3px 9px", borderRadius: 99, background: statusBg(status), color: statusColor(status) }}>
      {statusLabel(status)}
    </span>
  );
}

function InvoiceListItem({ inv, onSelect }: { inv: Invoice; onSelect: () => void }) {
  return (
    <div onClick={onSelect} style={{ background: T.card, borderRadius: 18, padding: "14px 16px", boxShadow: T.cardShadow, cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 42, height: 42, borderRadius: 13, background: `${inv.avatarColor}18`, border: `1.5px solid ${inv.avatarColor}28`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: T.ff, fontSize: 14, fontWeight: 700, color: inv.avatarColor }}>
        {inv.initials}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: T.cream, marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{inv.client}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontFamily: T.fm, fontSize: 10, color: T.muted }}>{inv.id}</span>
          <span style={{ width: 2, height: 2, borderRadius: "50%", background: T.muted }} />
          <span style={{ fontSize: 10, color: T.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{inv.description}</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5, flexShrink: 0 }}>
        <span style={{ fontFamily: T.ff, fontSize: 15, fontWeight: 700, color: T.cream }}>{inv.amount}</span>
        <StatusBadge status={inv.status} />
      </div>
      <IcoChevronRight color="#3d3020" size={14} />
    </div>
  );
}

// ─── Invoice Detail ───────────────────────────────────────────────────────────

function InvoiceDetail({ inv, onBack }: { inv: Invoice; onBack: () => void }) {
  const isPaid = inv.status === "paid";
  const isDraft = inv.status === "draft";

  return (
    <div style={{ flex: 1, overflowY: "auto", paddingBottom: 120, scrollbarWidth: "none" as const }}>
      {/* Header */}
      <div style={{ padding: "56px 20px 16px" }}>
        <div className="amber-glow" style={{ position: "absolute", top: 0, left: 0, right: 0, height: 240, pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: "50%", background: T.card, border: `1px solid ${T.amberBorder}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: T.cardShadow, flexShrink: 0 }}>
            <IcoChevronLeft color={T.mutedMid} size={18} />
          </button>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: T.fm, fontSize: 10, color: T.muted, letterSpacing: "0.12em", textTransform: "uppercase" as const }}>{inv.id}</p>
            <h2 style={{ fontFamily: T.ff, fontSize: 18, fontWeight: 700, color: T.cream, lineHeight: 1.2 }}>{inv.description}</h2>
          </div>
          <StatusBadge status={inv.status} />
        </div>

        {/* Hero amount */}
        <div style={{ position: "relative", zIndex: 1, background: T.card, borderRadius: 24, padding: "24px 24px 20px", boxShadow: T.cardShadowRaised, overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.4) 40%, rgba(245,158,11,0.4) 60%, transparent)" }} />
          <p style={{ fontFamily: T.fm, fontSize: 10, color: T.muted, letterSpacing: "0.14em", textTransform: "uppercase" as const, marginBottom: 8 }}>Invoice Amount</p>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 2, marginBottom: 16 }}>
            <span style={{ fontFamily: T.ff, fontSize: 18, fontWeight: 700, color: isPaid ? T.green : T.amber, marginTop: 8 }}>$</span>
            <span style={{ fontFamily: T.ff, fontSize: 56, fontWeight: 900, color: isPaid ? T.green : T.amber, lineHeight: 1, letterSpacing: "-0.03em" }}>{inv.amount.replace("$", "")}</span>
          </div>

          {/* Client + dates */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" as const }}>
            <div style={{ flex: 1, minWidth: 100 }}>
              <p style={{ fontFamily: T.fm, fontSize: 9, color: T.muted, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 3 }}>Client</p>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div style={{ width: 22, height: 22, borderRadius: 7, background: `${inv.avatarColor}20`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.ff, fontSize: 9, fontWeight: 700, color: inv.avatarColor }}>{inv.initials}</div>
                <span style={{ fontSize: 12, fontWeight: 600, color: T.cream }}>{inv.client}</span>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 100 }}>
              <p style={{ fontFamily: T.fm, fontSize: 9, color: T.muted, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 3 }}>Due Date</p>
              <span style={{ fontSize: 12, fontWeight: 600, color: inv.status === "overdue" ? T.red : T.cream }}>{inv.dueDate}</span>
            </div>
            <div style={{ flex: 1, minWidth: 100 }}>
              <p style={{ fontFamily: T.fm, fontSize: 9, color: T.muted, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 3 }}>Sent</p>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.cream }}>{inv.sentDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Line items */}
      <div style={{ padding: "0 20px 16px" }}>
        <p style={{ fontFamily: T.fm, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: T.muted, marginBottom: 12, fontWeight: 500 }}>Line Items</p>
        <div style={{ background: T.card, borderRadius: 20, overflow: "hidden", boxShadow: T.cardShadow }}>
          {inv.lineItems.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 18px", borderBottom: i < inv.lineItems.length - 1 ? `1px solid rgba(245,158,11,0.06)` : "none" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: T.cream, marginBottom: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</p>
                <p style={{ fontFamily: T.fm, fontSize: 10, color: T.muted }}>{item.qty > 1 ? `${item.qty} × ${item.rate}` : item.rate}</p>
              </div>
              <span style={{ fontFamily: T.ff, fontSize: 14, fontWeight: 700, color: T.cream, flexShrink: 0, marginLeft: 12 }}>{item.total}</span>
            </div>
          ))}
          {/* Totals */}
          <div style={{ borderTop: `1px solid rgba(245,158,11,0.1)`, padding: "12px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: T.muted }}>Subtotal</span>
              <span style={{ fontFamily: T.fm, fontSize: 12, color: T.muted }}>{inv.amount}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: T.muted }}>Tax (0%)</span>
              <span style={{ fontFamily: T.fm, fontSize: 12, color: T.muted }}>$0.00</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: T.cream }}>Total</span>
              <span style={{ fontFamily: T.ff, fontSize: 16, fontWeight: 700, color: T.amber }}>{inv.amount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment history */}
      {inv.paymentHistory.length > 0 && (
        <div style={{ padding: "0 20px 20px" }}>
          <p style={{ fontFamily: T.fm, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: T.muted, marginBottom: 14, fontWeight: 500 }}>Timeline</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {inv.paymentHistory.map((evt, i) => {
              const isLast = i === inv.paymentHistory.length - 1;
              const isPayment = evt.event.includes("received");
              return (
                <div key={i} style={{ display: "flex", gap: 14 }}>
                  {/* Timeline track */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 20, flexShrink: 0 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: isPayment ? T.green : T.amber, border: `2px solid ${T.bg}`, boxShadow: `0 0 8px ${isPayment ? T.green : T.amber}50`, flexShrink: 0, marginTop: 4 }} />
                    {!isLast && <div style={{ width: 1, flex: 1, background: "rgba(245,158,11,0.12)", minHeight: 28 }} />}
                  </div>
                  {/* Content */}
                  <div style={{ paddingBottom: isLast ? 0 : 20, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: evt.note ? 4 : 0 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: T.cream }}>{evt.event}</span>
                      <span style={{ fontFamily: T.fm, fontSize: 10, color: T.muted }}>{evt.date}</span>
                    </div>
                    {evt.note && <p style={{ fontSize: 11, color: T.muted, lineHeight: 1.4 }}>{evt.note}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action buttons */}
      {!isPaid && (
        <div style={{ padding: "0 20px 20px", display: "flex", gap: 10 }}>
          {!isDraft && (
            <button style={{ flex: 1, padding: "13px 0", borderRadius: 99, border: `1px solid ${T.amberBorder}`, background: T.card, cursor: "pointer", fontFamily: T.fb, fontSize: 13, fontWeight: 600, color: T.amber, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, boxShadow: T.cardShadow }}>
              <IcoMail color={T.amber} size={16} />
              Reminder
            </button>
          )}
          <button className="pill-button" style={{ flex: 2, padding: "13px 0", borderRadius: 99, border: "none", cursor: "pointer", fontFamily: T.fb, fontSize: 13, fontWeight: 600, color: T.bg, display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
            {isDraft ? (
              <><IcoSend color={T.bg} size={16} /> Send Invoice</>
            ) : (
              <><IcoCheck color={T.bg} size={16} /> Mark as Paid</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Invoices Screen ──────────────────────────────────────────────────────────

export default function Invoices() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selected, setSelected] = useState<Invoice | null>(null);

  if (selected) {
    return (
      <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", position: "relative" }}>
        <InvoiceDetail inv={selected} onBack={() => setSelected(null)} />
      </div>
    );
  }

  const filtered = INVOICES.filter(inv => statusFilter === "all" || inv.status === statusFilter);
  const totals = {
    overdue: INVOICES.filter(i => i.status === "overdue").reduce((s, i) => s + i.amountRaw, 0),
    paid: INVOICES.filter(i => i.status === "paid").reduce((s, i) => s + i.amountRaw, 0),
  };

  return (
    <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", paddingBottom: 112, scrollbarWidth: "none" as const }}>
      <div className="amber-glow" style={{ position: "absolute", top: 0, left: 0, right: 0, height: 280, pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ padding: "56px 20px 20px", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontFamily: T.fm, fontSize: 10, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: T.muted, marginBottom: 4 }}>Collecta</p>
            <h1 style={{ fontFamily: T.ff, fontSize: 30, fontWeight: 800, color: T.cream, lineHeight: 1.1 }}>Invoices</h1>
          </div>
          <button className="pill-button" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 99, border: "none", cursor: "pointer", fontFamily: T.fb, fontSize: 13, fontWeight: 600, color: T.bg }}>
            <IcoPlus color={T.bg} size={14} />
            New
          </button>
        </div>

        {/* Quick stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "0 20px 18px" }}>
          <div style={{ background: T.card, borderRadius: 16, padding: "14px 16px", boxShadow: T.cardShadow }}>
            <p style={{ fontFamily: T.fm, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: T.muted, marginBottom: 6 }}>Overdue</p>
            <span style={{ fontFamily: T.ff, fontSize: 24, fontWeight: 900, color: T.red, letterSpacing: "-0.01em" }}>${totals.overdue.toLocaleString()}</span>
          </div>
          <div style={{ background: T.card, borderRadius: 16, padding: "14px 16px", boxShadow: T.cardShadow }}>
            <p style={{ fontFamily: T.fm, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: T.muted, marginBottom: 6 }}>Paid</p>
            <span style={{ fontFamily: T.ff, fontSize: 24, fontWeight: 900, color: T.green, letterSpacing: "-0.01em" }}>${totals.paid.toLocaleString()}</span>
          </div>
        </div>

        {/* Status filter tabs (horizontal scroll) */}
        <div style={{ display: "flex", gap: 8, padding: "0 20px 18px", overflowX: "auto", scrollbarWidth: "none" as const }}>
          {STATUS_FILTERS.map(f => (
            <button key={f} onClick={() => setStatusFilter(f)} style={{ padding: "7px 18px", borderRadius: 99, border: "none", cursor: "pointer", fontFamily: T.fb, fontSize: 12, fontWeight: 500, background: statusFilter === f ? (f === "all" ? T.amber : statusColor(f)) : T.card, color: statusFilter === f ? (f === "all" ? T.bg : (f === "draft" ? T.bg : T.bg)) : T.muted, boxShadow: statusFilter === f ? `0 0 14px ${f === "all" ? "rgba(245,158,11,0.35)" : statusColor(f) + "50"}` : T.cardShadow, transition: "all 0.18s", textTransform: "capitalize" as const, flexShrink: 0, letterSpacing: "0.01em" }}>
              {f} {f !== "all" && `· ${INVOICES.filter(i => i.status === f).length}`}
            </button>
          ))}
        </div>

        {/* Invoice list */}
        <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(inv => (
            <InvoiceListItem key={inv.id} inv={inv} onSelect={() => setSelected(inv)} />
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 0", color: T.muted, fontSize: 13 }}>No invoices</div>
          )}
        </div>
      </div>
    </div>
  );
}
