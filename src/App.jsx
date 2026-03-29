import { useState, useMemo, useEffect, useRef } from "react";

/* ══════════════════════════════════════════════════════════════════
   FoodSave × Dunkin' — Complete Food Waste Analytics Platform
   Integrated: Waste Analysis Dashboard + ROI Simulator
   Author: Katherine | Research Project
   ══════════════════════════════════════════════════════════════════ */

// ─── Color System ───
const C = {
  bg: "#0C0A09", bgAlt: "#1C1917", card: "#1C1917", cardHover: "#292524",
  border: "rgba(245,158,11,0.12)", borderHover: "rgba(245,158,11,0.25)",
  accent: "#F59E0B", accentDim: "rgba(245,158,11,0.15)", accentDark: "#D97706",
  pink: "#FB7185", pinkDim: "rgba(251,113,133,0.12)",
  green: "#34D399", greenDim: "rgba(52,211,153,0.12)", greenDark: "#059669",
  blue: "#60A5FA", blueDim: "rgba(96,165,250,0.12)",
  red: "#EF4444", redDim: "rgba(239,68,68,0.12)",
  text: "#FAFAF9", textDim: "#A8A29E", textMuted: "#78716C",
  // Light mode for ROI page
  lBg: "#FAFAF8", lCard: "#FFFFFF", lBorder: "#E8E4DF",
  lAccent: "#D4641B", lGreen: "#1A7A4C", lGreenLight: "#E6F5ED",
  lRed: "#C53030", lRedLight: "#FEE5E5", lText: "#1A1814",
  lTextMid: "#5C564D", lTextLight: "#8A847A", lWarm: "#F5F0EA",
};
const heading = "'Playfair Display', Georgia, serif";
const body = "'Source Sans 3', 'Segoe UI', sans-serif";
const mono = "'IBM Plex Mono', 'SF Mono', monospace";

// ══════════════════════════════════════════════
// SECTION 1: MENU DATA & ANALYTICS ENGINE
// ══════════════════════════════════════════════

const MENU = [
  { id:1, name:"Glazed Donut", cat:"Donuts", price:1.09, daily:120, shelf:12, ing:["Flour","Sugar","Palm Oil","Yeast","Eggs","Milk Powder"], perish:"high" },
  { id:2, name:"Boston Kreme", cat:"Donuts", price:1.69, daily:60, shelf:10, ing:["Flour","Sugar","Palm Oil","Yeast","Eggs","Vanilla Custard","Chocolate Icing"], perish:"high" },
  { id:3, name:"Chocolate Frosted", cat:"Donuts", price:1.49, daily:55, shelf:12, ing:["Flour","Sugar","Palm Oil","Yeast","Eggs","Chocolate Icing"], perish:"high" },
  { id:4, name:"Strawberry Frosted", cat:"Donuts", price:1.69, daily:45, shelf:12, ing:["Flour","Sugar","Palm Oil","Yeast","Eggs","Strawberry Icing","Sprinkles"], perish:"high" },
  { id:5, name:"Jelly Donut", cat:"Donuts", price:1.49, daily:50, shelf:10, ing:["Flour","Sugar","Palm Oil","Yeast","Eggs","Jelly Filling"], perish:"high" },
  { id:6, name:"Old Fashioned Cake", cat:"Donuts", price:1.29, daily:40, shelf:14, ing:["Flour","Sugar","Buttermilk","Egg Yolk","Soybean Oil"], perish:"medium" },
  { id:7, name:"Munchkins® 25ct", cat:"Donuts", price:6.49, daily:20, shelf:10, ing:["Flour","Sugar","Palm Oil","Yeast","Eggs"], perish:"high" },
  { id:8, name:"Plain Bagel", cat:"Bagels", price:1.39, daily:60, shelf:18, ing:["Flour","Water","Sugar","Yeast","Salt","Malt"], perish:"medium" },
  { id:9, name:"Everything Bagel", cat:"Bagels", price:1.79, daily:50, shelf:18, ing:["Flour","Water","Yeast","Sesame Seeds","Onion","Garlic"], perish:"medium" },
  { id:10, name:"Blueberry Muffin", cat:"Bagels", price:2.29, daily:30, shelf:16, ing:["Flour","Sugar","Butter","Eggs","Blueberries","Milk"], perish:"medium" },
  { id:11, name:"Croissant", cat:"Bagels", price:2.49, daily:35, shelf:12, ing:["Flour","Butter","Sugar","Yeast","Eggs","Milk"], perish:"high" },
  { id:12, name:"Bacon Egg & Cheese", cat:"Sandwiches", price:4.49, daily:45, shelf:4, ing:["Bacon","Eggs","Cheese","Croissant","Butter"], perish:"very_high" },
  { id:13, name:"Sausage Egg & Cheese", cat:"Sandwiches", price:4.49, daily:35, shelf:4, ing:["Sausage","Eggs","Cheese","English Muffin"], perish:"very_high" },
  { id:14, name:"Turkey Sausage Wrap", cat:"Sandwiches", price:4.79, daily:20, shelf:4, ing:["Turkey Sausage","Eggs","Cheese","Tortilla"], perish:"very_high" },
  { id:15, name:"Wake-Up Wrap", cat:"Sandwiches", price:3.99, daily:30, shelf:4, ing:["Bacon","Eggs","Cheese","Tortilla"], perish:"very_high" },
  { id:16, name:"Avocado Toast", cat:"Sandwiches", price:4.29, daily:15, shelf:3, ing:["Sourdough","Avocado","Seasoning"], perish:"very_high" },
  { id:17, name:"Hash Browns", cat:"Sandwiches", price:3.29, daily:50, shelf:2, ing:["Potatoes","Vegetable Oil","Salt"], perish:"very_high" },
  { id:18, name:"Iced Coffee (M)", cat:"Beverages", price:3.49, daily:200, shelf:999, ing:["Coffee Beans","Water","Milk"], perish:"low" },
  { id:19, name:"Latte (M)", cat:"Beverages", price:4.99, daily:80, shelf:999, ing:["Espresso","Milk","Sugar Syrup"], perish:"low" },
  { id:20, name:"Matcha Latte", cat:"Beverages", price:5.29, daily:25, shelf:999, ing:["Matcha Powder","Milk","Sugar"], perish:"low" },
  { id:21, name:"Refresher", cat:"Beverages", price:4.09, daily:35, shelf:999, ing:["Green Tea","Fruit Concentrate"], perish:"low" },
];

