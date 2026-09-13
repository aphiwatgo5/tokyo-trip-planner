#!/usr/bin/env node
// ===== gen-pptx.mjs — build the trip deck (native, fully modifiable PowerPoint) =====
// Data: data.js (SEED/FOOD_PICKS) · Maps: pptx-assets/day-N.png (route.html snapshots)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const req=createRequire(import.meta.url);
const pptxgen=req(process.env.GROOT_PPTX+'/pptxgenjs');

const HERE=path.dirname(fileURLToPath(import.meta.url));
const ROOT=path.resolve(HERE,'..');
const ASSETS=path.join(ROOT,'pptx-assets');
const OUT=path.join(ROOT,'Tokyo_Trip_Plan_2026.pptx');

// ---- load plan data (eval data.js like the other scripts) ----
const src=fs.readFileSync(path.join(ROOT,'data.js'),'utf8');
const sandbox={getItem:()=>null,setItem:()=>{},removeItem(){}};
const ctx=new Function('localStorage','window',src+'\n;return {SEED, FOOD_PICKS, normalizeTimes, normalizeTags};')(sandbox,undefined);
const S=ctx.SEED; ctx.normalizeTimes(S); ctx.normalizeTags(S);

// ---- meal-area matcher (mirrors app.js) ----
const AREA_RULES=[
  ['skytree',/solamachi|skytree|โซลามาจิ|สกายทรี/i],['asakusa',/asakusa|อาซากุสะ|senso-ji|nakamise/i],
  ['tokyostation',/tokyo station|marunouchi|nihonbashi|character street|ramen street|หน้าสถานี|กลางเมือง/i],
  ['yokohama',/minatomirai|yokohama|mark is|โยโกฮามะ/i],['kamakura',/kamakura|hase|komachi|คามาคุระ/i],
  ['disney',/maihama|disney|ikspiari|ไมฮามะ/i],['toyosu',/toyosu|lalaport|โทโยซุ/i],
  ['dome',/dome city|suidobashi|laqua|yellow street|ซุอิโดบาชิ|dome/i],['shinagawa',/shinagawa|ชินางาวะ/i]];
function mealInfo(day,row){
  const text=`${row.ft||''} ${row.act||''} ${day.zone||''}`;
  let k='ueno'; for(const [key,re] of AREA_RULES){ if(re.test(text)){k=key;break;} }
  const st=row.start!=null?row.start:720;
  return {meal:(st>=660&&st<=870)?'กลางวัน':'เย็น', area:ctx.FOOD_PICKS[k]||ctx.FOOD_PICKS.ueno};
}

// ---- palette (app theme) ----
const C={ink:'1B2430',teal:'0E5B47',teal2:'12846A',persim:'E0572F',gold:'C99327',
         muted:'69758A',tint:'E7F2ED',tintGold:'F7EBCB',line:'E6E0D2',white:'FFFFFF',navy:'0B3A2E'};
const rowsOf=d=>d.variants[d.activeVariant].rows;
const yen=n=>'¥'+Math.round(n).toLocaleString();
const dayTotal=d=>rowsOf(d).reduce((a,r)=>a+(d.inc&&r.inc?r.train+r.cost:0),0);
const grand=S.days.reduce((a,d)=>a+dayTotal(d),0)+S.settings.hotelTokyo*S.settings.nightsTokyo+S.settings.hotelShizuoka*S.settings.nightsShizuoka;

const pres=new pptxgen();
pres.layout='LAYOUT_WIDE'; // 13.3 × 7.5
pres.author='Tokyo Trip Planner'; pres.title='Tokyo Trip 2026 — Day by Day';

// ============ SLIDE 1 · TITLE (dark) ============
{
  const s=pres.addSlide(); s.background={color:C.navy};
  s.addText('TOKYO · KAMAKURA · YOKOHAMA',{x:0.9,y:1.5,w:11.5,h:0.4,fontSize:14,color:C.gold,charSpacing:4,bold:true,fontFace:'Calibri'});
  s.addText('แผนทริปโตเกียว 2026',{x:0.9,y:1.95,w:11.5,h:1.15,fontSize:54,bold:true,color:'FFFFFF',fontFace:'Calibri'});
  s.addText('28 พฤศจิกายน – 6 ธันวาคม 2026 · 9 วัน · ค้างอูเอโนะทุกคืน',{x:0.9,y:3.15,w:11.5,h:0.5,fontSize:20,color:'CFE0D8',fontFace:'Calibri'});
  const stats=[['9','วัน'],['2+1','ผู้ใหญ่ + เด็กเล็ก'],[yen(grand),'งบรวม (≈฿'+Math.round(grand*S.settings.fx).toLocaleString()+')']];
  stats.forEach((st,i)=>{
    const x=0.9+i*3.55;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x,y:4.3,w:3.2,h:1.5,rectRadius:0.12,fill:{color:'10604B'},line:{color:'1D7A62',width:1}});
    s.addText(st[0],{x,y:4.42,w:3.2,h:0.75,fontSize:30,bold:true,color:'FFFFFF',align:'center',fontFace:'Calibri'});
    s.addText(st[1],{x,y:5.18,w:3.2,h:0.45,fontSize:12,color:'BFE3D5',align:'center',fontFace:'Calibri'});
  });
  s.addText('สร้างจากแอป Tokyo Trip Planner · 28 ก.ย. 2026',{x:0.9,y:6.9,w:11.5,h:0.35,fontSize:10,color:'7FA99B',fontFace:'Calibri'});
}

