// ===== Tokyo Trip Planner — shared data, state & trips registry (v2) =====
// row: {time, act, ft, line, dur, train, cost, type, note, inc, start(min|nil), durMin(min|nil)}
// R(time, act, ft, line, dur, train, cost, type, note, start, durMin) — exactly 11 positional args
function R(time,act,ft,line,dur,train,cost,type,note,start,durMin){
  const numOrNil=x=>{ if(x==null||x==='') return null; const n=Number(x); return isNaN(n)?null:n; };
  return {time,act,ft,line,dur,train:parseFloat(train)||0,cost:parseFloat(cost)||0,type:type||"",note:note||"",inc:true,start:numOrNil(start),durMin:numOrNil(durMin)};
}

// ---- The v2 plan change: stay in Tokyo every night, Shizuoka removed ----
const NEW_D7={date:"2026-12-04", d:"4 ธ.ค.", dow:"ศุกร์ · D7", tag:"วันกลาง", pace:"med", inc:true,
  title:"Pokémon Café + Tokyo Station 🐾", sub:"ค้างโตเกียวทุกคืน — ไม่มี Shizuoka แล้ว", activeVariant:0,
  variants:[{name:"แผนหลัก", rows:[
    R("08:00–08:30","อาหารเช้า","โรงแรม/konbini","เดิน","",0,1200,"food","",480,30),
    R("09:10–09:35","ไป Nihonbashi","Ueno → Nihonbashi","JR Yamanote → Tokyo Sta. + เดิน 15 นาที","~25 นาที",340,0,"","รถไฟ ¥170/คน",550,25),
    R("10:00–11:00","Pokémon Café (Nihonbashi Takashimaya)","Nihonbashi","","1 ชม.",0,4000,"food","จองล่วงหน้า — เปิดวันที่ 1 ของเดือนก่อน 18:00 หมดเร็วมาก",600,60),
    R("11:15–12:30","Tokyo Character Street + KITTE","Tokyo Station","เดิน","~1 ชม. 15 นาที",0,0,"","ร้านการ์ตูนใต้ Tokyo Station · ดาดฟ้า KITTE วิวสถานี",675,75),
    R("12:30–13:15","มื้อกลางวัน Ramen Street / food court","Tokyo Station","เดิน","",0,3000,"food","",750,45),
    R("13:30–14:00","กลับโรงแรม","Nihonbashi → Ueno","เดิน → JR Yamanote","~30 นาที",340,0,"","",810,30),
    R("14:00–15:30","งีบบ่ายที่โรงแรม","โรงแรม","","",0,0,"","ชาร์จแบตก่อนออกรอบเย็น",840,90),
    R("16:00–17:30","เรือหงส์ Shinobazu Pond + เดิน Ueno Park","Ueno Park","เดิน","~1.5 ชม.",0,1600,"misc","เรือหงส์ ~¥800/30 นาที/ลำ",960,90),
    R("18:30–19:30","มื้อเย็นใกล้โรงแรม","ร้านใกล้ Ueno","เดิน","",0,3500,"food","",1110,60),
  ]}]};
// ---- v3 revision: drop WB + Odaiba · add Anpanman + Maxell + Marunouchi lights ----
const V3_D5={date:"2026-12-02", d:"2 ธ.ค.", dow:"พุธ · D5", tag:"วันกลาง", pace:"med", inc:true,
  title:"teamLab + Maxell Aqua Park 🐬", sub:"ไม่ไป Odaiba แล้ว — ในร่มทั้งวัน เหมาะอากาศธันวา", activeVariant:0,
  variants:[{name:"แผนหลัก", rows:[
    R("08:00–08:30","อาหารเช้า","โรงแรม/konbini","เดิน","",0,1200,"food","",480,30),
    R("09:00–09:40","ไป teamLab","Ueno → Toyosu","Tokyo Metro (เปลี่ยนสาย 1 ครั้ง)","~40 นาที",500,0,"","",540,40),
    R("10:00–11:30","teamLab Planets","Toyosu","","1.5 ชม.",0,7600,"entry","รถเข็นเข้าไม่ได้ ต้องอุ้ม · เตรียมชุดสำรอง Hooga (ลุยน้ำ)",600,90),
    R("12:00–13:00","มื้อกลางวัน LaLaport Toyosu","LaLaport (food court)","เดิน","",0,2800,"food","เลือกตามสะดวก มี family restaurant เยอะ — หลวมๆ พอ",720,60),
    R("13:30–14:00","กลับโรงแรม งีบ","Toyosu → Ueno","Tokyo Metro","~30 นาที",500,0,"","ชาร์จแบตก่อนรอบเย็น",810,30),
    R("16:00–16:25","ไป Maxell Aqua Park","Ueno → Shinagawa","JR Yamanote (ตรง)","~25 นาที",760,0,"","อควาเรียมในร่มติดสถานี ~15 นาทีจากใจกลางเมือง",960,25),
    R("16:30–18:30","Maxell Aqua Park 🐬","ชินางาวะ","","2 ชม.",0,4400,"entry","โชว์โลมาทุก ~1 ชม. — เช็กตารางโชว์แล้วเลือกรอบก่อนเข้า · ธันวามีโชว์กลางคืนแสงไฟสวยพิเศษ",990,120),
    R("19:00–19:45","มื้อเย็นย่านสถานีชินางาวะ","Ekinaka / food court","เดิน","",0,3500,"food","ร้านในสถานีเยอะ เลือกตามสะดวก — ไม่ต้องจอง",1140,45),
    R("20:00–20:25","กลับ Ueno","Shinagawa → Ueno","JR Yamanote","~25 นาที",760,0,"","",1200,25),
  ]}]};
const V3_D6={date:"2026-12-03", d:"3 ธ.ค.", dow:"พฤหัส · D6", tag:"วันหนัก", pace:"big", inc:true,
  title:"Anpanman + Yokohama 🐜", sub:"ไม่ไป Warner Bros แล้ว — day trip โยโกฮามะ (ธรรมดา คนน้อยกว่าเสาร์อาทิตย์)", activeVariant:0,
  variants:[{name:"แผนหลัก", rows:[
    R("08:00–08:30","อาหารเช้า","โรงแรม/konbini","เดิน","",0,1200,"food","",480,30),
    R("08:45–09:35","ไป Minatomirai","Ueno → Minatomirai","JR Yamanote → Yokohama → Minatomirai Line","~50 นาที",1460,0,"","≈¥730/คน · Hooga ฟรี (ต่ำกว่า 6 ขวบ)",525,50),
    R("10:00–12:30","Anpanman Museum 🐜","Minatomirai (MARK IS)","","2.5 ชม.",0,3600,"entry","เหมาะกับ 1-2 ขวบที่สุดในลิสต์ — ซื้อบัตรหน้างาน/ออนไลน์ได้ · เด็ก 1 ขวบขึ้นมีบัตรเด็ก ~¥1,600 ตามจริง",600,150),
    R("12:30–13:30","มื้อกลางวัน ใน MARK IS / ริมอ่าว","Minatomirai","เดิน","",0,3000,"food","food court ใหญ่ เลือกตามสะดวก — หลวมๆ",750,60),
    R("13:30–15:00","Cosmoworld โซนเด็ก + ชิงช้าสวรรค์","Cosmoworld (ริมอ่าว)","เดิน","~1.5 ชม.",0,2000,"misc","สวนสนุกเข้าฟรี จ่ายรายเครื่อง ~¥300-500 · ธันวามีไฟประดับริมอ่าวช่วงค่ำ",810,90),
    R("15:15–16:05","กลับ Ueno","Minatomirai → Ueno","Minatomirai Line → Yokohama → JR","~50 นาที",1460,0,"","Hooga งีบบนรถไฟ",915,50),
    R("17:00–17:45","ซักผ้า + พัก","โรงแรม / coin laundry","","","",500,"misc","เผื่อซักให้เสร็จก่อนวันสุดท้าย",1020,45),
    R("18:30–19:30","มื้อเย็นใกล้โรงแรม","ร้านใกล้ Ueno","เดิน","",0,3500,"food","เดินเลือกได้เลย — ไม่ต้องจอง",1110,60),
  ]}]};
const V3_D7={date:"2026-12-04", d:"4 ธ.ค.", dow:"ศุกร์ · D7", tag:"วันกลาง", pace:"med", inc:true,
  title:"Pokémon Café + ไฟ Marunouchi 🎆", sub:"ค้างโตเกียวทุกคืน · เย็นดูไฟประดับหน้า Tokyo Station (ฤดูหนาว)", activeVariant:0,
  variants:[{name:"แผนหลัก", rows:[
    R("08:00–08:30","อาหารเช้า","โรงแรม/konbini","เดิน","",0,1200,"food","",480,30),
    R("09:10–09:35","ไป Nihonbashi","Ueno → Nihonbashi","JR Yamanote → Tokyo Sta. + เดิน 15 นาที","~25 นาที",340,0,"","รถไฟ ¥170/คน",550,25),
    R("10:00–11:00","Pokémon Café (Nihonbashi Takashimaya)","Nihonbashi","","1 ชม.",0,4000,"food","จองล่วงหน้า — เปิดวันที่ 1 ของเดือนก่อน 18:00 หมดเร็วมาก (วันเยี่ยม 4 ธ.ค. → จอง 1 พ.ย.)",600,60),
    R("11:15–12:30","Tokyo Character Street + KITTE","Tokyo Station","เดิน","~1 ชม. 15 นาที",0,0,"","ร้านการ์ตูนใต้ Tokyo Station · ดาดฟ้า KITTE วิวสถานี",675,75),
    R("12:30–13:15","มื้อกลางวัน Ramen Street / food court","Tokyo Station","เดิน","",0,3000,"food","เลือกตามสะดวก — คิวเร็ว",750,45),
    R("13:30–14:00","กลับโรงแรม งีบ","Nihonbashi → Ueno","เดิน → JR Yamanote","~30 นาที",340,0,"","",810,30),
    R("16:00–16:25","ไป Tokyo Station / Marunouchi","Ueno → Tokyo","JR Yamanote","~10 นาที",340,0,"","พระอาทิตย์ตก ~16:30 ธันวา — เย็นนี้ดูไฟพอดี",960,25),
    R("16:30–17:45","เดินเล่น Marunouchi / ดาดฟ้า KITTE","Marunouchi","เดิน","",0,0,"","เข้าเย็นแสงสวย อากาศธันวาเย็นเตรียมเสื้อกันหนาวให้ Hooga",990,75),
    R("18:00–19:00","มื้อเย็นย่าน Marunouchi","ร้านย่านสถานี","เดิน","",0,3500,"food","ร้านเยอะ เลือกตามสะดวก — หลวมๆ",1080,60),
    R("19:15–19:45","ชมไฟ Marunouchi Illumination 🎆","หน้า Tokyo Station","เดิน","~30 นาที",0,0,"","mid-Nov–Feb ทุกปี · ฟรี · วิวสวยสุดตอนค่ำ รถเข็นได้สบาย",1155,30),
    R("20:00–20:25","กลับ Ueno","Tokyo → Ueno","JR Yamanote","~10 นาที",340,0,"","",1200,25),
  ]}]};
