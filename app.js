// ===== Shared app logic: totals, Excel sync, modal/toast, import flow =====
// Requires data.js (SEED, Trips, migrate, normalizeTimes, time utils) loaded first.
window.APP = (function(){

// ---------- password gate (runs immediately on script load) ----------
const LOCK_PASS = 'hoogaati';
(function gate(){
  let unlocked=false;
  try{ unlocked = sessionStorage.getItem('tp-unlocked')==='1'; }catch(e){}
  if(unlocked) return;
  const st=document.createElement('style');
  st.textContent='body{display:none!important}'
    +'.tp-gate{position:fixed;inset:0;z-index:5000;display:flex;align-items:center;justify-content:center;background:linear-gradient(155deg,#21433A 0%,#2C5648 60%,#1C3A31 100%);font-family:"Sarabun",system-ui,sans-serif;}'
    +'.tp-gate .card{background:#fff;border-radius:18px;padding:30px 26px 24px;width:min(92vw,360px);box-shadow:0 18px 60px rgba(0,0,0,.35);text-align:center;}'
    +'.tp-gate h2{font-family:"Mitr",sans-serif;margin:6px 0 4px;font-size:20px;color:#275145;}'
    +'.tp-gate p{font-size:12.5px;color:#5A6270;margin:0 0 16px;}'
    +'.tp-gate input{width:100%;border:1.5px solid #DCDDD4;border-radius:10px;padding:11px 13px;font-size:15px;text-align:center;letter-spacing:.12em;font-family:"Sarabun";}'
    +'.tp-gate input:focus{outline:none;border-color:#2F5E50;}'
    +'.tp-gate button{margin-top:12px;width:100%;border:none;background:#2F5E50;color:#fff;font-family:"Mitr",sans-serif;font-size:14px;border-radius:10px;padding:11px;cursor:pointer;}'
    +'.tp-gate button:hover{background:#244a3f;}'
    +'.tp-gate .err{color:#CE4A2B;font-size:12px;margin-top:8px;min-height:16px;font-family:"Sarabun";}'
    +'.tp-gate.shake .card{animation:tpsh .38s;}'
    +'@keyframes tpsh{0%,100%{transform:none}25%{transform:translateX(-9px)}75%{transform:translateX(9px)}}';
  document.head.appendChild(st);
  const show=()=>{
    const g=document.createElement('div'); g.className='tp-gate';
    g.innerHTML=`<div class="card"><div style="font-size:36px">🔐</div><h2>Tokyo Trip Planner</h2>
      <p>ใส่รหัสผ่านเพื่อเข้าใช้งาน</p>
      <input type="password" id="tp-pass" placeholder="รหัสผ่าน" autofocus>
      <div class="err" id="tp-err"></div>
      <button id="tp-go">เข้าสู่ระบบ</button></div>`;
    document.documentElement.appendChild(g);   // child of <html> so it shows while body is hidden
    const inp=g.querySelector('#tp-pass'), err=g.querySelector('#tp-err');
    const unlock=()=>{
      if(inp.value===LOCK_PASS){
        try{ sessionStorage.setItem('tp-unlocked','1'); }catch(e){}
        g.remove(); st.remove();
      }else{
        err.textContent='รหัสผ่านไม่ถูกต้อง — ลองอีกครั้ง';
        g.classList.remove('shake'); void g.offsetWidth; g.classList.add('shake');
        inp.select();
      }
    };
    g.querySelector('#tp-go').onclick=unlock;
    inp.onkeydown=e=>{ if(e.key==='Enter'){ e.preventDefault(); unlock(); } };
    setTimeout(()=>inp.focus(),50);
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',show); else show();
})();


// ---------- budget math ----------
const FOOD_MULT = {"ประหยัด":0.8,"กลาง":1.0,"สบาย":1.3};
function foodMultOf(S){ return FOOD_MULT[S.settings.foodStyle] || 1.0; }
function dayTotalsOf(S, day){
  const rows = day.variants[day.activeVariant].rows;
  const fm = foodMultOf(S);
  let train=0, entry=0, food=0, other=0;
  rows.forEach(r=>{
    if(!r.inc || !day.inc) return;
    train+=r.train;
    if(r.type==='food') food+=r.cost*fm;
    else if(r.type==='entry') entry+=r.cost;
    else if(r.cost) other+=r.cost;
  });
  return {train, entry, food, other, sum: train+entry+food+other};
}
function totalsOf(S){
  let train=0, entry=0, food=0, other=0;
  S.days.forEach(d=>{ const t=dayTotalsOf(S,d); train+=t.train; entry+=t.entry; food+=t.food; other+=t.other; });
  const st=S.settings;
  const hotel = st.hotelTokyo*st.nightsTokyo + st.hotelShizuoka*st.nightsShizuoka;
  const grand = train+entry+food+other+hotel;
  return {train, entry, food, other, hotel, grand, baht: Math.round(grand*st.fx)};
}

// ---------- toast & modal (self-contained DOM) ----------
function _ensureStyle(){
  if(document.getElementById('tp-appcss')) return;
  const st=document.createElement('style');
  st.id='tp-appcss';
  st.textContent=`
  .tp-toast{position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:#20242E; color:#fff;
    font-family:"Mitr",sans-serif; font-size:13px; padding:10px 18px; border-radius:12px; z-index:1200;
    opacity:0; transition:.25s; pointer-events:none; max-width:90vw;}
  .tp-toast.show{opacity:1;}
  .tpm-wrap{position:fixed; inset:0; background:rgba(32,36,46,.5); z-index:1100; display:flex; align-items:center; justify-content:center; padding:16px;}
  .tpm{background:#fff; border-radius:16px; box-shadow:0 12px 40px rgba(32,36,46,.25); max-width:440px; width:100%; padding:20px; font-family:"Sarabun",sans-serif;}
  .tpm h3{font-family:"Mitr"; font-weight:600; font-size:17px; margin:0 0 6px; color:#20242E; word-break:break-word;}
  .tpm .tpm-body{font-size:13.5px; color:#5A6270; margin-bottom:14px; line-height:1.5;}
  .tpm .tpm-ops{display:flex; gap:8px; flex-wrap:wrap; justify-content:flex-end;}
  .tpm button{font-family:"Mitr"; font-size:13px; border-radius:10px; padding:8px 16px; cursor:pointer; border:1px solid #DCDDD4; background:#F4F5F2; color:#20242E;}
  .tpm button.primary{background:#2F5E50; border-color:#2F5E50; color:#fff;}
  .tpm button:hover{filter:brightness(.97);}
  /* tag chips */
  .tgc{display:inline-block; font-family:"Mitr"; font-size:10px; padding:1px 8px; border-radius:10px; border:1px solid; vertical-align:middle; white-space:nowrap;}
  .tgc-attraction{background:#F3D9CF; color:#CE4A2B; border-color:#EAC3B4;}
  .tgc-food{background:#F3E2BE; color:#94660c; border-color:#E8D3A2;}
  .tgc-shopping{background:#E6EDF5; color:#33506F; border-color:#D3DFEC;}
  .tgc-rest{background:#E7EBE8; color:#6f8078; border-color:#D8DED9;}
  .tgc-logistic{background:#DCEAE3; color:#2F5E50; border-color:#C8DCCF;}
  .tgc-view{background:#E9E0F0; color:#6B4E8E; border-color:#D9C9E5;}
  .tgc-other{background:#EFF0ED; color:#5A6270; border-color:#DFE2DD;}
  /* idea library */
  .ideabar{display:flex; gap:6px; flex-wrap:wrap; margin-bottom:12px;}
  .ideabar button{font-family:"Mitr"; font-size:12px; border:1px solid #DCDDD4; background:#fff; border-radius:18px; padding:4px 13px; cursor:pointer;}
  .ideabar button.on{background:#2F5E50; color:#fff; border-color:#2F5E50;}
  .ideagrid{display:grid; gap:10px; grid-template-columns:repeat(auto-fill,minmax(250px,1fr));}
  .ideacard{background:#fff; border:1px solid #DCDDD4; border-radius:13px; padding:11px 13px; box-shadow:0 1px 2px rgba(32,36,46,.06),0 8px 24px rgba(32,36,46,.07); display:flex; flex-direction:column; gap:4px;}
  .ideacard .ic-name{font-weight:600; font-size:13.5px;}
  .ideacard .ic-meta{font-size:11.5px; color:#5A6270;}
  .ideacard .ic-note{font-size:11.5px; color:#5A6270; line-height:1.45; flex:1;}
  .ideacard .ic-ops{display:flex; gap:6px; margin-top:6px; align-items:center;}
  .ideacard select{flex:1; min-width:0; border:1px solid #DCDDD4; border-radius:8px; padding:4px 6px; font-family:"Mitr"; font-size:11.5px; background:#FBFCFA;}
  .ideacard button{border:none; background:#2F5E50; color:#fff; font-family:"Mitr"; font-size:11.5px; border-radius:8px; padding:6px 11px; cursor:pointer; white-space:nowrap;}
  .ideacard button:hover{background:#244a3f;}`;
  document.head.appendChild(st);
}
function toast(msg, ms){
  _ensureStyle();
  let t=document.getElementById('tp-app-toast');
  if(!t){ t=document.createElement('div'); t.id='tp-app-toast'; t.className='tp-toast'; document.body.appendChild(t); }
  t.textContent=msg; t.classList.add('show');
  clearTimeout(t._h); t._h=setTimeout(()=>t.classList.remove('show'), ms||2600);
}
function modal({title, body, buttons}){
  _ensureStyle();
  return new Promise(res=>{
    const wrap=document.createElement('div'); wrap.className='tpm-wrap';
    const ops=buttons.map((b,i)=>`<button data-i="${i}" class="${b.cls||''}">${b.label}</button>`).join('');
    wrap.innerHTML=`<div class="tpm"><h3>${title}</h3><div class="tpm-body">${body||''}</div><div class="tpm-ops">${ops}</div></div>`;
    document.body.appendChild(wrap);
    wrap.addEventListener('click', e=>{
      const btn=e.target.closest('button');
      if(!btn){ if(e.target===wrap){ wrap.remove(); res(null);} return; }
      wrap.remove(); res(buttons[+btn.dataset.i].val);
    });
  });
}

// ---------- Excel export ----------
function buildWorkbook(S){
  const st=S.settings;
  const wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
    ["รายการ","ค่า","หมายเหตุ"],
    ["อัตราแลกเงิน (¥→฿)",st.fx,""],
    ["สไตล์อาหาร",st.foodStyle,"ประหยัด=0.8 กลาง=1.0 สบาย=1.3"],
    ["โรงแรมโตเกียว (¥/คืน)",st.hotelTokyo,""],
    ["คืนโตเกียว",st.nightsTokyo,""],
    ["โรงแรม Shizuoka (¥/คืน)",st.hotelShizuoka,""],
    ["คืน Shizuoka",st.nightsShizuoka,""],
    ["ผู้ใหญ่",st.adults,""],["เด็ก",st.children,""],
  ]),"ตั้งค่า");
  const plan=[["วันที่ (ISO)","วันที่","วัน","ป้าย","โหมด","รวมวัน?","ชื่อวัน","คำอธิบายวัน","ตัวเลือก","เวลา","กิจกรรม","แท็ก","เส้นทาง","ขนส่ง/สาย","ระยะเวลา","ค่าเดินทาง ¥","ค่าใช้จ่าย ¥","หมวด","รวมแถว?","โน้ต","dayKey"]];
  S.days.forEach((d,di)=>{
    d.variants.forEach(vr=>{
      vr.rows.forEach(r=>{
        plan.push([d.date,d.d,d.dow,d.tag,d.pace,d.inc?"รวม":"ไม่รวม",d.title,d.sub||"",vr.name,
          r.time,r.act,r.tag||"",r.ft||"",r.line||"",r.dur||"",r.train||0,r.cost||0,r.type||"",r.inc?"รวม":"ไม่รวม",r.note||"",di+1]);
      });
    });
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(plan),"แผนรายวัน");
  const T=totalsOf(S);
  const dash=[["ตัวชี้วัด","ค่า"],["งบรวมทั้งหมด (¥)",T.grand],["งบรวม (฿)",T.baht],
    ["เดินทาง (¥)",T.train],["ค่าเข้าชม (¥)",T.entry],["อาหาร (¥)",T.food],["อื่นๆ (¥)",T.other],
    ["ที่พัก (¥)",T.hotel],["สไตล์อาหาร",st.foodStyle],["",null],
    ["Day","วันที่","ธีม","รวมวัน (¥)","รวมวัน (฿)"]];
  S.days.forEach((d,i)=>{ const t=dayTotalsOf(S,d); dash.push([`D${i+1}`,d.d,d.title,t.sum,Math.round(t.sum*st.fx)]); });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(dash),"แดชบอร์ด");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["เส้นทาง","สายรถ","เวลา","¥/คน","พิเศษ"],
    ...S.routes.map(r=>[r[0],r[1],r[2],r[3],r[4]?"Kamakura/Shizuoka":""])]),"เส้นทาง");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["รายการ","รายละเอียด","ช่วงเวลา","แท็ก","สถานะ"],
    ...S.checks.map(c=>[c[0],c[1],c[2],c[3],c[4]])]),"เช็กลิสต์จอง");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["ชื่อ","พื้นที่","แท็ก","ราคาประมาณ ¥ (2 คน)","โน้ต","ย้ายออกจากวัน"],
    ...(S.parked||[]).map(p=>[p.n||'',p.area||'',p.tag||'',p.est||0,p.note||'',p.from||''])]),"คลังไอเดีย");
  return wb;
}
function downloadExcel(S){
  if(typeof XLSX==='undefined'){ toast('โหลดโมดูล Excel ไม่สำเร็จ (ต้องออนไลน์ครั้งแรก)'); return; }
  XLSX.writeFile(buildWorkbook(S), S.meta.filename || "trip-plan.xlsx");
  toast("บันทึกลง Excel แล้ว — ย้ายไฟล์ไปแทนไฟล์เดิมได้เลย");
}

