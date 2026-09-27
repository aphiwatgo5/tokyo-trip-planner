# Tokyo Trip Planner 🍁

เว็บแอปวางแผนทริปแบบยืดหยุ่น + **sync สองทางกับไฟล์ Excel** — ทริปตัวอย่าง: โตเกียว 8 คืน (Ueno) 28 พ.ย. – 6 ธ.ค. 2026 · แผน v4 จัดแบบ geo-clustered (วันละ 1 ทิศทาง ลดเวลาต่อรถ · งบรวม ≈¥232,000)

## เปิดใช้

- **เครื่องตัวเอง:** ดับเบิลคลิก `index.html` (หรือ `python3 -m http.server` แล้วเปิด `http://localhost:8000`)
- **บนเว็บ (GitHub Pages):** ดูหัวข้อ Deploy ด้านล่าง

## 5 หน้า (v5 — Sheet-first)

| หน้า | ใช้ทำอะไร |
|---|---|
| `index.html` 📊 **แผน (Sheet=หน้าแรก)** | ทั้งทริปในตารางเดียว — แก้ได้ทุกช่อง (Enter/Tab) · **ลาก ⠿ สลับลำดับ/ย้ายข้ามวัน แล้วเวลาทั้งวันเรียงตามอัตโนมัติ (⛓)** · แถว 📌 ตรึงเวลา (รถ/ของจอง) ไม่ถูกขยับ · ปุ่มย้อน 1 ขั้น · 🗺 ต่อแถว → เส้นทางวันนั้น · 🤖 AI ส่งแผนให้ AI ปรับแล้วรับกลับ · เครื่องคิดงบสด · คลังไอเดีย · สร้างทริปใหม่จากเทมเพลต |
| `map.html` 🗺️ แผนที่ | จุดจากแผนปัจจุบัน (live) + kid-friendly + ไอเดีย · `?day=N` = โหมด "วันนี้" กรองเฉพาะวันนั้น |
| `route.html` 🧭 Route Sim | **จำลองเส้นทางรายวัน** — markers ลำดับ + เส้นเดินจริง (Valhalla) + ▶ เล่น · `?day=N&stop=R` บินไปไฮไลต์แถวนั้น (ปุ่ม 🗺 ใน Sheet ใช้ลิงก์นี้) |
| `cards.html` 📋 อ่าน | การ์ดรายชั่วโมงแบบ **อ่านอย่างเดียว** สำหรับระหว่างเที่ยว/สั่งพรินต์ (แก้แผนที่ Sheet) · เช็กลิสต์จองติ๊กได้ |
| `explore.html` 🔍 สำรวจ | **แคตตาล็อกที่เที่ยวเด็ก 1–2 ขวบ 24 แห่ง** พร้อมคะแนน /10 · กด ＋ ใส่ในวันไหนก็ได้ |

## วงจรการใช้งาน

**แก้ในแอป → ลง Excel:** แก้อะไรก็ได้ → **💾 บันทึกลง Excel** → ได้ .xlsx (ชีต: ตั้งค่า / แผนรายวัน / แดชบอร์ด / เส้นทาง / เช็กลิสต์จอง / คลังไอเดีย) เอาไปแทนไฟล์เดิม

**แก้ใน Excel → เข้าแอป:** ลากไฟล์ .xlsx วางบนหน้าแอป (หรือกด 📂) → เลือก "ทับทริปปัจจุบัน" หรือ "สร้างทริปใหม่"

**กติกา:** ไม่มี merge — ไฟล์ที่โหลดล่าสุดคือไฟล์ที่ใช้ แถบบนแสดงชื่อไฟล์+เวลาโหลดเสมอ (ไฟล์รุ่นใหม่จำค่า schema + คอลัมน์ "ตรึงเวลา?" ไว้ด้วย — รอบกลับไม่หาย)

**🤖 ให้ AI ช่วยปรับแผน (z.ai / ChatGPT / Gemini):** กด **🤖 AI** → แท็บ "ส่งให้ AI" → คัดลอกแพ็กเกจ (พรอมป์ตไทย + กติกา + JSON ของแผน) → ไปวางกับ AI ที่ค้นเว็บได้ → กลับมาแท็บ "รับจาก AI" วางคำตอบ → ดู **diff** (เพิ่ม/ลบ/ย้ายวัน/แก้เวลา + delta งบ + คำเตือน QA) → เลือก "ทับแผนเดิม" หรือ "สร้างเป็นตัวเลือกใหม่ A/B" — มีปุ่มย้อน

**ลากแล้วเวลาเรียงตาม (⛓):** ลาก ⠿ หรือกด ↑↓ → เวลาทั้งวันไหลตามลำดับใหม่จากแถวแรกที่มีเวลา โดยแต่ละแถวคงช่วงห่างเดิมไว้ · แถวที่กด **📌 ตรึงเวลา** (รถไฟ/สิ่งที่จองไว้) จะไม่ถูกขยับ — ถ้าเกิดทับจะขึ้นสีเหลืองเตือน · ปุ่ม ⛓ บนหัววัน = เรียงเวลาทั้งวันเมื่อไหร่ก็ได้