const ING_DB = {
  "Flour":{cost:0.45,shelf:180,cat:"Dry"}, "Sugar":{cost:0.55,shelf:730,cat:"Dry"}, "Palm Oil":{cost:2.1,shelf:365,cat:"Oil"},
  "Yeast":{cost:4.8,shelf:120,cat:"Leaven"}, "Eggs":{cost:3.5,shelf:21,cat:"Dairy"}, "Milk Powder":{cost:8.5,shelf:365,cat:"Dry"},
  "Milk":{cost:4.2,shelf:7,cat:"Dairy"}, "Butter":{cost:5,shelf:30,cat:"Dairy"}, "Buttermilk":{cost:3.8,shelf:14,cat:"Dairy"},
  "Egg Yolk":{cost:4.2,shelf:2,cat:"Dairy"}, "Vanilla Custard":{cost:6,shelf:3,cat:"Prepared"}, "Chocolate Icing":{cost:3.2,shelf:30,cat:"Topping"},
  "Strawberry Icing":{cost:3.4,shelf:30,cat:"Topping"}, "Jelly Filling":{cost:2.8,shelf:60,cat:"Topping"}, "Sprinkles":{cost:5.5,shelf:365,cat:"Topping"},
  "Blueberries":{cost:4.5,shelf:5,cat:"Produce"}, "Soybean Oil":{cost:3.5,shelf:365,cat:"Oil"}, "Water":{cost:0,shelf:9999,cat:"Utility"},
  "Salt":{cost:0.5,shelf:9999,cat:"Dry"}, "Malt":{cost:3,shelf:365,cat:"Dry"}, "Sesame Seeds":{cost:6,shelf:180,cat:"Dry"},
  "Onion":{cost:1,shelf:30,cat:"Produce"}, "Garlic":{cost:3,shelf:21,cat:"Produce"},
  "Bacon":{cost:7.5,shelf:7,cat:"Protein"}, "Sausage":{cost:5.2,shelf:5,cat:"Protein"}, "Turkey Sausage":{cost:6,shelf:5,cat:"Protein"},
  "Cheese":{cost:4.5,shelf:21,cat:"Dairy"}, "Croissant":{cost:1.2,shelf:2,cat:"Bread"}, "English Muffin":{cost:0.47,shelf:5,cat:"Bread"},
  "Tortilla":{cost:0.25,shelf:14,cat:"Bread"}, "Sourdough":{cost:0.58,shelf:3,cat:"Bread"}, "Avocado":{cost:1.5,shelf:3,cat:"Produce"},
  "Seasoning":{cost:5,shelf:365,cat:"Dry"}, "Potatoes":{cost:0.8,shelf:14,cat:"Produce"}, "Vegetable Oil":{cost:3.2,shelf:365,cat:"Oil"},
  "Coffee Beans":{cost:12,shelf:30,cat:"Beverage"}, "Espresso":{cost:15,shelf:21,cat:"Beverage"}, "Sugar Syrup":{cost:4.5,shelf:180,cat:"Beverage"},
  "Matcha Powder":{cost:25,shelf:120,cat:"Beverage"}, "Green Tea":{cost:8,shelf:365,cat:"Beverage"}, "Fruit Concentrate":{cost:6,shelf:60,cat:"Beverage"},
};

function simulate(seed = 42) {
  let s = seed;
  const r = () => { s = (s * 16807) % 2147483647; return (s & 0x7fffffff) / 0x7fffffff; };
  return MENU.map(item => {
    const base = item.perish === "very_high" ? 0.12+r()*0.15 : item.perish === "high" ? 0.08+r()*0.12 : item.perish === "medium" ? 0.04+r()*0.06 : 0.01+r()*0.03;
    const wasted = Math.round(item.daily * base);
    const risk = Math.min(100, Math.round((item.shelf <= 4 ? 45 : item.shelf <= 12 ? 30 : item.shelf <= 18 ? 15 : 5) + base * 200 + (item.daily > 50 ? 10 : 0)));
    return { ...item, wasteRate: Math.round(base*1000)/10, wasted, dailyLoss: Math.round(wasted*item.price*0.35*100)/100, monthlyLoss: Math.round(wasted*item.price*0.35*30), risk };
  });
}

const HOURLY = [
  {h:"5AM",prod:95,sales:30},{h:"6AM",prod:20,sales:65},{h:"7AM",prod:30,sales:90},{h:"8AM",prod:25,sales:85},
  {h:"9AM",prod:15,sales:55},{h:"10AM",prod:10,sales:40},{h:"11AM",prod:5,sales:30},{h:"12PM",prod:15,sales:45},
  {h:"1PM",prod:5,sales:25},{h:"2PM",prod:0,sales:18},{h:"3PM",prod:0,sales:15},{h:"4PM",prod:0,sales:10},
  {h:"5PM",prod:0,sales:8},{h:"Close",prod:0,sales:0},
];

// ══════════════════════════════════════════════
// SECTION 2: ROI ENGINE
// ══════════════════════════════════════════════

const BASE = { rev: 1_050_000, foodPct: 0.30, laborPct: 0.28, rentPct: 0.10, otherPct: 0.12, donutWaste: 280, sandwichWaste: 25, bagelWaste: 30, donutCost: 0.32, sandCost: 1.85, bagelCost: 0.55, donutPrice: 1.49 };

const STRATS = [
  { id:"production", icon:"📉", name:"Reduce Overproduction", desc:"Produce fewer donuts based on demand forecast", max:30, cost:500, costLabel:"Forecasting software" },
  { id:"markdown", icon:"🏷️", name:"Late-Day Markdown", desc:"50% off remaining donuts after 2 PM", max:50, cost:200, costLabel:"Signage & POS update" },
  { id:"buildtoorder", icon:"🥪", name:"Build-to-Order Sandwiches", desc:"Prep ingredients, assemble on order only", max:80, cost:1200, costLabel:"Workflow training" },
  { id:"inventory", icon:"🧊", name:"Smart Inventory", desc:"Smaller, frequent orders for perishables", max:40, cost:800, costLabel:"Tracking system" },
  { id:"donation", icon:"🤝", name:"Donation Program", desc:"Donate surplus to food banks (tax deduction)", max:60, cost:300, costLabel:"Partnership setup" },
];