// ============ SLIDE 2 · OVERVIEW ============
{
  const s=pres.addSlide(); s.background={color:C.white};
  s.addShape(pres.shapes.OVAL,{x:0.5,y:0.35,w:0.55,h:0.55,fill:{color:C.teal}});
  s.addText('ภาพรวมทริป',{x:1.2,y:0.3,w:6,h:0.6,fontSize:30,bold:true,color:C.ink,fontFace:'Calibri'});
  s.addText('จัดวันตามทิศทางรถไฟ (geo-clustered) — วันละ 1 โซน ลดเวลาต่อรถ',{x:1.2,y:0.88,w:8,h:0.4,fontSize:13,color:C.muted,fontFace:'Calibri'});
  const head=[{text:'วัน',options:{bold:true,color:'FFFFFF',fill:{color:C.teal}}},{text:'โซน',options:{bold:true,color:'FFFFFF',fill:{color:C.teal}}},{text:'แผน',options:{bold:true,color:'FFFFFF',fill:{color:C.teal}}},{text:'งบ/วัน',options:{bold:true,color:'FFFFFF',fill:{color:C.teal},align:'right'}}];
  const tbl=[head];
  S.days.forEach((d,i)=>{
    const fill=i%2?'F7F9F7':'FFFFFF';
    tbl.push([
      {text:`${d.d} ${d.dow.split('·')[0]}`,options:{fill:{color:fill},bold:true}},
      {text:d.zone||'',options:{fill:{color:fill},color:C.teal2}},
      {text:d.title,options:{fill:{color:fill}}},
      {text:d.inc?yen(dayTotal(d)):'—',options:{fill:{color:fill},align:'right',color:C.persim,bold:true}},
    ]);
  });
  tbl.push([{text:'รวม + ที่พัก 8 คืน',options:{colspan:3,bold:true,fill:{color:C.tint}}},{text:yen(grand),options:{bold:true,fill:{color:C.tint},align:'right',color:C.teal}}]);
  s.addTable(tbl,{x:0.5,y:1.45,w:8.1,colW:[1.7,2.1,3.2,1.1],fontSize:11,fontFace:'Calibri',color:C.ink,border:{pt:0.5,color:C.line},rowH:0.34,valign:'middle'});
  // right rail
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:9.0,y:1.45,w:3.8,h:5.4,rectRadius:0.1,fill:{color:C.tint},shadow:{type:'outer',color:'1B2430',blur:7,offset:2,angle:45,opacity:0.14}});
  s.addText('🔑 จุดเด่นของแผน',{x:9.25,y:1.7,w:3.3,h:0.4,fontSize:15,bold:true,color:C.teal,fontFace:'Calibri'});
  const bu=()=>({code:'25B8',indent:10,color:C.teal2});
  s.addText([
    {text:'Anpanman + Kamakura วันเดียวจบ (ลงใต้ครั้งเดียว)',options:{bullet:bu(),breakLine:true}},
    {text:'วันสลับหนัก-เบา ทุกวันมีงีบกลางวัน',options:{bullet:bu(),breakLine:true}},
    {text:'Outdoor เช้า / ในร่มบ่าย (พระอาทิตย์ตก 16:30)',options:{bullet:bu(),breakLine:true}},
    {text:'Illumination ฤดูหนาว: Dome City, Marunouchi, ริมอ่าวโยโกฮามะ',options:{bullet:bu(),breakLine:true}},
    {text:'Disney วันจันทร์ (คนน้อยสุด) + ธีมคริสต์มาส',options:{bullet:bu(),breakLine:true}},
    {text:'เด็กต่ำกว่า 6 ขวบ รถไฟฟรี · ส่วนใหญ่ค่าเข้าฟรี',options:{bullet:bu()}},
  ],{x:9.25,y:2.15,w:3.35,h:4.5,fontSize:12.5,color:C.ink,fontFace:'Calibri',paraSpaceAfter:10,margin:0,valign:'top'});
}