const NEW_D8={date:"2026-12-05", d:"5 ธ.ค.", dow:"เสาร์ · D8", tag:"วันหนัก", pace:"big", inc:true,
  title:"Hanayashiki + Skytree + ช้อปของฝาก 🎡🛍️", sub:"วันสุดท้ายเต็มวัน — เที่ยวเช้า Asakusa · ช้อป+อควอเรียมเย็น Skytree", activeVariant:0,
  variants:[{name:"แผนหลัก", rows:[
    R("08:30–09:00","อาหารเช้า","คาเฟ่ใกล้โรงแรม","เดิน","","",1500,"food","",510,30),
    R("09:15–09:25","ไป Asakusa","Ueno → Asakusa","Tokyo Metro Ginza Line","~10 นาที",360,0,"","",555,10),
    R("09:30–11:30","Hanayashiki (สวนสนุกเก่าแก่ที่สุดของญี่ปุ่น)","ถัดจาก Senso-ji","เดิน","2 ชม.",0,3200,"entry","ผู้ใหญ่ ¥1,600 · Hooga ≤4 ขวบฟรี · จ่ายรายเครื่องเล่น ~¥100–200",570,120),
    R("11:30–11:50","เดินช้อป Nakamise ของฝากเล็ก","Nakamise-dori","เดิน","~20 นาที",0,0,"shopping","นิงเงิ๋วยากิ/ขนมข้าวโพด — เดินผ่านทางกลับสถานีพอดี",690,20),
    R("11:50–12:35","มื้อกลางวัน Asakusa","ร้านย่าน Asakusa","เดิน","",0,3000,"food","เดินเลือกตามสะดวก — หลวมๆ พอ",710,45),
    R("12:45–13:00","กลับโรงแรม","Asakusa → Ueno","Tokyo Metro Ginza Line","~10 นาที",360,0,"","",765,15),
    R("13:00–15:00","งีบ + เก็บกระเป๋า","โรงแรม","","",0,0,"","พรุ่งนี้บิน 10:35",780,120),
    R("15:15–15:35","ไป Skytree","Ueno → Tokyo Skytree","Ginza→Asakusa, Tobu→Skytree","~20 นาที",480,0,"","",915,20),
    R("15:45–17:15","ช้อปของฝาก Tokyo Solamachi 🛍️","ใต้ Skytree","เดิน","~1.5 ชม.",0,0,"shopping","มอลล์ 4 ชั้น — KitKat Tokyo · Tokyo Banana · ร้านการ์ตูน · รถเข็นเข้าได้สบาย · งบของฝากแยกต่างหาก",945,90),
    R("17:30–19:00","Sumida Aquarium","Skytree","","1.5 ชม.",0,5000,"entry","เสาระเปิดถึง ~21:00 (เช็กอีกครั้ง) · ตอนเย็นคนน้อยกว่า · เพนกวิน+แมงกะพรุนเรืองแสง",1050,90),
    R("19:15–20:15","มื้อเย็นพิเศษส่งท้าย","Solamachi (food court/ร้านในมอลล์)","เดิน","",0,5000,"food","เลือกตามสะดวก — ไม่ต้องจอง",1155,60),
    R("20:30–20:50","กลับ Ueno","Skytree → Ueno","Tobu→Asakusa, Ginza→Ueno","~20 นาที",480,0,"","",1230,20),
    R("21:00–21:45","ของฝากรอบสุดท้าย Don Quijote","Donki Ueno (เปิด 24 ชม.)","เดิน","~45 นาที",0,0,"shopping","เต็มที่รอบสุดท้าย · เช็กกระเป๋าให้พร้อมก่อนเช้าบิน",1260,45),
  ]}]};

