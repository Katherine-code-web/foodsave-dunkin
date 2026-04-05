import { useMemo } from "react";
import { C, heading, body, mono } from "../theme/colors";
import { calcROI } from "../data/engine";
import { AnimNum } from "../components/AnimNum";
import { useLang } from "../i18n/LangContext";

const STRAT_KEYS = [
  { id: "production",   icon: "📉", max: 30, cost: 500,  nameKey: "strat_production_name",   descKey: "strat_production_desc",   costKey: "strat_production_cost" },
  { id: "markdown",     icon: "🏷️", max: 50, cost: 200,  nameKey: "strat_markdown_name",     descKey: "strat_markdown_desc",     costKey: "strat_markdown_cost" },
  { id: "buildtoorder", icon: "🥪", max: 80, cost: 1200, nameKey: "strat_buildtoorder_name", descKey: "strat_buildtoorder_desc", costKey: "strat_buildtoorder_cost" },
  { id: "inventory",    icon: "🧊", max: 40, cost: 800,  nameKey: "strat_inventory_name",    descKey: "strat_inventory_desc",    costKey: "strat_inventory_cost" },
  { id: "donation",     icon: "🤝", max: 60, cost: 300,  nameKey: "strat_donation_name",     descKey: "strat_donation_desc",     costKey: "strat_donation_cost" },
];

const PRESET_VALS = [
  { emoji: "🐢", key: "preset_conservative", v: { production:10, markdown:20, buildtoorder:30, inventory:15, donation:20 } },
  { emoji: "⚖️", key: "preset_moderate",     v: { production:20, markdown:35, buildtoorder:60, inventory:30, donation:40 } },
  { emoji: "🚀", key: "preset_aggressive",    v: { production:30, markdown:50, buildtoorder:80, inventory:40, donation:60 } },
];

