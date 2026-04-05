import { C, heading, body, mono } from "../theme/colors";
import { useLang } from "../i18n/LangContext";
import { T } from "../i18n/translations";

export function AboutPage() {
  const { lang, t } = useLang();

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 32px", color: C.text }}>
      <h2 style={{ fontFamily: heading, fontSize: 28, fontWeight: 800, marginTop: 0, marginBottom: 8 }}>{t("about_title")}</h2>
      <p style={{ fontSize: 15, color: C.textDim, lineHeight: 1.8, marginBottom: 28 }}>{t("about_intro")}</p>

      {/* How to use */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 12px", color: C.accent }}>{t("about_how_title")}</h3>
        {T.about_how.map((item, i) => {
          const [title, desc] = item[lang] || item["zh"];
          return (
            <div key={i} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: i < T.about_how.length - 1 ? `1px solid ${C.border}` : "none" }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>{title}</div>
              <div style={{ fontSize: 13, color: C.textDim, lineHeight: 1.5 }}>{desc}</div>
            </div>
          );
        })}
      </div>

      {/* Sources */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 12px", color: C.accent }}>{t("about_sources_title")}</h3>
        {T.about_sources.map((item, i) => {
          const [title, desc] = item[lang] || item["zh"];
          return (
            <div key={i} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: i < T.about_sources.length - 1 ? `1px solid ${C.border}` : "none" }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>{title}</div>
              <div style={{ fontSize: 13, color: C.textDim, lineHeight: 1.5 }}>{desc}</div>
            </div>
          );
        })}
      </div>

      {/* Methodology */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 12px", color: C.accent }}>{t("about_method_title")}</h3>
        <p style={{ fontSize: 13, color: C.textDim, lineHeight: 1.7, margin: "0 0 12px" }}>{t("about_method_intro")}</p>
        {T.about_method.map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
            <span style={{ color: C.accent, fontWeight: 800, fontFamily: mono, fontSize: 13, flexShrink: 0 }}>{String(i + 1).padStart(2, "0")}</span>
            <span style={{ fontSize: 13, color: C.textDim, lineHeight: 1.5 }}>{item[lang] || item["zh"]}</span>
          </div>
        ))}
      </div>

      {/* Privacy */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 12px", color: C.accent }}>{t("about_privacy_title")}</h3>
        <p style={{ fontSize: 13, color: C.textDim, lineHeight: 1.7, margin: 0 }}>{t("about_privacy")}</p>
      </div>

      {/* Limitations */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px" }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 12px", color: C.accent }}>{t("about_limits_title")}</h3>
        <p style={{ fontSize: 13, color: C.textDim, lineHeight: 1.7, margin: 0 }}>{t("about_limits")}</p>
      </div>
    </div>
  );
}
