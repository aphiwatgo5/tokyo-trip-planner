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
  ['dome',/dome city|suidobashi|laqua|yellow street|ซุอิโดบาชิ|dome/i],['shinagawa',/shinagawa|ชินางาวะ/i]];
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
const DAY_TIPS={ // di (0-7) → [{p:place, t:[tips]}]
 0:[{p:'Haneda → เมือง + วันแรก',t:[
    'รถเข็นร่มแบบเบา ดีที่สุด — ลิฟต์สถานีเล็กและต้องรอคิว (Reddit r/JapanTravelTips)',
    'ตั้ง Suica ใน Wallet มือถือตั้งแต่สนามบิน — ไม่ต้องต่อคิวตั๋ว วันแรกยังไม่ต้องซื้อพาสเพิ่ม',
    'สูตร "ถึงเช้า → งีบยาวกลางวัน → เย็นเดินเบาๆ" ปรับ jetlag ทั้งบ้าน วัน 2–3 จะสดกว่า (แผนเรา)']},
   {p:'Ueno Park / Ameyoko (เย็น)',t:[
    'Ameyoko เป็นตลาดเงินสดเป็นหลัก — เตรียมแบงค์ย่อย (Trip.com · TripAdvisor)',
    'ตอนค่ำสตรีทฟู้ดคึกคักสุด แต่ร้านหลายร้านปิด ~20:00 — มาตามแผน 16:30 พอดี',
    'แปะก๊วย Ueno Park เหลืองสวยปลาย พ.ย.–ต้น ธ.ค. ช่วงเราเพิ่งเริ่มฤดู (inference)']}],
 1:[{p:'Ueno Zoo',t:[
    'คิวแพนด้าพีคยาวเป็นชั่วโมง มีรีวิวรอ 40 นาทีได้ดูแค่ 2 นาที — เข้า 09:30 ตอนเปิดแล้วตรงไปแพนด้าก่อน (TripAdvisor/ฟอรัม)',
    'ครึ่งชั่วโมงแรกหลังเปิดคิวสั้นสุด · วันอาทิตย์ (วันเรา) คนเยอะกว่าปกติ — เดินหน่อย (TripAdvisor)',
    'ทั้งสวนใช้ 1.5–3 ชม. พอ · ทางเดินกว้าง รถเข็นสบาย (รีวิว + แผนเรา)']},
   {p:'Hanayashiki',t:[
    'เด็ก 0–4 ขวบขึ้นส่วนใหญ่ฟรี · ค่าเข้า + จ่ายรายเครื่อง ~¥100–200 (japanforkids · TripAdvisor)',
    'เสน่ห์คือของเก่าริเทรโรปี 1853 ไม่ใช่เครื่องเล่นจัด — คิดเป็นสวนเด็กเล็กกลางย่านจะไม่ผิดหวัง (Reddit)',
    'อยู่ติด Senso-ji เดินต่อกัน 5 นาที จบทั้งย่านมื้อเดียว (Navitime)']},
   {p:'Senso-ji ช่วงพลบค่ำ',t:[
    'หลัง 17:00 ไฟอ่อนสวย คนน้อยลงเยอะ — แผนเราจัดตอนเย็นถูกแล้ว (รีวิวทั่วไป)',
    'อาคารหลักในปิด ~17:00 แต่ลานกลางแจ้งเปิดตลอด — เก็บ ningyo-yaki ท้าย Nakamise ก่อนออก']}],
 2:[{p:'บัตร + เข้าสวน',t:[
    'Hooga (ต่ำกว่า 4 ขวบ) เข้าฟรี · ผู้ใหญ่บัตรตามวัน หลังขึ้นราคา ต.ค. 2025 แพงสุด ~¥12,400 — ซื้อออนไลน์ระบุวันล่วงหน้า (เว็บทางการ TDR)',
    'จองร้านอาหารในสวน (Priority Seating) ผ่านแอปตั้งแต่เช้า — มื้อกลางวันคิวยาวมาก (familyintokyo)',
    'คิวเครื่องเล่นฮิต 90+ นาที เป็นเรื่องปกติ — วัย Hooga เล่น Fantasyland/Toontown พอ ไม่ต้องเก็บเครื่องเล่นคิวยาว (Reddit r/DisneyPlanning)']},
   {p:'รถเข็น + Baby Center',t:[
    'เช่ารถเข็นในสวน ~¥1,000/วัน (แบบพับได้) หรือพาของเรา — จุดจอดรถเข็นมีทุกเครื่องเล่น (familyintokyo)',
    'Baby Center: เปลี่ยนผ้าอ้อม ห้องให้นม อุ่มนม — จำตำแหน่งจากแผนที่ในแอปไว้ (emmajaneexplores · เว็บทางการ)']},
   {p:'จังหวะวัน',t:[
    'งีบในรถเข็นช่วงบ่าย = กลยุทธ์มาตรฐานครอบครัวญี่ปุ่น เดินช้า พักบ่อย (guides)',
    'พาเหรดคริสต์มาสบ่ายแก่ — ยืนดูริมทางเดินหลักได้ ไม่ต้องยืนจองจุดล่วงหน้านาน']}],
 3:[{p:'Anpanman Museum',t:[
    'ต้องจองออนไลน์ล่วงหน้า — ไม่มีขายหน้างาน สุดสัปดาห์หมดก่อน 3 วัน (japanforkids · trip.com)',
    'ชั้น 1 ฟรี (ร้าน+เบเกอรี่+ฟู้ดคอร์ท) — ถ้าบัตรหมดจริงๆ ยังเดินชั้นล่างได้ (yokohamajapan.com)',
    'เข้ารอบเปิด 10:00 คนน้อยสุด · กลุ่มเป้าหมายจริงคือ 1–5 ขวบพอดีวัย Hooga (itravelblog · travelxgirl)']},
   {p:'Kamakura (Hase + พระใหญ่)',t:[
    'พระใหญ่เดินรอบสั้น รถเข็นไหลได้ · Hase-dera บันได+ทางชัน — ผูกอุ้มสะพายจะสบายกว่า (Reddit · onedayaway)',
    'สูตรครอบครัว: รถเข็น + ผูกอุ้มสำรอง — ลานพระใช้รถเข็น เข้าวัดสลับอุ้ม (Lemon8 · geminiconnect)',
    'Enoden บ่ายแน่นได้ ถ้าคิวยาว เดิน/แท็กซี่ ไป Hase ~10 นาทีก็ถึง (inference จากรีวิว)']}],
 4:[{p:'teamLab Planets',t:[
    'เดินเท้าเปล่าทั้งที่ (ตู้เก็บรองเท้า) · ผ้าเช็ดมีให้ฟรี ไม่ต้องเตรียม (tinytotintokyo)',
    'ช่วงลุยน้ำลึก ~เข่า (30 ซม.) + ห้องมืด — เด็ก 1 ขวบต้องอุ้มตลอดจริงๆ (TripAdvisor รีวิวพ่อแม่ + Reddit)',
    'รีวิวเด็กต่ำกว่า 2 ขวบ ไปมาก/น้อย — ทางเลือกชิลกว่า: teamLab Borderless ที่ Azumabashi ไม่มีน้ำ รถเข็นได้ (Reddit)',
    'จองรอบออนไลน์ล่วงหน้า มาตรงเวลา — เข้าเป็นกลุ่มพร้อมกัน (guides)']},
   {p:'LaLaport Toyosu',t:[
    'ฟู้ดคอร์ทมีมุมเด็ก+ที่เปลี่ยนผ้าอ้อม ร้านครอบครัวเยอะ (แผนเรา)',
    'ถ้า Hooga ยังสดหลัง teamLab — สนามเด็ก/ร้านของเล่นในมอลล์เดินเล่นได้อีก (inference)']}],
 5:[{p:'Asobono!',t:[
    'ถุงเท้าบังคับทั้งเด็กและผู้ใหญ่ — ลืมซื้อได้ที่เคาน์เตอร์ · ถอดรองเท้าทั้งครอบครัว (TripAdvisor · เว็บทางการ)',
    'เช้าวันธรรมดาเงียบสุด — แผนเราพฤหัส 09:45 พอดี · หลัง 15:00 ค่าเข้าถูกลงแบบเข้าช่วงบ่าย (Klook · เว็บทางการ)',
    'มีโซนทารกแยกในตัว + บอลพูต 40,000 ลูกเรือโจรสลัด — เริ่มโซนเบบี้ก่อนแล้วค่อยขยาย (japanforkids)']},
   {p:'Dome City Illumination',t:[
    'ฟรี ไม่ต้องบัตร · ไฟเปิดพอดีหลังพระอาทิตย์ตก 16:30 — มาหัวค่ำสวยสุด รถเข็นเข็นได้ทั้งทาง (แผนเรา + ข้อมูลทางการ)']}],
 6:[{p:'Pokémon Café',t:[
    'เปิดจอง 31 วันก่อน เวลา 18:00 JST = 16:00 เวลาไทย — มื้อ 4 ธ.ค. → เตรียมหน้าจอ 3 พ.ย. 16:00 หมดในไม่กี่นาที (Reddit · FAQ ทางการ)',
    'กรอกแค่ชื่อ+อีเมล+เบอร์ ไม่ต้องบัตรเครดิต · เช็ก cancellation คืนก่อน ~21:00 + same-day ถึง 08:00 (Reddit)',
    'ถ้าพลาด: ลุ้นรอบเปิด 10:30 หรือช่วงบ่าย มีคนปล่อยบ่อยกว่ามื้อกลางวัน (Reddit)']},
   {p:'Character St. + Ramen St.',t:[
    'Pokémon Store สาขาสถานีแน่นสุดในคอมเพล็กซ์ — มา 10:00–11:00 หลังเปิดยังโล่ง มีของลิมิเต็ดเฉพาะสาขา (Facebook กลุ่ม · TripAdvisor)',
    'Ramen Street: ซื้อบัตรที่ตู้กดก่อนเข้าคิว เตรียมเงินสด · เลี่ยง 12:00–13:00 คิวยาวเป็นชั่วโมง (planmyjapan · TripAdvisor)',
    'ตู้กดเฉยๆ นานจะ timeout คืนเงิน — เลือกเมนูไวก่อน (goodtastevice)']},
   {p:'Maxell Aqua Park',t:[
    'โชว์โลมา ~15 นาที/รอบ หลายรอบต่อวัน — เช็กบอร์ดตารางก่อนเข้า แล้ววางเดินย้อนจากรอบที่จะดู (TripAdvisor)',
    'ป้อนอาหารโลมา ¥700 หมดไว — อยากได้ซื้อตั้งแต่เข้า · ให้อาหารคาปิบาร่า ¥200 (TripAdvisor FAQ)',
    'รอบแรกของวันเหมาะกับเด็กเล็กสุด (ก่อนหิว-ง่วง) · คาร์เซลเด็กชอบมาก (japanforkids · Reddit)']},
   {p:'ไฟ Marunouchi',t:[
    'ฟรี ทั้งถนนนากะโดริ — ถ่ายหน้าตึกอิฐสถานีฝั่งมารูนอูจิ หลัง 18:00 ไฟเต็มที่สวยสุด (ข้อมูลทั่วไป)']}],
 7:[{p:'Ameyoko',t:[
    'เงินสดเป็นหลัก บางร้าน tax-free ยื่นพาสปอร์ต — เตรียมแบงค์ย่อย (Trip.com)',
    'ร้านเล็กหลายร้านเปิด 10:00–11:00 — ถ้ามาก่อนเวลา เริ่มจากร้านในอาคาร/หน้าสถานีก่อน (guides)',
    'ของกินทานเล่นเยอะ ราคาถูกเป็นชุด — เช้าเสาร์ก่อน 10:30 ยังไม่แน่น (japan.travel · TripAdvisor)']},
   {p:'Solamachi (Skytree)',t:[
    'ของลิมิเต็ด "มีแต่ที่นี่" เยอะมาก — KitKat รสพิเศษ + Tokyo Banana ครบจบในที่เดียว (เว็บทางการ Solamachi)',
    'ฟู้ดคอร์ทชั้น 10 มีมุมเด็ก/เปลี่ยนผ้าอ้อม · ช่วงเย็นคิวร้านของฝากยาว — แผนเรา 15:45 พอดี (แผนเรา)']},
   {p:'Don Quijote Ueno',t:[
    'เปิด 24 ชม. — คืนก่อนบินยัดของได้สบาย ไม่ต้องรีบ (ข้อมูลร้าน)',
    'tax-free เมื่อยอดรวม ≥¥5,000/ใบเสร็จ ยื่นพาสปอร์ตที่เคาน์เตอร์ (กฎทั่วไป)']}],
};
const DAY_SRC={ // source URLs for slide notes (per di)
 0:['reddit.com/r/JapanTravelTips — Japan trip with infant / stroller epilogue','trip.com Ameyoko guide','japan.travel/en/spot/1706 (Ameyoko)'],
 1:['tripadvisor.com Ueno Zoo reviews + forum "Ueno Zoo and Pandas"','magical-trip.com/media/ueno-zoological-gardens','japanforkids.jp/places/hanayashiki-amusement-park','tripadvisor.com Asakusa Hanayashiki reviews','japantravel.navitime.com Hanayashiki guide'],
 2:['tokyodisneyresort.jp/en/ticket + /guide/baby + /guide/child-tdl (official)','reddit.com/r/DisneyPlanning — TDL with 13-month-old','familyintokyo.com/en/blog/tokyo-disney-with-kids','emmajaneexplores.com/tokyo-disney-with-toddlers','lexandrekan.com tokyo-disneyland-planning-tips'],
 3:['japanforkids.jp/places/yokohama-anpanman-childrens-museum','trip.com Anpanman moments','yokohamajapan.com Anpanman detail','itravelblog.net anpanman-childrens-museum','travelxgirl.com yokohama-anpanman-museum-with-toddler','reddit.com/r/JapanTravelTips — stroller in Kamakura','onedayawaytravel.com/kamakura-with-kids','geminiconnect.com kamakura family guide'],
 4:['tinytotintokyo.com teamlab-planets-with-kids','tripadvisor.com TeamLab Planets "with a baby" review','reddit.com/r/JapanTravelTips — teamlab with baby','thetokyochapter.com planets-vs-borderless','lunitravels.com/teamlab-planets-tokyo'],
 5:['tokyo-dome.co.jp/en/asobono/information (official)','tripadvisor.com Asobono reviews','japanforkids.jp asobono guide','klook.com ASOBono tickets'],
 6:['reddit.com/r/JapanTravelTips — Pokémon Café reservation tips ×3 threads','pokemon-cafe.jp/en/cafe/faq (official)','planmyjapan.com tokyo-station-ramen-street','thetravelpockets.com tokyo-ramen-street','goodtastevice.com ticket machine','tripadvisor.com Maxell Aqua Park + FAQ','japanforkids.jp maxell-aqua-park','japantravel.navitime.com Maxell spot'],
 7:['en.www.tokyo-solamachi.jp/enjoy/souvenir (official)','trip.com Ameyoko guide','japan.travel/en/spot/1706','ordinarygirlextraordinarydreamer.com ameyoko guide','tripadvisor.com Ameyoko reviews'],
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
