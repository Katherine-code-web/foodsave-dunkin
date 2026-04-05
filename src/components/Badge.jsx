import { C } from "../theme/colors";

export function Badge({ children, color, bg }) {
  return (
    <span style={{ background: bg, color, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: "0.03em", whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

export function RiskBadge({ score }) {
  return score >= 70
    ? <Badge color={C.red}    bg={C.redDim}>   HIGH {score}</Badge>
    : score >= 40
    ? <Badge color={C.accent} bg={C.accentDim}>MED {score}</Badge>
    : <Badge color={C.green}  bg={C.greenDim}> LOW {score}</Badge>;
}
