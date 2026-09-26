#!/usr/bin/env node
// ===== qa.mjs — pre-deploy QA gate for the trip planner =====
// Validates the Tokyo SEED in ../data.js AND every template in ../data-trips.js
// Usage: node scripts/qa.mjs [plan.json]   (no arg = seed + templates)
// Exits non-zero on any FAIL → deploy.sh runs this before every push.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE=path.dirname(fileURLToPath(import.meta.url));
const ROOT=path.resolve(HERE,'..');

function loadJS(rel, ret){
  const src=fs.readFileSync(path.join(ROOT,rel),'utf8');
  const sandbox={getItem:()=>null,setItem:()=>{},removeItem(){}};
  const fn=new Function('localStorage','window',src+'\n;return {'+ret+'};');
  return fn(sandbox,undefined);
}

function loadPlans(){
  const arg=process.argv[2];
  if(arg) return [{tag:path.basename(arg), plan:JSON.parse(fs.readFileSync(path.resolve(arg),'utf8'))}];
  const plans=[];
  const {SEED}=loadJS('data.js','SEED');
  plans.push({tag:'SEED (Tokyo)', plan:SEED});
  if(fs.existsSync(path.join(ROOT,'data-trips.js'))){
    // data-trips.js uses R() from data.js — eval both together like the browser does
    const srcBoth=fs.readFileSync(path.join(ROOT,'data.js'),'utf8')+'\n'+fs.readFileSync(path.join(ROOT,'data-trips.js'),'utf8');
    const sandbox={getItem:()=>null,setItem:()=>{},removeItem(){}};
    const fn=new Function('localStorage','window',srcBoth+'\n;return {TRIP_TEMPLATES};');
    const {TRIP_TEMPLATES}=fn(sandbox,undefined);
    for(const t of TRIP_TEMPLATES||[]){
      plans.push({tag:'template:'+t.id, plan:{
        meta:{schema:5}, settings:t.settings, days:t.days,
        checks:t.checks||[], parked:[],
        foodAreas:t.foodAreas||{}, foodRules:t.foodRules||[],
        passCompare:t.passCompare||null, packing:t.packing||null, packingDone:{},
      }});
    }
  }
  return plans;
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

const TAGWORDS=['rest','view','logistic','attraction','food','shopping','misc'];
let exitCode=0, totalErrs=0, totalWarns=0;

function validatePlan(S, tag){
  const errs=[], warns=[];
  const E=(day,label,msg)=>errs.push('❌ ['+day+'] '+label+': '+msg);
  const W=(day,label,msg)=>warns.push('🟡 ['+day+'] '+label+': '+msg);
  normalizeTimes(S);
  if(!S.days?.length){ console.error('❌ ['+tag+'] no days'); exitCode=1; return; }

  S.days.forEach((d,di)=>{
    const dl=d.d+' (D'+(di+1)+')';
    (d.variants?.[d.activeVariant||0]?.rows||[]).forEach((r,ri)=>{
      const label='row'+ri+' "'+(r.act||'').slice(0,24)+'"';
      if(!r.act) E(dl,label,'empty activity name');
      if(TAGWORDS.includes(String(r.note||'').trim())) E(dl,label,'note holds a tag word — R() args shifted!');
      if(r.start==null){ if(ri>0) W(dl,label,'no parseable start time'); return; }
      if(r.durMin==null){ W(dl,label,'no duration (end = start)'); }
      const end=r.start+(r.durMin||0);
      if(r.durMin!=null && r.durMin<=0) E(dl,label,'durMin='+r.durMin);
      if(r.durMin>360) E(dl,label,'durMin='+r.durMin+'min (>6h) — likely arg-shift bug');
      if(end>=1440) E(dl,label,'ends '+(Math.floor(end/60)%24)+':next-day — crosses midnight');
    });
    const rows=(d.variants[d.activeVariant||0].rows||[]).filter(r=>r.start!=null);
    let prev=null;
    rows.forEach(r=>{
      if(prev){
        if(r.start < prev.start) E(dl,'"'+r.act.slice(0,20)+'"','times out of order vs previous row');
        if(r.start < prev.end) E(dl,'"'+r.act.slice(0,20)+'"','overlaps previous (prev ends '+String(Math.floor(prev.end/60)).padStart(2,'0')+':'+String(prev.end%60).padStart(2,'0')+')');
        else if(r.start - prev.end > 90) W(dl,'gap',(r.start-prev.end)+'min gap after "'+(prev.name||'').slice(0,20)+'" before "'+r.act.slice(0,20)+'"');
      }
      prev={start:r.start, end:r.start+(r.durMin||0), name:r.act};
    });
    const anchors=rows.filter(r=>r.tag==='attraction').length;
    if(anchors>2) W(dl,anchors+' attractions — heavy for a toddler day');
    if(!rows.some(r=>r.tag==='rest'||/งีบ|พัก/.test(r.act)) && di!==S.days.length-1) W(dl,'no rest/nap row in day');
  });

  // budget sanity (multi-city stays aware)
  let total=0;
  S.days.forEach(d=>(d.variants[d.activeVariant||0].rows||[]).forEach(r=>{ if(r.inc&&d.inc) total+=r.train+(r.type==='food'?r.cost:r.cost); }));
  const st=S.settings;
  const hotel=(st.stays&&st.stays.length)?st.stays.reduce((a,x)=>a+(x.per||0)*(x.nights||0),0)
    : st.hotelTokyo*st.nightsTokyo+st.hotelShizuoka*st.nightsShizuoka;
  const grand=total+hotel;
  if(grand<50000) errs.push('❌ grand total suspiciously low: ¥'+grand);
  if(grand>600000) errs.push('❌ grand total suspiciously high: ¥'+grand);

  // template extras: food areas + rules + pass legs consistent
  if(S.foodAreas&&Object.keys(S.foodAreas).length){
    (S.foodRules||[]).forEach(pair=>{ if(!S.foodAreas[pair[0]]) errs.push('❌ foodRules key "'+pair[0]+'" has no foodAreas entry'); });
    Object.values(S.foodAreas).forEach(a=>{
      if(!a.label) errs.push('❌ foodArea missing label');
      (a.items||[]).forEach(it=>{ if(!it.n||!it.price) errs.push('❌ foodArea "'+a.label+'" item missing name/price'); });
    });
  }
  if(S.passCompare){
    (S.passCompare.legs||[]).forEach(l=>{ if(!(l.fare>0)||!l.from) errs.push('❌ passCompare leg invalid: '+JSON.stringify(l).slice(0,60)); });
    (S.passCompare.passes||[]).forEach(pp=>{ if(!(pp.price>0)||!pp.name) errs.push('❌ passCompare pass invalid: '+JSON.stringify(pp).slice(0,60)); });
    if(!S.passCompare.verdict) errs.push('❌ passCompare missing verdict');
  }

  console.log('QA '+tag+' — '+S.days.length+' days · grand ¥'+grand.toLocaleString()+' (≈฿'+Math.round(grand*(st.fx||0.23)).toLocaleString()+')');
  warns.forEach(w=>console.log('  '+w));
  if(errs.length){ console.log('  FAILED:'); errs.forEach(e=>console.log('  '+e)); exitCode=1; totalErrs+=errs.length; }
  else console.log('  ✅ PASS — '+errs.length+' errors, '+warns.length+' warnings');
  totalWarns+=warns.length;
}

for(const p of loadPlans()) validatePlan(p.plan, p.tag);
if(exitCode){ console.log('\n❌ QA FAILED somewhere above'); process.exit(1); }
console.log('\n✅ ALL PLANS PASS — '+totalErrs+' errors, '+totalWarns+' warnings');
