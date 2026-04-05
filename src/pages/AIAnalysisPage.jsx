import { useState } from "react";
import { C, heading, body, mono } from "../theme/colors";
import { analyzeWaste } from "../api/claude";
import { useLang } from "../i18n/LangContext";

const inp = (extra = {}) => ({
  border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px",
  background: "rgba(255,255,255,0.05)", color: C.text, fontFamily: body,
  fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box", ...extra,
});

function MarkdownSection({ text }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return (
    <span>
      {parts.map((p, i) => i % 2 === 1
        ? <strong key={i} style={{ color: C.text }}>{p}</strong>
        : <span key={i}>{p}</span>
      )}
    </span>
  );
}

function ResultCard({ title, content, color = C.accent }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 22px", marginBottom: 14 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color, marginBottom: 10 }}>{title}</div>
      <div style={{ fontSize: 14, color: C.textDim, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
        <MarkdownSection text={content} />
      </div>
    </div>
  );
}

function parseResult(text, t) {
  const patterns = [
    { titleKey: "ai_section_actions",   color: C.red,    regex: /(?:1\.|Top 3|前\s*3|Priority)([\s\S]*?)(?=(?:2\.|Item|品項|🍽|$))/i },
    { titleKey: "ai_section_items",     color: C.accent, regex: /(?:2\.|Item-Specific|各品項)([\s\S]*?)(?=(?:3\.|Inventory|庫存|🧊|$))/i },
    { titleKey: "ai_section_inventory", color: C.blue,   regex: /(?:3\.|Inventory|庫存)([\s\S]*?)(?=(?:4\.|Estimated|預估|💰|$))/i },
    { titleKey: "ai_section_savings",   color: C.green,  regex: /(?:4\.|Estimated|預估)([\s\S]*?)$/i },
  ];

  const sections = [];
  for (const { titleKey, color, regex } of patterns) {
    const match = text.match(regex);
    if (match) sections.push({ title: t(titleKey), content: match[1].trim(), color });
  }
  if (sections.length === 0) {
    sections.push({ title: t("ai_section_full"), content: text, color: C.accent });
  }
  return sections;
}

export function AIAnalysisPage({ restaurant, wasteRecords, claudeKey, setClaudeKey }) {
  const { t, lang } = useLang();
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState(null);
  const [error,    setError]    = useState(null);
  const [showKey,  setShowKey]  = useState(false);

  const totalRecords = wasteRecords.length;
  const totalUnits   = wasteRecords.reduce((s, r) => s + r.totalUnits, 0);
  const totalCost    = wasteRecords.reduce((s, r) => s + r.totalCost,  0);

  const itemTotals = {};
  wasteRecords.forEach(r => r.items.forEach(it => { itemTotals[it.name] = (itemTotals[it.name] || 0) + it.units; }));
  const topItems = Object.entries(itemTotals).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const handleAnalyze = async () => {
    setLoading(true); setError(null); setResult(null);
    try {
      const text = await analyzeWaste(claudeKey, restaurant, wasteRecords, lang);
      setResult(parseResult(text, t));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "24px", maxWidth: 900, margin: "0 auto", color: C.text }}>
      <h2 style={{ fontFamily: heading, fontSize: 22, fontWeight: 800, margin: "0 0 6px" }}>{t("ai_title")}</h2>
      <p style={{ fontSize: 14, color: C.textMuted, margin: "0 0 20px" }}>{t("ai_sub")}</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        {/* Data summary */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 20px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.accent, marginBottom: 12 }}>{t("ai_data_summary")}</div>
          {totalRecords === 0
            ? <div style={{ color: C.textMuted, fontSize: 13, lineHeight: 1.6 }}>{t("ai_no_records")}</div>
            : <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
                {[[t("ai_stat_records"), `${totalRecords}`], [t("ai_stat_waste"), `${totalUnits}`], [t("ai_stat_loss"), `$${totalCost.toFixed(0)}`]].map(([l, v]) => (
                  <div key={l}>
                    <div style={{ fontSize: 11, color: C.textMuted }}>{l}</div>
                    <div style={{ fontFamily: mono, fontWeight: 700, fontSize: 16, color: C.red }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>{t("ai_top_items")}</div>
              {topItems.map(([name, units]) => (
                <div key={name} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                  <span style={{ color: C.textDim }}>{name}</span>
                  <span style={{ fontFamily: mono, color: C.red }}>{units}</span>
                </div>
              ))}
            </>
          }
        </div>

        {/* API Key */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 20px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.accent, marginBottom: 12 }}>{t("ai_key_title")}</div>
          <div style={{ position: "relative", marginBottom: 10 }}>
            <input type={showKey ? "text" : "password"} style={inp({ paddingRight: 60 })} value={claudeKey} onChange={e => setClaudeKey(e.target.value)} placeholder={t("ai_key_ph")} />
            <button onClick={() => setShowKey(p => !p)} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 13 }}>
              {showKey ? t("ai_key_hide") : t("ai_key_show")}
            </button>
          </div>
          <div style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.5 }}>
            {t("ai_key_note")}<span style={{ color: C.accent }}>console.anthropic.com</span>
          </div>
          <div style={{ marginTop: 12, padding: "8px 12px", background: "rgba(245,158,11,0.06)", borderRadius: 8, fontSize: 12, color: C.textDim }}>
            {t("ai_key_usage")}
          </div>
        </div>
      </div>

      {/* Analyze button */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <button onClick={handleAnalyze} disabled={loading || !claudeKey || totalRecords === 0} style={{
          padding: "14px 48px", borderRadius: 12, border: "none", fontSize: 16, fontWeight: 700, fontFamily: body,
          cursor: loading || !claudeKey || totalRecords === 0 ? "not-allowed" : "pointer",
          background: loading ? C.accentDim : claudeKey && totalRecords > 0 ? C.accent : "rgba(255,255,255,0.08)",
          color: claudeKey && totalRecords > 0 ? "#000" : C.textMuted, transition: "all 0.3s",
        }}>
          {loading ? t("ai_analyzing") : t("ai_analyze_btn")}
        </button>
        {!claudeKey         && <div style={{ fontSize: 12, color: C.textMuted, marginTop: 8 }}>{t("ai_no_key")}</div>}
        {claudeKey && totalRecords === 0 && <div style={{ fontSize: 12, color: C.textMuted, marginTop: 8 }}>{t("ai_no_records_btn")}</div>}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "40px", textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 16 }}>🤖</div>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{t("ai_loading_title")}</div>
          <div style={{ fontSize: 13, color: C.textMuted }}>{t("ai_loading_sub")}</div>
          <div style={{ marginTop: 20, display: "flex", justifyContent: "center", gap: 6 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: C.accent, animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
            ))}
          </div>
          <style>{`@keyframes pulse{0%,100%{opacity:0.3;transform:scale(0.8)}50%{opacity:1;transform:scale(1.2)}}`}</style>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ background: C.redDim, border: `1px solid ${C.red}40`, borderRadius: 14, padding: "18px 20px", marginBottom: 16 }}>
          <div style={{ fontWeight: 700, color: C.red, marginBottom: 6 }}>{t("ai_error_title")}</div>
          <div style={{ fontSize: 13, color: C.textDim }}>{error}</div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.green }}>{t("ai_done")}</div>
            <div style={{ fontSize: 12, color: C.textMuted }}>{t("ai_by")} · {new Date().toLocaleString()}</div>
            <button onClick={() => setResult(null)} style={{ marginLeft: "auto", background: "none", border: `1px solid ${C.border}`, color: C.textMuted, borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 12 }}>{t("ai_clear")}</button>
          </div>
          {result.map((s, i) => <ResultCard key={i} title={s.title} content={s.content} color={s.color} />)}
          <div style={{ marginTop: 16, padding: "12px 16px", background: "rgba(255,255,255,0.03)", borderRadius: 10, fontSize: 12, color: C.textMuted }}>
            {t("ai_tip")}
          </div>
        </div>
      )}
    </div>
  );
}