export function ROIPage({ restaurant, roiSliders, setROISliders }) {
  const { t } = useLang();
  const sl = roiSliders;
  const sc = useMemo(() => calcROI(restaurant, sl), [restaurant, sl]);
  const any = Object.values(sl).some(v => v > 0);

  const upd  = (id, v) => setROISliders(prev => ({ ...prev, [id]: v }));
  const reset = () => setROISliders({ production: 0, markdown: 0, buildtoorder: 0, inventory: 0, donation: 0 });

  const breakdownItems = [
    { labelKey: "roi_break_prod",  value: sc.saveProd,  color: C.lAccent },
    { labelKey: "roi_break_mark",  value: sc.markRev,   color: "#E8890C" },
    { labelKey: "roi_break_sand",  value: sc.sandSave,  color: "#2563EB" },
    { labelKey: "roi_break_inv",   value: sc.ingSave,   color: "#7C3AED" },
    { labelKey: "roi_break_tax",   value: sc.taxBen,    color: C.lGreen  },
  ].filter(i => i.value > 0);
  const breakTotal = breakdownItems.reduce((s, i) => s + i.value, 0);

  return (
    <div style={{ background: C.lBg, color: C.lText, minHeight: "100vh", fontFamily: body }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 32px" }}>

        {/* Current state banner */}
        <div style={{ background: C.lRedLight, border: `1.5px solid ${C.lRed}20`, borderRadius: 14, padding: "18px 24px", marginBottom: 24, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 16 }}>
          {[
            [t("roi_current_waste"),  `$${sc.totalW.toLocaleString()}`],
            [t("roi_waste_pct"),      `${sc.curWR}%`],
            [t("roi_net_profit"),     `$${sc.curProfit.toLocaleString()}`],
            [t("roi_revenue"),        `$${(restaurant.rev || 0).toLocaleString()}`],
          ].map(([l, v], i) => (
            <div key={i} style={{ borderRight: i < 3 ? `1px solid ${C.lRed}15` : "none", paddingRight: i < 3 ? 16 : 0 }}>
              <div style={{ fontSize: 11, color: C.lRed, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{l}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: i === 2 ? C.lText : C.lRed, fontFamily: mono, marginTop: 4 }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Presets */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: C.lTextLight, textTransform: "uppercase", letterSpacing: "0.06em" }}>{t("roi_presets")}</span>
          {PRESET_VALS.map((p, i) => (
            <button key={i} onClick={() => setROISliders(p.v)} style={{
              padding: "7px 16px", borderRadius: 8, cursor: "pointer", fontFamily: body,
              fontSize: 13, fontWeight: 700, border: `1.5px solid ${C.lBorder}`,
              background: "#fff", color: C.lTextMid, transition: "all 0.2s",
            }}>{p.emoji} {t(p.key)}</button>
          ))}
          {any && (
            <button onClick={reset} style={{ padding: "7px 14px", borderRadius: 8, border: "none", cursor: "pointer", background: "#F7F5F2", color: C.lTextLight, fontSize: 12, fontWeight: 600, fontFamily: body, marginLeft: "auto" }}>
              {t("roi_reset")}
            </button>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

          {/* Left: Sliders */}
          <div>
            <h2 style={{ fontFamily: heading, fontSize: 20, fontWeight: 800, margin: "0 0 14px" }}>{t("roi_adjust")}</h2>
            <div style={{ display: "grid", gap: 10 }}>
              {STRAT_KEYS.map(s => {
                const active = sl[s.id] > 0;
                return (
                  <div key={s.id} style={{
                    background: active ? "#FFF0E6" : "#fff",
                    border: `1.5px solid ${active ? C.lAccent : C.lBorder}`,
                    borderRadius: 12, padding: "16px 20px", transition: "all 0.3s",
                  }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                      <span style={{ fontSize: 24, lineHeight: 1 }}>{s.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 700 }}>{t(s.nameKey)}</div>
                        <div style={{ fontSize: 12.5, color: C.lTextMid, marginTop: 2 }}>{t(s.descKey)}</div>
                      </div>
                      <div style={{
                        background: active ? C.lAccent : "#F7F5F2",
                        color: active ? "#fff" : C.lTextLight,
                        padding: "4px 12px", borderRadius: 8, fontSize: 15, fontWeight: 800,
                        fontFamily: mono, minWidth: 52, textAlign: "center", transition: "all 0.2s",
                      }}>{sl[s.id]}%</div>
                    </div>
                    <input type="range" min={0} max={s.max} value={sl[s.id]}
                      onChange={e => upd(s.id, +e.target.value)}
                      style={{ width: "100%", accentColor: C.lAccent, cursor: "pointer", height: 6 }} />
                    {active && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, fontSize: 11, color: C.lTextMid }}>
                        <span style={{ background: C.lAccent, color: "#fff", padding: "1px 6px", borderRadius: 4, fontSize: 10, fontWeight: 700 }}>{t("roi_cost_label")}</span>
                        ${s.cost.toLocaleString()} · {t(s.costKey)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Results */}
          <div>
            <h2 style={{ fontFamily: heading, fontSize: 20, fontWeight: 800, margin: "0 0 14px" }}>{t("roi_impact")}</h2>

            {/* Hero savings */}
            <div style={{
              background: any ? C.lGreenLight : "#F7F5F2",
              border: `1.5px solid ${any ? C.lGreen + "40" : C.lBorder}`,
              borderRadius: 14, padding: "28px 24px", marginBottom: 14, textAlign: "center", transition: "all 0.4s",
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: any ? C.lGreen : C.lTextLight, textTransform: "uppercase", letterSpacing: "0.08em" }}>{t("roi_annual_savings")}</div>
              <div style={{ fontSize: 44, fontWeight: 900, fontFamily: mono, marginTop: 8 }}>
                <AnimNum value={sc.totalBen} prefix="$" color={any ? "#0F5C35" : C.lTextLight} />
              </div>
              {any && (
                <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 14 }}>
                  {[
                    [sc.profitUp, t("roi_payback_unit").trim() === "mo" ? "%" : "%",       t("roi_profit_up"),  C.lGreen],
                    [sc.payback,  t("roi_payback_unit"),                                    t("roi_payback"),    C.lAccent],
                    [sc.rescued,  "",                                                        t("roi_rescued"),    "#2563EB"],
                  ].map(([v, suf, l, col], i) => (
                    <div key={i} style={{ position: "relative" }}>
                      <div style={{ fontSize: 20, fontWeight: 800, fontFamily: mono, color: col }}>
                        <AnimNum value={v} color={col} /><span style={{ fontSize: 14, fontWeight: 600 }}>{suf}</span>
                      </div>
                      <div style={{ fontSize: 11, color: C.lTextMid }}>{l}</div>
                    </div>
                  ))}
                </div>
              )}
              {!any && <div style={{ fontSize: 14, color: C.lTextLight, marginTop: 10 }}>{t("roi_hint")}</div>}
            </div>

            {/* P&L */}
            {any && (
              <div style={{ background: "#fff", border: `1px solid ${C.lBorder}`, borderRadius: 14, padding: "22px 24px", marginBottom: 14 }}>
                <div style={{ fontSize: 14, fontWeight: 700, fontFamily: heading, marginBottom: 16 }}>{t("roi_pnl")}</div>
                {[
                  [t("roi_food_cost"),     sc.curFood,   sc.newFood,   (restaurant.rev || 0) * 0.35],
                  [t("roi_annual_waste"),  sc.totalW,    Math.max(0, sc.totalW - sc.directSave - sc.donated), sc.totalW * 1.2],
                  [t("roi_net_profit_row"),sc.curProfit, sc.newProfit, sc.newProfit * 1.1],
                ].map(([l, b, a, mx], i) => {
                  const better = i === 2 ? a > b : a < b;
                  return (
                    <div key={i} style={{ marginBottom: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{l}</span>
                        <span style={{ fontSize: 12, color: better ? C.lGreen : C.lRed, fontWeight: 700, fontFamily: mono }}>
                          {better ? "▼" : "▲"} ${Math.abs(b - a).toLocaleString()}
                        </span>
                      </div>
                      <div style={{ height: 8, background: "#F7F5F2", borderRadius: 4, overflow: "hidden", marginBottom: 3 }}>
                        <div style={{ width: `${(b / mx) * 100}%`, height: "100%", background: "#D4CFC8", borderRadius: 4, transition: "width 0.5s" }} />
                      </div>
                      <div style={{ height: 8, background: "#F7F5F2", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ width: `${(a / mx) * 100}%`, height: "100%", background: better ? C.lGreen : C.lAccent, borderRadius: 4, transition: "width 0.5s" }} />
                      </div>
                    </div>
                  );
                })}
                <div style={{ borderTop: `1px solid ${C.lBorder}`, paddingTop: 14, marginTop: 8, display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{t("roi_impl_cost")}</span>
                    <div style={{ fontSize: 12, color: C.lTextMid, marginTop: 2 }}>{t("roi_roi_pct")}{Math.round((sc.totalBen / Math.max(1, sc.implCost)) * 100)}%</div>
                  </div>
                  <span style={{ fontFamily: mono, fontSize: 15, fontWeight: 700, color: C.lAccent }}>${sc.implCost.toLocaleString()}</span>
                </div>
                {breakTotal > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.lTextLight, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>{t("roi_breakdown")}</div>
                    {breakdownItems.map((item, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                        <span style={{ flex: 1, fontSize: 13, color: C.lTextMid }}>{t(item.labelKey)}</span>
                        <span style={{ fontFamily: mono, fontSize: 13, fontWeight: 600 }}>${item.value.toLocaleString()}</span>
                        <div style={{ width: 60, height: 5, background: "#F7F5F2", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ width: `${(item.value / breakTotal) * 100}%`, height: "100%", background: item.color, borderRadius: 3 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Monthly chart */}
            {any && (
              <div style={{ background: "#fff", border: `1px solid ${C.lBorder}`, borderRadius: 14, padding: "22px 24px" }}>
                <div style={{ fontSize: 14, fontWeight: 700, fontFamily: heading, marginBottom: 14 }}>{t("roi_monthly_chart")}</div>
                <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 130 }}>
                  {sc.monthly.map((d, i) => {
                    const mx = Math.max(...sc.monthly.map(x => x.cur));
                    return (
                      <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                        <div style={{ display: "flex", gap: 1, width: "100%", justifyContent: "center", alignItems: "flex-end" }}>
                          <div style={{ width: "42%", borderRadius: "3px 3px 0 0", height: `${(d.cur / mx) * 100}px`, background: "#E8E4DF", transition: "height 0.4s" }} />
                          <div style={{ width: "42%", borderRadius: "3px 3px 0 0", height: `${Math.max(3, (d.opt / mx) * 100)}px`, background: C.lGreen, opacity: 0.8, transition: "height 0.4s" }} />
                        </div>
                        <span style={{ fontSize: 10, color: C.lTextLight, fontWeight: 600 }}>{d.m}</span>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: "flex", gap: 20, justifyContent: "center", marginTop: 12 }}>
                  {[["#E8E4DF", t("roi_current_bar")], [C.lGreen, t("roi_optimized_bar")]].map(([c, l], i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.lTextMid }}>
                      <div style={{ width: 12, height: 8, borderRadius: 2, background: c }} />{l}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Executive Summary */}
        {any && (
          <div style={{ marginTop: 24, background: "linear-gradient(135deg,#1A1814,#2D2A24)", borderRadius: 14, padding: "22px 28px", color: "#fff" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.lAccent, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{t("roi_exec_summary")}</div>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: "#D4CFC8", margin: 0 }}>
              {t("roi_summary_text", {
                savings: sc.totalBen.toLocaleString(),
                pct: sc.profitUp,
                cost: sc.implCost.toLocaleString(),
                payback: sc.payback,
                rescued: sc.rescued > 0 ? t("roi_rescued_text", { n: sc.rescued }) : "",
                curWR: sc.curWR,
                newWR: sc.newWR,
              })}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginTop: 20 }}>
              {[
                [t("roi_summary_saved"),   `$${sc.totalBen.toLocaleString()}`, "#34D399"],
                [t("roi_summary_profit"),  `${sc.profitUp}%`,                  C.lAccent],
                [t("roi_summary_payback"), `${sc.payback}${t("roi_payback_unit")}`, "#FBBF24"],
                [t("roi_summary_rate"),    `${sc.curWR}%→${sc.newWR}%`,        "#34D399"],
                [t("roi_summary_rescued"), `${sc.rescued}`,                     "#60A5FA"],
              ].map(([l, v, col], i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: "#8A847A", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{l}</div>
                  <div style={{ fontSize: 17, fontWeight: 800, fontFamily: mono, color: col, marginTop: 4 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