// ============ SLIDES 3-10 · EACH DAY ============
S.days.slice(0,8).forEach((d,di)=>{
  const s=pres.addSlide(); s.background={color:C.white};
  // header: day circle + title + zone
  s.addShape(pres.shapes.OVAL,{x:0.5,y:0.32,w:0.72,h:0.72,fill:{color:C.persim}});
  s.addText('D'+(di+1),{x:0.5,y:0.32,w:0.72,h:0.72,fontSize:20,bold:true,color:'FFFFFF',align:'center',valign:'middle',fontFace:'Calibri',margin:0});
  s.addText(`${d.dow.split('·')[1]?'':''}${d.d} ${d.dow}`,{x:1.4,y:0.28,w:6.6,h:0.45,fontSize:22,bold:true,color:C.ink,fontFace:'Calibri',margin:0});
  s.addText(d.title,{x:1.4,y:0.72,w:6.6,h:0.38,fontSize:14,color:C.teal2,bold:true,fontFace:'Calibri',margin:0});
  s.addText([{text:'📍 ',options:{}} ,{text:d.zone||'',options:{}}],{x:8.2,y:0.42,w:3.4,h:0.4,fontSize:11.5,color:C.teal,align:'right',fontFace:'Calibri',margin:0});
  // timeline table (left)
  const rows=[[{text:'เวลา',options:{bold:true,color:'FFFFFF',fill:{color:C.teal2}}},{text:'กิจกรรม',options:{bold:true,color:'FFFFFF',fill:{color:C.teal2}}},{text:'การเดินทาง / หมายเหตุ',options:{bold:true,color:'FFFFFF',fill:{color:C.teal2}}}]];
  rowsOf(d).forEach((r,ri)=>{
    const fill=ri%2?'F7F9F7':'FFFFFF';
    rows.push([
      {text:r.time||'—',options:{fill:{color:fill},color:C.persim,bold:true}},
      {text:r.act+(r.cost?`  (${r.type==='food'?'🍜':'🎟'} ¥${r.cost.toLocaleString()})`:(r.train?`  🚆¥${r.train.toLocaleString()}`:'')),options:{fill:{color:fill},bold:/attraction|shopping/.test(r.tag||'')}},
      {text:[r.line&&r.line!=='เดิน'?`🚆 ${r.line}`:'',r.note].filter(Boolean).join(' · ').slice(0,80),options:{fill:{color:fill},color:C.muted}},
    ]);
  });
  const nRows=rows.length;
  const rowH=Math.max(0.24,Math.min(0.42,5.3/nRows));
  s.addTable(rows,{x:0.5,y:1.28,w:7.0,colW:[1.05,3.05,2.9],fontSize:nRows>11?9.5:10.5,fontFace:'Calibri',color:C.ink,border:{pt:0.5,color:C.line},rowH,valign:'middle'});
  s.addText(`งบวันนี้ ${d.inc?yen(dayTotal(d)):'ไม่นับ'}${d.extras&&d.extras.length?`   ·   ⏳ เหลือแรง: ${d.extras[0]}`:''}`,{x:0.5,y:7.02,w:7,h:0.35,fontSize:11,color:C.muted,fontFace:'Calibri',margin:0});
  // map (right top)
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:7.72,y:1.22,w:5.1,h:3.28,rectRadius:0.08,fill:{color:'FFFFFF'},line:{color:C.line,width:1},shadow:{type:'outer',color:'1B2430',blur:7,offset:2,angle:45,opacity:0.16}});
  s.addImage({path:path.join(ASSETS,`day-${di+1}.png`),x:7.82,y:1.32,w:4.9,h:3.08,sizing:{type:'cover',w:4.9,h:3.08}});
  s.addText('เส้นทางจริงของวันนี้ (เดิน = เส้นเขียว · รถไฟ = เส้นน้ำเงินประะ)',{x:7.82,y:4.42,w:4.9,h:0.28,fontSize:9,color:C.muted,fontFace:'Calibri',margin:0,italic:true});
  // food picks (right bottom)
  const meals={};
  rowsOf(d).filter(r=>r.type==='food'&&r.start!=null&&r.start>=660).forEach(r=>{
    const mi=mealInfo(d,r); const key=mi.meal;
    if(!meals[key]) meals[key]={area:mi.area,items:[]};
    if(meals[key].items.length<3) meals[key].items.push(mi.area.items[Math.min(meals[key].items.length,mi.area.items.length-1)]);
  });
  const mealKeys=Object.keys(meals);
  if(mealKeys.length){
    const boxY=4.78, boxH=2.55;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:7.72,y:boxY,w:5.1,h:boxH,rectRadius:0.08,fill:{color:C.tintGold}});
    s.addText('🍜 ตัวเลือกร้านแนะนำของวันนี้',{x:7.95,y:boxY+0.1,w:4.7,h:0.35,fontSize:13,bold:true,color:'8A6A1F',fontFace:'Calibri',margin:0});
    let yy=boxY+0.5;
    mealKeys.forEach(k=>{
      const m=meals[k];
      s.addText(`${k==='กลางวัน'?'🌤':'🌙'} มื้อ${k} — ย่าน${m.area.label}`,{x:7.95,y:yy,w:4.7,h:0.3,fontSize:11,bold:true,color:C.ink,fontFace:'Calibri',margin:0});
      yy+=0.3;
      s.addText(m.items.map((it,ix)=>`${it.n} (~¥${it.price}/คน)${ix<m.items.length-1?'  ·  ':''}`).join(''),
        {x:8.1,y:yy,w:4.55,h:0.55,fontSize:10,color:'6B5A2E',fontFace:'Calibri',margin:0});
      yy+=0.62;
    });
    s.addText('เลือกสดตอนไปถึง — ดูตัวเลือกเพิ่มกด 🍜 ในแอป',{x:7.95,y:boxY+boxH-0.32,w:4.7,h:0.28,fontSize:9,italic:true,color:'8A6A1F',fontFace:'Calibri',margin:0});
  }
});

