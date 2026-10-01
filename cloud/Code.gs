/**
 * Tokyo Trip Planner — ☁️ Cloud sync backend (Google Sheets + Apps Script)
 * ─────────────────────────────────────────────────────────────────────────
 * ติดตั้ง: ตาม cloud/SETUP.md (5 ขั้น ใช้เวลา ~5 นาที)
 *
 * โครงสร้างใน Spreadsheet:
 *   _trips : tripId | name | updatedAt (ISO) | device | chunks | acts | tabName
 *   _db    : tripId | idx | chunk   (state JSON แบ่งทีละ 45,000 ตัวอักษร — cell limit 50k)
 *   แผน·<ชื่อทริป> : มิเรอร์อ่านง่าย (สร้างใหม่ทุกครั้งที่ save — แก้ตรงนั้นไม่มีผล)
 *
 * API (โทเคน = Script Property "SECRET"):
 *   GET  ?action=list&t=TOKEN                      → {trips:[{id,name,updatedAt,device,acts}]}
 *   GET  ?action=load&t=TOKEN&trip=ID              → {trip,name,updatedAt,device,state}
 *   POST (body JSON: action=save)                  → {updatedAt}
 *        {token, trip, name, device, state, base, force}
 *        base = updatedAt ที่ client รู้จักล่าสุด — ถ้าไม่ตรงและคนละเครื่อง → {conflict:true,...}
 */
var CHUNK = 45000;

function doGet(e)  { return handle(e, {}); }
function doPost(e) {
  var body = {};
  try { body = JSON.parse((e && e.postData && e.postData.contents) || '{}'); } catch (err) {}
  return handle(e, body);
}

function handle(e, body) {
  var p = (e && e.parameter) || {};
  var token = p.t || body.token || '';
  var SECRET = PropertiesService.getScriptProperties().getProperty('SECRET') || '';
  var out;
  if (!SECRET) {
    out = { ok: false, error: 'ยังไม่ได้ตั้ง SECRET — ดู cloud/SETUP.md ขั้นที่ 3' };
  } else if (token !== SECRET) {
    out = { ok: false, auth: false, error: 'โทเคนไม่ถูกต้อง' };
  } else {
    try {
      var r = route(String(p.action || body.action || ''), p, body);
      out = r;
    } catch (err) {
      out = { ok: false, error: String((err && err.message) || err) };
    }
  }
  return ContentService.createTextOutput(JSON.stringify(out))
    .setMimeType(ContentService.MimeType.JSON);
}

function route(action, p, body) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  if (action === 'list') {
    return { ok: true, trips: listTrips(ss) };
  }

  if (action === 'load') {
    var id = String(p.trip || body.trip || '');
    if (!id) return { ok: false, error: 'missing trip' };
    var t = getTrip(ss, id);
    if (!t) return { ok: false, error: 'not found' };
    var json = chunksJoin(ss, id);
    if (!json) return { ok: false, error: 'not found' };
    return { ok: true, trip: t.id, name: t.name, updatedAt: t.updatedAt, device: t.device,
             state: JSON.parse(json) };
  }

  if (action === 'save') {
    var id2 = String(body.trip || '');
    var name = String(body.name || ('ทริป ' + id2));
    var device = String(body.device || '?');
    var state = body.state;
    if (!id2 || !state) return { ok: false, error: 'missing trip/state' };
    var lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      var cur = getTrip(ss, id2);
      var base = String(body.base || '');
      if (!body.force && cur && base && cur.updatedAt !== base && cur.device !== device) {
        return { ok: false, conflict: true,
                 server: { updatedAt: cur.updatedAt, device: cur.device, name: cur.name } };
      }
      var now = new Date().toISOString();
      saveChunks(ss, id2, JSON.stringify(state));
      upsertTrip(ss, cur, id2, name, now, device, state);
      renderMirror(ss, cur, id2, name, now, device, state);
      return { ok: true, updatedAt: now };
    } finally {
      lock.releaseLock();
    }
  }

  return { ok: false, error: 'unknown action: ' + action };
}