// ================= V4 — full-week replan, geo-clustered (2026-09-13) =================
// Logic: 1 anchor/day · cluster by rail direction from Ueno · nap midday · outdoor AM / indoor PM ·
// heavy days alternate with light · weekday-sensitive on weekdays · extras = "ถ้าเวลาเหลือ" (ไม่นับงบ)
const V4_DAYS=[
{date:"2026-11-28", d:"28 พ.ย.", dow:"เสาร์ · D1", tag:"วันพัก", pace:"rest", zone:"อูเอโนะ (ใกล้บ้าน)",
  extras:["Ameyoko ของว่างกลางคืนถ้ายังไหว","นอนให้พร้อมพรุ่งนี้"],
  title:"ถึงโตเกียว", sub:"Haneda 06:55 · วันปรับตัว — ไม่แพลนอะไรหนัก", activeVariant:0, inc:true,
  variants:[{name:"แผนหลัก", rows:[
    R("06:55–08:00","เครื่องลง Haneda (T3) + ตม.","Haneda","","~1 ชม.",0,0,"logistic","ผ่าน ตม. + รับกระเป๋า ~60 นาที",415,65),
    R("08:30–09:15","เข้าเมือง","Haneda → Ueno","Keikyu → Shinagawa → JR Yamanote","~45 นาที",1040,0,"logistic","ตั้ง Suica ในมือถือก่อนออกจากสนามบิน",510,45),
    R("09:30–10:00","ฝากกระเป๋าที่โรงแรม","โรงแรม (Ueno)","เดิน","",0,0,"rest","เช็กอินบ่าย ฝากของก่อน",570,30),
    R("10:00–12:00","พัก/คาเฟ่ ให้เด็กปรับเวลา","รอบ Ueno","เดิน","",0,0,"rest","",600,120),
    R("12:00–13:00","มื้อกลางวันเบาๆ","ร้านใกล้โรงแรม","เดิน","",0,2500,"food","Kura Sushi / Marugame — เดินเลือกได้",720,60),
    R("13:30–16:00","งีบยาว","โรงแรม","","",0,0,"","เช็กอิน 15:00 · ให้เวลาปรับ jetlag",810,150),
    R("16:30–18:00","เดินเล่น Ueno Park / Ameyoko","Ueno Park","เดิน","",0,0,"view","แปะก๊วยหางฤดูใบไม้ร่วง ~ต้น ธ.ค.",990,90),
    R("18:30–19:30","มื้อเย็น + นอนเร็ว","ร้านใกล้โรงแรม","เดิน","",0,3500,"food","เก็บแรงไว้พรุ่งนี้",1110,60),
  ]}]},
{date:"2026-11-29", d:"29 พ.ย.", dow:"อาทิตย์ · D2", tag:"วันกลาง", pace:"med", zone:"อูเอโนะ–อาซากุสะ (ฝั่งเดียวกัน)",
  extras:["Kappabashi ถนนร้านครัว (ต่อจาก Asakusa)","พิพิธภัณฑ์วิทยาศาสตร์ Kahaku (ติดสวนสัตว์)"],
  title:"Ueno Zoo + Hanayashiki + Asakusa 🎡", sub:"รวมย่านเดียวทั้งวัน — รถไฟแค่ 2 เที่ยว 5 นาที", activeVariant:0, inc:true,
  variants:[{name:"แผนหลัก", rows:[
    R("08:30–09:00","อาหารเช้า","คาเฟ่/konbini","เดิน","","",1500,"food","",510,30),
    R("09:30–11:30","Ueno Zoo","Ueno Park (เดิน 5 นาที)","เดิน","2 ชม.",0,1200,"attraction","เช้าสัตว์ตื่น · ทางเดินกว้าง รถเข็นสะดวก",570,120),
    R("11:45–12:30","มื้อกลางวัน","Ueno แถวสถานี","เดิน","",0,2500,"food","เดินเลือกตามสะดวก",705,45),
    R("12:45–14:45","งีบที่โรงแรม","โรงแรม","เดิน","",0,0,"rest","กลับมานอนกลางวัน — บ้านใกล้",765,120),
    R("15:00–15:10","ไป Asakusa","Ueno → Asakusa","Tokyo Metro Ginza Line","~5 นาที",360,0,"logistic","",900,10),
    R("15:15–17:00","Hanayashiki 🎡 (รวมวันเดียวกับ Asakusa)","ถัดจาก Senso-ji","เดิน","~1.5 ชม.",0,3200,"attraction","สวนสนุกเก่าแก่ 1853 · ≤4 ขวบฟรี จ่ายรายเครื่อง ~¥100–200",915,105),
    R("17:00–18:00","Senso-ji + Nakamise ช่วงพลบค่ำ","Asakusa","เดิน","",0,1000,"food","ไฟอ่อนสวย คนน้อยลงตอนเย็น · ขนม ningyo-yaki",1020,60),
    R("18:15–19:00","มื้อเย็น Asakusa","ร้านย่าน Asakusa","เดิน","",0,3000,"food","เดินเลือกได้ — หลวมๆ",1095,45),
    R("19:15–19:25","กลับโรงแรม","Asakusa → Ueno","Tokyo Metro Ginza Line","~5 นาที",360,0,"logistic","",1155,10),
  ]}]},
{date:"2026-11-30", d:"30 พ.ย.", dow:"จันทร์ · D3", tag:"วันหนัก", pace:"big", zone:"ไมฮามะ (ตะวันออก)",
  extras:["Ikspiari มื้อเย็น/ช้อปหน้าสถานี Maihama"],
  title:"Tokyo Disneyland 🎢 (คริสต์มาส)", sub:"วันจันทร์คนน้อยสุด · ตกแต่งคริสต์มาสเต็มรูปแบบถึง 25 ธ.ค.", activeVariant:0, inc:true,
  variants:[{name:"แผนหลัก", rows:[
    R("07:30–08:00","อาหารเช้าเร็ว","konbini/โรงแรม","","","",1200,"food","",450,30),
    R("08:00–08:50","เดินทางไป Disney","Ueno → Maihama","JR Yamanote→Tokyo→JR Keiyo→Maihama","~50 นาที",460,0,"logistic","ชานชาลา Keiyo ที่ Tokyo ไกล เผื่อเดิน ~15 นาที",480,50),
    R("09:00–12:00","เข้าสวน + Fantasyland + Toontown","Maihama (เดิน 5 นาที)","เดิน","3 ชม.",0,18000,"attraction","โซนเด็กเล็กสุด · เช่ารถเข็นในสวน · ใช้ Baby Center",540,180),
    R("12:00–13:00","มื้อกลางวันในสวน","ร้านในสวน","","","",5000,"food","",720,60),
    R("13:00–15:00","งีบในรถเข็น + เครื่องเล่นเด็ก","ในสวน","","",0,0,"","",780,120),
    R("15:00–18:00","เครื่องเล่นเพิ่ม + พาเหรดคริสต์มาส","ในสวน","","","",1500,"food","ของว่าง/ป๊อปคอร์น",900,180),
    R("18:00–19:00","มื้อเย็น","ในสวน / Ikspiari","","","",5000,"food","ถ้า Hooga เพลีย กลับก่อนได้",1080,60),
    R("19:00–19:50","เดินทางกลับ","Maihama → Ueno","JR Keiyo→Tokyo→Yamanote","~50 นาที",460,0,"logistic","",1140,50),
  ]}]},
{date:"2026-12-01", d:"1 ธ.ค.", dow:"อังคาร · D4", tag:"วันหนัก", pace:"big", zone:"ใต้: โยโกฮามะ + คามาคุระ (สายเดียวกัน)",
  extras:["Enoshima นั่ง Enoden ต่อถ้าแรงเหลือ","Komachi-dori ของกินเดินเล่น"],
  title:"Anpanman + Kamakura วันเดียว 🐜🗿", sub:"ลงใต้ครั้งเดียวจบ — ต่อรถไฟสายเดิมตลอด · Hooga งีบบนรถช่วงบ่าย", activeVariant:0, inc:true,
  variants:[{name:"แผนหลัก", rows:[
    R("07:30–08:00","อาหารเช้า","โรงแรม/konbini","","","",1200,"food","",450,30),
    R("08:10–09:00","ไป Minatomirai","Ueno → Minatomirai","JR Yamanote→Yokohama→Minatomirai Line","~50 นาที",1460,0,"logistic","≈¥730/คน · นั่งจนปลายทาง",490,50),
    R("09:00–10:00","เดินรอบ MARK IS / รับบัตร","Minatomirai","เดิน","~1 ชม.",0,0,"rest","คาเฟ่ริมหน้าต่าง รอพิพิธภัณฑ์เปิด 10:00",540,60),
    R("10:00–12:00","Anpanman Museum 🐜","MARK IS Minatomirai","","2 ชม.",0,3600,"attraction","เหมาะ 1-2 ขวบที่สุด · ซื้อบัตรหน้างาน/ออนไลน์ · เด็ก 1 ขวบขึ้น ~¥1,600",600,120),
    R("12:00–12:45","มื้อกลางวัน MARK IS food court","Minatomirai","เดิน","",0,3000,"food","เลือกตามสะดวก — หลวมๆ",720,45),
    R("13:00–13:55","ลงใต้ต่อ → Kamakura","Minatomirai → Yokohama → Kamakura","Minatomirai Line → JR Negishi","~55 นาที",1100,0,"logistic","Hooga งีบบนรถไฟช่วงนี้",780,55),
    R("14:05–14:15","Enoden ไป Hase","Kamakura → Hase","Enoden","~3 นาที",380,0,"logistic","",845,10),
    R("14:20–15:10","Hase-dera","Hase","เดิน","~50 นาที",0,800,"attraction","วิวทะเลจากยอดเนิน · บันไดเยอะ ผลัดอุ้ม",860,50),
    R("15:15–16:00","Great Buddha (Kotoku-in) 🗿","Hase","เดิน 10 นาที","~45 นาที",0,600,"attraction","พระใหญ่กลางแจ้ง เดินรอบๆ สั้นๆ พอ",915,45),
    R("16:10–16:40","กลับสถานี Kamakura (ผ่าน Komachi)","Hase → Kamakura Sta.","Enoden","",380,800,"food","ของกินถนนถ้าผ่าน — ไม่ตั้งใจ",970,30),
    R("17:00–18:05","กลับ Ueno","Kamakura → Ueno","JR Yokosuka (ตรง)","~65 นาที",2080,0,"logistic","รถตรงไม่ต้องเปลี่ยน · มื้อเย็นบนรถ/ข้าวกล่อง",1020,65),
    R("18:30–19:30","มื้อเย็นเบาๆ ใกล้โรงแรม","ร้านใกล้ Ueno","เดิน","",0,3500,"food","",1110,60),
  ]}]},
{date:"2026-12-02", d:"2 ธ.ค.", dow:"พุธ · D5", tag:"วันเบา", pace:"light", zone:"โทโยซุ (ตะวันออก) + บ้าน",
  extras:["เรือหงส์ Shinobazu Pond (อยู่ในคลังไอเดีย — หยิบมาใส่ได้)","LaLaport เดินชิลต่อ"],
  title:"teamLab + วันพักกลางสัปดาห์ 🎨", sub:"วันหลังวันหนัก — anchor เดียว เช้าจบ บ่ายว่าง", activeVariant:0, inc:true,
  variants:[{name:"แผนหลัก", rows:[
    R("08:30–09:00","อาหารเช้า","โรงแรม/konbini","","","",1200,"food","",510,30),
    R("09:00–09:40","ไป teamLab","Ueno → Toyosu","Tokyo Metro (เปลี่ยนสาย 1 ครั้ง)","~40 นาที",500,0,"logistic","จองรอบ ~10:00",540,40),
    R("10:00–11:30","teamLab Planets 🎨","Toyosu","","1.5 ชม.",0,7600,"attraction","ต้องอุ้มช่วงลุยน้ำ · เตรียมชุดสำรอง Hooga",600,90),
    R("11:45–13:00","มื้อกลางวัน LaLaport Toyosu","LaLaport (food court)","เดิน","",0,2800,"food","family restaurant เยอะ — เลือกตามสะดวก",705,75),
    R("13:15–14:00","กลับโรงแรม","Toyosu → Ueno","Tokyo Metro","~40 นาที",500,0,"logistic","",795,45),
    R("14:00–16:30","งีบยาว + อาบน้ำ + พักจริงจัง","โรงแรม","","",0,0,"","วันนี้ตั้งใจพัก — รีเซ็ตก่อนครึ่งหลังทริป",840,150),
    R("17:00–18:00","เดินเล่น Ueno Park ช่วงพลบค่ำ","Ueno Park","เดิน","",0,0,"view","อากาศธันวาเย็นสบาย ใส่เสื้อกันหนาว",1020,60),
    R("18:30–19:30","มื้อเย็นใกล้โรงแรม","ร้านใกล้ Ueno","เดิน","",0,3500,"food","",1110,60),
  ]}]},
{date:"2026-12-03", d:"3 ธ.ค.", dow:"พฤหัส · D6", tag:"วันกลาง", pace:"med", zone:"ซุอิโดบาชิ–บุงเกียว (ติดบ้าน)",
  extras:["สวน Koishikawa Korakuen ใบแปะก๊วยหาง (10 นาทีจาก Dome)","Sunshine Aquarium อิเคบุคุโระ ถ้ายังอยากดูปลา"],
  title:"Asobono! + ไฟ Tokyo Dome City 🧸", sub:"สนามเล่นในร่มยักษ์เช้า · ไฟประดับเย็น — ในร่มหลัก ติดบ้าน", activeVariant:0, inc:true,
  variants:[{name:"แผนหลัก", rows:[
    R("08:30–09:00","อาหารเช้า","โรงแรม/konbini","","","",1200,"food","",510,30),
    R("09:10–09:35","ไป Tokyo Dome City","Ueno → Suidobashi","JR Yamanote→Akihabara→JR Sobu หรือ Ginza→Suehirocho","~25 นาที",560,0,"logistic","≈¥280/คน",550,25),
    R("09:45–12:00","Asobono! สนามเล่นในร่มยักษ์ 🧸","Tokyo Dome City","","~2 ชม.",0,1600,"attraction","ออกแบบสำหรับ 0-6 ขวบโดยเฉพาะ · มีโซนทารก · ถอดรองเท้า",585,135),
    R("12:00–13:00","มื้อกลางวัน LaQua / Yellow Street","Tokyo Dome City","เดิน","",0,2800,"food","ร้านครอบครัวเยอะ — เลือกตามสะดวก",720,60),
    R("13:15–14:00","กลับโรงแรม งีบ","Suidobashi → Ueno","JR","~25 นาที",560,0,"logistic","",795,45),
    R("14:00–15:45","งีบ + พัก","โรงแรม","","",0,0,"","",840,105),
    R("16:15–16:40","กลับไป Dome City ช่วงไฟ","Ueno → Suidobashi","JR","~25 นาที",560,0,"logistic","พระอาทิตย์ตก ~16:30 — ไฟเปิดพอดี",975,25),
    R("16:45–18:00","เดินชม Tokyo Dome City Winter Illumination ✨","Tokyo Dome City","เดิน","~1 ชม.",0,0,"view","ไฟประดับฤดูหนาว + ชิงช้าสวรรค์สวย · ฟรี · รถเข็นได้",1005,75),
    R("18:15–19:15","มื้อเย็นก่อนกลับ","ย่าน Suidobashi/บ้าน","เดิน","",0,3000,"food","",1095,60),
    R("19:30–19:55","กลับ Ueno","Suidobashi → Ueno","JR","~25 นาที",560,0,"logistic","",1170,25),
  ]}]},
{date:"2026-12-04", d:"4 ธ.ค.", dow:"ศุกร์ · D7", tag:"วันกลาง", pace:"med", zone:"กลางเมือง: หน้าสถานีโตเกียว–ชินางาวะ",
  extras:["Ginza เดินชิล / Uniqlo กินซ่า (1 สถานี)","ดาดฟ้า KITTE มุมถ่ายรูปสถานี"],
  title:"Pokémon Café + Maxell + ไฟ Marunouchi 🎆", sub:"ทุกอย่างแนวสถานีโตเกียว–ชินางาวะ รถไฟสั้นๆ ทั้งวัน", activeVariant:0, inc:true,
  variants:[{name:"แผนหลัก", rows:[
    R("08:00–08:30","อาหารเช้า","โรงแรม/konbini","","","",1200,"food","",480,30),
    R("09:10–09:35","ไป Nihonbashi","Ueno → Nihonbashi","JR Yamanote → Tokyo Sta. + เดิน 15 นาที","~25 นาที",340,0,"logistic","¥170/คน",550,25),
    R("10:00–11:00","Pokémon Café ⚡","Nihonbashi Takashimaya","","1 ชม.",0,4000,"food","จอง 1 พ.ย. 18:00 ให้ทัน (เปิดจอยวันที่ 1 ของเดือนก่อน)",600,60),
    R("11:15–12:30","Tokyo Character Street + KITTE","Tokyo Station","เดิน","~1 ชม.",0,0,"shopping","ร้านการ์ตูนใต้สถานี · ของฝากเช้าๆ คนยังน้อย",675,75),
    R("12:30–13:15","มื้อกลางวัน Ramen Street","Tokyo Station","เดิน","",0,3000,"food","คิวเร็ว เลือกตามสะดวก",750,45),
    R("13:30–14:00","กลับโรงแรม งีบ","Nihonbashi → Ueno","เดิน → JR Yamanote","~30 นาที",340,0,"logistic","",810,30),
    R("14:00–15:30","งีบ","โรงแรม","","",0,0,"","",840,90),
    R("15:50–16:15","ไป Maxell Aqua Park","Ueno → Shinagawa","JR Yamanote (ตรง)","~20 นาที",760,0,"logistic","ติดสถานีชินางาวะ ออกปุ๊บถึง",950,25),
    R("16:30–18:15","Maxell Aqua Park 🐬","ชินางาวะ","","~1.5 ชม.",0,4400,"attraction","เช็กตารางโชว์โลมา (~ทุก 1 ชม.) แล้วเลือกรอบก่อนเข้า · ในร่มทั้งหมด",990,105),
    R("18:30–18:45","ขึ้นไปดูไฟ Marunouchi","Shinagawa → Tokyo","JR Yamanote","~15 นาที",380,0,"logistic","",1110,15),
    R("18:50–19:35","ชมไฟ Marunouchi Illumination 🎆","หน้า Tokyo Station","เดิน","~45 นาที",0,0,"view","mid-Nov–Feb ทุกปี ฟรี · ตึกสถานียามค่ำสวยสุดๆ",1130,45),
    R("19:45–20:45","มื้อเย็น Marunouchi/กลับไปกินบ้าน","ย่านสถานี","เดิน","",0,3500,"food","เลือกตามสะดวก — หลวมๆ",1185,60),
    R("21:00–21:20","กลับ Ueno","Tokyo → Ueno","JR Yamanote","~10 นาที",340,0,"logistic","",1260,20),
  ]}]},
{date:"2026-12-05", d:"5 ธ.ค.", dow:"เสาร์ · D8", tag:"วันเบา", pace:"light", zone:"อูเอโนะ + สกายทรี (ปิดท้ายใกล้บ้าน)",
  extras:["ขึ้น Tokyo Skytree Tembo Deck (บัตรรอบค่ำ)","Akachan Honpo ของฝากเด็ก (1 สถานีจาก Skytree)"],
  title:"เก็บกระเป๋า + ช้อปของฝากสุดท้าย 🛍️", sub:"เสาร์คนเยอะ — เลยจัดวันเบาใกล้บ้าน: แพ็กของเช้า ช้อป Solamachi เย็น", activeVariant:0, inc:true,
  variants:[{name:"แผนหลัก", rows:[
    R("08:30–09:00","อาหารเช้า","คาเฟ่ใกล้โรงแรม","เดิน","","",1500,"food","",510,30),
    R("09:15–10:30","ช้อปของฝาก Ameyoko + เก็บของชิ้นเล็ก","Ameyoko","เดิน","~1 ชม.",0,0,"shopping","เช้าเสาร์คนยังไม่เยอะ · งบของฝากแยกต่างหาก",555,75),
    R("10:30–12:00","เก็บกระเป๋า + พัก","โรงแรม","","",0,0,"","แพ็กให้เสร็จก่อนออกรอบเย็น — พรุ่งนี้บิน 10:35",630,90),
    R("12:00–13:00","มื้อกลางวัน","ร้านแถว Ueno","เดิน","",0,2800,"food","",720,60),
    R("13:00–14:45","งีบบ่ายสุดท้าย","โรงแรม","","",0,0,"","",780,105),
    R("15:15–15:35","ไป Skytree","Ueno → Tokyo Skytree","Ginza→Asakusa, Tobu→Skytree","~20 นาที",480,0,"logistic","",915,20),
    R("15:45–17:30","ช้อปของฝาก Tokyo Solamachi 🛍️","ใต้ Skytree","เดิน","~1.5 ชม.",0,0,"shopping","KitKat Tokyo · Tokyo Banana · ร้านการ์ตูน · รถเข็นสบาย",945,105),
    R("17:45–18:45","มื้อเย็นพิเศษส่งท้าย","Solamachi (food court/ร้านในมอลล์)","เดิน","",0,5000,"food","มื้อส่งท้ายทริป เลือกตามใจ",1065,60),
    R("19:00–19:45","เดินเที่ยวสุดท้ายรอบ Skytree (ไฟตึกช่วงค่ำ)","Skytree บริเวณรอบตึก","เดิน","",0,0,"view","ไฟประดับตึกสวย · ถ่ายรูปรอบๆ พอ",1140,45),
    R("20:00–20:20","กลับ Ueno","Skytree → Ueno","Tobu→Asakusa, Ginza→Ueno","~20 นาที",480,0,"logistic","",1200,20),
    R("20:45–21:30","ของฝากรอบสุดท้าย Don Quijote","Donki Ueno (เปิด 24 ชม.)","เดิน","",0,0,"shopping","เช็กกระเป๋าให้พร้อม · นอนไม่เกิน 22:00",1245,45),
  ]}]},
{date:"2026-12-06", d:"6 ธ.ค.", dow:"อาทิตย์ · D9", tag:"กลับ", pace:"rest", zone:"กลับกรุงเทพฯ",
  extras:[],
  title:"กลับกรุงเทพฯ ✈️", sub:"TG683 10:35 — ออกจากโรงแรม 07:30", activeVariant:0, inc:true,
  variants:[{name:"แผนหลัก", rows:[
    R("07:00–07:30","อาหารเช้าเร็ว + เช็กเอาท์","โรงแรม","","","",1200,"food","",420,30),
    R("07:30–08:20","เดินทางไปสนามบิน","Ueno → Haneda","JR Yamanote→Shinagawa, Keikyu→Haneda","~50 นาที",1040,0,"logistic","เผื่อ check-in 2 ชม.",450,50),
    R("10:35–15:40","TG683 ออกเดินทาง ✈️","Haneda → BKK","","",0,0,"","ถึง BKK 15:40",635,295),
  ]}]},
];