**✓ ตรวจแผน:** ปุ่มบนแถบเครื่องมือ — เช็คเวลาไม่เรียง/ทับ/ข้ามเที่ยงคืน/นานเกิน 6 ชม. ตามกฎเดียวกับ QA ก่อน deploy

## ฟีเจอร์หลัก

- **แก้ได้ทุกจุด:** เพิ่ม/ลบ/ทำสำเนา/เลื่อน ทั้งแถวและทั้งวัน · ปิด "รวม" รายแถว/รายวัน เพื่อตัดออกจากงบ
- **Auto-calculation:** จบ = เริ่ม + ระยะเวลา · Σแถว = เดินทาง + ค่าใช้จ่าย (อาหารคูณตัวคูณสไตล์ ×0.8/1.0/1.3) · แถวรวมวัน · งบรวม ¥/฿
- **ปรับตาม event ก่อนหน้า (⛓):** แก้เวลาเริ่ม/ระยะเวลา → แถวถัดไปในวันเดียวกันถูกดันตาม delta · เตือนสีเหลืองเมื่อเวลาทับ
- **แท็กกิจกรรม:** Attraction / Food / Shopping / Rest / Logistic / View / Other — แสดงเป็นชิปสี แก้ได้ในคอลัมน์ "แท็ก" และ sync ลง Excel (คอลัมน์ "แท็ก")
- **💡 คลังไอเดีย (สองทาง):** attraction/food/shopping ที่ยังไม่อยู่ในแผน (Ghibli, Shibuya Sky, Tsukiji, Ichiran, Kiddy Land ฯลฯ) — เลือกวันแล้วกด ＋ ใส่ในแผนได้ทันที · **กด 🗑 ที่แถวในแผน → "ย้ายไปคลังไอเดีย"** เพื่อเก็บกิจกรรมที่ยังไม่อยากทำออกจากตาราง (ตัดออกจากงบด้วย) แล้วหยิบกลับมาวันไหนก็ได้ — รายการที่ย้ายออก sync ลงชีต "คลังไอเดีย" ของ Excel ด้วย
- **🔐 ล็อกรหัสผ่าน:** เข้าใช้ต้องใส่รหัสผ่านก่อน (ตั้งไว้ที่ `LOCK_PASS` ใน `app.js` — ปัจจุบันคือ `hoogaati`) · ปลดล็อกครั้งเดียวต่อแท็บ (sessionStorage) แล้วสลับหน้าได้ไม่ต้องใส่ซ้ำ — เป็นการบังตาเชิงพื้นฐาน ไม่ได้เข้ารหัสข้อมูล (ดูข้อมูลใน localStorage ได้ถ้ารู้จัก DevTools)
- **หลายทริป:** ตัวเลือกทริปบน toolbar — โหลด Excel ใหม่เป็น "ทริปใหม่" ได้เรื่อยๆ ข้อมูลแยกกันตาม trip
- **สำรอง:** ⬇︎/⬆︎ JSON · ↺ รีเซ็ต

## 🧭 Route Simulation — infra & stack

```
แผน (localStorage)          places.json (baked, offline)      APIs (keyless, online)
┌────────────────┐   geocode lookup   ┌──────────────┐   miss→live   Nominatim (search?q=…)
│ rows + base    │ ─────────────────→ │ name → latlng │ ─────────→   Valhalla /route
└────────────────┘                    └──────────────┘              costing=pedestrian
        │                                        ↑                        │ polyline
        └───────────── routing.js (RK) ──────────┴────────────────────────┘
                          │ buildDayRoute → {stops, legs}
                          ↓
                     route.html (Leaflet + playback)
```

