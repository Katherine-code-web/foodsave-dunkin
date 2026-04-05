import { useState, useEffect } from "react";
import { C, mono } from "../theme/colors";

export function AnimNum({ value, prefix = "", suffix = "", color = C.lText }) {
  const [d, setD] = useState(0);
  useEffect(() => {
    const start = d, diff = value - start;
    if (Math.abs(diff) < 1) { setD(value); return; }
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const p = 1 - Math.pow(1 - step / 20, 3);
      setD(Math.round(start + diff * p));
      if (step >= 20) clearInterval(timer);
    }, 25);
    return () => clearInterval(timer);
  }, [value]);
  return (
    <span style={{ fontFamily: mono, fontWeight: 700, color, letterSpacing: "-0.02em" }}>
      {prefix}{d.toLocaleString()}{suffix}
    </span>
  );
}