const SEED = {
  meta: { filename: "Tokyo_Trip_Working_Plan_2026.xlsx", loadedAt: "2026-09-06T00:00:00Z", source: "seed", schema: 5 },
  settings: {
    fx: 0.23, foodStyle: "กลาง", hotelTokyo: 13000, nightsTokyo: 8,
    hotelShizuoka: 12000, nightsShizuoka: 0, adults: 2, children: 1
  },
  days: JSON.parse(JSON.stringify(V4_DAYS)),
  routes: [
    ["Haneda → Ueno","Keikyu → Shinagawa → JR Yamanote","~45 นาที",520,0],
    ["Ueno → Maihama (Disney)","JR Yamanote→Tokyo→JR Keiyo","~50 นาที",230,0],
    ["Ueno → Toyosu (teamLab)","Tokyo Metro (เปลี่ยน 1 ครั้ง)","~40 นาที",250,0],
    ["Shin-Toyosu → Odaiba (Lego)","Yurikamome","~13 นาที",330,0],
    ["Odaiba → Ueno","Yurikamome→Shimbashi, JR","~35 นาที",500,0],
    ["Ueno → Toshimaen (WB)","Toei Oedo Line (ตรง)","~30 นาที",280,0],
    ["Ueno → Asakusa","Tokyo Metro Ginza Line","~5 นาที",180,0],
    ["Ueno → Nihonbashi (Pokémon Café)","JR Yamanote → Tokyo Sta. + เดิน 15 นาที","~25 นาที",170,0],
    ["Ueno → Skytree","Ginza→Asakusa, Tobu→Skytree","~20 นาที",240,0],
    ["Ueno → Kamakura","JR Ueno-Tokyo Line (ตรง)","~65 นาที",1040,1],
    ["Enoden 1-Day Pass 'Noriorikun'","ขึ้น-ลงไม่จำกัดทั้งสาย Enoden","1 วัน",800,1],
    ["Ueno → Haneda","JR Yamanote→Shinagawa→Keikyu","~50 นาที",520,0],
  ],
  checks: [
    ["จองที่พักโตเกียว 8 คืน (free cancellation)","28พ.ย.–5ธ.ค. ค้าง Ueno ทุกคืน — ไม่ต้องย้ายโรงแรม","ทำเลย","w-now","ยังไม่ได้ทำ"],
    ["จองตั๋ว Disneyland ออนไลน์","เปิดล่วงหน้า 2 เดือน → ~ปลาย ก.ย. 2026","~ก.ย.","w-soon","ยังไม่ได้ทำ"],
    ["จอง Pokémon Café (Nihonbashi)","เปิดจองวันที่ 1 ของเดือนก่อน 18:00 — หมดเร็วมาก (วันเยี่ยม 4 ธ.ค. → จอง 1 พ.ย.)","1 พ.ย. 18:00","w-now","ยังไม่ได้ทำ"],
    ["จอง teamLab Planets (timed slot)","ตั๋วหมดเร็ว จอง ~2–3 สัปดาห์ล่วงหน้า","~1 เดือน","w-pre","ยังไม่ได้ทำ"],
    ["ซื้อบัตร Anpanman Museum","ซื้อหน้างานได้ / ออนไลน์ล่วงหน้า · เด็ก 1 ขวบขึ้นมีบัตรเด็ก ~¥1,600","ก่อนวันไป","w-pre","ยังไม่ได้ทำ"],
    ["ซื้อบัตร Maxell Aqua Park","ซื้อออนไลน์ลดเล็กน้อย · เช็กตารางโชว์โลมาล่วงหน้า","~2 สัปดาห์","w-pre","ยังไม่ได้ทำ"],
    ["แจ้งโรงแรมยืมเปลเด็ก","ของมีจำกัด แจ้งตอนจอง","ล่วงหน้า","w-pre","ยังไม่ได้ทำ"],
    ["เตรียม Suica + eSIM/pocket wifi","ตั้ง Suica ในมือถือก่อนบิน","ก่อนบิน","w-pre","ยังไม่ได้ทำ"],
    ["ประกันเดินทาง (ครอบคลุมเด็ก)","เช็กค่ารักษาเด็ก","ก่อนบิน","w-pre","ยังไม่ได้ทำ"],
  ]
};