// ---------- Excel import (pure parse → state) ----------
function parseExcelState(buf, filename){
  if(typeof XLSX==='undefined') return {ok:false, error:'โหลดโมดูล Excel ไม่สำเร็จ (ต้องออนไลน์ครั้งแรก)'};
  let wb;
  try { wb=XLSX.read(buf,{type:'array'}); } catch(e){ return {ok:false, error:'อ่านไฟล์ไม่ได้: '+e.message}; }
  const grid=name=>{const ws=wb.Sheets[name]; return ws?XLSX.utils.sheet_to_json(ws,{header:1,defval:''}):null;};
  const findSheet=kw=>wb.SheetNames.find(n=>n.includes(kw)) || null;

  const settings={fx:0.23, foodStyle:"กลาง", hotelTokyo:13000, nightsTokyo:8, hotelShizuoka:12000, nightsShizuoka:0, adults:2, children:1};
  const setSh=findSheet('ตั้งค่า');
  if(setSh){
    (grid(setSh)||[]).forEach(row=>{
      const k=String(row[0]||'').trim(), val=row[1];
      if(!k) return;
      if(k.includes('อัตราแลก')) settings.fx=parseFloat(val)||settings.fx;
      else if(k.includes('สไตล์อาหาร')) settings.foodStyle=FOOD_MULT[val]?val:settings.foodStyle;
      else if(k.includes('โตเกียว')&&k.includes('¥')) settings.hotelTokyo=parseFloat(val)||settings.hotelTokyo;
      else if(k.includes('คืนโตเกียว')) settings.nightsTokyo=parseInt(val)||0;
      else if(k.includes('Shizuoka')&&k.includes('¥')) settings.hotelShizuoka=parseFloat(val)||settings.hotelShizuoka;
      else if(k.includes('คืน Shizuoka')) settings.nightsShizuoka=parseInt(val)||0;
      else if(k==='ผู้ใหญ่') settings.adults=parseInt(val)||2;
      else if(k==='เด็ก') settings.children=parseInt(val)||1;
    });
  }

  const planSh=findSheet('แผนรายวัน');
  if(!planSh) return {ok:false, error:'ไม่เจอชีต "แผนรายวัน" ในไฟล์นี้'};
  const g=grid(planSh);
  let hIdx=-1, col={};
  for(let i=0;i<Math.min(g.length,15);i++){
    const cells=(g[i]||[]).map(c=>String(c).trim());
    const t=cells.findIndex(c=>c==='เวลา'), a=cells.findIndex(c=>c.includes('กิจกรรม'));
    if(t>=0 && a>=0){
      hIdx=i;
      const find=(names,dflt)=>{ for(const n of names){
          const exact=n.startsWith('='), q=exact?n.slice(1):n;
          let j=cells.findIndex(c=>c===q);
          if(j<0 && !exact) j=cells.findIndex(c=>c.includes(q));
          if(j>=0) return j; } return dflt; };
      col={date:find(['วันที่ (ISO)','ISO','=Day'],0), d:find(['วันที่'],1), dow:find(['=วัน'],2),
        tag:find(['=ป้าย'],-1), pace:find(['=โหมด'],-1), dayinc:find(['รวมวัน'],-1),
        title:find(['ชื่อวัน','ธีม'],6), sub:find(['คำอธิบาย'],-1),
        variant:find(['ตัวเลือก'],-1), time:t, act:a, tag:find(['แท็ก'],a+1), ft:find(['เส้นทาง'],a+2), line:find(['ขนส่ง'],a+3),
        dur:find(['ระยะเวลา'],a+4), train:find(['ค่าเดินทาง'],a+5), cost:find(['ค่าใช้จ่าย'],a+6),
        type:find(['หมวด'],a+7), rowinc:find(['รวมแถว','รวมงบ'],a+8), note:find(['โน้ต','note'],a+9)};
      break;
    }
  }
  if(hIdx<0) return {ok:false, error:'ไม่เจอแถวหัวตาราง (ต้องมีคอลัมน์ "เวลา" และ "กิจกรรม")'};

  const days=[]; let cur=null, curVarName=null;
  const TYPE_MAP={'อาหาร':'food','ค่าเข้า':'entry','อื่นๆ':'misc','food':'food','entry':'entry','misc':'misc'};
  for(let i=hIdx+1;i<g.length;i++){
    const row=g[i]||[];
    const cell=j=>{const c=row[j]; return c===undefined||c===null?'':c;};
    const act=String(cell(col.act)).trim();
    const time=String(cell(col.time)).trim();
    if(!act && !time) continue;
    const iso=String(cell(col.date)).trim();
    const dLabel=String(cell(col.d)).trim();
    const varName=String(cell(col.variant)).trim();
    if(!cur || (iso && iso!==cur.date) || (!iso && dLabel && dLabel!==cur.d)){
      cur={date:iso, d:dLabel||('Day '+(days.length+1)),
        dow:String(cell(col.dow)).trim()||'', tag:col.tag>=0?(String(cell(col.tag)).trim()||'วันกลาง'):'วันกลาง',
        pace:col.pace>=0?(String(cell(col.pace)).trim()||'med'):'med',
        inc:col.dayinc<0?true:(String(cell(col.dayinc)).trim()!=='ไม่รวม'),
        title:String(cell(col.title)).trim()||dLabel, sub:col.sub>=0?String(cell(col.sub)).trim():'',
        activeVariant:0, variants:[]};
      days.push(cur); curVarName=null;
    }
    if(varName && varName!==curVarName){
      cur.variants.push({name:varName, rows:[]}); curVarName=varName;
    }
    if(!cur.variants.length){ cur.variants.push({name:'แผนหลัก', rows:[]}); curVarName='แผนหลัก'; }
    const vr=cur.variants[cur.variants.length-1];
    const toNum=x=>{const n=parseFloat(String(x).replace(/[^0-9.\-]/g,'')); return isNaN(n)?0:n;};
    vr.rows.push({time, act,
      tag:col.tag>=0?String(cell(col.tag)).trim():'',
      ft:String(cell(col.ft)).trim(), line:String(cell(col.line)).trim(), dur:String(cell(col.dur)).trim(),
      train:toNum(cell(col.train)), cost:toNum(cell(col.cost)),
      type:TYPE_MAP[String(cell(col.type)).trim()]||'',
      inc:String(cell(col.rowinc)).trim()!=='ไม่รวม',
      note:String(cell(col.note)).trim()});
  }
  if(!days.length) return {ok:false, error:'ไม่พบข้อมูลกิจกรรมในไฟล์'};

  let checks=null;
  const chkSh=findSheet('เช็กลิสต์');
  if(chkSh){
    const cg=grid(chkSh);
    const hi=cg.findIndex(r=>r.some(c=>String(c).includes('รายการ')));
    if(hi>=0){
      const items=[];
      for(let i=hi+1;i<cg.length;i++){
        const r=cg[i]||[];
        const item=String(r[0]||'').trim(); if(!item || item==='รายการ' || item.length<4) continue;
        items.push([item,String(r[1]||'').trim(),String(r[2]||'').trim(),'w-pre',
          ['จองแล้ว','รอตัดสินใจ'].includes(String(r[4]||'').trim())?String(r[4]).trim():'ยังไม่ได้ทำ']);
      }
      if(items.length) checks=items;
    }
  }
  let routes=null;
  const rtSh=findSheet('เส้นทาง');
  if(rtSh){
    const rg=grid(rtSh);
    const hi=rg.findIndex(r=>String(r[0]||'').includes('เส้นทาง')&&String(r[0]||'').length<20);
    if(hi>=0){
      const items=[];
      for(let i=hi+1;i<rg.length;i++){
        const r=rg[i]||[]; if(!String(r[0]||'').trim()) continue;
        items.push([String(r[0]),String(r[1]||''),String(r[2]||''),parseFloat(r[3])||0,String(r[4]||'').includes('Kamakura')?1:0]);
      }
      if(items.length) routes=items;
    }
  }
  // parked ideas (removed from the plan, kept in the library) — Excel round-trip
  let parked=[];
  const pkSh=findSheet('คลัง');
  if(pkSh){
    const pg=grid(pkSh);
    const hi=pg.findIndex(r=>String(r[0]||'').trim()==='ชื่อ');
    if(hi>=0){
      for(let i=hi+1;i<pg.length;i++){
        const r=pg[i]||[];
        const n=String(r[0]||'').trim(); if(!n) continue;
        const tagStr=String(r[2]||'').trim();
        parked.push({n, area:String(r[1]||'').trim(), tag:TAGS[tagStr]?tagStr:'other',
          est:parseFloat(r[3])||0, note:String(r[4]||'').trim(), from:String(r[5]||'').trim()});
      }
    }
  }
  // schema starts at 1 so migrate() can inspect content (Shizuoka → Tokyo-nights) before stamping v2
  const state={meta:{filename:filename||'excel', loadedAt:new Date().toISOString(), source:'excel', schema:1},
    settings, days, routes:routes||[], checks:checks||[], parked};
  migrate(state);
  normalizeTimes(state);
  normalizeTags(state);
  const nAct=days.reduce((a,d)=>a+d.variants.reduce((b,v)=>b+v.rows.length,0),0);
  return {ok:true, state, summary:{days:days.length, acts:nAct, migrated: !!state.__mig}};
}