- **เดิน** = เส้นทางคนเดินจริงจาก [Valhalla](https://valhalla1.openstreetmap.de) (OpenStreetMap) · **รถไฟ** = เส้นโค้งสไตล์ + ชื่อสายจากแผน (ไม่มี transit routing ฟรีแบบ keyless — ถ้าต้องการจริง ต่อ NAVITIME/Jorudan API เองได้)
- พิกัดมี 3 ชั้น: `row.geo` (แก้มือ) → **places.json** (precompute แล้ว ใช้ offline ได้เลย) → live Nominatim (cache ในเครื่อง)
- **สั่ง run ผ่าน Claude / terminal ได้:** แก้แผนแล้วสั่ง
  ```bash
  node scripts/build-places.mjs              # จาก seed ใน data.js
  node scripts/build-places.mjs plan.json    # หรือจากไฟล์ ⬇︎ JSON ที่ export จากแอป
  ```
  สคริปต์จะ geocode เฉพาะชื่อใหม่ (cache ใน `scripts/geo-cache.json`) แล้วเขียน `places.json` ใหม่ → commit/push → เว็บอัปเดต
- **เรื่อง MCP:** MCP คือ protocol เชื่อม *agent* (เช่น Claude) กับ tools — ใช้กับเว็บ static โดยตรงไม่ได้ บทบาทเดียวกันในโครงนี้คือ "สั่ง Claude run สคริปต์ precompute / แก้แผน / deploy" ตามที่อธิบายไว้ด้านบน (และ Claude ก็เรียก curl/valhalla ตรงๆ ได้เหมือนกัน)

## 📱 Mobile

- ทุกหน้า responsive: การ์ดเรียงแนวตั้ง + แถบงบรวมติดล่างจอ · ตาราง scroll แนวนอน + ปุ่ม ↑↓ จัดลำดับ (drag ใช้ไม่ได้บน touch) + แถบกระโดดข้ามวัน · Route = แผนที่บน + timeline ล่าง

## 🔒 กติกา QA ก่อน deploy (บังคับ)

**ทุกครั้งก่อน push ต้องผ่าน QA** — สคริปต์ตรวจทั้งแผน: เวลาเรียงถูกต้อง · ไม่ทับกัน · ระยะเวลาไม่พัง (ไม่ข้ามเที่ยงคืน / ไม่เกิน 6 ชม.) · โน้ต/แท็กไม่ถูก arg-shift · งบรวมสมเหตุสมผล:

```bash
node scripts/qa.mjs            # ตรวจ seed ใน data.js
node scripts/qa.mjs plan.json  # หรือไฟล์ ⬇︎ JSON จากแอป
./scripts/deploy.sh            # QA → commit → push (หยุดถ้า QA fail)
```

## Deploy ขึ้น GitHub Pages

repo นี้พร้อม deploy แล้ว (มี `.github/workflows/deploy.yml` + `.nojekyll`):

**วิธีที่ 1 — GitHub Actions (แนะนำ):**
```bash
cd trip-planner
git init && git add -A && git commit -m "trip planner"
gh repo create tokyo-trip-planner --public --source=. --push
# แล้วเปิด Pages ผ่าน Actions:
gh api repos/{owner}/tokyo-trip-planner/pages -X POST \
  -f build_type=workflow -f source='{"branch":"main","path":"/"}'
```
พุชทุกครั้ง → Actions deploy ให้อัตโนมัติ → เปิดที่ `https://<user>.github.io/tokyo-trip-planner/`

**วิธีที่ 2 — manual:** สร้าง repo → push → Settings → Pages → Source: *GitHub Actions*

> ⚠️ หมายเหตุความเป็นส่วนตัว: ข้อมูลทริป (ชื่ะ เที่ยวบิน งบ) จะอยู่บน repo สาธารณะ — ถ้าไม่อยากให้คนอื่นเห็น ใช้ repo private (Pages ต้องมี Pro) หรือใช้แค่ในเครื่อง/localhost

## โครงสร้างไฟล์

- `data.js` — ข้อมูลตั้งต้น (seed) + TAGS + IDEAS + Trips registry + migration + time utils
- `app.js` — logic ใช้ร่วม: ตัวคิดงบ, สร้าง/อ่าน Excel, modal/toast, คลังไอเดีย, reflowDay, AI handoff (buildAIPackage/parseAIReturn/diffPlan/qaCheck)
- `index.html` (Sheet หน้าหลัก) · `cards.html` (อ่าน) · `map.html` · `route.html` · `explore.html` — `sheet.html` เป็น redirect เก่า
- ข้อมูลผู้ใช้เก็บใน localStorage ตาม origin (ย้ายเครื่อง/เว็บ ใช้ JSON export/import)
- `JOURNEY.md` — บันทึก user-journey audit before/after ของการรีโครงสร้าง v5

ราคา/เวลาเป็นประมาณการ — ตรวจสอบเว็บทางการก่อนจองทุกครั้ง


## Multi-trip templates (v3)

สร้างทริปใหม่ได้จาก dropdown บนแถบเครื่องมือ → มีฐานข้อมูลเทมเพลต 8 วันใน `data-trips.js`:
- 🏔️ **ภาคกลางญี่ปุ่น** — นาโกย่า/ทากายามะ/ชิรากาวะโก/คานาซาวะ (มีคำนวณ pass: Takayama-Hokuriku ¥19,800 คุ้มกว่าตั๋วเดี่ยว)
- 🏯 **โอซาก้า–คันไซ** — ฐานเดียว Namba + นารา/เกียวโตะ/USJ (สรุป: ไม่ต้องซื้อ pass — IC card พอ)

ทริปใหม่แต่ละทริปมี: แผน 9 วันครบ + งบ multi-city stays + ตัวเลือกอาหารต่อย่าน (foodAreas/foodRules ของทริปนั้น) + เช็กลิสต์จอง + packing checklist + ตารางเทียบบัตรรถไฟ — และ sync Excel สองทางได้เหมือนทริปโตเกียว (ชีต "ตั้งค่า" มี row ที่พักต่อเมือง)
เพิ่มเทมเพลตใหม่: เพิ่ม object ใน `TRIP_TEMPLATES` แล้วรัน `node scripts/build-places.mjs` เพื่อ geocode สถานที่ใหม่ — `qa.mjs` จะตรวจทุกเทมเพลตอัตโนมัติก่อนทุก deploy