// ================= TIME UTILS =================
function minToStr(m){ m=((m%1440)+1440)%1440; return String(Math.floor(m/60)).padStart(2,'0')+":"+String(m%60).padStart(2,'0'); }
function parseTimeStr(s){ const m=String(s||'').match(/(\d{1,2})[:.](\d{2})/); if(!m) return null; const h=+m[1],mm=+m[2]; if(h>23||mm>59) return null; return h*60+mm; }
function parseTimeRange(t){ const s=String(t||''); const parts=s.split(/[–\-~]/).map(x=>parseTimeStr(x)); const start=parts[0]; const end=(parts.length>1&&parts[1]!=null)?parts[1]:null; return {start,end}; }
function parseDurText(t){
  const s=String(t||'').trim(); if(!s) return null;
  if(/^1\s*วัน/.test(s)) return null;
  // range like "3–4 ชม." → use the larger bound
  const rg=s.match(/(\d+(?:\.\d+)?)\s*[–\-~]\s*(\d+(?:\.\d+)?)\s*(ชม\.?|ชั่วโมง|hr?|นาที|min)?/);
  if(rg){
    const v=parseFloat(rg[2]); const u=rg[3]||'ชม.';
    return (u.startsWith('ช')||/^h/i.test(u)) ? Math.round(v*60) : Math.round(v);
  }
  const m=s.match(/(\d+(?:\.\d+)?)\s*(ชม\.?|ชั่วโมง|hr?|นาที|min)?/); if(!m) return null;
  const v=parseFloat(m[1]); const u=m[2]||'นาที';
  return (u.startsWith('ช')||/^h/i.test(u)) ? Math.round(v*60) : Math.round(v);
}
function durStr(m){ if(m==null) return ''; if(m>=60 && m%60===0) return (m/60)+' ชม.'; if(m>=60) return (Math.round(m/30)/2)+' ชม.'; return m+' นาที'; }
function syncTimeText(row){ if(row.start==null) return; row.time = minToStr(row.start) + (row.durMin!=null ? '–'+minToStr(row.start+row.durMin) : ''); }
function endOf(row){ return (row.start!=null && row.durMin!=null) ? row.start+row.durMin : null; }
function normalizeTimes(state){
  (state.days||[]).forEach(d=>(d.variants||[]).forEach(v=>(v.rows||[]).forEach(r=>{
    if(r.start==null){ const pr=parseTimeRange(r.time); r.start=pr.start; if(r.durMin==null&&pr.end!=null&&pr.start!=null) r.durMin=pr.end-pr.start; }
    if(r.durMin==null){ const pd=parseDurText(r.dur); if(pd!=null) r.durMin=pd; }
    syncTimeText(r);
  })));
}
function thaiDate(iso){ try{ return new Date(iso+'T00:00:00').toLocaleDateString('th-TH',{day:'numeric',month:'short'}); }catch(e){ return iso; } }

// ================= ACTIVITY TAGS =================
const TAGS={
  attraction:{label:'Attraction', icon:'🎡'},
  food:      {label:'Food',       icon:'🍜'},
  shopping:  {label:'Shopping',   icon:'🛍️'},
  rest:      {label:'Rest',       icon:'😴'},
  logistic:  {label:'Logistic',   icon:'🚆'},
  view:      {label:'View',       icon:'🌄'},
  other:     {label:'Other',      icon:'📌'}
};
// heuristic backfill for rows without an explicit tag
function deriveTag(r){
  const a=String(r.act||'');
  if(/งีบ|พัก|เช็กอิน|เช็กเอาท์|ฝากกระเป๋า|ซักผ้า|เก็บกระเป๋า|ปรับตัว|อาบน้ำ/.test(a)) return 'rest';
  if(/ช้อป|ของฝาก|Don ?Quijote|Donki/.test(a)) return 'shopping';
  if(/^(ไป|กลับ|เดินทาง)/.test(a) || /Shinkansen|เครื่องลง|TG683|รถบัส|Enoden|Keikyu/.test(a) || (r.train>0 && !r.cost && !/มื้อ/.test(a))) return 'logistic';
  if(/วัด|ศาลเจ้า|Zoo|Disney|Aquarium|Studio Tour|teamLab|Legoland|Hanayashiki|Skytree|Park|Castle|Ropeway|Museum|Toshogu|Hachimangu|Hase|Buddha|Miho|Matsubara|Gundam|Senso-ji|Shinobazu|Character Street/.test(a)) return 'attraction';
  if(r.type==='food' || /มื้อ|อาหาร|เช้า|กลางวัน|เย็น|คาเฟ่|Butterbeer|Oden Alley|ชิราสุ/.test(a)) return 'food';
  if(r.type==='entry') return 'attraction';
  if(/เดินเล่น|ชมทะเล|วิว/.test(a)) return 'view';
  return 'other';
}
function normalizeTags(state){
  (state.days||[]).forEach(d=>(d.variants||[]).forEach(v=>(v.rows||[]).forEach(r=>{
    if(!TAGS[r.tag]) r.tag=deriveTag(r);
  })));
}

// ================= IDEA LIBRARY (not yet in the plan) =================
// est = ¥ for 2 adults combined (0 = free / varies)
const IDEAS=[
  // ---- attractions ----
  {n:"Ghibli Museum 🎈",area:"Mitaka",tag:"attraction",est:2000,note:"ต้องซื้อบัตรล่วงหน้าที่ Lawson ตั้งแต่วันที่ 10 ของเดือนก่อน — หมดเร็วมาก"},
  {n:"teamLab Borderless 🎨",area:"Azabudai Hills",tag:"attraction",est:6400,note:"พี่น้องของ Planets ที่อยู่ในแผน — สวยสำหรับเด็กเช่นกัน"},
  {n:"Shibuya Sky 🌆",area:"Shibuya",tag:"attraction",est:4400,note:"ช่วงพระอาทิตย์ตกสวยสุด จองรอบล่วงหน้า"},
  {n:"Kahaku Science Museum 🦖",area:"Ueno",tag:"attraction",est:1260,note:"ไดโนเสาร์ T-Rex 12 ม. · ปิดวันจันทร์ — ไปคู่กับ Ueno Zoo ได้"},
  {n:"Small Worlds 🏙️",area:"Ariake",tag:"attraction",est:3200,note:"เมืองจำลองขนาดจิ๋ว สนามบิน/อวกาศ เด็กจ้องมองเพลิน"},
  {n:"Sunshine Aquarium 🐠",area:"Ikebukuro",tag:"attraction",est:4400,note:"ในร่มบนตึก Sunshine City — เหมาะวันฝนตก"},
  {n:"Miraikan 🔬",area:"Odaiba",tag:"attraction",est:1320,note:"พิพิธภัณฑ์วิทยาศาสตร์ หุ่นยนต์ ASIMO — ใกล้ DECKS"},
  {n:"Imperial Palace East Gardens 🌳",area:"Tokyo Sta.",tag:"attraction",est:0,note:"สวนฟรี เดินเล่นสบาย เชื่อมกับวัน Tokyo Station ได้"},
  {n:"Zojoji + Tokyo Tower ⛩",area:"Shiba",tag:"attraction",est:0,note:"วัดใหญ่คู่หอคอย — ถ่ายรูปสวย ไม่ต้องขึ้นหอก็ได้"},
  {n:"Yanaka Ginza 🏮",area:"Yanaka",tag:"attraction",est:0,note:"ย่านเก่าร้านขนม+แมวจำนวนมาก ห่าง Ueno 1 สถานี"},
  {n:"Kappabashi Kitchen Street 🔪",area:"Asakusa",tag:"attraction",est:0,note:"ถนนร้านอุปกรณ์ครัว ของฝากแปลกใหม่ ต่อจาก Senso-ji ได้"},
  {n:"Cup Noodles Museum 🍜",area:"Yokohama",tag:"attraction",est:1000,note:"ทำก๋วยเตี๋ยวถ้วยเอง เด็กชอบ — เป็น day trip ร่วมกับ Minato Mirai"},
  {n:"Sanrio Puroland 🎀",area:"Tama (Keio)",tag:"attraction",est:6600,note:"ธีมพาร์คในร่ม Hello Kitty — ตัวเลือกวันฝนตกที่ดีสุด"},
  {n:"Railway Museum 🚂",area:"Omiya",tag:"attraction",est:2000,note:"รถไฟจริง ขึ้นขับจำลองได้ — ต่อ JR จาก Ueno ~40 นาที"},
  {n:"Tokyo Sea Life Park 🐧",area:"Kasai",tag:"attraction",est:1200,note:"พิพิธภัณฑ์สัตว์น้ำราคาถูก ปลาทูน่าวงกลม"},
  {n:"Todoroki Valley 🌿",area:"Setagaya",tag:"view",est:0,note:"หุบเขาเขียวขจีกลางเมือง เดิน ~30 นาที ฟรี"},
  // ---- food ----
  {n:"Ichiran Ramen 🍜",area:"ทุกย่าน",tag:"food",est:2000,note:"ราเมนบูธส่วนตัว — เด็กเข้าด้วยได้ สั่งผ่านเครื่อง"},
  {n:"Afuri Yuzu Ramen 🍋",area:"Ebisu/Nakameguro",tag:"food",est:1800,note:"ราเมนน้ำใสมะนาว ไม่เผ็ด เหมาะเด็ก"},
  {n:"Tsukiji Outer Market 🐟",area:"Tsukiji",tag:"food",est:3000,note:"อาหารเช้าตลาดปลา ทามาโกะยากิ หอยปิ้ง — เช้าวันไหนก็ได้"},
  {n:"Depachika Food Hall 🍱",area:"Ginza/Ueno",tag:"food",est:2500,note:"ชั้นอาหารในห้าง (Mitsukoshi/Isetan) เลือกกินง่าย"},
  {n:"Omoide Yokocho 🍢",area:"Shinjuku",tag:"food",est:3500,note:"ตรอยากิโทริย่านเก่า — สลับกันดู Hooga"},
  {n:"Konbini Breakfast 🥪",area:"ทุกที่",tag:"food",est:600,note:"แซนด์ไข่ 7-11 + กาแฟกระป๋องร้อน — ต้องลองอย่างน้อยครั้ง"},
  {n:"Uogashi Nihon-Ichi 🍣",area:"Shibuya/Shinjuku",tag:"food",est:2400,note:"ซูชิยืนกินราคาดี กินเร็วเพลิน"},
  {n:"Tsurutontan Udon 🍜",area:"Roppongi",tag:"food",est:3000,note:"อุด้งจานใหญ่โต เด็กแชร์กินได้"},
  {n:"Kagetsudo Melonpan 🍞",area:"Asakusa",tag:"food",est:500,note:"ขนมเมลอนแพนร้อนๆ ใกล้ Senso-ji ต่อคิวสั้นๆ"},
  {n:"Zauo Fishing Restaurant 🎣",area:"Shinjuku",tag:"food",est:6000,note:"ตกปลาเองแล้วเชฟทำให้กิน — ทริปหน้าน่าลอง"},
  // ---- shopping ----
  {n:"Kiddy Land 🧸",area:"Harajuku",tag:"shopping",est:0,note:"ร้านของเล่น 5 ชั้น ของฝากเด็กชั้นเยี่ยม"},
  {n:"Pokémon Center Mega ⚡",area:"Ikebukuro Sunshine",tag:"shopping",est:0,note:"สาขาใหญ่สุด — เสริมจาก Pokémon Café วัน D7"},
  {n:"Nakano Broadway 🎮",area:"Nakano",tag:"shopping",est:0,note:"การ์ดโปเกมอน ของเก่า อนิเมะ ถูกกว่า Akihabara"},
  {n:"Akihabara Electric Town 🎮",area:"Akihabara",tag:"shopping",est:0,note:"ย่านไฟฟ้า การ์ตูน เกม — สลับกันเดิน"},
  {n:"Loft Stationery ✏️",area:"Shibuya/Ikebukuro",tag:"shopping",est:0,note:"เครื่องเขียน ของฝากแนวแม่+เด็ก"},
  {n:"Tokyu Hands 🛠️",area:"Shibuya",tag:"shopping",est:0,note:"ของใช้สารพัด DIY ของฝากแปลกๆ"},
  {n:"Bic Camera / Yodobashi 📷",area:"Ikebukuro/Shinjuku",tag:"shopping",est:0,note:"อิเล็กทรอนิกส์ tax-free — เทียบราคาก่อนซื้อ"},
  {n:"Book Off 📚",area:"ทุกย่าน",tag:"shopping",est:0,note:"หนังสือ/มังงะมือสองถูกมาก ของฝากคนอ่าน"},
  {n:"Oriental Bazaar 🎎",area:"Omotesando",tag:"shopping",est:0,note:"ของฝากญี่ปุ่นคลาสสิก ผ้าเช็ดตัว ชา ตุ๊กตา"},
  {n:"Don Quijote Mega Shibuya 🐧",area:"Shibuya",tag:"shopping",est:0,note:"สาขาใหญ่สุดเปิด 24 ชม. — ถ้าอยากได้รอบดึกจริงจัง"},
];

