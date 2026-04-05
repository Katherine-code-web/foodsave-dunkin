import { useState } from "react";
import { C, heading, body, mono } from "../theme/colors";
import { useLang } from "../i18n/LangContext";

const REASON_KEYS = ["reason_overproduction", "reason_expired", "reason_damaged", "reason_returned", "reason_other"];

const inp = (extra = {}) => ({
  border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 10px",
  background: "rgba(255,255,255,0.05)", color: C.text, fontFamily: body,
  fontSize: 13, outline: "none", boxSizing: "border-box", ...extra,
});

export function WasteInputPage({ restaurant, wasteRecords, addWasteRecord, deleteWasteRecord }) {
  const { t } = useLang();
  const menu  = restaurant.menu || [];
  const today = new Date().toISOString().split("T")[0];

  const [date, setDate]   = useState(today);
  const [items, setItems] = useState(
    menu.map(m => ({ menuId: m.id, name: m.name, units: 0, reason: "reason_overproduction" }))
  );
  const [saved, setSaved] = useState(false);

  const updateItem = (idx, field, value) =>
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it));

  const totalUnits = items.reduce((s, it) => s + (it.units || 0), 0);
  const totalCost  = items.reduce((s, it) => {
    const mi = menu.find(m => m.id === it.menuId);
    return s + (it.units || 0) * (mi ? mi.price * 0.35 : 0);
  }, 0);

  const handleSave = () => {
    if (totalUnits === 0) return;
    addWasteRecord({
      id: Date.now(), date,
      items: items.filter(it => it.units > 0).map(it => ({
        menuId: it.menuId, name: it.name, units: it.units,
        reason: t(it.reason),
      })),
      totalUnits,
      totalCost: Math.round(totalCost * 100) / 100,
    });
    setItems(menu.map(m => ({ menuId: m.id, name: m.name, units: 0, reason: "reason_overproduction" })));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const recent  = wasteRecords.slice(0, 7);
  const avgDaily = recent.length > 0 ? Math.round(recent.reduce((s, r) => s + r.totalUnits, 0) / recent.length) : 0;
  const totalLoss = recent.reduce((s, r) => s + r.totalCost, 0);

  return (
    <div style={{ padding: "24px", maxWidth: 1000, margin: "0 auto", color: C.text }}>
      <h2 style={{ fontFamily: heading, fontSize: 22, fontWeight: 800, margin: "0 0 6px" }}>{t("waste_title")}</h2>
      <p style={{ fontSize: 14, color: C.textMuted, margin: "0 0 20px" }}>{t("waste_sub")}</p>

      {/* Quick stats */}
      {recent.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
          {[["📅", t("waste_stat_count"), `${recent.length}`],
            ["📦", t("waste_stat_daily"), `${avgDaily}${t("waste_stat_unit")}`],
            ["💸", t("waste_stat_loss"),  `$${totalLoss.toFixed(0)}`],
          ].map(([icon, label, value]) => (
            <div key={label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 18px" }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
              <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 600 }}>{label}</div>
              <div style={{ fontSize: 20, fontWeight: 800, fontFamily: mono, color: C.accent }}>{value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Input form */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 22px", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 600, marginBottom: 4 }}>{t("waste_date")}</div>
            <input type="date" style={inp({ width: 160 })} value={date} onChange={e => setDate(e.target.value)} max={today} />
          </div>
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <div style={{ fontSize: 12, color: C.textMuted }}>{t("waste_total")}</div>
            <div style={{ fontFamily: mono, fontSize: 18, fontWeight: 800, color: totalUnits > 0 ? C.red : C.textMuted }}>
              {totalUnits}{t("waste_stat_unit")} · ${totalCost.toFixed(2)}
            </div>
          </div>
        </div>

        {menu.length === 0 && (
          <div style={{ color: C.textMuted, textAlign: "center", padding: 32, fontSize: 14 }}>{t("waste_no_menu")}</div>
        )}

        {menu.length > 0 && <>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 100px 160px 60px", gap: 10, padding: "6px 8px", fontSize: 11, color: C.textMuted, fontWeight: 700, borderBottom: `1px solid ${C.border}`, marginBottom: 6 }}>
            <span>{t("waste_col_item")}</span><span>{t("waste_col_qty")}</span><span>{t("waste_col_reason")}</span><span>{t("waste_col_loss")}</span>
          </div>
          <div style={{ maxHeight: 420, overflowY: "auto" }}>
            {items.map((it, idx) => {
              const mi   = menu.find(m => m.id === it.menuId);
              const cost = it.units * (mi ? mi.price * 0.35 : 0);
              return (
                <div key={it.menuId} style={{ display: "grid", gridTemplateColumns: "2fr 100px 160px 60px", gap: 10, padding: "7px 8px", alignItems: "center", borderBottom: `1px solid rgba(255,255,255,0.04)`, background: it.units > 0 ? "rgba(239,68,68,0.05)" : "transparent", transition: "background 0.2s" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{it.name}</div>
                    <div style={{ fontSize: 11, color: C.textMuted }}>{mi?.cat}</div>
                  </div>
                  <input type="number" min={0} value={it.units} onChange={e => updateItem(idx, "units", Math.max(0, +e.target.value))} style={inp({ width: "100%", textAlign: "center" })} />
                  <select value={it.reason} onChange={e => updateItem(idx, "reason", e.target.value)} style={{ ...inp(), cursor: "pointer", fontSize: 12 }}>
                    {REASON_KEYS.map(r => <option key={r} value={r}>{t(r)}</option>)}
                  </select>
                  <span style={{ fontFamily: mono, fontSize: 12, color: it.units > 0 ? C.red : C.textMuted, textAlign: "right" }}>
                    {it.units > 0 ? `$${cost.toFixed(2)}` : "—"}
                  </span>
                </div>
              );
            })}
          </div>
        </>}

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
          <button onClick={handleSave} disabled={totalUnits === 0} style={{
            padding: "10px 28px", borderRadius: 8, border: "none", cursor: totalUnits > 0 ? "pointer" : "not-allowed",
            fontFamily: body, fontSize: 14, fontWeight: 700,
            background: saved ? C.green : totalUnits > 0 ? C.accent : "rgba(255,255,255,0.08)",
            color: totalUnits > 0 ? "#000" : C.textMuted, transition: "all 0.3s",
          }}>
            {saved ? t("waste_saved_btn") : t("waste_save_btn", { n: totalUnits })}
          </button>
        </div>
      </div>

      {/* History */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 22px" }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 12px", color: C.accent }}>
          {t("waste_history", { n: Math.min(wasteRecords.length, 10) })}
        </h3>
        {wasteRecords.length === 0
          ? <div style={{ color: C.textMuted, textAlign: "center", padding: 32 }}>{t("waste_no_history")}</div>
          : wasteRecords.slice(0, 10).map(record => (
            <div key={record.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 0", borderBottom: `1px solid ${C.border}` }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <span style={{ fontFamily: mono, fontSize: 13, fontWeight: 700, color: C.accent }}>{record.date}</span>
                  <span style={{ fontSize: 12, color: C.textMuted }}>{record.items.length} items</span>
                  <span style={{ fontFamily: mono, fontSize: 13, fontWeight: 700, color: C.red }}>{record.totalUnits}{t("waste_stat_unit")} · ${record.totalCost.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {record.items.slice(0, 5).map((it, i) => (
                    <span key={i} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 6, padding: "2px 8px", fontSize: 11, color: C.textDim }}>{it.name} ×{it.units}</span>
                  ))}
                  {record.items.length > 5 && <span style={{ fontSize: 11, color: C.textMuted }}>{t("waste_more", { n: record.items.length - 5 })}</span>}
                </div>
              </div>
              <button onClick={() => deleteWasteRecord(record.id)} style={{ background: C.redDim, border: "none", color: C.red, borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 12, flexShrink: 0 }}>{t("waste_delete")}</button>
            </div>
          ))
        }
      </div>
    </div>
  );
}