function calcROI(sl) {
  const B = BASE;
  const donutW = B.donutWaste*B.donutCost*365, sandW = B.sandwichWaste*B.sandCost*365, bagelW = B.bagelWaste*B.bagelCost*365;
  const ingW = B.rev*B.foodPct*0.04;
  const totalW = donutW+sandW+bagelW+ingW;

  const cutDonuts = B.donutWaste*(sl.production/100);
  const saveProd = cutDonuts*B.donutCost*365;
  const remain = B.donutWaste - cutDonuts;
  const recovered = remain*(sl.markdown/100);
  const markRev = recovered*B.donutPrice*0.5*365;
  const markSave = recovered*B.donutCost*365;
  const sandSave = sandW*(sl.buildtoorder/100);
  const ingSave = ingW*(sl.inventory/100);
  const directSave = saveProd+markSave+sandSave+ingSave;
  const leftover = totalW - directSave;
  const donated = Math.max(0, leftover*(sl.donation/100));
  const taxBen = donated*0.15;
  const totalBen = directSave+markRev+taxBen;
  const implCost = STRATS.reduce((s,st) => s + (sl[st.id]>0?st.cost:0), 0);
  const curProfit = B.rev*(1-B.foodPct-B.laborPct-B.rentPct-B.otherPct);
  const newProfit = curProfit+totalBen;
  const profitUp = ((newProfit-curProfit)/curProfit)*100;
  const payback = totalBen>0 ? Math.max(0.5, implCost/(totalBen/12)) : Infinity;
  const rescued = Math.round(cutDonuts+recovered+(B.sandwichWaste*sl.buildtoorder/100)+(leftover>0?(leftover/365/B.donutCost)*sl.donation/100:0));
  const newWR = Math.max(0, Math.round(((totalW-directSave-donated)/(B.rev*B.foodPct))*1000)/10);
  const curWR = Math.round((totalW/(B.rev*B.foodPct))*1000)/10;
  const monthly = Array.from({length:12},(_,i) => ({
    m:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
    cur: Math.round(totalW/12*(0.9+Math.sin(i*0.8)*0.15)),
    opt: Math.round(Math.max(0,totalW-directSave-donated)/12*(0.9+Math.sin(i*0.8)*0.15)),
  }));

  return { totalW:Math.round(totalW), totalBen:Math.round(totalBen), implCost, curProfit:Math.round(curProfit), newProfit:Math.round(newProfit),
    profitUp:Math.round(profitUp*10)/10, payback:Math.round(payback*10)/10, rescued, newWR, curWR,
    saveProd:Math.round(saveProd), markRev:Math.round(markRev), markSave:Math.round(markSave), sandSave:Math.round(sandSave), ingSave:Math.round(ingSave), taxBen:Math.round(taxBen),
    donated:Math.round(donated), directSave:Math.round(directSave), curFood:Math.round(B.rev*B.foodPct), newFood:Math.round(B.rev*B.foodPct-directSave), monthly };
}

// ══════════════════════════════════════════════
// SECTION 3: SHARED COMPONENTS
// ══════════════════════════════════════════════

