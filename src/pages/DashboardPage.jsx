import { useState, useMemo } from "react";
import { C, heading, body, mono } from "../theme/colors";
import { simulate } from "../data/engine";
import { Badge, RiskBadge } from "../components/Badge";
import { MiniBar } from "../components/MiniBar";
import { StatCard } from "../components/StatCard";
import { useLang } from "../i18n/LangContext";

export function DashboardPage({ restaurant }) {
  const { t } = useLang();
  const [tab, setTab]     = useState("overview");
  const [catF, setCatF]   = useState("All");
  const [sortK, setSortK] = useState("risk");
  const [simDay, setSimDay] = useState(1);

  const menu    = restaurant.menu        || [];
  const ingDB   = restaurant.ingredients || {};
  const hourly  = restaurant.hourly      || [];

  const data     = useMemo(() => simulate(menu, simDay * 7), [menu, simDay]);
  const cats     = ["All", ...new Set(menu.map(m => m.cat))];
  const filtered = data.filter(d => catF === "All" || d.cat === catF)
                       .sort((a, b) => (b[sortK] || 0) - (a[sortK] || 0));

  const totalML = data.reduce((s, d) => s + d.monthlyLoss, 0);
  const totalW  = data.reduce((s, d) => s + d.wasted,      0);
  const avgWR   = data.length ? Math.round(data.reduce((s, d) => s + d.wasteRate, 0) / data.length * 10) / 10 : 0;
  const highR   = data.filter(d => d.risk >= 65).length;

  const tabs = [
    { id:"overview",    label: t("dash_tab_overview"),    icon:"📊" },
    { id:"menu",        label: t("dash_tab_menu"),        icon:"🍽️" },
    { id:"ingredients", label: t("dash_tab_ingredients"), icon:"🧊" },
    { id:"timeline",    label: t("dash_tab_timeline"),    icon:"⏰" },
  ];

  // Donut chart
  const catWaste   = {};
  data.forEach(d => { catWaste[d.cat] = (catWaste[d.cat] || 0) + d.monthlyLoss; });
  const catEntries = Object.entries(catWaste).sort((a, b) => b[1] - a[1]);
  const catTotal   = catEntries.reduce((s, e) => s + e[1], 0);
  const palette    = [C.accent, C.pink, C.blue, C.green];
  let off = 0;
  const segs = catEntries.map(([cat, val], i) => {
    const pct = (val / catTotal) * 100;
    const seg = { cat, pct, val, color: palette[i % 4], offset: off };
    off += pct;
    return seg;
  });

  // Ingredient risk
  const ingMap = {};
  data.forEach(item => item.ing && item.ing.forEach(ig => {
    if (!ingMap[ig]) ingMap[ig] = { dishes: [], waste: 0 };
    ingMap[ig].dishes.push(item.name);
    ingMap[ig].waste += item.monthlyLoss;
  }));
  const ingList = Object.entries(ingMap).map(([name, info]) => {
    const db = ingDB[name] || {};
    const sh = db.shelf || 30;
    const rs = Math.min(100, Math.round(
      (sh <= 3 ? 50 : sh <= 7 ? 35 : sh <= 21 ? 20 : sh <= 60 ? 10 : 3)
      + (info.dishes.length === 1 ? 25 : info.dishes.length <= 3 ? 10 : 0)
      + Math.min(25, info.waste / 80)
    ));
    return { name, ...db, ...info, risk: rs, dc: info.dishes.length };
  }).filter(i => i.shelf && i.shelf < 365).sort((a, b) => b.risk - a.risk).slice(0, 12);

  const sortOptions = [
    ["risk",         t("dash_sort_risk")],
    ["wasteRate",    t("dash_sort_waste")],
    ["monthlyLoss",  t("dash_sort_loss")],
  ];

  return (
    <div style={{ padding: "20px 24px", maxWidth: 1100, margin: "0 auto" }}>

      {/* Sub-nav */}
      <div style={{ display: "flex", gap: 3, marginBottom: 20, background: "rgba(0,0,0,0.3)", borderRadius: 10, padding: 3, overflowX: "auto" }}>
        {tabs.map(tab_ => (
          <button key={tab_.id} onClick={() => setTab(tab_.id)} style={{
            padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer",
            fontSize: 13, fontWeight: 600, fontFamily: body, whiteSpace: "nowrap",
            background: tab === tab_.id ? C.accentDim : "transparent",
            color: tab === tab_.id ? C.accent : C.textMuted, transition: "all 0.2s",
          }}>{tab_.icon} {tab_.label}</button>
        ))}
      </div>

      {/* Day slider */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, background: C.card, padding: "10px 16px", borderRadius: 10, border: `1px solid ${C.border}` }}>
        <span style={{ fontSize: 12, color: C.textMuted, fontWeight: 600 }}>{t("dash_sim_day")}</span>
        <input type="range" min={1} max={30} value={simDay} onChange={e => setSimDay(+e.target.value)} style={{ flex: 1, accentColor: C.accent, cursor: "pointer" }} />
        <span style={{ fontFamily: mono, fontSize: 14, color: C.accent, fontWeight: 700 }}>
          {t("dash_day")} {simDay}{t("dash_day_suffix")}
        </span>
      </div>

      {/* ── OVERVIEW ── */}
      {tab === "overview" && <>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12, marginBottom: 24 }}>
          <StatCard icon="💸" label={t("dash_monthly_loss")} value={`$${totalML.toLocaleString()}`} sub={t("dash_monthly_sub")} accent={C.red} />
          <StatCard icon="🗑" label={t("dash_daily_waste")}  value={totalW} sub={t("dash_daily_sub", { n: Math.round(totalW * 0.6) })} accent={C.pink} />
          <StatCard icon="📉" label={t("dash_avg_rate")}     value={`${avgWR}%`} sub={t("dash_avg_sub")} accent={C.accent} />
          <StatCard icon="⚠️" label={t("dash_high_risk")}   value={highR} sub={t("dash_high_sub", { n: data.length })} accent={C.red} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          {/* Donut chart */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px" }}>{t("dash_cat_waste")}</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
              <svg width="130" height="130" viewBox="0 0 42 42">
                <circle cx="21" cy="21" r="15.9" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4.5" />
                {segs.map((s, i) => (
                  <circle key={i} cx="21" cy="21" r="15.9" fill="none" stroke={s.color} strokeWidth="4.5"
                    strokeDasharray={`${s.pct} ${100 - s.pct}`} strokeDashoffset={`${-s.offset + 25}`} />
                ))}
                <text x="21" y="19.5" textAnchor="middle" fill={C.text} fontSize="5.5" fontWeight="800" fontFamily={mono}>${Math.round(catTotal / 1000)}k</text>
                <text x="21" y="24"   textAnchor="middle" fill={C.textMuted} fontSize="2.8">{t("dash_per_month")}</text>
              </svg>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {segs.map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: s.color, flexShrink: 0 }} />
                    <span style={{ color: C.textDim, minWidth: 80 }}>{s.cat}</span>
                    <span style={{ fontFamily: mono, fontWeight: 700, color: C.text }}>${s.val.toLocaleString()}</span>
                    <span style={{ color: C.textMuted, fontSize: 11 }}>{Math.round(s.pct)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top items */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px" }}>{t("dash_top_items")}</h3>
            {[...data].sort((a, b) => b.monthlyLoss - a.monthlyLoss).slice(0, 6).map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: C.textMuted, fontFamily: mono, width: 20 }}>#{i + 1}</span>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{item.name}</span>
                <span style={{ fontSize: 13, fontFamily: mono, fontWeight: 700, color: C.red }}>${item.monthlyLoss}</span>
                <div style={{ width: 60 }}>
                  <MiniBar value={item.monthlyLoss} max={[...data].sort((a, b) => b.monthlyLoss - a.monthlyLoss)[0]?.monthlyLoss || 1} color={C.red} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "linear-gradient(135deg,rgba(245,158,11,0.08),rgba(251,113,133,0.06))", border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 22px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.accent, marginBottom: 8 }}>{t("dash_insight")}</div>
          <p style={{ fontSize: 14, color: C.textDim, lineHeight: 1.7, margin: 0 }}>{t("dash_insight_text")}</p>
        </div>
      </>}

      {/* ── MENU ── */}
      {tab === "menu" && <>
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          {cats.map(c => (
            <button key={c} onClick={() => setCatF(c)} style={{
              padding: "5px 14px", borderRadius: 20,
              border: `1px solid ${catF === c ? C.accent : C.border}`,
              background: catF === c ? C.accentDim : "transparent",
              color: catF === c ? C.accent : C.textMuted,
              fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: body,
            }}>{c}</button>
          ))}
          <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
            {sortOptions.map(([k, l]) => (
              <button key={k} onClick={() => setSortK(k)} style={{
                padding: "4px 10px", borderRadius: 6, border: "none", cursor: "pointer",
                fontSize: 11, fontFamily: body, fontWeight: 600,
                background: sortK === k ? C.accentDim : "rgba(255,255,255,0.04)",
                color: sortK === k ? C.accent : C.textMuted,
              }}>{l}</button>
            ))}
          </div>
        </div>
        <div style={{ display: "grid", gap: 6 }}>
          {filtered.map(item => (
            <div key={item.id} style={{
              background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
              padding: "14px 18px", display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 80px",
              alignItems: "center", gap: 12, fontSize: 13,
            }}>
              <div>
                <div style={{ fontWeight: 700 }}>{item.name}</div>
                <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{item.cat} · ${item.price}</div>
              </div>
              <div><div style={{ fontSize: 11, color: C.textMuted }}>{t("dash_col_daily")}</div><div style={{ fontFamily: mono, fontWeight: 600 }}>{item.daily}</div></div>
              <div><div style={{ fontSize: 11, color: C.textMuted }}>{t("dash_col_waste")}</div>
                <div style={{ fontFamily: mono, fontWeight: 700, color: item.wasteRate > 15 ? C.red : item.wasteRate > 8 ? C.accent : C.green }}>{item.wasteRate}%</div>
              </div>
              <div><div style={{ fontSize: 11, color: C.textMuted }}>{t("dash_col_loss")}</div><div style={{ fontFamily: mono, fontWeight: 700, color: C.pink }}>${item.monthlyLoss}</div></div>
              <div><div style={{ fontSize: 11, color: C.textMuted }}>{t("dash_col_shelf")}</div>
                <div style={{ fontFamily: mono, fontWeight: 600, color: item.shelf <= 4 ? C.red : item.shelf <= 12 ? C.accent : C.textDim }}>
                  {item.shelf === 999 ? t("dash_shelf_stable") : `${item.shelf}h`}
                </div>
              </div>
              <RiskBadge score={item.risk} />
            </div>
          ))}
        </div>
      </>}

      {/* ── INGREDIENTS ── */}
      {tab === "ingredients" && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 6px" }}>{t("dash_ing_title")}</h3>
          <p style={{ fontSize: 12, color: C.textMuted, margin: "0 0 16px" }}>{t("dash_ing_sub")}</p>
          {ingList.length === 0
            ? <div style={{ color: C.textMuted, textAlign: "center", padding: 32 }}>{t("dash_ing_empty")}</div>
            : <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 3px" }}>
                <thead>
                  <tr>{[t("dash_ing_col_name"), t("dash_ing_col_cat"), t("dash_ing_col_shelf"), t("dash_ing_col_used"), t("dash_ing_col_risk"), ""].map((h, i) => (
                    <th key={i} style={{ textAlign: "left", padding: "6px 10px", fontSize: 10, color: C.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: `1px solid ${C.border}` }}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {ingList.map((ig, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent" }}>
                      <td style={{ padding: 10, fontSize: 13, fontWeight: 600 }}>{ig.name}</td>
                      <td style={{ padding: 10, fontSize: 12, color: C.textDim }}>{ig.cat}</td>
                      <td style={{ padding: 10, fontSize: 12, fontFamily: mono, color: ig.shelf <= 5 ? C.red : ig.shelf <= 14 ? C.accent : C.textDim }}>{ig.shelf}{t("dash_ing_days")}</td>
                      <td style={{ padding: 10, fontSize: 12, color: C.textDim }}>{ig.dc}{t("dash_ing_items")}</td>
                      <td style={{ padding: 10 }}><RiskBadge score={ig.risk} /></td>
                      <td style={{ padding: 10, width: 80 }}><MiniBar value={ig.risk} color={ig.risk >= 70 ? C.red : ig.risk >= 40 ? C.accent : C.green} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
        </div>
      )}

      {/* ── TIMELINE ── */}
      {tab === "timeline" && <>
        {hourly.length === 0
          ? <div style={{ color: C.textMuted, textAlign: "center", padding: 60 }}>{t("dash_tl_empty")}</div>
          : <>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20, marginBottom: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 4px" }}>{t("dash_tl_title")}</h3>
              <p style={{ fontSize: 12, color: C.textMuted, margin: "0 0 16px" }}>{t("dash_tl_sub")}</p>
              <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 160, padding: "0 4px" }}>
                {hourly.map((d, i) => {
                  const isClose = d.h === "Close";
                  const mx = Math.max(...hourly.map(x => x.sales));
                  return (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                      {!isClose && <span style={{ fontSize: 9, color: C.textMuted, fontFamily: mono }}>{d.sales}</span>}
                      {isClose
                        ? <div style={{ width: "100%", height: 50, borderRadius: "5px 5px 0 0", background: `repeating-linear-gradient(45deg,${C.redDim},${C.redDim} 4px,transparent 4px,transparent 8px)`, border: `1px dashed ${C.red}`, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 14 }}>🗑</span></div>
                        : <div style={{ width: "100%", borderRadius: "4px 4px 0 0", height: `${Math.max(4, (d.sales / mx) * 120)}px`, background: `linear-gradient(to top,${C.accent},#FBBF24)`, opacity: 0.85, transition: "height 0.4s" }} />
                      }
                      <span style={{ fontSize: 9, color: isClose ? C.red : C.textMuted, fontWeight: isClose ? 700 : 500 }}>{d.h}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ background: `linear-gradient(135deg,${C.redDim},rgba(251,113,133,0.04))`, border: `1px solid rgba(239,68,68,0.15)`, borderRadius: 14, padding: "18px 22px" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.red, marginBottom: 10 }}>{t("dash_tl_problem")}</div>
              <p style={{ fontSize: 13, color: C.textDim, lineHeight: 1.6, margin: 0 }}>{t("dash_tl_tip")}</p>
            </div>
          </>
        }
      </>}
    </div>
  );
}