// ================= TODDLER ATTRACTION CATALOG (explore.html) =================
// score /10 for age 1-2 = ความสนุกสำหรับวัย + ปลอดภัย + สะดวกรถเข็น + มีห้องนม/ห้องน้ำเด็ก
// est = ราคาโดยประมาณ 2 ผู้ใหญ่ (เด็กต่ำกว่า 3-6 ขวบ ส่วนใหญ่ฟรี)
// tier: top (แนะนำจริง ≤30-40 นาที) | cond (มีเงื่อนไข/เด็กโตคุ้มกว่า) | bonus (40-60 นาที)
const KIDS_ATTRACTIONS=[
  {n:"Anpanman Museum 🐜",zone:"Minatomirai, โยโกฮามะ",time:"~30-35 นาที",score:9.5,tier:"top",indoor:true,est:3600,dur:"ครึ่งวัน",note:"เหมาะกับ 1-2 ขวบที่สุดในลิสต์นี้ — ออกแบบมาเพื่อเด็ก 1-6 ขวบโดยเฉพาะ"},
  {n:"Sanrio Puroland 🎀",zone:"Tama Center",time:"~35-40 นาที (จากชินจูกุ)",score:9.5,tier:"top",indoor:true,est:6600,dur:"ครึ่งวัน-ทั้งวัน",note:"ธีมพาร์คในร่ม Hello Kitty — ตัวเลือกวันฝนตกที่ดีที่สุด"},
  {n:"Maxell Aqua Park 🐟",zone:"ชินางาวะ",time:"~15 นาที",score:9,tier:"top",indoor:true,est:4400,dur:"2 ชม.",note:"อควาเรียมในร่มติดสถานี โชว์โลมาสวย วงล้อสว่างไฟ"},
  {n:"Ueno Zoo 🐼",zone:"อูเอโนะ",time:"~15 นาที",score:8.5,tier:"top",indoor:false,est:1200,dur:"2.5 ชม.",note:"สวนสัตว์เก่าแก่ ทางเดินกว้าง รถเข็นสะดวก (อยู่ในแผน D2 แล้ว)"},
  {n:"Sunshine City Aquarium + Pokémon Center 🐠",zone:"อิเคบุคุโระ",time:"~20 นาที",score:8.5,tier:"top",indoor:true,est:4400,dur:"ครึ่งวัน",note:"อควาเรียมบนตึก + ร้านโปเกมอนใหญ่ในคอมเพล็กซ์เดียว — ครบจบในร่ม"},
  {n:"Asobono! สนามเล่นในร่มยักษ์ 🧸",zone:"Tokyo Dome City",time:"~15 นาที",score:8.5,tier:"top",indoor:true,est:1600,dur:"2-3 ชม.",note:"สนามเล่นอินดอร์ใหญ่สุดแถวนี้ ออกแบบสำหรับเด็ก 0-6 ขวบโดยเฉพาะ"},
  {n:"Sumida Aquarium + Skytree 🐧",zone:"โอชิอาเกะ",time:"~30 นาที",score:8.5,tier:"top",indoor:true,est:5000,dur:"ครึ่งวัน",note:"เพนกวิน+แมงกะพรุนเรืองแสง แวะ Solamachi ได้ (อยู่ในแผน D8 แล้ว)"},
  {n:"Showa Kinen Park 🌳",zone:"ทาจิกาวะ",time:"~30-40 นาที (จากชินจูกุ)",score:8.5,tier:"top",indoor:false,est:1000,dur:"ครึ่งวัน",note:"สวนใหญ่มาก มีเรือนกระจก+สนามเด็ก ลานกว้างให้วิ่ง"},
  {n:"The Railway Museum 🚂",zone:"โอมิยะ",time:"~35-40 นาที",score:8,tier:"top",indoor:true,est:2000,dur:"2-3 ชม.",note:"ดีมากแต่เด็ก 3+ สนุกกว่า — วัย 1-2 ขวบสนุกช่วงโซนของเล่น ~1.5-2 ชม.พอ"},
  {n:"Tokyo Toy Museum 🪀",zone:"โยสึยะ",time:"~10 นาที",score:8,tier:"top",indoor:true,est:1600,dur:"1.5-2 ชม.",note:"พิพิธภัณฑ์ของเล่นไม้ในอาคารโรงเรียนเก่า มีโซน Bubbles สำหรับเด็กเล็ก"},
  {n:"Minato Mirai เดินเล่น + Cosmoworld 🎡",zone:"โยโกฮามะ",time:"~35 นาที",score:8,tier:"top",indoor:false,est:2000,dur:"ครึ่งวัน",note:"โซนเด็กของ Cosmoworld + เดินริมทะเล คู่กับ Anpanman ได้เป็นวันโยโกฮามะ"},
  {n:"Tokyo Sea Life Park + สวนคาไซ 🐡",zone:"คาไซ",time:"~20-25 นาที",score:7.5,tier:"top",indoor:true,est:1200,dur:"2-3 ชม.",note:"อควาเรียมราคาถูก ปลาทูน่าวงกลม ต่อรถไฟ 1 เด้งจาก คาไซริงไค"},
  // ---- conditional ----
  {n:"Pokémon Café ⚡",zone:"นิฮงบาชิ",time:"~20 นาที",score:7,tier:"cond",indoor:true,est:4000,dur:"1 ชม.",note:"ต้องจองล่วงหน้าหลายวัน ทางเว็บเท่านั้น (อยู่ในแผน D7 แล้ว)"},
  {n:"teamLab Planets 🎨",zone:"โทโยซุ",time:"~25 นาที",score:7.5,tier:"cond",indoor:true,est:6400,dur:"1.5 ชม.",note:"ตื่นตามาก แต่ต้องถือเด็กช่วงลุยน้ำ จองตั๋วรอบเวลาล่วงหน้า (อยู่ในแผน D5 แล้ว)"},
  {n:"Legoland Discovery 🧱",zone:"โอไดบะ",time:"~30 นาที",score:6.5,tier:"cond",indoor:true,est:5000,dur:"2.5 ชม.",note:"มีโซน Duplo ให้เด็กเล็ก แต่เหมาะหลัก 3+ (อยู่ในแผน D5 แล้ว)"},
  {n:"Pokémon Center 🛍️",zone:"อิเคบุคุโระ/โยโกฮามะ",time:"~20 นาที",score:6.5,tier:"cond",indoor:true,est:0,dur:"20-30 นาที",note:"เป็นร้านของเล่นไม่ใช่สวนสนุก เที่ยวจบใน 20 นาที — แนะนำรวมกับ Sunshine Aquarium"},
  {n:"Ghibli Museum 🎈",zone:"มิตากะ",time:"~35 นาที",score:6,tier:"cond",indoor:true,est:2000,dur:"2 ชม.",note:"ใต้ 4 ขวบฟรี แต่ของเล่นน้อยสำหรับวัยนี้ จองตั้งแต่วันที่ 10 ของเดือนก่อน ปิดวันอังคาร"},
  {n:"Doraemon Museum 🐱",zone:"คาวาซากิ",time:"~30 นาที",score:6.5,tier:"cond",indoor:true,est:2000,dur:"2 ชม.",note:"ต้องจองล่วงหน้า ปิดวันอังคาร เด็กโตจะสนุกกว่า"},
  {n:"Tokyo Disneyland 🎢",zone:"ไมฮามะ",time:"~50 นาที (จากอูเอโนะ)",score:6,tier:"cond",indoor:false,est:18000,dur:"ทั้งวัน",note:"แค่ ~15 นาทีจากสถานีโตเกียว มี Baby Care Center ครบ — เด็กโตสนุกกว่าแต่วัยนี้ก็ได้ (อยู่ในแผน D3 แล้ว)"},
  {n:"KidZania Tokyo 👷",zone:"โทโยซุ",time:"~25 นาที",score:null,tier:"cond",indoor:true,est:0,dur:"—",note:"เข้าไม่ได้ถ้าต่ำกว่า 3 ขวบ — ข้ามไปก่อน"},
  // ---- bonus 40-60 min ----
  {n:"Zoorasia 🦒",zone:"โยโกฮามะ",time:"~50-60 นาที",score:9,tier:"bonus",indoor:false,est:1600,dur:"ครึ่งวัน",note:"สวนสัตว์ระดับตำนาน เงาเยอะ รถเข็นสะดวก กรงปลอดภัยเปิดกว้าง"},
  {n:"Tama Zoo 🦁",zone:"ฮิโนะ",time:"~40-45 นาที",score:8.5,tier:"bonus",indoor:false,est:1200,dur:"ครึ่งวัน",note:"บัสซาฟารี + กระช้าลอยฟรี (ลิงตัวใหญ่จะแย่งของกิน — ระวัง)"},
  {n:"Hakkeijima Sea Paradise 🐬",zone:"คานาซาวะ, โยโกฮามะ",time:"~45-50 นาที",score:8,tier:"bonus",indoor:false,est:4400,dur:"ทั้งวัน",note:"อควาเรียม + สวนสนุกริมทะเล เกาะเล็กน่าเดิน ลมเย็นๆ"},
  {n:"Moominvalley Park 🌷",zone:"ฮันโน, ไซตามะ",time:"~50 นาที (จากอิเคบุคุโระ)",score:8,tier:"bonus",indoor:false,est:3000,dur:"ครึ่งวัน",note:"หุบเขามูมินน่ารักมาก บรรยากาศสงบ เหมาะเดินเล่นชิลๆ"},
];
const KIDS_TIPS=[
  ["☔ วันฝนตก","Puroland / Anpanman / Asobono! / Aqua Park — ในร่มทั้งหมด"],
  ["🎟️ ต้องจองล่วงหน้า","Pokémon Café, Ghibli, Doraemon Museum, teamLab"],
  ["🏆 คอมโบ 1 วันสนุกสุด","โยโกฮามะ = Anpanman (เช้า) + เดิน Minato Mirai + ชิงช้าสวรรค์ Cosmoworld (บ่าย)"],
  ["👶 เด็กต่ำกว่า 3 ขวบ","สวนสนุก/สวนสัตว์ส่วนใหญ่เข้าฟรี แต่วันหยุดคนเยอะมาก — ไปวันธรรมดา"],
];
// ================= FOOD PICKS — ตัวเลือกร้านตามย่าน (ไม่เพิ่มเข้าแผน ใช้เลือกสด) =================
// price = ~¥/คน
const FOOD_PICKS={
  ueno:{label:"อูเอโนะ",items:[
    {n:"Kura Sushi Okachimachi",kind:"🍣 ซูชิสายพาน",price:1500,note:"จานละ ¥150-300 · เกม Bikkura Pon ทุก 5 จาน เด็กหลงใจ"},
    {n:"Marugame Seimen Ueno",kind:"🍜 อุด้ง",price:700,note:"ก๋วยเตี๋ยวนุ่ม เด็กกินง่าย · สั่งที่เคาน์เตอร์ เร็วมาก"},
    {n:"Seiyoken (上野精養軒)",kind:"🍳 โยชกุ",price:2000,note:"โอมุไรซ์/ครอกเกตตำนาน 1910 · มีเก้าอี้เด็ก"},
    {n:"Ichiran Ramen Ueno",kind:"🍜 ราเมน",price:1000,note:"บูธส่วนตัว สั่งผ่านเครื่อง · คิวเดินเร็ว"},
    {n:"Saizeriya / Gusto (Ueno)",kind:"🍝 เฟมิลี่ร้านอาหาร",price:800,note:"เมนูเด็ก+ดริ้งบาร์ · โต๊ะกว้าง รถเข็นเข้าได้"},
    {n:"Innsyoutei (ใน Ueno Park)",kind:"🍱 ข้าวญี่ปุ่น",price:2500,note:"บ้านญี่ปุ่นโบราณ บรรยากาศสงบ · เหมาะมื้อกลางวันชิลๆ"},
  ]},
  asakusa:{label:"อาซากุสะ",items:[
    {n:"Tempura Daikokuya",kind:"🍤 เท็มปุระด้ง",price:2000,note:"ตำนาน 130 ปี · คิว ~20-40 นาที ไปก่อน 11:30"},
    {n:"Onigiri Yadoroku",kind:"🍙 โนริมากิ",price:700,note:"ร้านโนริมากิเก่าแก่สุดของโตเกียว · กินเดินได้"},
    {n:"Sushi Zanmai Asakusa",kind:"🍣 ซูชิ",price:2000,note:"สายพาน เปิดดึก · ของเด็กไม่ใส่วาซาบิได้"},
    {n:"Sometaro",kind:"🫓 โอโคโนมิยากิ",price:1500,note:"ทอนเองที่โต๊ะ สนุกสำหรับครอบครัว (ระวังร้อน)"},
    {n:"Asakusa Gyukatsu",kind:"🥩 เกียวคัตสึ",price:1500,note:"เนื้อทอดทานกลาง · คิวสั้นกว่าเท็มปุระ"},
  ]},
  disney:{label:"ไมฮามะ (Disney)",items:[
    {n:"ร้านในสวน (Queen of Hearts ฯลฯ)",kind:"🎢 ในสวน",price:2500,note:"อยู่ในงบแผนอยู่แล้ว · จองรอบอาหารผ่านแอปได้"},
    {n:"Rainforest Cafe Ikspiari",kind:"🦜 ธีมร้านอาหาร",price:3000,note:"สัตว์จักรกล+ฟ้าผ่ารอบโต๊ะ เด็กชอบมาก"},
    {n:"Ikspiari Food Court",kind:"🍱 ฟู้ดคอร์ท",price:1200,note:"เลือกง่าย ที่นั่งเยอะ ติดสถานี Maihama"},
  ]},
  kamakura:{label:"คามาคุระ",items:[
    {n:"Tobiuo (ติดสถานี)",kind:"🐟 ชิราสุด้ง",price:1300,note:"ขาวสะอาด อาหารเด็กกินได้ · ไม่ต้องรอนาน"},
    {n:"Sasagawa (Hase)",kind:"🐟 ชิราสุด้ง",price:1500,note:"ร้านเก่าแก่หลังเนิน · เดินจาก Hase-dera 6 นาที"},
    {n:"Kua'Aina Hase",kind:"🍔 เบอร์เกอร์",price:1500,note:"เบอร์เกอร์ฮาวายเลื่องชื่อ · เด็กกินง่ายสุดในย่าน"},
    {n:"Yoroppaken (Komachi)",kind:"🍛 แกง",price:1100,note:"แกงยุโรปบ้านเก่า · เมนูเด็กมี"},
  ]},
  yokohama:{label:"โยโกฮามะ/มินาโตมิไร",items:[
    {n:"MARK IS Food Court",kind:"🍱 ฟู้ดคอร์ท",price:1200,note:"ในแผนอยู่แล้ว — ตัวเลือกเยอะสุดในย่าน"},
    {n:"bills Minatomirai",kind:"🥞 แพนเค้ก",price:1800,note:"ริค็อตต้าแพนเค้กดัง · เหมาะมื้อช้าๆ"},
    {n:"Kiyoken (ชุมชนจีนใกล้)",kind:"🥟 ซิวไม่",price:800,note:"ซิวไม่บันได้ติดบ้าน · ซื้อกล่องไปนั่งริมอ่าวได้"},
    {n:"Manchinro (ไชน่าทาวน์)",kind:"🥟 ติมซำ",price:2500,note:"ถ้าอยากต่อไชน่าทาวน์ · เดินจาก Minatomirai ~15 นาที"},
  ]},
  toyosu:{label:"โทโยซุ",items:[
    {n:"LaLaport Food Court",kind:"🍱 ฟู้ดคอร์ท",price:1200,note:"ในแผนอยู่แล้ว · มีห้องเด็ก/เปลี่ยนผ้าอ้อม"},
    {n:"Sushiro Toyosu",kind:"🍣 ซูชิสายพาน",price:1000,note:"ถูกและเร็ว · สาขาใหญ่"},
    {n:"Toyosu Senkyaku Banrai",kind:"🍢 ตลาด+อาหาร",price:1800,note:"ตลาดปลาใหม่+ฟู้ดอัลลีย์ · มีฟุตออนเซ็นฟรีให้แช่เท้า"},
  ]},
  dome:{label:"ซุอิโดบาชิ (Tokyo Dome City)",items:[
    {n:"Yellow Street ซอยร้านอาหาร",kind:"🍱 เลือกหลายร้าน",price:1200,note:"เดิน 1 นาทีจาก Dome · ร้านครอบครัวเยอะ"},
    {n:"Coco Ichibanya Suidobashi",kind:"🍛 แกงกะหรี่",price:900,note:"ปรับความเผ็ดได้ เมนูเด็ก · เด็กต่ำกว่า 12 ขวบถูกลง"},
    {n:"Mominoki House",kind:"🌰 ตะวันตกออร์แกนิก",price:1800,note:"ร้านตำนานบ้านไม้ บรรยากาศอบอุ่น"},
  ]},
  tokyostation:{label:"หน้าสถานีโตเกียว–นิฮงบาชิ",items:[
    {n:"Tokyo Ramen Street (B1)",kind:"🍜 ราเมน",price:1100,note:"ในแผนอยู่แล้ว · Rokurinsha สึเกเม็งดัง คิวยาวช่วงเที่ยง"},
    {n:"Tamahide (นิฮงบาชิ)",kind:"🍚 โอยาโกด้ง",price:1600,note:"ต้นตำรับโอยาโกด้ง 1800 · รสนุ่ม เด็กกินได้"},
    {n:"Kanda Matsuya",kind:"🍜 โซบะ",price:1000,note:"โซบะ 1884 บ้านเก่า · คิวเดินเร็ว"},
    {n:"Shiseido Parlour (Ginza edge)",kind:"🍳 โยชกุคลาสสิก",price:2200,note:"โอมุไรซ์/สปาเก็ตตี้สไตล์เรโทร"},
    {n:"Isomaru Suisan Tokyo Sta.",kind:"🦐 ซีฟู้ดย่าง",price:2500,note:"ย่างเองที่โต๊ะ เปิดดึก"},
  ]},
  shinagawa:{label:"ชินางาวะ",items:[
    {n:"Eat Paradise (Shinagawa Prince)",kind:"🍽️ บุฟเฟ่ต์",price:3200,note:"บุฟเฟ่ต์ใหญ่ มีมุมเด็ก · คุ้มถ้าหิวมาก"},
    {n:"Ekinaka ชินางาวะ",kind:"🍱 ร้านในสถานี",price:1000,note:"เลือกเยอะ ใกล้ Maxell มาก"},
  ]},
  skytree:{label:"สกายทรี/โซลามาจิ",items:[
    {n:"Solamachi Food Court (10F)",kind:"🍱 ฟู้ดคอร์ท",price:1200,note:"ในแผนอยู่แล้ว · เลือก 10+ ร้าน"},
    {n:"Katsuya Solamachi",kind:"🍗 คัตสึด้ง",price:800,note:"เร็ว อิ่ม ถูก"},
    {n:"Momo Paradise Solamachi",kind:"🍲 ชาบู",price:2200,note:"ชาบุหม้อเดี่ยว เด็กกินผักได้ง่าย"},
    {n:"Sky Restaurant 634",kind:"🌆 ชมวิว",price:4500,note:"มื้อพิเศษบนชั้นสูง — ถ้าอยากเว่อร์ปิดทริป"},
  ]},
};
const FOOD_ANYWHERE=[
  {n:"Saizeriya / Gusto",kind:"🍝 เฟมิรีเสสตอรัง",price:700,note:"เมนูเด็ก+ดริ้งบาร์ — เจอทุกย่าน"},
  {n:"Sushiro / Kura Sushi",kind:"🍣 ซูชิสายพาน",price:1000,note:"เด็กต่ำกว่า 3-4 ขวบส่วนใหญ่ฟรี"},
  {n:"Coco Ichibanya",kind:"🍛 แกงกะหรี่",price:900,note:"ปรับเผ็ด เมนูเด็กทุกสาขา"},
  {n:"Matsuya / Yoshinoya",kind:"🥩 กิวด้ง",price:600,note:"สั่งจากตู้ เร็ว ราคาเป็นมิตร"},
];

