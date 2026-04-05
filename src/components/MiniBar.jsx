import { C } from "../theme/colors";

export function MiniBar({ value, max = 100, color = C.accent, h = 6 }) {
  return (
    <div style={{ width: "100%", height: h, background: "rgba(255,255,255,0.05)", borderRadius: h, overflow: "hidden" }}>
      <div style={{ width: `${Math.min(100, (value / max) * 100)}%`, height: "100%", background: color, borderRadius: h, transition: "width 0.5s ease" }} />
    </div>
  );
}