// ============ SLIDE 11 · BOOKING + TIPS (dark close) ============
{
  const s=pres.addSlide(); s.background={color:C.navy};
  s.addText('เช็กลิสต์ก่อนเที่ยว',{x:0.9,y:0.45,w:6,h:0.6,fontSize:28,bold:true,color:'FFFFFF',fontFace:'Calibri'});
  const buW=()=>({code:'25A1',indent:12,color:C.gold});
  s.addText(S.checks.map((c,i)=>({text:`${c[2]} — ${c[0]}`,options:{bullet:buW(),breakLine:i<S.checks.length-1}})),
    {x:0.9,y:1.2,w:6.3,h:5.6,fontSize:13,color:'E8F0EC',fontFace:'Calibri',paraSpaceAfter:9,margin:0,valign:'top'});
  s.addText('❄️ เคล็ดลับต้นธันวา',{x:7.7,y:0.45,w:5,h:0.6,fontSize:28,bold:true,color:'FFFFFF',fontFace:'Calibri'});
  const buT=()=>({code:'25B8',indent:12,color:'7FD1B9'});
  s.addText([
    {text:'อากาศ 8–15°C แห้ง ฝนน้อย — แจ็กเก็ตบาง+ผ้าห่มรถเข็นให้ Hooga',options:{bullet:buT(),breakLine:true}},
    {text:'พระอาทิตย์ตก ~16:30 — outdoor ก่อนบ่ายสาม แล้วต่อในร่ม/ดูไฟ',options:{bullet:buT(),breakLine:true}},
    {text:'Illumination เปิดเต็มที่: Marunouchi (D7) · Dome City (D6) · ริมอ่าวโยโกฮามะ (D4)',options:{bullet:buT(),breakLine:true}},
    {text:'Disney ธีมคริสต์มาสถึง 25 ธ.ค.',options:{bullet:buT(),breakLine:true}},
    {text:'วันเสาร์ (D8) คนเยอะสุด — จัดเป็นวันเก็บกระเป๋า+ช้อปใกล้บ้าน',options:{bullet:buT(),breakLine:true}},
    {text:'ปิดปีใหม่เริ่ม ~29 ธ.ค. — ช่วงเราปกติเต็มที่',options:{bullet:buT()}},
  ],{x:7.7,y:1.2,w:5.0,h:3.6,fontSize:13,color:'E8F0EC',fontFace:'Calibri',paraSpaceAfter:9,margin:0,valign:'top'});
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:7.7,y:5.0,w:5.0,h:1.7,rectRadius:0.1,fill:{color:'10604B'},line:{color:'1D7A62',width:1}});
  s.addText('แอปประกอบแผน',{x:7.95,y:5.15,w:4.5,h:0.35,fontSize:14,bold:true,color:C.gold,fontFace:'Calibri'});
  s.addText('aphiwatgo5.github.io/tokyo-trip-planner\nรหัสผ่าน: hoogaati → hoogaati · แก้แผนได้สด แล้ว sync Excel สองทาง',{x:7.95,y:5.5,w:4.5,h:1.0,fontSize:12,color:'CFE0D8',fontFace:'Calibri',margin:0});
}

pres.writeFile({fileName:OUT}).then(()=>console.log('written:',OUT));
