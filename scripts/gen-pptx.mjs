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
  ['ueno',/ueno|อูเอโนะ|ameyoko/i],
  ['skytree',/solamachi|skytree|โซลามาจิ|สกายทรี/i],['asakusa',/asakusa|อาซากุสะ|senso-ji|nakamise/i],
  ['tokyostation',/tokyo station|marunouchi|nihonbashi|character street|ramen street|หน้าสถานี|กลางเมือง/i],
  ['yokohama',/minatomirai|yokohama|mark is|โยโกฮามะ/i],['kamakura',/kamakura|hase|komachi|คามาคุระ/i],
  ['disney',/maihama|disney|ikspiari|ไมฮามะ/i],['toyosu',/toyosu|lalaport|โทโยซุ/i],
  ['dome',/dome city|suidobashi|laqua|yellow street|ซุอิโดบาชิ|dome/i],['shinagawa',/shinagawa|ชินางาวะ/i],['harajuku',/harajuku|omotesando|ฮาราจูกุ|meiji|ไมเจะ|ginkgo|แปะก๊วย/i],['azabudai',/azabudai|kamiyacho|borderless|อะซาบูได/i],['ikebukuro',/ikebukuro|อิเกบุคุโร|sunshine city|pok[eé]mon center mega/i]];
function mealInfo(day,row){
  const t1=`${row.ft||''} ${row.act||''}`;
  const t2=`${t1} ${day.zone||''}`;
  let k='ueno';
  for(const [key,re] of AREA_RULES){ if(re.test(t1)){k=key;break;} }          // row's own words win
  if(k==='ueno'&&t2!==t1) for(const [key,re] of AREA_RULES){ if(re.test(t2)){k=key;break;} } // zone only as fallback
  const st=row.start!=null?row.start:720;
  return {meal:(st>=660&&st<=870)?'กลางวัน':'เย็น', area:ctx.FOOD_PICKS[k]||ctx.FOOD_PICKS.ueno};
}

