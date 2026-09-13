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
    R("13:00–15:00","งีบ + เก็บกระเป๋า","โรงแรม","","","",0,0,"","พรุ่งนี้บิน 10:35",780,120),
    R("15:15–15:35","ไป Skytree","Ueno → Tokyo Skytree","Ginza→Asakusa, Tobu→Skytree","~20 นาที",480,0,"","",915,20),
    R("15:45–17:15","ช้อปของฝาก Tokyo Solamachi 🛍️","ใต้ Skytree","เดิน","~1.5 ชม.",0,0,"shopping","มอลล์ 4 ชั้น — KitKat Tokyo · Tokyo Banana · ร้านการ์ตูน · รถเข็นเข้าได้สบาย · งบของฝากแยกต่างหาก",945,90),
    R("17:30–19:00","Sumida Aquarium","Skytree","","1.5 ชม.",0,5000,"entry","เสาระเปิดถึง ~21:00 (เช็กอีกครั้ง) · ตอนเย็นคนน้อยกว่า · เพนกวิน+แมงกะพรุนเรืองแสง",1050,90),
    R("19:15–20:15","มื้อเย็นพิเศษส่งท้าย","Solamachi (food court/ร้านในมอลล์)","เดิน","",0,5000,"food","เลือกตามสะดวก — ไม่ต้องจอง",1155,60),
    R("20:30–20:50","กลับ Ueno","Skytree → Ueno","Tobu→Asakusa, Ginza→Ueno","~20 นาที",480,0,"","",1230,20),
    R("21:00–21:45","ของฝากรอบสุดท้าย Don Quijote","Donki Ueno (เปิด 24 ชม.)","เดิน","~45 นาที",0,0,"shopping","เต็มที่รอบสุดท้าย · เช็กกระเป๋าให้พร้อมก่อนเช้าบิน",1260,45),
  ]}]};

