// ─── Claude API Integration ───

function buildPrompt(restaurant, wasteRecords, lang = "zh") {
  const menu    = restaurant.menu || [];
  const rev     = restaurant.rev  || 0;
  const foodPct = restaurant.foodPct || 30;

  const aggregated = {};
  wasteRecords.forEach(record => {
    record.items.forEach(it => {
      if (!aggregated[it.name]) aggregated[it.name] = { units: 0, reasons: {} };
      aggregated[it.name].units += it.units;
      aggregated[it.name].reasons[it.reason] = (aggregated[it.name].reasons[it.reason] || 0) + 1;
    });
  });

  const topItems = Object.entries(aggregated)
    .sort((a, b) => b[1].units - a[1].units)
    .slice(0, 10)
    .map(([name, data]) => {
      const mi        = menu.find(m => m.name === name);
      const topReason = Object.entries(data.reasons).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
      const estCost   = mi ? data.units * mi.price * 0.35 : 0;
      return `  - ${name}: ${data.units} units, top reason "${topReason}", est. loss $${estCost.toFixed(0)}`;
    }).join("\n");

  const totalUnits = wasteRecords.reduce((s, r) => s + r.totalUnits, 0);
  const totalCost  = wasteRecords.reduce((s, r) => s + r.totalCost,  0);
  const dateRange  = wasteRecords.length > 0
    ? `${wasteRecords[wasteRecords.length - 1].date} to ${wasteRecords[0].date}`
    : "no data";

  const langInstruction = lang === "zh"
    ? "Please respond entirely in Traditional Chinese (繁體中文)."
    : "Please respond entirely in English.";

  return `You are a professional food waste consultant specializing in QSR (quick-service restaurant) ingredient loss analysis.

${langInstruction}

## Restaurant Info
- Name: ${restaurant.name || "Unnamed"}
- Type: ${restaurant.type || "Restaurant"}
- Annual Revenue: $${rev.toLocaleString()}
- Food Cost %: ${foodPct}%

## Waste Data Summary (${dateRange}, ${wasteRecords.length} records)
- Total waste: ${totalUnits} units
- Estimated loss: $${totalCost.toFixed(0)}

## Top 10 Wasted Items
${topItems || "No data"}

## Provide the following analysis with clear section headers:

**1. Top 3 Priority Actions**
For the most critical waste issues, provide 3 specific, immediately actionable steps. For each include:
- Specific action to take
- Estimated waste reduction %
- Implementation difficulty (Low/Medium/High)

**2. Item-Specific Suggestions**
For the top 5 wasted items, provide 1-2 specific improvement suggestions each.

**3. Inventory & Production Management**
Based on the waste reason distribution, suggest optimizations for ordering frequency and production scheduling.

**4. Estimated Annual Savings**
Based on the above recommendations, estimate the potential annual savings if implemented.

Keep recommendations specific and actionable. Avoid vague generalizations.`;
}

export async function analyzeWaste(apiKey, restaurant, wasteRecords, lang = "zh") {
  if (!apiKey)               throw new Error(lang === "zh" ? "請提供 Claude API Key" : "Please provide your Claude API Key");
  if (wasteRecords.length === 0) throw new Error(lang === "zh" ? "請先輸入至少一筆浪費記錄" : "Please add at least one waste record first");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-opus-4-6",
      max_tokens: 1800,
      messages: [{ role: "user", content: buildPrompt(restaurant, wasteRecords, lang) }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error ${response.status}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text || "";
}
