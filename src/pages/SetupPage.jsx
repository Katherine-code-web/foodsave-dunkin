import { useState } from "react";
import { C, heading, body, mono } from "../theme/colors";
import { DUNKIN_RESTAURANT } from "../data/templates/dunkin";
import { useLang } from "../i18n/LangContext";

const PERISH_KEYS = ["very_high", "high", "medium", "low"];

const inp = (extra = {}) => ({
  border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px",
  background: "rgba(255,255,255,0.05)", color: C.text, fontFamily: body,
  fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box", ...extra,
});
const sel = { ...inp(), cursor: "pointer" };
const labelSt = { fontSize: 12, color: C.textMuted, fontWeight: 600, display: "block", marginBottom: 4 };
const btn = (accent = false) => ({
  padding: "8px 18px", borderRadius: 8, border: "none", cursor: "pointer",
  fontFamily: body, fontSize: 13, fontWeight: 700,
  background: accent ? C.accent : "rgba(255,255,255,0.08)",
  color: accent ? "#000" : C.textDim, transition: "all 0.2s",
});

export function SetupPage({ restaurant, setRestaurant, onSave }) {
  const { t } = useLang();

  const TYPE_OPTIONS = [
    { key: "type_fast",   zh: "快餐",    en: "Fast Food" },
    { key: "type_cafe",   zh: "咖啡廳",  en: "Café" },
    { key: "type_formal", zh: "正式餐廳", en: "Full Service" },
    { key: "type_snack",  zh: "小吃店",  en: "Snack Bar" },
    { key: "type_bakery", zh: "烘焙坊",  en: "Bakery" },
    { key: "type_other",  zh: "其他",    en: "Other" },
  ];

  const [form, setForm] = useState(() => ({
    name:          restaurant.name          || "",
    type:          restaurant.type          || t("type_fast"),
    rev:           restaurant.rev           || 1_050_000,
    foodPct:       restaurant.foodPct       || 30,
    laborPct:      restaurant.laborPct      || 28,
    rentPct:       restaurant.rentPct       || 10,
    otherPct:      restaurant.otherPct      || 12,
    menu:          restaurant.menu          || [],
    ingredients:   restaurant.ingredients   || {},
    hourly:        restaurant.hourly        || [],
    donutWaste:    restaurant.donutWaste    ?? 280,
    sandwichWaste: restaurant.sandwichWaste ?? 25,
    bagelWaste:    restaurant.bagelWaste    ?? 30,
    donutCost:     restaurant.donutCost     ?? 0.32,
    sandCost:      restaurant.sandCost      ?? 1.85,
    bagelCost:     restaurant.bagelCost     ?? 0.55,
    donutPrice:    restaurant.donutPrice    ?? 1.49,
  }));

  const [section,     setSection]    = useState("basic");
  const [newMenuItem, setNewMenuItem] = useState({ name:"", cat:"", price:"", daily:"", shelf:"", perish:"medium" });
  const [newIng,      setNewIng]     = useState({ name:"", cost:"", shelf:"", cat:"" });
  const [saved,       setSaved]      = useState(false);

  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const addMenuItem = () => {
    if (!newMenuItem.name) return;
    upd("menu", [...form.menu, { ...newMenuItem, id: Date.now(), price: +newMenuItem.price, daily: +newMenuItem.daily, shelf: +newMenuItem.shelf, ing: [] }]);
    setNewMenuItem({ name:"", cat:"", price:"", daily:"", shelf:"", perish:"medium" });
  };

  const addIng = () => {
    if (!newIng.name) return;
    upd("ingredients", { ...form.ingredients, [newIng.name]: { cost: +newIng.cost, shelf: +newIng.shelf, cat: newIng.cat } });
    setNewIng({ name:"", cost:"", shelf:"", cat:"" });
  };

  const loadTemplate = () => {
    const d = DUNKIN_RESTAURANT;
    setForm(f => ({ ...f, menu: d.menu, ingredients: d.ingredients, hourly: d.hourly,
      donutWaste: d.donutWaste, sandwichWaste: d.sandwichWaste, bagelWaste: d.bagelWaste,
      donutCost: d.donutCost, sandCost: d.sandCost, bagelCost: d.bagelCost, donutPrice: d.donutPrice,
    }));
  };

  const handleSave = () => {
    setRestaurant(form);
    setSaved(true);
    setTimeout(() => { setSaved(false); onSave && onSave(); }, 1200);
  };

  const sections = [
    { id:"basic",       label: t("setup_tab_basic"),   icon:"🏪" },
    { id:"menu",        label: t("setup_tab_menu"),    icon:"🍽️" },
    { id:"ingredients", label: t("setup_tab_ing"),     icon:"🧊" },
    { id:"roi",         label: t("setup_tab_roi"),     icon:"📊" },
  ];

  const perishLabel = (p) => t(`perish_${p}`);

  return (
    <div style={{ padding: "24px", maxWidth: 900, margin: "0 auto", color: C.text }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h2 style={{ fontFamily: heading, fontSize: 22, fontWeight: 800, margin: 0 }}>{t("setup_title")}</h2>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button onClick={loadTemplate} style={btn()}>{t("setup_load_tmpl")}</button>
          <button onClick={handleSave}   style={btn(true)}>{saved ? t("setup_saved") : t("setup_save")}</button>
        </div>
      </div>

      {/* Section tabs */}
      <div style={{ display: "flex", gap: 3, marginBottom: 24, background: "rgba(0,0,0,0.3)", borderRadius: 10, padding: 3 }}>
        {sections.map(s => (
          <button key={s.id} onClick={() => setSection(s.id)} style={{
            padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer",
            fontSize: 13, fontWeight: 600, fontFamily: body,
            background: section === s.id ? C.accentDim : "transparent",
            color: section === s.id ? C.accent : C.textMuted, transition: "all 0.2s",
          }}>{s.icon} {s.label}</button>
        ))}
      </div>

      {/* ─── BASIC ─── */}
      {section === "basic" && (
        <div style={{ display: "grid", gap: 20 }}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 16px", color: C.accent }}>{t("setup_basic_title")}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <span style={labelSt}>{t("setup_name")}</span>
                <input style={inp()} value={form.name} onChange={e => upd("name", e.target.value)} placeholder={t("setup_name_ph")} />
              </div>
              <div>
                <span style={labelSt}>{t("setup_type")}</span>
                <select style={sel} value={form.type} onChange={e => upd("type", e.target.value)}>
                  {TYPE_OPTIONS.map(o => <option key={o.key} value={t(o.key)}>{t(o.key)}</option>)}
                </select>
              </div>
              <div>
                <span style={labelSt}>{t("setup_revenue")}</span>
                <input style={inp()} type="number" value={form.rev} onChange={e => upd("rev", +e.target.value)} />
              </div>
            </div>
          </div>

          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 4px", color: C.accent }}>{t("setup_cost_title")}</h3>
            <p style={{ fontSize: 12, color: C.textMuted, margin: "0 0 16px" }}>{t("setup_cost_sub")}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[["foodPct",t("setup_food_pct")],["laborPct",t("setup_labor_pct")],["rentPct",t("setup_rent_pct")],["otherPct",t("setup_other_pct")]].map(([k, l]) => (
                <div key={k}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={labelSt}>{l}</span>
                    <span style={{ fontFamily: mono, fontSize: 14, color: C.accent, fontWeight: 700 }}>{form[k]}%</span>
                  </div>
                  <input type="range" min={0} max={60} value={form[k]} onChange={e => upd(k, +e.target.value)} style={{ width: "100%", accentColor: C.accent, cursor: "pointer" }} />
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, padding: "10px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 8 }}>
              <div style={{ fontSize: 13, color: C.textDim }}>
                {t("setup_profit_est")} <span style={{ fontFamily: mono, fontWeight: 700, color: C.green }}>
                  {Math.max(0, 100 - form.foodPct - form.laborPct - form.rentPct - form.otherPct)}%
                </span>
                <span style={{ fontSize: 11, color: C.textMuted, marginLeft: 8 }}>
                  = ${Math.max(0, Math.round(form.rev * (100 - form.foodPct - form.laborPct - form.rentPct - form.otherPct) / 100)).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── MENU ─── */}
      {section === "menu" && (
        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 20px" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 12px", color: C.accent }}>{t("setup_menu_add")}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr auto", gap: 8, alignItems: "flex-end" }}>
              {[
                [newMenuItem.name,  v => setNewMenuItem(p=>({...p,name:v})),  t("setup_menu_col_name"),  "text"],
                [newMenuItem.cat,   v => setNewMenuItem(p=>({...p,cat:v})),   t("setup_menu_col_cat"),   "text"],
                [newMenuItem.price, v => setNewMenuItem(p=>({...p,price:v})), t("setup_menu_col_price"), "number"],
                [newMenuItem.daily, v => setNewMenuItem(p=>({...p,daily:v})), t("setup_menu_col_daily"), "number"],
                [newMenuItem.shelf, v => setNewMenuItem(p=>({...p,shelf:v})), t("setup_menu_col_shelf"), "number"],
              ].map(([val, onChange, placeholder, type], i) => (
                <div key={i}><span style={labelSt}>{placeholder}</span>
                  <input style={inp()} type={type} value={val} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
                </div>
              ))}
              <div><span style={labelSt}>{t("setup_menu_col_perish")}</span>
                <select style={sel} value={newMenuItem.perish} onChange={e => setNewMenuItem(p => ({ ...p, perish: e.target.value }))}>
                  {PERISH_KEYS.map(o => <option key={o} value={o}>{perishLabel(o)}</option>)}
                </select>
              </div>
              <div style={{ paddingBottom: 2 }}>
                <button onClick={addMenuItem} style={{ ...btn(true), padding: "9px 16px" }}>{t("setup_menu_btn_add")}</button>
              </div>
            </div>
          </div>

          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: C.accent }}>{t("setup_menu_current", { n: form.menu.length })}</h3>
              <button onClick={loadTemplate} style={btn()}>{t("setup_menu_load_tmpl")}</button>
            </div>
            {form.menu.length === 0
              ? <div style={{ color: C.textMuted, textAlign: "center", padding: 32 }}>{t("setup_menu_empty")}</div>
              : <div style={{ display: "grid", gap: 4, maxHeight: 400, overflowY: "auto" }}>
                  {form.menu.map(item => (
                    <div key={item.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr auto", alignItems: "center", gap: 8, padding: "10px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 8, fontSize: 13 }}>
                      <div><div style={{ fontWeight: 600 }}>{item.name}</div><div style={{ fontSize: 11, color: C.textMuted }}>{item.cat}</div></div>
                      <span style={{ fontFamily: mono }}>${item.price}</span>
                      <span style={{ fontFamily: mono }}>{item.daily}{t("setup_per_day")}</span>
                      <span style={{ fontFamily: mono, color: item.shelf <= 4 ? C.red : item.shelf <= 12 ? C.accent : C.textDim }}>
                        {item.shelf === 999 ? t("dash_shelf_stable") : `${item.shelf}h`}
                      </span>
                      <span style={{ fontFamily: mono, fontSize: 11 }}>{perishLabel(item.perish)}</span>
                      <span />
                      <button onClick={() => upd("menu", form.menu.filter(m => m.id !== item.id))} style={{ background: C.redDim, border: "none", color: C.red, borderRadius: 6, padding: "3px 8px", cursor: "pointer", fontSize: 12 }}>{t("setup_delete")}</button>
                    </div>
                  ))}
                </div>
            }
          </div>
        </div>
      )}

      {/* ─── INGREDIENTS ─── */}
      {section === "ingredients" && (
        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 20px" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 12px", color: C.accent }}>{t("setup_ing_add")}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr auto", gap: 8, alignItems: "flex-end" }}>
              {[
                [newIng.name,  v => setNewIng(p=>({...p,name:v})),  t("setup_ing_name"),  "text"],
                [newIng.cost,  v => setNewIng(p=>({...p,cost:v})),  t("setup_ing_cost"),  "number"],
                [newIng.shelf, v => setNewIng(p=>({...p,shelf:v})), t("setup_ing_shelf"), "number"],
                [newIng.cat,   v => setNewIng(p=>({...p,cat:v})),   t("setup_ing_cat"),   "text"],
              ].map(([val, onChange, placeholder, type], i) => (
                <div key={i}><span style={labelSt}>{placeholder}</span>
                  <input style={inp()} type={type} value={val} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
                </div>
              ))}
              <div style={{ paddingBottom: 2 }}>
                <button onClick={addIng} style={{ ...btn(true), padding: "9px 16px" }}>{t("setup_menu_btn_add")}</button>
              </div>
            </div>
          </div>

          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: C.accent }}>{t("setup_ing_current", { n: Object.keys(form.ingredients).length })}</h3>
              <button onClick={loadTemplate} style={btn()}>{t("setup_ing_load_tmpl")}</button>
            </div>
            {Object.keys(form.ingredients).length === 0
              ? <div style={{ color: C.textMuted, textAlign: "center", padding: 32 }}>{t("setup_ing_empty")}</div>
              : <div style={{ display: "grid", gap: 3, maxHeight: 400, overflowY: "auto" }}>
                  {Object.entries(form.ingredients).map(([name, info]) => (
                    <div key={name} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr auto", alignItems: "center", gap: 8, padding: "8px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 6, fontSize: 13 }}>
                      <span style={{ fontWeight: 600 }}>{name}</span>
                      <span style={{ color: C.textDim }}>{info.cat}</span>
                      <span style={{ fontFamily: mono }}>${info.cost}</span>
                      <span style={{ fontFamily: mono, color: info.shelf <= 5 ? C.red : info.shelf <= 14 ? C.accent : C.textDim }}>{info.shelf}{t("setup_ing_days")}</span>
                      <button onClick={() => { const n = { ...form.ingredients }; delete n[name]; upd("ingredients", n); }} style={{ background: C.redDim, border: "none", color: C.red, borderRadius: 6, padding: "3px 8px", cursor: "pointer", fontSize: 12 }}>{t("setup_delete")}</button>
                    </div>
                  ))}
                </div>
            }
          </div>
        </div>
      )}

      {/* ─── ROI PARAMS ─── */}
      {section === "roi" && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 4px", color: C.accent }}>{t("setup_roi_title")}</h3>
          <p style={{ fontSize: 12, color: C.textMuted, margin: "0 0 20px" }}>{t("setup_roi_sub")}</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {[
              ["donutWaste",    t("setup_roi_main_waste")],
              ["sandwichWaste", t("setup_roi_hot_waste")],
              ["bagelWaste",    t("setup_roi_baked_waste")],
              ["donutCost",     t("setup_roi_main_cost")],
              ["sandCost",      t("setup_roi_hot_cost")],
              ["bagelCost",     t("setup_roi_baked_cost")],
              ["donutPrice",    t("setup_roi_main_price")],
            ].map(([k, l]) => (
              <div key={k}><span style={labelSt}>{l}</span>
                <input style={inp()} type="number" step="0.01" value={form[k]} onChange={e => upd(k, +e.target.value)} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
        <button onClick={handleSave} style={{ ...btn(true), padding: "12px 32px", fontSize: 15 }}>
          {saved ? t("setup_saved") + "!" : t("setup_save_all")}
        </button>
      </div>
    </div>
  );
}