const SEED = {
  meta: { filename: "Tokyo_Trip_Working_Plan_2026.xlsx", loadedAt: "2026-09-06T00:00:00Z", source: "seed", schema: 3 },
  settings: {
    fx: 0.23, foodStyle: "กลาง", hotelTokyo: 13000, nightsTokyo: 8,
    hotelShizuoka: 12000, nightsShizuoka: 0, adults: 2, children: 1
  },
  days: [
    { date: "2026-11-28", d: "28 พ.ย.", dow: "เสาร์ · D1", tag: "วันพัก", pace: "rest", inc: true,
      title: "ถึงโตเกียว", sub: "Haneda 06:55 · วันปรับตัว", activeVariant: 0,
      variants: [ { name: "แผนหลัก", rows: [
        R("06:55","เครื่องลง Haneda (T3)","","","","","","","ผ่าน ตม. + รับกระเป๋า ~60–90 นาที"),
        R("08:30–09:15","เดินทางเข้าเมือง","Haneda → Ueno","Keikyu → Shinagawa → JR Yamanote","~45 นาที",1040,0,"","ตั้ง Suica ในมือถือก่อนออกจากสนามบิน"),
        R("09:30","ฝากกระเป๋าที่โรงแรม","โรงแรม (Ueno)","เดิน","","","","","เช็กอินบ่าย ฝากของก่อน"),
        R("10:00–12:00","พัก/อาบน้ำ คาเฟ่หรือล็อบบี้","รอบ Ueno","เดิน","","","","","เด็กเพลียจากไฟลต์กลางคืน"),
        R("12:00","มื้อกลางวันเบาๆ","ร้านใกล้โรงแรม","เดิน","","",2500,"food","Kura Sushi / อุด้ง Marugame"),
        R("13:30–16:00","งีบยาวที่โรงแรม","โรงแรม","","","","","","เช็กอิน 15:00 · ให้ Hooga ปรับเวลา"),
        R("16:30–18:00","เดินเล่น Ueno Park / Ameyoko","Ueno Park","เดิน","","","","","เดินเบาๆ สูดอากาศ"),
        R("18:30","มื้อเย็น + นอนเร็ว","ร้านใกล้โรงแรม","เดิน","","",3500,"food","เก็บแรงไว้พรุ่งนี้"),
      ] } ] },
    { date: "2026-11-29", d: "29 พ.ย.", dow: "อาทิตย์ · D2", tag: "วันกลาง", pace: "med", inc: true,
      title: "Ueno Zoo + Asakusa เย็น", sub: "อยู่ฝั่งเดียวกัน Ginza Line 5 นาที", activeVariant: 0,
      variants: [ { name: "แผนหลัก", rows: [
        R("08:30","อาหารเช้า","คาเฟ่/konbini","เดิน","","",1500,"food",""),
        R("09:30–12:00","Ueno Zoo","Ueno Park (เดิน 5 นาที)","เดิน","2.5 ชม.",0,1200,"entry","ผู้ใหญ่ ¥600 · Hooga ฟรี · ทางเดินกว้าง"),
        R("12:15","มื้อกลางวัน","Kura Sushi Okachimachi","เดิน ~8 นาที","","",2500,"food","ซูชิสายพาน มีของเล่นแจกเด็ก"),
        R("13:00–15:00","งีบบ่ายที่โรงแรม","โรงแรม","เดิน","","","","","ชาร์จแบตก่อนออกรอบเย็น"),
        R("15:15–15:25","ไป Asakusa","Ueno → Asakusa","Tokyo Metro Ginza Line","~5 นาที",360,0,"",""),
        R("15:30–17:30","Senso-ji + Nakamise","Asakusa","เดิน","","",1000,"food","ดูวัดจากดาดฟ้าฟรีของ Tourist Center · ร้าน Nakamise ปิด ~17:00–18:00"),
        R("18:00","มื้อเย็น Asakusa (เทมปุระ/อูนางิ)","ร้านย่าน Asakusa","เดิน","","",3000,"food",""),
        R("19:00–19:10","กลับโรงแรม นอนเร็ว","Asakusa → Ueno","Tokyo Metro Ginza Line","~5 นาที",360,0,"","พรุ่งนี้ Disney วันหนัก"),
      ] } ] },
    { date: "2026-11-30", d: "30 พ.ย.", dow: "จันทร์ · D3", tag: "วันหนัก", pace: "big", inc: true,
      title: "Tokyo Disneyland 🎢", sub: "ไฮไลต์ของทริป", activeVariant: 0,
      variants: [ { name: "แผนหลัก", rows: [
        R("07:30","อาหารเช้าเร็ว","konbini/โรงแรม","","","",1200,"food",""),
        R("08:00–08:50","เดินทางไป Disney","Ueno → Maihama","JR Yamanote→Tokyo, เปลี่ยน JR Keiyo→Maihama","~50 นาที",460,0,"","ชานชาลา Keiyo ที่ Tokyo ไกล เผื่อเดิน ~15 นาที"),
        R("09:00","เข้าสวน Disneyland","Maihama (เดิน 5 นาที)","เดิน","","",18000,"entry","ตั๋วจองล่วงหน้า · เช่ารถเข็นในสวน · จันทร์คนน้อย"),
        R("09:00–12:00","Fantasyland + Toontown","ในสวน","","","","","","โซนเหมาะเด็กเล็กสุด"),
        R("12:00","มื้อกลางวันในสวน","ร้านในสวน","","","",5000,"food","ใช้ Baby Center ป้อนนม/เปลี่ยนผ้าอ้อม"),
        R("13:00–15:00","งีบในรถเข็น + เครื่องเล่นเด็ก","ในสวน","","","","","",""),
        R("15:00–18:00","เครื่องเล่นเพิ่ม + พาเหรด","ในสวน","","","",1500,"food","ของว่าง/ป๊อปคอร์น"),
        R("18:00","มื้อเย็น","ในสวน / Ikspiari","","","",5000,"food","ถ้า Hooga เพลีย กลับก่อนได้"),
        R("19:00–19:50","เดินทางกลับ","Maihama → Ueno","JR Keiyo→Tokyo→Yamanote","~50 นาที",460,0,"",""),
      ] } ] },
    { date: "2026-12-01", d: "1 ธ.ค.", dow: "อังคาร · D4", tag: "วันกลาง", pace: "med", inc: true,
      title: "Kamakura Day Trip 🗿", sub: "วันนั่งรถไฟชิลๆ พักขาจาก Disney", activeVariant: 0,
      variants: [ { name: "แผนหลัก", rows: [
        R("08:00","อาหารเช้าเร็ว","konbini/โรงแรม","","","",1200,"food",""),
        R("08:40–09:50","ไปคามาคุระ","Ueno → Kamakura","JR Ueno-Tokyo Line (ตรง)","~65 นาที",2080,0,"","¥1,040/คน · รถตรงไม่ต้องเปลี่ยนสาย · Hooga งีบบนรถได้"),
        R("10:00–11:30","Tsurugaoka Hachimangu + Komachi-dori","Kamakura Sta.","เดิน","","",1000,"food","วัดหลักเข้าฟรี · ของว่างถนน Komachi"),
        R("11:35","ซื้อ Enoden 1-Day Pass (Noriorikun)","Kamakura Sta.","Enoden","",1600,0,"","¥800/คน · ขึ้น-ลงไม่จำกัดทั้งสาย"),
        R("12:00","มื้อกลางวัน ชิราสุด้ง","ร้านแถว Hase/Kamakura","Enoden + เดิน","","",3000,"food","ข้าวหน้าปลาชิราสุ เมนูดังคามาคุระ"),
        R("13:00–14:30","Hase-dera + Great Buddha (Kotoku-in)","Hase Sta.","Enoden + เดิน","","",1400,"entry","Hase-dera ¥400 + Daibutsu ¥300 (ต่อคน)"),
        R("15:00–16:00","นั่ง Enoden ชมทะเล / Enoshima","Hase → Enoshima","Enoden","","","","","จุดถ่ายรูป Kamakura-Kokomae · Hooga งีบในรถเข็น"),
        R("16:30–17:40","เดินทางกลับ","Kamakura → Ueno","JR Ueno-Tokyo Line","~65 นาที",2080,0,"",""),
        R("18:30","มื้อเย็น + นอนเร็ว","ร้านใกล้โรงแรม Ueno","เดิน","","",3500,"food",""),
      ] } ] },
    JSON.parse(JSON.stringify(V3_D5)),
    JSON.parse(JSON.stringify(V3_D6)),
    JSON.parse(JSON.stringify(V3_D7)),
    JSON.parse(JSON.stringify(NEW_D8)),
    { date: "2026-12-06", d: "6 ธ.ค.", dow: "อาทิตย์ · D9", tag: "กลับ", pace: "rest", inc: true,
      title: "กลับกรุงเทพฯ ✈️", sub: "TG683 10:35", activeVariant: 0,
      variants: [ { name: "แผนหลัก", rows: [
        R("07:00","อาหารเช้า + เช็กเอาท์","โรงแรม","","","",1200,"food",""),
        R("07:30–08:20","เดินทางไปสนามบิน","Ueno → Haneda","JR Yamanote→Shinagawa, Keikyu→Haneda","~50 นาที",1040,0,"","เผื่อ check-in 2–3 ชม."),
        R("10:35","TG683 ออกเดินทาง","Haneda → BKK","","","","","","ถึง BKK 15:40"),
      ] } ] },
  ],
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
    ["จอง Sumida Aquarium ออนไลน์","ซื้อล่วงหน้าถูกกว่าหน้างาน ~¥200/คน","~1 เดือน","w-pre","ยังไม่ได้ทำ"],
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
