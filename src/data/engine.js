// ─── Analytics Engine ───
// All calculation functions — accept restaurant data, not hardcoded constants

export const STRATS = [
  { id:"production",  icon:"📉", name:"減少過量生產",      desc:"根據需求預測調整每日生產量",     max:30, cost:500,  costLabel:"預測軟體" },
  { id:"markdown",    icon:"🏷️", name:"折扣促銷剩餘品項", desc:"收攤前對剩餘品項提供折扣",       max:50, cost:200,  costLabel:"標示更新" },
  { id:"buildtoorder",icon:"🥪", name:"按需組裝製作",      desc:"備妥食材，接單後再組裝完成",     max:80, cost:1200, costLabel:"作業流程培訓" },
  { id:"inventory",   icon:"🧊", name:"智慧庫存管理",      desc:"縮短叫貨週期，減少易腐食材備貨", max:40, cost:800,  costLabel:"庫存追蹤系統" },
  { id:"donation",    icon:"🤝", name:"捐贈計劃",          desc:"將剩餘食物捐贈給食物銀行（可抵稅）",max:60,cost:300, costLabel:"合作夥伴設置" },
];

export const PRESETS = [
  { label:"保守", emoji:"🐢", v:{ production:10, markdown:20, buildtoorder:30, inventory:15, donation:20 } },
  { label:"適中", emoji:"⚖️", v:{ production:20, markdown:35, buildtoorder:60, inventory:30, donation:40 } },
  { label:"積極", emoji:"🚀", v:{ production:30, markdown:50, buildtoorder:80, inventory:40, donation:60 } },
];

// Waste simulation — accepts a menu array (restaurant.menu)
export function simulate(menu, seed = 42) {
  let s = seed;
  const r = () => { s = (s * 16807) % 2147483647; return (s & 0x7fffffff) / 0x7fffffff; };
  return menu.map(item => {
    const base = item.perish === "very_high" ? 0.12+r()*0.15
               : item.perish === "high"      ? 0.08+r()*0.12
               : item.perish === "medium"    ? 0.04+r()*0.06
               :                              0.01+r()*0.03;
    const wasted = Math.round(item.daily * base);
    const risk = Math.min(100, Math.round(
      (item.shelf <= 4 ? 45 : item.shelf <= 12 ? 30 : item.shelf <= 18 ? 15 : 5)
      + base * 200
      + (item.daily > 50 ? 10 : 0)
    ));
    return {
      ...item,
      wasteRate: Math.round(base * 1000) / 10,
      wasted,
      dailyLoss: Math.round(wasted * item.price * 0.35 * 100) / 100,
      monthlyLoss: Math.round(wasted * item.price * 0.35 * 30),
      risk,
    };
  });
}

// ROI calculation — accepts restaurant config and slider values
export function calcROI(restaurant, sl) {
  const rev      = restaurant.rev;
  const foodPct  = (restaurant.foodPct || 30) / 100;
  const laborPct = (restaurant.laborPct || 28) / 100;
  const rentPct  = (restaurant.rentPct  || 10) / 100;
  const otherPct = (restaurant.otherPct || 12) / 100;

  const donutWaste    = restaurant.donutWaste    ?? 280;
  const sandwichWaste = restaurant.sandwichWaste ?? 25;
  const bagelWaste    = restaurant.bagelWaste    ?? 30;
  const donutCost     = restaurant.donutCost     ?? 0.32;
  const sandCost      = restaurant.sandCost      ?? 1.85;
  const bagelCost     = restaurant.bagelCost     ?? 0.55;
  const donutPrice    = restaurant.donutPrice    ?? 1.49;

  const donutW = donutWaste * donutCost * 365;
  const sandW  = sandwichWaste * sandCost * 365;
  const bagelW = bagelWaste * bagelCost * 365;
  const ingW   = rev * foodPct * 0.04;
  const totalW = donutW + sandW + bagelW + ingW;

  const cutDonuts  = donutWaste * (sl.production / 100);
  const saveProd   = cutDonuts * donutCost * 365;
  const remain     = donutWaste - cutDonuts;
  const recovered  = remain * (sl.markdown / 100);
  const markRev    = recovered * donutPrice * 0.5 * 365;
  const markSave   = recovered * donutCost * 365;
  const sandSave   = sandW * (sl.buildtoorder / 100);
  const ingSave    = ingW * (sl.inventory / 100);
  const directSave = saveProd + markSave + sandSave + ingSave;
  const leftover   = totalW - directSave;
  const donated    = Math.max(0, leftover * (sl.donation / 100));
  const taxBen     = donated * 0.15;
  const totalBen   = directSave + markRev + taxBen;
  const implCost   = STRATS.reduce((s, st) => s + (sl[st.id] > 0 ? st.cost : 0), 0);
  const curProfit  = rev * (1 - foodPct - laborPct - rentPct - otherPct);
  const newProfit  = curProfit + totalBen;
  const profitUp   = ((newProfit - curProfit) / curProfit) * 100;
  const payback    = totalBen > 0 ? Math.max(0.5, implCost / (totalBen / 12)) : Infinity;
  const rescued    = Math.round(
    cutDonuts + recovered
    + (sandwichWaste * sl.buildtoorder / 100)
    + (leftover > 0 ? (leftover / 365 / donutCost) * sl.donation / 100 : 0)
  );
  const newWR = Math.max(0, Math.round(((totalW - directSave - donated) / (rev * foodPct)) * 1000) / 10);
  const curWR = Math.round((totalW / (rev * foodPct)) * 1000) / 10;
  const monthly = Array.from({ length: 12 }, (_, i) => ({
    m: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
    cur: Math.round(totalW / 12 * (0.9 + Math.sin(i * 0.8) * 0.15)),
    opt: Math.round(Math.max(0, totalW - directSave - donated) / 12 * (0.9 + Math.sin(i * 0.8) * 0.15)),
  }));

  return {
    totalW: Math.round(totalW), totalBen: Math.round(totalBen), implCost,
    curProfit: Math.round(curProfit), newProfit: Math.round(newProfit),
    profitUp: Math.round(profitUp * 10) / 10,
    payback: Math.round(payback * 10) / 10,
    rescued, newWR, curWR,
    saveProd: Math.round(saveProd), markRev: Math.round(markRev),
    markSave: Math.round(markSave), sandSave: Math.round(sandSave),
    ingSave: Math.round(ingSave), taxBen: Math.round(taxBen),
    donated: Math.round(donated), directSave: Math.round(directSave),
    curFood: Math.round(rev * foodPct),
    newFood: Math.round(rev * foodPct - directSave),
    monthly,
  };
}