// ================= TRIPS REGISTRY =================
const LEGACY_KEY = "tokyo-trip-plan-v2";
const Trips = {
  regKey: 'tp-trips-v1',
  defaults(){ return {activeId:'tokyo2026', trips:[{id:'tokyo2026', name:'โตเกียว · พ.ย.–ธ.ค. 2026'}]}; },
  get(){
    let reg; try{ reg=JSON.parse(localStorage.getItem(this.regKey)); }catch(e){}
    if(!reg || !reg.trips || !reg.trips.length){ reg=this.defaults(); }
    if(!localStorage.getItem('tp-migrated-v1')){
      const old=localStorage.getItem(LEGACY_KEY);
      if(old){ try{ localStorage.setItem(this.dataKey('tokyo2026'), old); }catch(e){} }
      try{ localStorage.setItem('tp-migrated-v1','1'); }catch(e){}
    }
    if(!reg.trips.find(t=>t.id===reg.activeId)) reg.activeId=reg.trips[0].id;
    return reg;
  },
  save(reg){ try{ localStorage.setItem(this.regKey, JSON.stringify(reg)); }catch(e){} },
  dataKey(id){ return 'tp-trip-'+id; },
  loadData(id){ try{ const s=localStorage.getItem(this.dataKey(id)); return s?JSON.parse(s):null; }catch(e){ return null; } },
  saveData(id,state){ try{ localStorage.setItem(this.dataKey(id), JSON.stringify(state)); }catch(e){} },
  activeTrip(reg){ reg=reg||this.get(); return reg.trips.find(t=>t.id===reg.activeId)||reg.trips[0]; },
  create(name){ const reg=this.get(); const id='t'+Date.now().toString(36);
    reg.trips.push({id, name:name||('ทริปใหม่ '+new Date().toISOString().slice(0,10))});
    reg.activeId=id; this.save(reg); return id; },
  setActive(id){ const reg=this.get(); if(reg.trips.find(t=>t.id===id)){ reg.activeId=id; this.save(reg); } }
};

