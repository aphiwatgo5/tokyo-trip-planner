#!/usr/bin/env node
// ===== qa.mjs — pre-deploy QA gate for the trip planner =====
// Usage: node scripts/qa.mjs [plan.json]   (no arg = seed in ../data.js)
// Exits non-zero on any FAIL → wire into deploy: `node scripts/qa.mjs && git push`
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE=path.dirname(fileURLToPath(import.meta.url));
const ROOT=path.resolve(HERE,'..');

function loadPlan(){
  const arg=process.argv[2];
  if(arg) return JSON.parse(fs.readFileSync(path.resolve(arg),'utf8'));
  const src=fs.readFileSync(path.join(ROOT,'data.js'),'utf8');
  const sandbox={getItem:()=>null,setItem:()=>{},removeItem(){}};
  const fn=new Function('localStorage','window',src+'\n;return {SEED};');
  return fn(sandbox,undefined).SEED;
}

// same normalization the app runs
function parseTimeStr(s){ const m=String(s||'').match(/(\d{1,2})[:.](\d{2})/); if(!m) return null; const h=+m[1],mm=+m[2]; if(h>23||mm>59) return null; return h*60+mm; }
function parseTimeRange(t){ const parts=String(t||'').split(/[–\-~]/).map(x=>parseTimeStr(x)); return {start:parts[0],end:parts.length>1&&parts[1]!=null?parts[1]:null}; }
function normalizeTimes(state){
  (state.days||[]).forEach(d=>(d.variants||[]).forEach(v=>(v.rows||[]).forEach(r=>{
    if(r.start==null){ const pr=parseTimeRange(r.time); r.start=pr.start; if(r.durMin==null&&pr.end!=null&&pr.start!=null) r.durMin=pr.end-pr.start; }
    if(r.durMin==null && /นาที|ชม/.test(r.dur||'')){ const m=String(r.dur).match(/(\d+(?:\.\d+)?)\s*(ชม\.?|นาที)/); if(m) r.durMin=Math.round(parseFloat(m[1])*(m[2].startsWith('ช')?60:1)); }
    if(r.start!=null){ const e=(r.start+(r.durMin||0))%1440;
      r.time=String(Math.floor(r.start/60)).padStart(2,'0')+':'+String(r.start%60).padStart(2,'0')+'–'+String(Math.floor(e/60)).padStart(2,'0')+':'+String(e%60).padStart(2,'0'); }
  })));
}

const S=loadPlan();
normalizeTimes(S);
const errs=[], warns=[];
const TAGWORDS=['rest','view','logistic','attraction','food','shopping','misc'];

function E(day,label,msg){ errs.push(`❌ [${day}] ${label}: ${msg}`); }
function W(day,label,msg){ warns.push(`🟡 [${day}] ${label}: ${msg}`); }

// 1. structure
if(!S.days?.length) { console.error('❌ no days'); process.exit(1); }
const grandDays=S.days.length;

// 2. per-day, per-row checks
S.days.forEach((d,di)=>{
  const dl=`${d.d} (D${di+1})`;
  (d.variants?.[d.activeVariant||0]?.rows||[]).forEach((r,ri)=>{
    const label=`row${ri} "${(r.act||'').slice(0,24)}"`;
    if(!r.act) E(dl,label,'empty activity name');
    if(TAGWORDS.includes(String(r.note||'').trim())) E(dl,label,'note holds a tag word — R() args shifted!');
    if(r.start==null){ if(ri>0) W(dl,label,'no parseable start time'); return; }
    if(r.durMin==null){ W(dl,label,'no duration (end = start)'); }
    const end=r.start+(r.durMin||0);
    if(r.durMin!=null && r.durMin<=0) E(dl,label,`durMin=${r.durMin}`);
    if(r.durMin>360) E(dl,label,`durMin=${r.durMin}min (>6h) — likely arg-shift bug`);
    if(end>=1440) E(dl,label,`ends ${(Math.floor(end/60)%24)}:next-day — crosses midnight`);
  });
  // 3. chain: sorted + no overlap
  const rows=(d.variants[d.activeVariant||0].rows||[]).filter(r=>r.start!=null);
  let prev=null;
  rows.forEach(r=>{
    if(prev){
      if(r.start < prev.start) E(dl,`"${r.act.slice(0,20)}"`,'times out of order vs previous row');
      if(r.start < prev.end) E(dl,`"${r.act.slice(0,20)}"`,`overlaps previous (prev ends ${String(Math.floor(prev.end/60)).padStart(2,'0')}:${String(prev.end%60).padStart(2,'0')})`);
      else if(r.start - prev.end > 90) W(dl,'gap',`${r.start-prev.end}min gap after "${(prev.name||'').slice(0,20)}" before "${r.act.slice(0,20)}"`);
    }
    prev={start:r.start, end:r.start+(r.durMin||0), name:r.act};
  });
  // 4. toddler sanity: anchor attractions per day
  const anchors=rows.filter(r=>r.tag==='attraction').length;
  if(anchors>2) W(dl,`${anchors} attractions — heavy for a toddler day`);
  if(!rows.some(r=>r.tag==='rest'||/งีบ|พัก/.test(r.act)) && di!==S.days.length-1) W(dl,'no rest/nap row in day');
});

// 5. budget sanity
let total=0;
S.days.forEach(d=>(d.variants[d.activeVariant||0].rows||[]).forEach(r=>{ if(r.inc&&d.inc) total+=r.train+(r.type==='food'?r.cost:r.cost); }));
const st=S.settings;
const grand=total+st.hotelTokyo*st.nightsTokyo+st.hotelShizuoka*st.nightsShizuoka;
if(grand<50000) errs.push(`❌ grand total suspiciously low: ¥${grand}`);
if(grand>600000) errs.push(`❌ grand total suspiciously high: ¥${grand}`);

console.log(`QA — ${grandDays} days · grand ¥${grand.toLocaleString()} (≈฿${Math.round(grand*st.fx).toLocaleString()})`);
warns.forEach(w=>console.log(w));
if(errs.length){ console.log('\nFAILED:'); errs.forEach(e=>console.log(e)); process.exit(1); }
console.log(`\n✅ PASS — ${errs.length} errors, ${warns.length} warnings`);