function Badge({children, color, bg}) {
  return <span style={{background:bg,color,padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700,letterSpacing:"0.03em",whiteSpace:"nowrap"}}>{children}</span>;
}
function RiskBadge({score}) {
  return score>=70 ? <Badge color={C.red} bg={C.redDim}>HIGH {score}</Badge> : score>=40 ? <Badge color={C.accent} bg={C.accentDim}>MED {score}</Badge> : <Badge color={C.green} bg={C.greenDim}>LOW {score}</Badge>;
}
function MiniBar({value, max=100, color=C.accent, h=6}) {
  return <div style={{width:"100%",height:h,background:"rgba(255,255,255,0.05)",borderRadius:h,overflow:"hidden"}}><div style={{width:`${Math.min(100,(value/max)*100)}%`,height:"100%",background:color,borderRadius:h,transition:"width 0.5s ease"}}/></div>;
}
function StatCard({icon,label,value,sub,accent=C.accent}) {
  return <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"18px 20px"}}>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}><span style={{fontSize:18}}>{icon}</span><span style={{fontSize:11,color:C.textMuted,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em"}}>{label}</span></div>
    <div style={{fontSize:26,fontWeight:800,color:accent,fontFamily:mono,letterSpacing:"-0.02em"}}>{value}</div>
    {sub && <div style={{fontSize:12,color:C.textDim,marginTop:4}}>{sub}</div>}
  </div>;
}
function AnimNum({value, prefix="", suffix="", color=C.lText}) {
  const [d, setD] = useState(0);
  useEffect(() => {
    const start=d, diff=value-start; if(Math.abs(diff)<1){setD(value);return;}
    let step=0; const timer=setInterval(()=>{step++;const p=1-Math.pow(1-step/20,3);setD(Math.round(start+diff*p));if(step>=20)clearInterval(timer);},25);
    return ()=>clearInterval(timer);
  }, [value]);
  return <span style={{fontFamily:mono,fontWeight:700,color,letterSpacing:"-0.02em"}}>{prefix}{d.toLocaleString()}{suffix}</span>;
}

// ══════════════════════════════════════════════
// PAGE 1: WASTE ANALYSIS DASHBOARD (Dark)
// ══════════════════════════════════════════════

function DashboardPage() {
  const [tab, setTab] = useState("overview");
  const [catF, setCatF] = useState("All");
  const [sortK, setSortK] = useState("risk");
  const [simDay, setSimDay] = useState(1);
  const data = useMemo(() => simulate(simDay*7), [simDay]);
  const cats = ["All",...new Set(MENU.map(m=>m.cat))];
  const filtered = data.filter(d=>catF==="All"||d.cat===catF).sort((a,b)=>(b[sortK]||0)-(a[sortK]||0));
  const totalML = data.reduce((s,d)=>s+d.monthlyLoss,0);
  const totalW = data.reduce((s,d)=>s+d.wasted,0);
  const avgWR = Math.round(data.reduce((s,d)=>s+d.wasteRate,0)/data.length*10)/10;
  const highR = data.filter(d=>d.risk>=65).length;

  const tabs = [{id:"overview",label:"Overview",icon:"📊"},{id:"menu",label:"Menu Items",icon:"🍩"},{id:"ingredients",label:"Ingredients",icon:"🧊"},{id:"timeline",label:"Daily Flow",icon:"⏰"}];

  // Donut chart for categories
  const catWaste = {};
  data.forEach(d => { catWaste[d.cat] = (catWaste[d.cat]||0) + d.monthlyLoss; });
  const catEntries = Object.entries(catWaste).sort((a,b)=>b[1]-a[1]);
  const catTotal = catEntries.reduce((s,e)=>s+e[1],0);
  const palette = [C.accent, C.pink, C.blue, C.green];
  let off = 0;
  const segs = catEntries.map(([cat,val],i)=>{const pct=(val/catTotal)*100;const seg={cat,pct,val,color:palette[i%4],offset:off};off+=pct;return seg;});

  // Ingredient risk
  const ingMap = {};
  data.forEach(item => item.ing.forEach(ig => {
    if(!ingMap[ig]) ingMap[ig]={dishes:[],waste:0};
    ingMap[ig].dishes.push(item.name); ingMap[ig].waste+=item.monthlyLoss;
  }));
  const ingList = Object.entries(ingMap).map(([name,info])=>{
    const db=ING_DB[name]||{}; const sh=db.shelf||30;
    const rs=Math.min(100,Math.round((sh<=3?50:sh<=7?35:sh<=21?20:sh<=60?10:3)+(info.dishes.length===1?25:info.dishes.length<=3?10:0)+Math.min(25,info.waste/80)));
    return{name,...db,...info,risk:rs,dc:info.dishes.length};
  }).filter(i=>i.shelf&&i.shelf<365).sort((a,b)=>b.risk-a.risk).slice(0,12);

  return (
    <div style={{padding:"20px 24px",maxWidth:1100,margin:"0 auto"}}>
      {/* Sub-nav */}
      <div style={{display:"flex",gap:3,marginBottom:20,background:"rgba(0,0,0,0.3)",borderRadius:10,padding:3,overflowX:"auto"}}>
        {tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"8px 16px",borderRadius:8,border:"none",cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:body,whiteSpace:"nowrap",background:tab===t.id?C.accentDim:"transparent",color:tab===t.id?C.accent:C.textMuted,transition:"all 0.2s"}}>{t.icon} {t.label}</button>)}
      </div>

      {/* Day slider */}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20,background:C.card,padding:"10px 16px",borderRadius:10,border:`1px solid ${C.border}`}}>
        <span style={{fontSize:12,color:C.textMuted,fontWeight:600}}>SIMULATE DAY:</span>
        <input type="range" min={1} max={30} value={simDay} onChange={e=>setSimDay(+e.target.value)} style={{flex:1,accentColor:C.accent,cursor:"pointer"}}/>
        <span style={{fontFamily:mono,fontSize:14,color:C.accent,fontWeight:700}}>Day {simDay}</span>
      </div>

      {/* OVERVIEW */}
      {tab==="overview" && <>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:12,marginBottom:24}}>
          <StatCard icon="💸" label="Monthly Loss" value={`$${totalML.toLocaleString()}`} sub="From unsold & expired" accent={C.red}/>
          <StatCard icon="🗑" label="Daily Wasted" value={totalW} sub={`~${Math.round(totalW*0.6)} donuts/day`} accent={C.pink}/>
          <StatCard icon="📉" label="Avg Waste Rate" value={`${avgWR}%`} sub="Industry: 4-10%" accent={C.accent}/>
          <StatCard icon="⚠️" label="High Risk" value={highR} sub={`of ${data.length} items`} accent={C.red}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:20}}>
            <h3 style={{fontSize:14,fontWeight:700,margin:"0 0 16px"}}>Waste by Category</h3>
            <div style={{display:"flex",alignItems:"center",gap:24,flexWrap:"wrap"}}>
              <svg width="130" height="130" viewBox="0 0 42 42"><circle cx="21" cy="21" r="15.9" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4.5"/>
                {segs.map((s,i)=><circle key={i} cx="21" cy="21" r="15.9" fill="none" stroke={s.color} strokeWidth="4.5" strokeDasharray={`${s.pct} ${100-s.pct}`} strokeDashoffset={`${-s.offset+25}`}/>)}
                <text x="21" y="19.5" textAnchor="middle" fill={C.text} fontSize="5.5" fontWeight="800" fontFamily={mono}>${Math.round(catTotal/1000)}k</text>
                <text x="21" y="24" textAnchor="middle" fill={C.textMuted} fontSize="2.8">/month</text>
              </svg>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {segs.map((s,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:8,fontSize:13}}>
                  <div style={{width:10,height:10,borderRadius:3,background:s.color,flexShrink:0}}/><span style={{color:C.textDim,minWidth:100}}>{s.cat}</span>
                  <span style={{fontFamily:mono,fontWeight:700,color:C.text}}>${s.val.toLocaleString()}</span><span style={{color:C.textMuted,fontSize:11}}>{Math.round(s.pct)}%</span>
                </div>)}
              </div>
            </div>
          </div>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:20}}>
            <h3 style={{fontSize:14,fontWeight:700,margin:"0 0 16px"}}>Top Waste Items</h3>
            {[...data].sort((a,b)=>b.monthlyLoss-a.monthlyLoss).slice(0,6).map((item,i)=>
              <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                <span style={{fontSize:12,color:C.textMuted,fontFamily:mono,width:20}}>#{i+1}</span>
                <span style={{flex:1,fontSize:13,fontWeight:500}}>{item.name}</span>
                <span style={{fontSize:13,fontFamily:mono,fontWeight:700,color:C.red}}>${item.monthlyLoss}</span>
                <div style={{width:60}}><MiniBar value={item.monthlyLoss} max={data.sort((a,b)=>b.monthlyLoss-a.monthlyLoss)[0]?.monthlyLoss||1} color={C.red}/></div>
              </div>
            )}
          </div>
        </div>
        <div style={{background:"linear-gradient(135deg,rgba(245,158,11,0.08),rgba(251,113,133,0.06))",border:`1px solid ${C.border}`,borderRadius:14,padding:"18px 22px"}}>
          <div style={{fontSize:13,fontWeight:700,color:C.accent,marginBottom:8}}>🔑 KEY INSIGHT</div>
          <p style={{fontSize:14,color:C.textDim,lineHeight:1.7,margin:0}}>
            <strong style={{color:C.text}}>Donuts = highest volume waste, Sandwiches = highest waste rate.</strong> A typical Dunkin' discards 200-400 donuts at closing. But sandwiches (4-hour shelf life) show 12-27% waste vs 8-20% for donuts. The best ROI comes from build-to-order sandwiches + late-day donut markdowns.
          </p>
        </div>
      </>}

      {/* MENU */}
      {tab==="menu" && <>
        <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
          {cats.map(c=><button key={c} onClick={()=>setCatF(c)} style={{padding:"5px 14px",borderRadius:20,border:`1px solid ${catF===c?C.accent:C.border}`,background:catF===c?C.accentDim:"transparent",color:catF===c?C.accent:C.textMuted,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:body}}>{c}</button>)}
          <div style={{marginLeft:"auto",display:"flex",gap:6}}>
            {[["risk","Risk"],["wasteRate","Waste%"],["monthlyLoss","Cost"]].map(([k,l])=><button key={k} onClick={()=>setSortK(k)} style={{padding:"4px 10px",borderRadius:6,border:"none",cursor:"pointer",fontSize:11,fontFamily:body,fontWeight:600,background:sortK===k?C.accentDim:"rgba(255,255,255,0.04)",color:sortK===k?C.accent:C.textMuted}}>{l}</button>)}
          </div>
        </div>
        <div style={{display:"grid",gap:6}}>
          {filtered.map(item=><div key={item.id} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"14px 18px",display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 80px",alignItems:"center",gap:12,fontSize:13}}>
            <div><div style={{fontWeight:700}}>{item.name}</div><div style={{fontSize:11,color:C.textMuted,marginTop:2}}>{item.cat} · ${item.price}</div></div>
            <div><div style={{fontSize:11,color:C.textMuted}}>Daily</div><div style={{fontFamily:mono,fontWeight:600}}>{item.daily}</div></div>
            <div><div style={{fontSize:11,color:C.textMuted}}>Waste</div><div style={{fontFamily:mono,fontWeight:700,color:item.wasteRate>15?C.red:item.wasteRate>8?C.accent:C.green}}>{item.wasteRate}%</div></div>
            <div><div style={{fontSize:11,color:C.textMuted}}>Mo. Loss</div><div style={{fontFamily:mono,fontWeight:700,color:C.pink}}>${item.monthlyLoss}</div></div>
            <div><div style={{fontSize:11,color:C.textMuted}}>Shelf</div><div style={{fontFamily:mono,fontWeight:600,color:item.shelf<=4?C.red:item.shelf<=12?C.accent:C.textDim}}>{item.shelf}h</div></div>
            <RiskBadge score={item.risk}/>
          </div>)}
        </div>
      </>}

      {/* INGREDIENTS */}
      {tab==="ingredients" && <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:20}}>
        <h3 style={{fontSize:15,fontWeight:700,margin:"0 0 6px"}}>Perishable Ingredient Risk</h3>
        <p style={{fontSize:12,color:C.textMuted,margin:"0 0 16px"}}>Ranked by shelf life × usage breadth × waste exposure</p>
        <table style={{width:"100%",borderCollapse:"separate",borderSpacing:"0 3px"}}>
          <thead><tr>{["Ingredient","Category","Shelf","Used In","Risk",""].map((h,i)=><th key={i} style={{textAlign:"left",padding:"6px 10px",fontSize:10,color:C.textMuted,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",borderBottom:`1px solid ${C.border}`}}>{h}</th>)}</tr></thead>
          <tbody>{ingList.map((ig,i)=><tr key={i} style={{background:i%2===0?"rgba(255,255,255,0.02)":"transparent"}}>
            <td style={{padding:10,fontSize:13,fontWeight:600}}>{ig.name}</td>
            <td style={{padding:10,fontSize:12,color:C.textDim}}>{ig.cat}</td>
            <td style={{padding:10,fontSize:12,fontFamily:mono,color:ig.shelf<=5?C.red:ig.shelf<=14?C.accent:C.textDim}}>{ig.shelf}d</td>
            <td style={{padding:10,fontSize:12,color:C.textDim}}>{ig.dc} items</td>
            <td style={{padding:10}}><RiskBadge score={ig.risk}/></td>
            <td style={{padding:10,width:80}}><MiniBar value={ig.risk} color={ig.risk>=70?C.red:ig.risk>=40?C.accent:C.green}/></td>
          </tr>)}</tbody>
        </table>
      </div>}

      {/* TIMELINE */}
      {tab==="timeline" && <>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:20,marginBottom:20}}>
          <h3 style={{fontSize:15,fontWeight:700,margin:"0 0 4px"}}>Donut Lifecycle — A Typical Day</h3>
          <p style={{fontSize:12,color:C.textMuted,margin:"0 0 16px"}}>Sales by hour. Unsold inventory → end-of-day disposal.</p>
          <div style={{display:"flex",gap:4,alignItems:"flex-end",height:160,padding:"0 4px"}}>
            {HOURLY.map((d,i)=>{const isClose=d.h==="Close";const mx=Math.max(...HOURLY.map(x=>x.sales));
              return <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                {!isClose&&<span style={{fontSize:9,color:C.textMuted,fontFamily:mono}}>{d.sales}</span>}
                {isClose?<div style={{width:"100%",height:50,borderRadius:"5px 5px 0 0",background:`repeating-linear-gradient(45deg,${C.redDim},${C.redDim} 4px,transparent 4px,transparent 8px)`,border:`1px dashed ${C.red}`,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:14}}>🗑</span></div>
                :<div style={{width:"100%",borderRadius:"4px 4px 0 0",height:`${Math.max(4,(d.sales/mx)*120)}px`,background:`linear-gradient(to top,${C.accent},#FBBF24)`,opacity:0.85,transition:"height 0.4s"}}/>}
                <span style={{fontSize:9,color:isClose?C.red:C.textMuted,fontWeight:isClose?700:500}}>{d.h}</span>
              </div>;})}
          </div>
        </div>
        <div style={{background:`linear-gradient(135deg,${C.redDim},rgba(251,113,133,0.04))`,border:`1px solid rgba(239,68,68,0.15)`,borderRadius:14,padding:"18px 22px"}}>
          <div style={{fontSize:14,fontWeight:700,color:C.red,marginBottom:10}}>⚡ The "Closing Time Problem"</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16,marginBottom:14}}>
            {[["200-400","donuts discarded nightly"],["30+","trays disposed per shift"],["9,600+","US locations face this daily"]].map(([v,l],i)=>
              <div key={i}><div style={{fontSize:22,fontWeight:800,fontFamily:mono}}>{v}</div><div style={{fontSize:12,color:C.textDim}}>{l}</div></div>
            )}
          </div>
          <p style={{fontSize:13,color:C.textDim,lineHeight:1.6,margin:0}}>Dunkin' offers an <strong style={{color:C.text}}>End-of-Day Donation Program</strong> for franchisees, but participation is voluntary. One Portland, ME franchise diverted 3.7M lbs through composting. Without mandatory enforcement, outcomes vary widely.</p>
        </div>
      </>}
    </div>
  );
}