// ---------- idea library renderer (shared by index & sheet) ----------
// opts: {getDays, onAdd(idea, dayIdx, parkedIdx), getParked}
// parkedIdx >= 0 → the item came from S.parked (removed from the plan); adding it back should splice it out of parked.
function tagChip(tag){ const t=TAGS[tag]||TAGS.other; return `<span class="tgc tgc-${tag||'other'}">${t.icon} ${t.label}</span>`; }
function renderIdeas(el, opts){
  _ensureStyle();
  let filter='all';
  const cats=['attraction','food','shopping'];
  function draw(){
    const days=opts.getDays();
    const parked=(opts.getParked?opts.getParked():[]);
    const entries=[...parked.map((p,pi)=>({idea:p,pi})), ...IDEAS.map(i=>({idea:i,pi:-1}))];
    const list=entries.filter(e=>filter==='all' || (filter==='parked'?e.pi>=0:e.idea.tag===filter));
    const parkedN=parked.length;
    el.innerHTML=`<div class="ideabar">
        <button data-f="all" class="${filter==='all'?'on':''}">ทั้งหมด ${entries.length}</button>
        ${cats.map(c=>`<button data-f="${c}" class="${filter===c?'on':''}">${TAGS[c].icon} ${TAGS[c].label} ${IDEAS.filter(i=>i.tag===c).length}</button>`).join('')}
        ${parkedN?`<button data-f="parked" class="${filter==='parked'?'on':''}">↩ ย้ายออกจากแผน ${parkedN}</button>`:''}
      </div>
      <div class="ideagrid">${list.map((e,ix)=>`
        <div class="ideacard">
          <div class="ic-name">${e.idea.n} ${tagChip(e.idea.tag)}</div>
          <div class="ic-meta">📍 ${e.idea.area||'—'} · ${e.idea.est?('≈¥'+(+e.idea.est||0).toLocaleString()+' (2 คน)'):'ฟรี/จ่ายตามจริง'}</div>
          <div class="ic-note">${e.idea.note||''}</div>
          <div class="ic-ops"><select data-dayfor="${ix}">${days.map((d,di)=>`<option value="${di}">${d}</option>`).join('')}</select>
            <button data-add="${ix}" data-pi="${e.pi}">＋ ใส่ในแผน</button></div>
        </div>`).join('')}</div>`;
    el.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{filter=b.dataset.f; draw();});
    el.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>{
      const ix=+b.dataset.add, pi=+b.dataset.pi;
      const sel=el.querySelector(`select[data-dayfor="${ix}"]`);
      opts.onAdd(list[ix].idea, sel?Math.max(0,+sel.value):0, pi);
      draw();
    });
  }
  draw();
}