// ================= v2 MIGRATION (Tokyo-every-night plan change) =================
function migrate(state){
  if(!state || !state.days) return state;
  state.meta=state.meta||{};
  // ---- v4: full geo-clustered replan (Sumida out, Hanayashiki→Asakusa day, Yokohama+Kamakura merged, extras added) ----
  if((state.meta.schema||0)<5){
    const t4=JSON.stringify(state.days);
    if(/Anpanman|Kamakura|Sumida|teamLab|Hanayashiki/.test(t4)){
      state.days=JSON.parse(JSON.stringify(V4_DAYS));
      state.checks=(state.checks||[]).filter(c=>!String(c[0]).includes('Sumida'));
      state.__mig=state.__mig||'v4-replan';
    }
    state.meta.schema=5;
    return state;
  }
  if(state.meta.schema>=5) return state;
  // ---- v3: drop Warner Bros + Odaiba, add Anpanman/Maxell/Marunouchi-lights ----
  if(state.meta.schema<3){
    const txt3=JSON.stringify(state.days);
    if(txt3.includes('Warner')||txt3.includes('Odaiba')||txt3.includes('Legoland')){
      const swap=(nw,idx)=>{
        let i=state.days.findIndex(d=>d.date===nw.date);
        if(i<0) i=state.days.findIndex(d=>d.d===nw.d);
        if(i<0) i=idx;
        state.days[i]=JSON.parse(JSON.stringify(nw));
      };
      // preserve เรือหงส์ if present in old D7 → park it into the idea library
      const oldD7=state.days.find(d=>d.date==="2026-12-04"||d.d==="4 ธ.ค.");
      if(oldD7){
        const swan=oldD7.variants[oldD7.activeVariant].rows.find(r=>r.act.includes('เรือหงส์'));
        if(swan){
          state.parked=state.parked||[];
          state.parked.push({n:swan.act, area:swan.ft||'', tag:swan.tag||'attraction', est:swan.cost||0, note:swan.note||'', from:'4 ธ.ค.'});
        }
      }
      swap(V3_D5,4); swap(V3_D6,5); swap(V3_D7,6); swap(NEW_D8,7);
      state.days.forEach((d,i)=>{ if(d.dow && /·\s*D\d+/.test(d.dow)) d.dow=d.dow.replace(/·\s*D\d+/, '· D'+(i+1)); });
      state.checks=(state.checks||[]).filter(c=>!String(c[0]).includes('Warner')&&!String(c[0]).includes('Legoland'));
      if(!state.checks.find(c=>String(c[0]).includes('Anpanman'))){
        state.checks.splice(3,0,["ซื้อบัตร Anpanman Museum","ซื้อหน้างาน/ออนไลน์ · เด็ก 1 ขวบขึ้น ~¥1,600","ก่อนวันไป","w-pre","ยังไม่ได้ทำ"]);
      }
      if(!state.checks.find(c=>String(c[0]).includes('Maxell'))){
        state.checks.splice(4,0,["ซื้อบัตร Maxell Aqua Park","ออนไลน์ลดเล็กน้อย · เช็กตารางโชว์โลมา","~2 สัปดาห์","w-pre","ยังไม่ได้ทำ"]);
      }
      state.__mig='dec-revise';
    }
    state.meta.schema=3;
    return state;
  }
  if(state.meta.schema===3) return state;
  // detect this specific Tokyo trip by Shizuoka mentions in plan CONTENT (not settings keys —
  // unrelated trips also carry a nightsShizuoka field)
  const tripText=JSON.stringify(state.days)+' '+JSON.stringify(state.routes||[])+' '+JSON.stringify(state.checks||[]);
  const hasShizuoka = tripText.includes('Shizuoka');
  if(hasShizuoka){
    state.settings.nightsTokyo=8; state.settings.nightsShizuoka=0;
    const replace=(nw)=>{
      let i=state.days.findIndex(d=>d.date===nw.date);
      if(i<0) i=state.days.findIndex(d=>d.d===nw.d);            // Thai label fallback (original workbook has no ISO dates)
      if(i<0 && state.days.length>=8) i=(nw===NEW_D7?6:7);       // positional fallback for the 9-day trip
      if(i>=0) state.days[i]=JSON.parse(JSON.stringify(nw));
      else state.days.push(JSON.parse(JSON.stringify(nw)));
    };
    replace(NEW_D7); replace(NEW_D8);
    state.days.forEach((d,i)=>{ if(d.dow && /·\s*D\d+/.test(d.dow)) d.dow=d.dow.replace(/·\s*D\d+/, '· D'+(i+1)); });
    state.days.forEach(d=>(d.variants||[]).forEach(v=>(v.rows||[]).forEach(r=>{
      if(r.act && r.act.includes('เตรียมกระเป๋า')){ r.act='ซักผ้า'; r.note='ค้าง Ueno ทุกคืน — ไม่ต้องแพ็กกระเป๋าย้ายโรงแรม'; }
    })));
    state.checks=(state.checks||[]).filter(c=>!String(c[0]).includes('Shizuoka'));
    if(!state.checks.find(c=>String(c[0]).includes('Pokémon'))){
      state.checks.splice(2,0,["จอง Pokémon Café (Nihonbashi)","เปิดจองวันที่ 1 ของเดือนก่อน 18:00 — หมดเร็วมาก","1 พ.ย. 18:00","w-now","ยังไม่ได้ทำ"]);
    }
    state.checks.forEach(c=>{ if(String(c[0]).includes('ที่พักโตเกียว')){ c[0]='จองที่พักโตเกียว 8 คืน (free cancellation)'; c[1]='28พ.ย.–5ธ.ค. ค้าง Ueno ทุกคืน — ไม่ต้องย้ายโรงแรม'; } });
    state.routes=(state.routes||[]).filter(r=>!String(r[0]).includes('Shizuoka'));
    if(!state.routes.find(r=>String(r[0]).includes('Nihonbashi'))){
      state.routes.splice(7,0,["Ueno → Nihonbashi (Pokémon Café)","JR Yamanote → Tokyo Sta. + เดิน 15 นาที","~25 นาที",170,0]);
    }
    state.__mig=state.__mig||'tokyo-nights';
  }
  state.meta.schema=3;
  return state;
}

// ================= LOAD / SAVE (active trip) =================
function tpLoad(){
  const reg=Trips.get();
  let st=Trips.loadData(reg.activeId);
  if(!st){ st=JSON.parse(JSON.stringify(SEED)); }
  const before=JSON.stringify(st);
  st=migrate(st);
  normalizeTimes(st);
  normalizeTags(st);
  if(JSON.stringify(st)!==before){
    // persist WITHOUT the one-shot toast flag so it fires once, not on every reload
    const flag=st.__mig; delete st.__mig;
    Trips.saveData(reg.activeId, st);
    st.__mig=flag;
  }
  return st;
}
function tpSave(state){ Trips.saveData(Trips.get().activeId, state); }