// ══════════════════════════════════════════════
// PAGE 2: ROI SIMULATOR (Light)
// ══════════════════════════════════════════════

const PRESETS = [
  {label:"Conservative",emoji:"🐢",v:{production:10,markdown:20,buildtoorder:30,inventory:15,donation:20}},
  {label:"Moderate",emoji:"⚖️",v:{production:20,markdown:35,buildtoorder:60,inventory:30,donation:40}},
  {label:"Aggressive",emoji:"🚀",v:{production:30,markdown:50,buildtoorder:80,inventory:40,donation:60}},
];

function ROIPage() {
  const [sl, setSl] = useState({production:0,markdown:0,buildtoorder:0,inventory:0,donation:0});
  const [preset, setPreset] = useState(null);
  const sc = useMemo(()=>calcROI(sl),[sl]);
  const any = Object.values(sl).some(v=>v>0);
  const upd = (id,v)=>{setSl(p=>({...p,[id]:v}));setPreset(null);};

  const breakdownItems = [
    {label:"Production cut",value:sc.saveProd,color:C.lAccent},
    {label:"Markdown revenue",value:sc.markRev,color:"#E8890C"},
    {label:"Sandwich savings",value:sc.sandSave,color:"#2563EB"},
    {label:"Inventory savings",value:sc.ingSave,color:"#7C3AED"},
    {label:"Tax benefit",value:sc.taxBen,color:C.lGreen},
  ].filter(i=>i.value>0);
  const breakTotal = breakdownItems.reduce((s,i)=>s+i.value,0);

  return (
    <div style={{background:C.lBg,color:C.lText,minHeight:"100vh",fontFamily:body}}>
      <div style={{maxWidth:1100,margin:"0 auto",padding:"24px 32px"}}>
        {/* Current state */}
        <div style={{background:C.lRedLight,border:`1.5px solid ${C.lRed}20`,borderRadius:14,padding:"18px 24px",marginBottom:24,display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
          {[["Current Annual Waste",`$${sc.totalW.toLocaleString()}`],["Donuts Wasted Daily","~280"],["Waste % of Food Cost",`${sc.curWR}%`],["Current Net Profit",`$${sc.curProfit.toLocaleString()}`]].map(([l,v],i)=>
            <div key={i} style={{borderRight:i<3?`1px solid ${C.lRed}15`:"none",paddingRight:i<3?16:0}}>
              <div style={{fontSize:11,color:C.lRed,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em"}}>{l}</div>
              <div style={{fontSize:24,fontWeight:800,color:i===3?C.lText:C.lRed,fontFamily:mono,marginTop:4}}>{v}</div>
            </div>
          )}
        </div>

        {/* Presets */}
        <div style={{display:"flex",gap:10,marginBottom:20,alignItems:"center"}}>
          <span style={{fontSize:12,fontWeight:700,color:C.lTextLight,textTransform:"uppercase",letterSpacing:"0.06em"}}>Quick Presets:</span>
          {PRESETS.map((p,i)=><button key={i} onClick={()=>{setSl(p.v);setPreset(i);}} style={{padding:"7px 16px",borderRadius:8,cursor:"pointer",fontFamily:body,fontSize:13,fontWeight:700,border:`1.5px solid ${preset===i?C.lAccent:C.lBorder}`,background:preset===i?"#FFF0E6":"#fff",color:preset===i?C.lAccent:C.lTextMid,transition:"all 0.2s"}}>{p.emoji} {p.label}</button>)}
          {any&&<button onClick={()=>{setSl({production:0,markdown:0,buildtoorder:0,inventory:0,donation:0});setPreset(null);}} style={{padding:"7px 14px",borderRadius:8,border:"none",cursor:"pointer",background:"#F7F5F2",color:C.lTextLight,fontSize:12,fontWeight:600,fontFamily:body,marginLeft:"auto"}}>↺ Reset</button>}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
          {/* Left: Sliders */}
          <div>
            <h2 style={{fontFamily:heading,fontSize:20,fontWeight:800,margin:"0 0 14px"}}>Adjust Strategies</h2>
            <div style={{display:"grid",gap:10}}>
              {STRATS.map(s=>{const active=sl[s.id]>0;return(
                <div key={s.id} style={{background:active?"#FFF0E6":"#fff",border:`1.5px solid ${active?C.lAccent:C.lBorder}`,borderRadius:12,padding:"16px 20px",transition:"all 0.3s"}}>
                  <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:12}}>
                    <span style={{fontSize:24,lineHeight:1}}>{s.icon}</span>
                    <div style={{flex:1}}><div style={{fontSize:15,fontWeight:700}}>{s.name}</div><div style={{fontSize:12.5,color:C.lTextMid,marginTop:2}}>{s.desc}</div></div>
                    <div style={{background:active?C.lAccent:"#F7F5F2",color:active?"#fff":C.lTextLight,padding:"4px 12px",borderRadius:8,fontSize:15,fontWeight:800,fontFamily:mono,minWidth:52,textAlign:"center",transition:"all 0.2s"}}>{sl[s.id]}%</div>
                  </div>
                  <input type="range" min={0} max={s.max} value={sl[s.id]} onChange={e=>upd(s.id,+e.target.value)} style={{width:"100%",accentColor:C.lAccent,cursor:"pointer",height:6}}/>
                  {active&&<div style={{display:"flex",alignItems:"center",gap:6,marginTop:8,fontSize:11,color:C.lTextMid}}>
                    <span style={{background:C.lAccent,color:"#fff",padding:"1px 6px",borderRadius:4,fontSize:10,fontWeight:700}}>COST</span>${s.cost.toLocaleString()} · {s.costLabel}
                  </div>}
                </div>
              );})}
            </div>
          </div>

          {/* Right: Results */}
          <div>
            <h2 style={{fontFamily:heading,fontSize:20,fontWeight:800,margin:"0 0 14px"}}>Projected Impact</h2>
            {/* Hero */}
            <div style={{background:any?C.lGreenLight:"#F7F5F2",border:`1.5px solid ${any?C.lGreen+"40":C.lBorder}`,borderRadius:14,padding:"28px 24px",marginBottom:14,textAlign:"center",transition:"all 0.4s"}}>
              <div style={{fontSize:12,fontWeight:700,color:any?C.lGreen:C.lTextLight,textTransform:"uppercase",letterSpacing:"0.08em"}}>Annual Savings Potential</div>
              <div style={{fontSize:44,fontWeight:900,fontFamily:mono,marginTop:8}}><AnimNum value={sc.totalBen} prefix="$" color={any?"#0F5C35":C.lTextLight}/></div>
              {any&&<div style={{display:"flex",justifyContent:"center",gap:24,marginTop:14}}>
                {[[sc.profitUp,"%","Profit ↑",C.lGreen],[sc.payback," mo","Payback",C.lAccent],[sc.rescued,"","Saved/Day","#2563EB"]].map(([v,suf,l,col],i)=>
                  <div key={i}>{i>0&&<div style={{width:1,background:C.lBorder,position:"absolute",left:-12,top:0,bottom:0}}/>}
                    <div style={{fontSize:20,fontWeight:800,fontFamily:mono,color:col}}><AnimNum value={v} color={col}/><span style={{fontSize:14,fontWeight:600}}>{suf}</span></div>
                    <div style={{fontSize:11,color:C.lTextMid}}>{l}</div>
                  </div>
                )}
              </div>}
              {!any&&<div style={{fontSize:14,color:C.lTextLight,marginTop:10}}>← Adjust sliders to see projected savings</div>}
            </div>

            {/* P&L */}
            {any&&<div style={{background:"#fff",border:`1px solid ${C.lBorder}`,borderRadius:14,padding:"22px 24px",marginBottom:14}}>
              <div style={{fontSize:14,fontWeight:700,fontFamily:heading,marginBottom:16}}>P&L — Before vs After</div>
              {[["Food Cost",sc.curFood,sc.newFood,BASE.rev*0.35],["Annual Waste",sc.totalW,Math.max(0,sc.totalW-sc.directSave-sc.donated),sc.totalW*1.2],["Net Profit",sc.curProfit,sc.newProfit,sc.newProfit*1.1]].map(([l,b,a,mx],i)=>{
                const better = i===2?a>b:a<b;
                return <div key={i} style={{marginBottom:16}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                    <span style={{fontSize:13,fontWeight:600}}>{l}</span>
                    <span style={{fontSize:12,color:better?C.lGreen:C.lRed,fontWeight:700,fontFamily:mono}}>{better?"▼":"▲"} ${Math.abs(b-a).toLocaleString()}</span>
                  </div>
                  <div style={{height:8,background:"#F7F5F2",borderRadius:4,overflow:"hidden",marginBottom:3}}><div style={{width:`${(b/mx)*100}%`,height:"100%",background:"#D4CFC8",borderRadius:4,transition:"width 0.5s"}}/></div>
                  <div style={{height:8,background:"#F7F5F2",borderRadius:4,overflow:"hidden"}}><div style={{width:`${(a/mx)*100}%`,height:"100%",background:better?C.lGreen:C.lAccent,borderRadius:4,transition:"width 0.5s"}}/></div>
                </div>;
              })}
              <div style={{borderTop:`1px solid ${C.lBorder}`,paddingTop:14,marginTop:8,display:"flex",justifyContent:"space-between"}}>
                <div><span style={{fontSize:13,fontWeight:700}}>Implementation Cost</span><div style={{fontSize:12,color:C.lTextMid,marginTop:2}}>ROI: {Math.round((sc.totalBen/Math.max(1,sc.implCost))*100)}% Year 1</div></div>
                <span style={{fontFamily:mono,fontSize:15,fontWeight:700,color:C.lAccent}}>${sc.implCost.toLocaleString()}</span>
              </div>
              {breakTotal>0&&<div style={{marginTop:16}}>
                <div style={{fontSize:12,fontWeight:700,color:C.lTextLight,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Savings Breakdown</div>
                {breakdownItems.map((item,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:item.color,flexShrink:0}}/>
                  <span style={{flex:1,fontSize:13,color:C.lTextMid}}>{item.label}</span>
                  <span style={{fontFamily:mono,fontSize:13,fontWeight:600}}>${item.value.toLocaleString()}</span>
                  <div style={{width:60,height:5,background:"#F7F5F2",borderRadius:3,overflow:"hidden"}}><div style={{width:`${(item.value/breakTotal)*100}%`,height:"100%",background:item.color,borderRadius:3}}/></div>
                </div>)}
              </div>}
            </div>}

            {/* Monthly chart */}
            {any&&<div style={{background:"#fff",border:`1px solid ${C.lBorder}`,borderRadius:14,padding:"22px 24px"}}>
              <div style={{fontSize:14,fontWeight:700,fontFamily:heading,marginBottom:14}}>Monthly Waste Comparison</div>
              <div style={{display:"flex",gap:6,alignItems:"flex-end",height:130}}>
                {sc.monthly.map((d,i)=>{const mx=Math.max(...sc.monthly.map(x=>x.cur));return(
                  <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                    <div style={{display:"flex",gap:1,width:"100%",justifyContent:"center",alignItems:"flex-end"}}>
                      <div style={{width:"42%",borderRadius:"3px 3px 0 0",height:`${(d.cur/mx)*100}px`,background:"#E8E4DF",transition:"height 0.4s"}}/>
                      <div style={{width:"42%",borderRadius:"3px 3px 0 0",height:`${Math.max(3,(d.opt/mx)*100)}px`,background:C.lGreen,opacity:0.8,transition:"height 0.4s"}}/>
                    </div>
                    <span style={{fontSize:10,color:C.lTextLight,fontWeight:600}}>{d.m}</span>
                  </div>
                );})}
              </div>
              <div style={{display:"flex",gap:20,justifyContent:"center",marginTop:12}}>
                {[["#E8E4DF","Current"],["#1A7A4C","Optimized"]].map(([c,l],i)=><div key={i} style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:C.lTextMid}}><div style={{width:12,height:8,borderRadius:2,background:c}}/>{l}</div>)}
              </div>
            </div>}
          </div>
        </div>

        {/* Executive Summary */}
        {any&&<div style={{marginTop:24,background:"linear-gradient(135deg,#1A1814,#2D2A24)",borderRadius:14,padding:"22px 28px",color:"#fff"}}>
          <div style={{fontSize:12,fontWeight:700,color:C.lAccent,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>📋 Executive Summary</div>
          <p style={{fontSize:15,lineHeight:1.8,color:"#D4CFC8",margin:0}}>
            By implementing selected strategies, this location can <strong style={{color:"#fff"}}>save ${sc.totalBen.toLocaleString()}/year</strong>, a <strong style={{color:C.lAccent}}>{sc.profitUp}% profit increase</strong>.
            Implementation cost of <strong style={{color:"#fff"}}>${sc.implCost.toLocaleString()}</strong> pays back in <strong style={{color:C.lAccent}}>{sc.payback} months</strong>.
            {sc.rescued>0&&<> Approximately <strong style={{color:"#fff"}}>{sc.rescued} items/day</strong> rescued from disposal.</>}
            {" "}Waste rate: {sc.curWR}% → <strong style={{color:"#34D399"}}>{sc.newWR}%</strong>.
          </p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12,marginTop:20}}>
            {[["Annual Savings",`$${sc.totalBen.toLocaleString()}`,"#34D399"],["Profit ↑",`${sc.profitUp}%`,C.lAccent],["Payback",`${sc.payback} mo`,"#FBBF24"],["Waste Rate",`${sc.curWR}%→${sc.newWR}%`,"#34D399"],["Rescued/Day",`${sc.rescued}`,"#60A5FA"]].map(([l,v,col],i)=>
              <div key={i} style={{background:"rgba(255,255,255,0.06)",borderRadius:10,padding:"12px 14px",textAlign:"center"}}>
                <div style={{fontSize:10,color:"#8A847A",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em"}}>{l}</div>
                <div style={{fontSize:17,fontWeight:800,fontFamily:mono,color:col,marginTop:4}}>{v}</div>
              </div>
            )}
          </div>
        </div>}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// PAGE 3: ABOUT / METHODOLOGY
// ══════════════════════════════════════════════

function AboutPage() {
  return (
    <div style={{maxWidth:760,margin:"0 auto",padding:"40px 32px",color:C.text}}>
      <h2 style={{fontFamily:heading,fontSize:28,fontWeight:800,marginTop:0,marginBottom:8}}>About This Project</h2>
      <p style={{fontSize:15,color:C.textDim,lineHeight:1.8,marginBottom:28}}>
        FoodSave is a research project analyzing food waste patterns in the U.S. quick-service restaurant industry, using Dunkin' as a case study. The platform combines public data with simulation modeling to demonstrate how data-driven decisions can reduce waste and improve profitability.
      </p>

      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"22px 24px",marginBottom:20}}>
        <h3 style={{fontSize:16,fontWeight:700,margin:"0 0 12px",color:C.accent}}>📚 Data Sources</h3>
        {[
          ["Dunkin' Official Menu & Nutrition","Public menu items, prices, and ingredient data from dunkindonuts.com"],
          ["Kaggle Restaurant Food Wastage Dataset","1,782 catering events with waste rates by food type, price tier, and service format"],
          ["Industry Reports (ReFED, USDA)","National food waste statistics: 4-10% of purchased food wasted in QSR industry"],
          ["Viral TikTok Employee Reports","Documented 200-400 donuts discarded nightly at individual Dunkin' locations"],
          ["Dunkin' Corporate Sustainability Reports","End-of-Day Donation Program, composting initiatives (3.7M lbs diverted in Portland, ME)"],
        ].map(([t,d],i)=><div key={i} style={{marginBottom:14,paddingBottom:14,borderBottom:i<4?`1px solid ${C.border}`:"none"}}>
          <div style={{fontSize:14,fontWeight:700,marginBottom:3}}>{t}</div>
          <div style={{fontSize:13,color:C.textDim,lineHeight:1.5}}>{d}</div>
        </div>)}
      </div>

      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"22px 24px",marginBottom:20}}>
        <h3 style={{fontSize:16,fontWeight:700,margin:"0 0 12px",color:C.accent}}>🧮 Methodology</h3>
        <p style={{fontSize:13,color:C.textDim,lineHeight:1.7,margin:"0 0 12px"}}>The waste simulation engine uses a multi-factor model combining:</p>
        {[
          "Perishability classification (very high → low) based on shelf life",
          "Demand variability modeling with seeded pseudo-random variation",
          "Cost-weighted risk scoring (shelf life × usage breadth × volume)",
          "ROI projections based on industry-standard food cost ratios (30% COGS)",
        ].map((t,i)=><div key={i} style={{display:"flex",gap:10,marginBottom:8,alignItems:"flex-start"}}>
          <span style={{color:C.accent,fontWeight:800,fontFamily:mono,fontSize:13,flexShrink:0}}>{String(i+1).padStart(2,"0")}</span>
          <span style={{fontSize:13,color:C.textDim,lineHeight:1.5}}>{t}</span>
        </div>)}
      </div>

      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"22px 24px"}}>
        <h3 style={{fontSize:16,fontWeight:700,margin:"0 0 12px",color:C.accent}}>⚠️ Limitations</h3>
        <p style={{fontSize:13,color:C.textDim,lineHeight:1.7,margin:0}}>
          This is a research prototype using simulated data. Actual waste patterns vary significantly by location, season, management practices, and local regulations. The financial model assumes a single-store franchise with $1.05M annual revenue. Real-world implementation would require store-specific data collection and validation.
        </p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// MAIN APP — Navigation Shell
// ══════════════════════════════════════════════

export default function App() {
  const [page, setPage] = useState("dashboard");

  const pages = [
    { id: "dashboard", label: "Waste Analysis", icon: "📊" },
    { id: "roi", label: "ROI Simulator", icon: "💰" },
    { id: "about", label: "About & Sources", icon: "📚" },
  ];

  return (
    <div style={{ fontFamily: body, background: page === "roi" ? C.lBg : C.bg, color: page === "roi" ? C.lText : C.text, minHeight: "100vh", transition: "background 0.4s" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Source+Sans+3:wght@400;600;700;800&family=IBM+Plex+Mono:wght@500;600;700&display=swap" rel="stylesheet" />

      {/* Global Header */}
      <div style={{ background: page === "roi" ? "#fff" : "linear-gradient(135deg,#1C1917,#292524)", borderBottom: `1px solid ${page === "roi" ? C.lBorder : C.border}`, padding: "20px 32px", transition: "all 0.4s" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 26 }}>🍩</span>
                <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, fontFamily: heading, letterSpacing: "-0.02em" }}>
                  <span style={{ background: "linear-gradient(135deg,#F59E0B,#FB923C)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>FoodSave</span>
                  <span style={{ color: page === "roi" ? C.lTextMid : C.textDim, fontWeight: 500, fontSize: 15, marginLeft: 10, fontFamily: body }}>× Dunkin' Franchise Analytics</span>
                </h1>
              </div>
              <p style={{ margin: "2px 0 0 36px", fontSize: 12, color: page === "roi" ? C.lTextLight : C.textMuted }}>
                Data-driven food waste reduction for QSR · Research Project
              </p>
            </div>
            <a href="https://katherine-code-web.github.io/foodsave-dashboard/" target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 12, color: page === "roi" ? C.lAccent : C.accent, textDecoration: "none", fontWeight: 600, padding: "6px 14px", borderRadius: 8, border: `1px solid ${page === "roi" ? C.lAccent + "40" : C.accentDim}`, transition: "all 0.2s" }}>
              ← Original Dashboard
            </a>
          </div>

          {/* Page Nav */}
          <div style={{ display: "flex", gap: 3, marginTop: 16, background: page === "roi" ? "rgba(0,0,0,0.04)" : "rgba(0,0,0,0.3)", borderRadius: 10, padding: 3 }}>
            {pages.map(p => (
              <button key={p.id} onClick={() => setPage(p.id)} style={{
                padding: "9px 20px", borderRadius: 8, border: "none", cursor: "pointer",
                fontSize: 14, fontWeight: 700, fontFamily: body, transition: "all 0.2s",
                background: page === p.id ? (p.id === "roi" ? "#FFF0E6" : C.accentDim) : "transparent",
                color: page === p.id ? (p.id === "roi" ? C.lAccent : C.accent) : (page === "roi" ? C.lTextMid : C.textMuted),
              }}>
                {p.icon} {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Page Content */}
      {page === "dashboard" && <DashboardPage />}
      {page === "roi" && <ROIPage />}
      {page === "about" && <AboutPage />}

      {/* Footer */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 32px" }}>
        <div style={{ borderTop: `1px solid ${page === "roi" ? C.lBorder : C.border}`, paddingTop: 14, textAlign: "center", fontSize: 11, color: page === "roi" ? C.lTextLight : C.textMuted }}>
          FoodSave Analytics · Built by Katherine · Data: Dunkin' public menu, Kaggle dataset, ReFED, USDA · Research Prototype © 2026
        </div>
      </div>
    </div>
  );
}