// ---------- import flow with modal (replace current trip or create new) ----------
async function importFlow(buf, filename){
  const res=parseExcelState(buf, filename);
  if(!res.ok){ toast(res.error, 4000); return null; }
  const choice=await modal({
    title:`โหลด "${filename}"`,
    body:`อ่านได้ ${res.summary.days} วัน · ${res.summary.acts} กิจกรรม${res.summary.migrated?'<br>⚠️ ไฟล์นี้ยังมี Shizuoka — ระบบจะปรับเป็นแผนค้างโตเกียวทุกคืนอัตโนมัติ':''}<br>ต้องการทำอะไรกับข้อมูลนี้?`,
    buttons:[
      {label:'ทับทริปปัจจุบัน', cls:'primary', val:'replace'},
      {label:'สร้างทริปใหม่', val:'new'},
      {label:'ยกเลิก', val:null}
    ]});
  if(!choice) return null;
  if(choice==='new'){
    const name=(filename||'ทริปใหม่').replace(/\.xlsx?$/i,'');
    const id=Trips.create(name);
    Trips.loadData; // no-op keep shape
    res.state.meta.tripName=name;
    Trips.saveData(id, res.state);
    delete res.state.__mig;
    return {choice, state:res.state};
  }
  delete res.state.__mig;
  Trips.saveData(Trips.get().activeId, res.state);
  return {choice, state:res.state};
}

return {FOOD_MULT, foodMultOf, dayTotalsOf, totalsOf, toast, modal,
        buildWorkbook, downloadExcel, parseExcelState, importFlow,
        tagChip, renderIdeas};
})();
