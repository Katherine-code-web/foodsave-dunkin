import { useState } from "react";
import { C, heading, body } from "./theme/colors";
import { useStore } from "./store/useStore";
import { useLang } from "./i18n/LangContext";
import { DashboardPage }  from "./pages/DashboardPage";
import { ROIPage }        from "./pages/ROIPage";
import { SetupPage }      from "./pages/SetupPage";
import { WasteInputPage } from "./pages/WasteInputPage";
import { AIAnalysisPage } from "./pages/AIAnalysisPage";
import { AboutPage }      from "./pages/AboutPage";

export default function App() {
  const [page, setPage] = useState("dashboard");
  const { lang, toggle: toggleLang, t } = useLang();

  const {
    restaurant, setRestaurant,
    wasteRecords, addWasteRecord, deleteWasteRecord,
    roiSliders, setROISliders,
    claudeKey, setClaudeKey,
  } = useStore();

  const NAV = [
    { id: "dashboard", label: t("nav_dashboard"), icon: "📊" },
    { id: "roi",       label: t("nav_roi"),        icon: "💰" },
    { id: "waste",     label: t("nav_waste"),       icon: "📝" },
    { id: "ai",        label: t("nav_ai"),          icon: "🤖" },
    { id: "setup",     label: t("nav_setup"),       icon: "⚙️" },
    { id: "about",     label: t("nav_about"),       icon: "📚" },
  ];

  const isLight = page === "roi";
  const bg      = isLight ? C.lBg  : C.bg;
  const textCol = isLight ? C.lText : C.text;

  return (
    <div style={{ fontFamily: body, background: bg, color: textCol, minHeight: "100vh", transition: "background 0.4s" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Source+Sans+3:wght@400;600;700;800&family=IBM+Plex+Mono:wght@500;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{
        background: isLight ? "#fff" : "linear-gradient(135deg,#1C1917,#292524)",
        borderBottom: `1px solid ${isLight ? C.lBorder : C.border}`,
        padding: "16px 32px",
        transition: "all 0.4s",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 24 }}>🍃</span>
              <div>
                <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, fontFamily: heading, letterSpacing: "-0.02em" }}>
                  <span style={{ background: "linear-gradient(135deg,#F59E0B,#34D399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    {t("site_name")}
                  </span>
                </h1>
                <div style={{ fontSize: 11, color: isLight ? C.lTextLight : C.textMuted, marginTop: 1 }}>
                  {restaurant.name
                    ? <><span style={{ color: isLight ? C.lAccent : C.accent, fontWeight: 700 }}>{restaurant.name}</span> · {restaurant.type || t("type_other")}</>
                    : t("header_no_setup")}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* Record count pill */}
              {wasteRecords.length > 0 && (
                <div style={{
                  fontSize: 12, color: isLight ? C.lTextMid : C.textDim,
                  background: isLight ? "#F7F5F2" : "rgba(255,255,255,0.06)",
                  padding: "6px 14px", borderRadius: 20,
                }}>
                  📝 {wasteRecords.length} {t("header_records")}
                </div>
              )}

              {/* Language toggle */}
              <button onClick={toggleLang} style={{
                padding: "6px 14px", borderRadius: 20, border: `1px solid ${isLight ? C.lBorder : C.border}`,
                background: "transparent", cursor: "pointer", fontFamily: body,
                fontSize: 13, fontWeight: 700, letterSpacing: "0.04em",
                color: isLight ? C.lAccent : C.accent,
                transition: "all 0.2s",
              }}>
                {lang === "zh" ? "EN" : "中文"}
              </button>
            </div>
          </div>

          {/* Nav */}
          <div style={{ display: "flex", gap: 2, background: isLight ? "rgba(0,0,0,0.04)" : "rgba(0,0,0,0.3)", borderRadius: 10, padding: 3, overflowX: "auto" }}>
            {NAV.map(p => (
              <button key={p.id} onClick={() => setPage(p.id)} style={{
                padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: 600, fontFamily: body, whiteSpace: "nowrap",
                transition: "all 0.2s",
                background: page === p.id ? (isLight ? "#FFF0E6" : C.accentDim) : "transparent",
                color: page === p.id ? (isLight ? C.lAccent : C.accent) : (isLight ? C.lTextMid : C.textMuted),
              }}>
                {p.icon} {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pages */}
      {page === "dashboard" && <DashboardPage restaurant={restaurant} />}
      {page === "roi"       && <ROIPage restaurant={restaurant} roiSliders={roiSliders} setROISliders={setROISliders} />}
      {page === "waste"     && <WasteInputPage restaurant={restaurant} wasteRecords={wasteRecords} addWasteRecord={addWasteRecord} deleteWasteRecord={deleteWasteRecord} />}
      {page === "ai"        && <AIAnalysisPage restaurant={restaurant} wasteRecords={wasteRecords} claudeKey={claudeKey} setClaudeKey={setClaudeKey} />}
      {page === "setup"     && <SetupPage restaurant={restaurant} setRestaurant={setRestaurant} onSave={() => setPage("dashboard")} />}
      {page === "about"     && <AboutPage />}

      {/* Footer */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 32px" }}>
        <div style={{ borderTop: `1px solid ${isLight ? C.lBorder : C.border}`, paddingTop: 14, textAlign: "center", fontSize: 11, color: isLight ? C.lTextLight : C.textMuted }}>
          {t("footer")}
        </div>
      </div>
    </div>
  );
}