// ---------- sheet helpers ----------
function ensureTab(ss, name, headers) {
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    if (headers) sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    sh.setHiddenGridlines(true);
  }
  return sh;
}
function tabRows(sh) {                       // rows หลังแถวหัวตาราง
  var v = sh.getDataRange().getValues();
  return v.slice(1).filter(function (r) { return String(r[0] || '') !== ''; });
}
function getTrip(ss, id) {
  var sh = ensureTab(ss, '_trips', ['tripId', 'name', 'updatedAt', 'device', 'chunks', 'acts', 'tabName']);
  var rows = tabRows(sh);
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][0]) === String(id)) {
      return { id: String(rows[i][0]), name: String(rows[i][1]), updatedAt: String(rows[i][2]),
               device: String(rows[i][3]), tabName: rows[i][6] ? String(rows[i][6]) : '' };
    }
  }
  return null;
}
function listTrips(ss) {
  var sh = ensureTab(ss, '_trips', ['tripId', 'name', 'updatedAt', 'device', 'chunks', 'acts', 'tabName']);
  return tabRows(sh).map(function (r) {
    return { id: String(r[0]), name: String(r[1]), updatedAt: String(r[2]), device: String(r[3]),
             acts: r[5] || 0 };
  });
}
function saveChunks(ss, id, json) {
  var sh = ensureTab(ss, '_db', ['tripId', 'idx', 'chunk']);
  var keep = tabRows(sh).filter(function (r) { return String(r[0]) !== String(id); });
  var chunks = [];
  for (var i = 0; i < json.length; i += CHUNK) chunks.push(json.slice(i, i + CHUNK));
  var out = keep.concat(chunks.map(function (c, ix) { return [String(id), ix, c]; }));
  sh.clearContents();
  sh.getRange(1, 1, 1, 3).setValues([['tripId', 'idx', 'chunk']]).setFontWeight('bold');
  if (out.length) sh.getRange(2, 1, out.length, 3).setValues(out);
  return chunks.length;
}
function chunksJoin(ss, id) {
  var sh = ensureTab(ss, '_db', ['tripId', 'idx', 'chunk']);
  var rows = tabRows(sh).filter(function (r) { return String(r[0]) === String(id); });
  if (!rows.length) return '';
  rows.sort(function (a, b) { return (a[1] || 0) - (b[1] || 0); });
  return rows.map(function (r) { return String(r[2]); }).join('');
}
function upsertTrip(ss, cur, id, name, now, device, state) {
  var sh = ensureTab(ss, '_trips', ['tripId', 'name', 'updatedAt', 'device', 'chunks', 'acts', 'tabName']);
  var acts = 0;
  (state.days || []).forEach(function (d) {
    (d.variants || []).forEach(function (v) { acts += (v.rows || []).length; });
  });
  var tabName = 'แผน·' + sanitizeTab(name);
  var row = [String(id), name, now, device, Math.ceil(JSON.stringify(state).length / CHUNK), acts, tabName];
  var v = sh.getDataRange().getValues();
  var head = v[0];
  var found = false;
  for (var i = 1; i < v.length; i++) {
    if (String(v[i][0]) === String(id)) { sh.getRange(i + 1, 1, 1, row.length).setValues([row]); found = true; break; }
  }
  if (!found) sh.appendRow(row);
  // ทริปเปลี่ยนชื่อ → ลบแท็บมิเรอร์เก่า กันค้าง
  if (cur && cur.tabName && cur.tabName !== tabName) {
    var old = ss.getSheetByName(cur.tabName);
    if (old) ss.deleteSheet(old);
  }
  return tabName;
}
function sanitizeTab(s) {
  return String(s || '').replace(/[\[\]:*?\/\\]/g, '-').slice(0, 40);
}

// ---------- มิเรอร์อ่านง่าย (แท็บ "แผน·<ชื่อทริป>") ----------
function renderMirror(ss, cur, id, name, now, device, state) {
  var tabName = 'แผน·' + sanitizeTab(name);
  var sh = ss.getSheetByName(tabName) || ss.insertSheet(tabName);
  sh.clearContents();
  var rows = [];
  var fm = (state.settings && state.settings.foodStyle === 'ประหยัด') ? 0.8
         : (state.settings && state.settings.foodStyle === 'สบาย') ? 1.3 : 1.0;
  var st = state.settings || {};
  var hotel = (st.stays && st.stays.length)
    ? st.stays.reduce(function (a, x) { return a + (x.per || 0) * (x.nights || 0); }, 0)
    : (st.hotelTokyo || 0) * (st.nightsTokyo || 0) + (st.hotelShizuoka || 0) * (st.nightsShizuoka || 0);

  rows.push([name + ' — มิเรอร์จากแอป (อ่านอย่างเดียว — แก้ผ่านแอปเท่านั้น)']);
  rows.push(['อัปเดตล่าสุด', now, 'จากเครื่อง', device]);
  rows.push([]);
  var HEAD = ['วันที่', 'เวลา', 'กิจกรรม', 'แท็ก', 'เส้นทาง', 'ขนส่ง/สาย', 'ระยะเวลา', '🚆 ¥', '💸 ¥', 'โน้ต'];
  var grand = 0;
  (state.days || []).forEach(function (d) {
    var act = (d.variants && d.variants[d.activeVariant || 0] && d.variants[d.activeVariant || 0].rows) || [];
    rows.push([d.d + ' · ' + (d.title || ''), d.dow || '', act.length + ' กิจกรรม', (d.date || '')]);
    rows.push(HEAD);
    var daySum = 0;
    act.forEach(function (r) {
      var cost = (r.type === 'food') ? (r.cost || 0) * fm : (r.cost || 0);
      if (r.inc !== false && d.inc !== false) daySum += (r.train || 0) + (cost || 0);
      rows.push([d.d, r.time || '', r.act || '', r.tag || '', r.ft || '', r.line || '', r.dur || '',
                 r.train || '', r.cost || '', r.note || '']);
    });
    rows.push(['', '', 'รวมวัน', '', '', '', '', '', daySum, d.inc === false ? '(ไม่นับ)' : '']);
    rows.push([]);
    if (d.inc !== false) grand += daySum;
  });
  rows.push(['งบรวม (ไม่รวมตั๋วเครื่องบิน)', grand + hotel + ' ¥', '≈ ' + Math.round((grand + hotel) * ((st.fx || 0.23))) + ' ฿', 'ที่พัก ' + hotel + ' ¥']);
  sh.getRange(1, 1, rows.length, Math.max.apply(null, rows.map(function (r) { return r.length; })))
    .setValues(rows.map(function (r) { return r.concat(['', '', '', '', '', '', '', '', '', ''].slice(r.length)); }));
  sh.getRange(1, 1, 1, 4).setFontWeight('bold');
  sh.setFrozenRows(1);
  return tabName;
}

// ---------- ยูทิลิตี้: ตั้งค่า SECRET ครั้งแรก (รันครั้งเดียวจากเมนู ▶ หรือกด Run) ----------
function setupSecret() {
  var props = PropertiesService.getScriptProperties();
  if (props.getProperty('SECRET')) { Logger.log('SECRET มีอยู่แล้ว — ไม่แตะ'); return; }
  var s = 'tp-' + Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6);
  props.setProperty('SECRET', s);
  Logger.log('สร้าง SECRET แล้ว: ' + s + ' — คัดลอกไปใส่ในแอป (ปุ่ม ☁️ → ตั้งค่า)');
}