// ---- per-place tips harvested from public reviews (Reddit/TripAdvisor/Google/official), 2026-09-06 ----
// ---- per-place tips harvested from public reviews (Reddit/TripAdvisor/official), retrieved 2026-09-27 ----
const DAY_TIPS={ // di (0-7) → [{p:place, t:[tips]}]
 0:[{p:'Haneda → Yaesu + วันแรก',t:[
    'รถเข็นร่มแบบเบาดีที่สุด — ลิฟต์สถานีเล็กและต้องรอ (Reddit r/JapanTravelTips)',
    'ตั้ง Suica ใน Wallet มือถือตั้งแต่สนามบิน — Tokyo Station ออกประตู Yaesu เดิน 5 นาทีถึง Sardonyx',
    'Ramen Street (B1) ซื้อบัตรที่ตู้ก่อนเข้าคิว เตรียมเงินสด · เลี่ยง 12:00–13:00 (planmyjapan/TripAdvisor)']},
   {p:'Shibuya SKY 🌆',t:[
    'เปิดจอง 14 วันก่อน เที่ยงคืน JST (23:00 ไทย) — รอบ sunset หมดใน ~3 นาที ต้องลุ้นเป็น (TripAdvisor/Reddit)',
    'แผนสำรอง: จอบรอบบ่ายแล้วอยู่บนหอจนถึงพระอาทิตย์ตกได้ — เข้าก่อน sunset 30–45 นาทีสวยสุด (Reddit)',
    'ลมบนหอแรง + แดดจ้า — ผ้าห่ม/หมวก Hooga · ฝนตก outdoor ปิดได้ (ทางการ)']}],
 1:[{p:'ร้านกิโมโน Asakusa 👘',t:[
    'จองล่วงหน้าและเลือกร้านที่ระบุว่ามีชุดเด็กเล็ก/ทารก — ไม่ใช่ทุกร้านมี (web: รีวิวร้านกิโมโน Asakusa)',
    'แต่งช่วง 09:30–10:00 แล้วเดิน Sensō-ji ตอน 10:30 — แสงเช้าสวย คนน้อยกว่ากลางวันมาก (รีวิวทั่วไป)',
    'รองเท้าแตะ/รองเท้าหลุดง่ายใส่มา — ร้านให้ยืมถุงเท้า/tabii อยู่แล้ว (guides)']},
   {p:'Sensō-ji + Nakamise',t:[
    'หอใหญ่/อาคารหลักในปิด ~17:00 แต่ลานกลางแจ้งเปิดตลอด — จุดถ่าย Kaminarimon เช้าไฟสวย (รีวิวทั่วไป)',
    'ningyo-yaki ท้าย Nakamise ซื้อง่าย มีกล่องของฝาก (guides)']},
   {p:'Hanayashiki',t:[
    'หน้าหนาว (พ.ย.–ก.พ.) เปิด 10:00–16:00 — ต้องมาช่วงกลางวัน แผนเรา 13:15 พอดี (เว็บทางการ)',
    'เด็ก 0–4 ขวบขึ้นส่วนใหญ่ฟรี · ค่าเข้า + จ่ายรายเครื่อง ~¥100–200 (japanforkids/TripAdvisor)']}],
 2:[{p:'รถไฟ Tokyo Sta. → Kamakura',t:[
    'JR Yokosuka ขบวนตรงจาก Tokyo Station ~57 นาที ไม่ต้องเปลี่ยน — นั่งชิวกว่าเปลี่ยนที่ Yokohama (Japan Guide/JR)',
    'Hooga <6 ขวบฟรี — อุ้มบนตักผ่านประตู Suica ได้เลย (กฎ JR)']},
   {p:'Kamakura (Hase + พระใหญ่)',t:[
    'พระใหญ่เดินรอบสั้น รถเข็นไหลได้ · Hase-dera บันได+ทางชัน — ผูกอุ้มสะพายจะสบายกว่า (Reddit/onedayaway)',
    'สูตรครอบครัว: รถเข็น + ผูกอุ้มสำรอง — ลานพระใช้รถเข็น เข้าวัดสลับอุ้ม (Lemon8/geminiconnect)',
    'Enoden บ่ายแน่นได้ ถ้าคิวยาว เดิน/แท็กซี่ Hase≈10 นาทีก็ถึง (inference จากรีวิว)']}],
 3:[{p:'บัตร + เข้าสวน Disney',t:[
    'Hooga (ต่ำกว่า 4 ขวบ) เข้าฟรี · ผู้ใหญ่บัตรตามวัน หลังขึ้นราคา ต.ค. 2025 แพงสุด ~¥12,400 — ซื้อออนไลน์ระบุวันล่วงหน้า (เว็บทางการ TDR)',
    'จองร้านอาหารในสวน (Priority Seating) ผ่านแอปตั้งแต่เช้า — มื้อกลางวันคิวยาวมาก (familyintokyo)',
    'คิวเครื่องเล่นฮิต 90+ นาที เป็นเรื่องปกติ — วัย Hooga เล่น Fantasyland/Toontown พอ (Reddit r/DisneyPlanning)']},
   {p:'รถเข็น + Baby Center',t:[
    'เช่ารถเข็นในสวน ~¥1,000/วัน หรือพาของเราไป — จุดจอดรถเข็นมีทุกเครื่องเล่น (familyintokyo)',
    'Baby Center: เปลี่ยนผ้าอ้อม ห้องให้นม อุ่นนม — จำตำแหน่งจากแผนที่ในแอป (emmajaneexplores)']},
   {p:'จังหวะวัน',t:[
    'งีบในรถเข็นช่วงบ่าย = กลยุทธ์มาตรฐานครอบครัวญี่ปุ่น เดินช้า พักบ่อย (guides)',
    'พาเหรดคริสต์มาสบ่ายแก่ — ยืนดูริมทางเดินหลักได้ ไม่ต้องยืนจองจุดล่วงหน้านาน']}],
 4:[{p:'Meiji Jingu ⛩',t:[
    'เข้าทาง Harajuku gate ตอนเช้า ~9:30 คนน้อยและเงียบสุด — ทางเดินกรับเบิลกว้าง รถเข็นสบาย (รีวิวทั่วไป)',
    'น้ำมันเจอะ? — บริเวณวัดมีของประดับฤดู ถ่ายรูปสวยแต่ห้ามปีน (ทางการ)']},
   {p:'Harajuku + Omotesando',t:[
    'Takeshita ช่วงเช้าวันธรรมดายังโล่ง — คนเพิ่มช่วงบ่าย (TripAdvisor)',
    'Omotesando Hills ล็อบบี้กว้าง ลิฟต์ใหญ่ — เดินหนีร้อน/หนาวกับรถเข็นได้ (guides)']},
   {p:'ถนนแปะก๊วย Meiji Gaien 🍁',t:[
    'พีคเหลืองทอง ~ปลาย พ.ย.–ต้น ธ.ค. พอดีช่วงเรา — ไฟส้มยามเย็นสวยสุด ~16:00–16:30 (Japan Guide/inference)',
    'ปิดถนนสำหรับรถบางช่วงฤดู — เดินกลางถนนถ่ายรูปได้ (ขึ้นกับปี)']}],
 5:[{p:'teamLab Borderless 🎨',t:[
    'เลือก Borderless ถูกแล้ว — ไม่มีน้ำ บรรยากาศเหมาะเด็กเล็กกว่า Planets ชัดเจน (Reddit/roamingcrew)',
    'รถเข็นเข้าไม่ได้ — ฝากที่ล็อกเกอร์ ใช้ผูกอุ้มตลอด · ≤3 ขวบเข้าฟรี (ทางการ/รีวิว)',
    'จองรอบแรก 09:00–10:00 — คนทึ่มเข้า 9:30–10:00 เป็นกลุ่มใหญ่ รอบแรกสบายสุด (Reddit)',
    'Azabudai Hills มีห้องให้นม/เปลี่ยนผ้าอ้อม — เป็นย่าน kid-friendly มาก (wanderlog)']},
   {p:'Maxell Aqua Park 🐬',t:[
    'โชว์โลมา ~15 นาที/รอบหลายรอบต่อวัน — เช็กบอร์ดตารางก่อนเข้า แล้ววางเดินย้อนจากรอบที่จะดู (TripAdvisor)',
    'ป้อนอาหารโลมา ¥700 หมดไว — อยากได้ซื้อตั้งแต่เข้า · ให้อาหารคาปิบาร่า ¥200 (TripAdvisor FAQ)',
    'รอบแรกของวันเหมาะกับเด็กเล็กสุด (ก่อนหิว-ง่วง) · คาร์เซลเด็กชอบมาก (japanforkids/Reddit)']}],
 6:[{p:'Pokémon Center Mega Tokyo',t:[
    'สาขาใหญ่สุดในญี่ปุ่น อยู่ Sunshine City — เดินจากสถานี Ikebukuro ~8 นาที ไม่ต้องจอง (ทางการ Pokémon)',
    'เช้าวันธรรมดาคนน้อยสุด · ของลิมิเต็ตหมุนเวียน — เช็กก่อนซื้อที่สาขาอื่น (รีวิว)',
    '(ที่เลือกแทน Pokémon Café ที่ต้องลุ้นจอง 31 วันก่อน — ไม่เสี่ยงพลาดแผน) (inference)']},
   {p:'Optional: Ueno Zoo / Anpanman',t:[
    'Ueno Zoo: คิวแพนด้ายาวเป็นชั่วโมงช่วงพีค — เข้าเร็วแล้วตรงไปแพนด้าก่อน เลิกขายบัตรเข้าแพนด้า ~16:00 (TripAdvisor/ฟอรัม)',
    'Anpanman: ต้องจองออนไลน์ล่วงหน้าเท่านั้น ไม่มีขายหน้างาน — ตัดสินใจก่อน ~1 สัปดาห์ (japanforkids/trip.com)',
    'สองอย่างนี้คือแผนสำรอง — ถ้า Hooga เพลีย พักโรงแรม + ไฟ Marunouchi ก็ครบวันแล้ว (แผนเรา)']},
   {p:'ไฟ Marunouchi (หน้าบ้าน)',t:[
    'ฟรี ทั้งถนน Nakadori + หน้าตึกอิฐ — ถ่ายจากฝั่ง Marunouchi หลัง 18:00 ไฟเต็มที่สวยสุด (ข้อมูลทั่วไป)']}],
 7:[{p:'Tokyo Character Street',t:[
    '30+ ร้านการ์ตูนใต้สถานี — Pokémon Store สาขาสถานีมีของลิมิเต็ตเฉพาะสาขา แน่นสุดช่วงกลางวัน มาเช้า (TripAdvisor/Facebook)',
    'อยู่หน้าโรงแรมพอดี — ยัดของได้ทุกเมื่อก่อนขึ้นรถ แม้แต่วันสุดท้าย (แผนเรา)']},
   {p:'Solamachi (Skytree)',t:[
    'ของลิมิเต็ต "มีแต่ที่นี่" เยอะมาก — KitKat รสพิเศษ + Tokyo Banana ครบจบในที่เดียว (เว็บทางการ Solamachi)',
    'ฟู้ดคอร์ทชั้น 10 มีมุมเด็ก/เปลี่ยนผ้าอ้อม · ช่วงเย็นคิวร้านของฝากยาว — แผนเรา 15:45 พอดี (แผนเรา)']},
   {p:'Don Quijote Ueno',t:[
    'เปิด 24 ชม. — คืนก่อนบินยัดของได้สบาย ไม่ต้องรีบ (ข้อมูลร้าน)',
    'tax-free เมื่อยอดรวม ≥¥5,000/ใบเสร็จ ยื่นพาสปอร์ตที่เคาน์เตอร์ (กฎทั่วไป)']}],
};
const DAY_SRC={
 0:['reddit.com/r/JapanTravelTips — Japan with infant / stroller epilogue','tokyodisneyresort.jp (tickets/children)','tripadvisor.co.uk — Shibuya Sky sunset forum','klook.com Shibuya Sky (15-day window)','planmyjapan.com Ramen Street'],
 1:['tripadvisor.com Asakusa kimono rental reviews','japantravel.navitime.com Asakusa guide','hanayashiki.net official (winter hours)','japanforkids.jp/places/hanayashiki-amusement-park'],
 2:['japan-guide.com Kamakura access','reddit.com/r/JapanTravelTips — stroller in Kamakura','onedayawaytravel.com/kamakura-with-kids','geminiconnect.com kamakura family guide'],
 3:['tokyodisneyresort.jp/en/ticket + /guide/baby + /guide/child-tdl (official)','reddit.com/r/DisneyPlanning — TDL with 13-month-old','familyintokyo.com/en/blog/tokyo-disney-with-kids','emmajaneexplores.com/tokyo-disney-with-toddlers'],
 4:['tripadvisor.com Meiji Jingu reviews','japan-guide.com Harajuku/Omotesando','japan-guide.com Meiji Gaien ginkgo (autumn colors)'],
 5:['reddit.com/r/JapanTravelTips — teamLab Borderless with toddlers','roamingcrew.com teamLab Borderless with kids','wanderlog.com Azabudai Hills kids','teamlab.art Borderless official (stroller/tickets)','tripadvisor.com Maxell Aqua Park + FAQ','japanforkids.jp maxell-aqua-park'],
 6:['pokemon.co.jp Pokémon Center Mega Tokyo (official)','tripadvisor.com Ueno Zoo pandas forum','japanforkids.jp/places/yokohama-anpanman-childrens-museum','trip.com Anpanman moments'],
 7:['tripadvisor.com Tokyo Character Street reviews','en.www.tokyo-solamachi.jp/enjoy/souvenir (official)','donqui.com store hours','japan customs tax-free rule (general)'],
};


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
  s.addText('28 พฤศจิกายน – 6 ธันวาคม 2026 · 9 วัน · ค้าง Yaesu ติดสถานีโตเกียว (Sardonyx)',{x:0.9,y:3.15,w:11.5,h:0.5,fontSize:20,color:'CFE0D8',fontFace:'Calibri'});
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
    {text:'ฐานเดียว Yaesu ติดสถานีโตเกียว — รถไฟตรงทุกทิศ ≤1 ชม.',options:{bullet:bu(),breakLine:true}},
    {text:'วันสลับหนัก-เบา ทุกวันมีงีบกลางวัน',options:{bullet:bu(),breakLine:true}},
    {text:'กิโมโน Hooga ที่อาซากุสะ + แปะก๊วยทอง Meiji Gaien',options:{bullet:bu(),breakLine:true}},
    {text:'Optional วันเหลือแรง: Ueno Zoo / Anpanman — เลือกตาม Hooga',options:{bullet:bu(),breakLine:true}},
    {text:'Disney อังคาร · Maxell + Borderless ในร่มกันหนาว',options:{bullet:bu(),breakLine:true}},
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
  s.addImage({path:path.join(ASSETS,`day-${di+1}.jpg`),x:7.82,y:1.32,w:4.9,h:3.08,sizing:{type:'cover',w:4.9,h:3.08}});
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

  // ---- DETAIL SLIDE: per-place tips (public reviews) + full food options ----
  {
    const t=pres.addSlide(); t.background={color:C.white};
    t.addShape(pres.shapes.OVAL,{x:0.5,y:0.32,w:0.72,h:0.72,fill:{color:C.teal}});
    t.addText('D'+(di+1),{x:0.5,y:0.32,w:0.72,h:0.72,fontSize:20,bold:true,color:'FFFFFF',align:'center',valign:'middle',fontFace:'Calibri',margin:0});
    t.addText('เจาะลึก: Tips & อาหาร',{x:1.4,y:0.28,w:6.6,h:0.45,fontSize:22,bold:true,color:C.ink,fontFace:'Calibri',margin:0});
    t.addText(`${d.d} ${d.dow} · ${d.title}`,{x:1.4,y:0.72,w:6.6,h:0.38,fontSize:13,color:C.teal2,bold:true,fontFace:'Calibri',margin:0});
    t.addText([{text:'📍 ',options:{}},{text:d.zone||'',options:{}}],{x:8.2,y:0.42,w:4.6,h:0.4,fontSize:11.5,color:C.teal,align:'right',fontFace:'Calibri',margin:0});
    // left — tips table (one row per place)
    const tips=DAY_TIPS[di]||[];
    const trows=[[
      {text:'สถานที่',options:{bold:true,color:'FFFFFF',fill:{color:C.teal2},valign:'middle'}},
      {text:'💡 Tips จากรีวิวคนจริง',options:{bold:true,color:'FFFFFF',fill:{color:C.teal2},valign:'middle'}}]];
    tips.forEach(tp=>{
      trows.push([
        {text:tp.p,options:{bold:true,color:C.teal,valign:'top'}},
        {text:tp.t.map(x=>'· '+x).join('\n'),options:{color:C.ink,valign:'top'}}]);
    });
    t.addTable(trows,{x:0.5,y:1.3,w:7.35,colW:[1.85,5.5],fontSize:10,fontFace:'Calibri',color:C.ink,border:{pt:0.5,color:C.line},rowH:0.3,valign:'top',autoPage:false});
    t.addText('ที่มา tips: รีวิวสาธารณะ — Reddit · TripAdvisor · เว็บทางการ · บล็อกครอบครัว (ลิงก์เต็มอยู่ใน Notes ของสไลด์นี้)',{x:0.5,y:7.08,w:7.35,h:0.3,fontSize:8.5,italic:true,color:C.muted,fontFace:'Calibri',margin:0});
    // right — every food option for the day's meal areas
    const areaOf=r=>mealInfo(d,r).area;
    const mealRows=rowsOf(d).filter(r=>r.type==='food'&&/มื้อ|อาหารเช้า/.test(r.act||'')&&r.start!=null&&r.start>=600);
    const lunch=mealRows.find(r=>r.start<=870), dinner=mealRows.find(r=>r.start>870);
    const secs=[];
    if(lunch&&dinner&&areaOf(lunch)===areaOf(dinner)) secs.push({label:'กลางวัน + เย็น',area:areaOf(lunch)});
    else{
      if(lunch) secs.push({label:'กลางวัน',area:areaOf(lunch)});
      if(dinner) secs.push({label:'เย็น',area:areaOf(dinner)});
    }
    const cardY=1.3,cardH=5.5;
    t.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:8.05,y:cardY,w:4.75,h:cardH,rectRadius:0.08,fill:{color:C.tintGold}});
    t.addText('🍜 ทุกตัวเลือกอาหารของวันนี้',{x:8.28,y:cardY+0.1,w:4.3,h:0.32,fontSize:13,bold:true,color:'8A6A1F',fontFace:'Calibri',margin:0});
    const runs=[]; let first=true;
    secs.forEach(sc=>{
      if(!first) runs.push({text:'',options:{breakLine:true,fontSize:4}});
      first=false;
      runs.push({text:`${sc.label==='กลางวัน'?'🌤':sc.label==='เย็น'?'🌙':'🌤🌙'} มื้อ${sc.label} — ย่าน${sc.area.label}`,options:{bold:true,color:C.ink,fontSize:10.5,breakLine:true,paraSpaceBefore:4}});
      sc.area.items.forEach(it=>{
        const note=it.note?' — '+it.note.slice(0,36):'';
        runs.push({text:`• ${it.n} (~¥${it.price})${note}`,options:{color:'6B5A2E',fontSize:9.5,breakLine:true,paraSpaceAfter:2}});
      });
    });
    if(!runs.length) runs.push({text:'วันนี้เดินทาง — อาหารบนเครื่อง/สนามบิน',options:{color:'6B5A2E',fontSize:10}});
    runs.push({text:'(เลือกสดตอนถึง — ไม่ต้องจอง ยกเว้น Pokémon Café)',options:{italic:true,color:'8A6A1F',fontSize:8.5,paraSpaceBefore:6}});
    t.addText(runs,{x:8.28,y:cardY+0.45,w:4.32,h:cardH-0.6,fontFace:'Calibri',valign:'top',margin:0});
    t.addNotes('Tips sources (retrieved 2026-09-06):\n'+(DAY_SRC[di]||[]).map(u=>'· '+u).join('\n'));
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
    {text:'ไฟหน้าบ้าน: Marunouchi Illumination (D7) + Tokyo Station ยามค่ำ (D2)',options:{bullet:buT(),breakLine:true}},
    {text:'Disney ธีมคริสต์มาสถึง 25 ธ.ค. · แปะก๊วยพีคช่วงนี้พอดี',options:{bullet:buT(),breakLine:true}},
    {text:'วันเสาร์ (D8) คนเยอะสุด — จัดเป็นวันเก็บกระเป๋า+ช้อปหน้าบ้าน→Solamachi',options:{bullet:buT(),breakLine:true}},
    {text:'ปิดปีใหม่เริ่ม ~29 ธ.ค. — ช่วงเราปกติเต็มที่',options:{bullet:buT()}},
  ],{x:7.7,y:1.2,w:5.0,h:3.6,fontSize:13,color:'E8F0EC',fontFace:'Calibri',paraSpaceAfter:9,margin:0,valign:'top'});
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:7.7,y:5.0,w:5.0,h:1.7,rectRadius:0.1,fill:{color:'10604B'},line:{color:'1D7A62',width:1}});
  s.addText('แอปประกอบแผน',{x:7.95,y:5.15,w:4.5,h:0.35,fontSize:14,bold:true,color:C.gold,fontFace:'Calibri'});
  s.addText('aphiwatgo5.github.io/tokyo-trip-planner\nรหัสผ่าน: hoogaati → hoogaati · แก้แผนได้สด แล้ว sync Excel สองทาง',{x:7.95,y:5.5,w:4.5,h:1.0,fontSize:12,color:'CFE0D8',fontFace:'Calibri',margin:0});
}

pres.writeFile({fileName:OUT}).then(()=>console.log('written:',OUT));
