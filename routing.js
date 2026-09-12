// ===== RoutingKit — keyless geocoding + pedestrian routing for the static site =====
// Geocoding: Nominatim (https://nominatim.org/release-docs/latest/api/Search/)
// Walking:   Valhalla public server (pedestrian costing, encoded polyline shape)
// Resolution order for a place: row.geo (manual) → places.json (baked) → live Nominatim (cached) → null
window.RK = (function(){
  const GEO_KEY='tp-geo-v1', ROUTE_KEY='tp-routes-v1', PLACES_URL='places.json';
  let baked={};     // name -> {lat,lng} loaded from places.json
  let bakedLoaded=false;

  const lsGet=(k)=>{ try{ return JSON.parse(localStorage.getItem(k))||{}; }catch(e){ return {}; } };
  const lsSet=(k,v)=>{ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} };
  const norm=(s)=>String(s||'').trim().toLowerCase();

  async function loadBaked(){
    if(bakedLoaded) return baked;
    bakedLoaded=true;
    try{
      const r=await fetch(PLACES_URL+'?v=1',{cache:'force-cache'});
      if(r.ok) baked=await r.json();
    }catch(e){}
    return baked;
  }

  // ---- geocode ----
  async function geocode(name, area){
    if(!name) return null;
    const key=norm(name)+'|'+norm(area||'');
    const cache=lsGet(GEO_KEY);
    if(cache[key]!==undefined) return cache[key];          // includes cached misses (null)
    const bakedAll=await loadBaked();
    if(bakedAll[key]!=null) return bakedAll[key];
    // live Nominatim (policy: ≤1 req/s — we pace serially from the caller too)
    try{
      const q=encodeURIComponent(name+(area?', '+area:'')+', Tokyo, Japan');
      const r=await fetch('https://nominatim.openstreetmap.org/search?q='+q+'&format=json&limit=1',{
        headers:{'Accept':'application/json'}});
      if(r.ok){
        const j=await r.json();
        const hit=j&&j[0]?{lat:+j[0].lat,lng:+j[0].lon,name:j[0].display_name}:null;
        cache[key]=hit; lsSet(GEO_KEY,cache);
        return hit;
      }
    }catch(e){}
    cache[key]=null; lsSet(GEO_KEY,cache);
    return null;
  }

  // ---- Valhalla pedestrian ----
  function decodePolyline(str, precision){
    let index=0, lat=0, lng=0, coords=[];
    const factor=Math.pow(10, precision||6);
    while(index<str.length){
      let result=1, shift=0, b;
      do{ b=str.charCodeAt(index++)-63-1; result+=b<<shift; shift+=5; }while(b>=0x1f);
      lat+=result&1?~(result>>1):(result>>1);
      result=1; shift=0;
      do{ b=str.charCodeAt(index++)-63-1; result+=b<<shift; shift+=5; }while(b>=0x1f);
      lng+=result&1?~(result>>1):(result>>1);
      coords.push([lat/factor, lng/factor]);
    }
    return coords;
  }
  async function walkRoute(a, b){
    if(!a||!b) return null;
    const k=[a.lat.toFixed(5),a.lng.toFixed(5),b.lat.toFixed(5),b.lng.toFixed(5)].join(',');
    const cache=lsGet(ROUTE_KEY);
    if(cache[k]!==undefined) return cache[k];
    try{
      const payload={locations:[{lat:a.lat,lon:a.lng},{lat:b.lat,lon:b.lng}],costing:'pedestrian'};
      const r=await fetch('https://valhalla1.openstreetmap.de/route?json='+encodeURIComponent(JSON.stringify(payload)));
      if(r.ok){
        const j=await r.json();
        const trip=j.trip&&j.trip.legs&&j.trip.legs[0];
        if(trip&&trip.shape){
          const out={coords:decodePolyline(trip.shape,6),
            meters:trip.summary?trip.summary.length:0,
            minutes:trip.summary?Math.round(trip.summary.time/60):0};
          cache[k]=out; lsSet(ROUTE_KEY,cache);
          return out;
        }
      }
    }catch(e){}
    cache[k]=null; lsSet(ROUTE_KEY,cache);
    return null;
  }

  // ---- build a day's route model ----
  // base: {name, geo} hotel — prepended as waypoint 0 (or null)
  // classify legs: walk (no line / line 'เดิน') vs transit (has line)
  function placeKeys(row){
    const norm=s=>String(s||'').trim().toLowerCase();
    const act=String(row.act||'').trim(), ft=String(row.ft||'').trim();
    const keys=[norm(act)+'|'+norm(ft), norm(act)+'|'];
    const m=act.match(/^(?:ไป|กลับ|เดินทางไป|เดินทางกลับ)\s+(.+)$/);
    if(m){
      keys.push(norm(m[1])+'|'+norm(ft));
      keys.push(norm(m[1])+'|');
    }
    return keys;
  }
  async function buildDayRoute(day, base, onProgress){
    const rows=day.variants[day.activeVariant].rows;
    const bakedAll=await loadBaked();
    const lookup=(row)=>{
      if(row.geo&&isFinite(row.geo[0])) return {lat:row.geo[0],lng:row.geo[1]};
      for(const k of placeKeys(row)){ if(bakedAll[k]) return bakedAll[k]; }
      return null;
    };
    const stops=[];
    if(base&&base.geo) stops.push({name:base.name||'โรงแรม (base)', geo:base.geo, row:null});
    for(const r of rows){
      stops.push({name:r.act, geo:lookup(r), row:r});
    }
    const resolved=stops.filter(s=>s.geo);
    const legs=[];
    for(let i=0;i<resolved.length-1;i++){
      const A=resolved[i], B=resolved[i+1];
      const isTransit = B.row && B.row.line && B.row.line!=='เดิน' && /ไป|กลับ|เดินทาง|Shinkansen|Line|Enoden|Yurikamome|Keikyu|JR|Metro|Toei|Ropeway|บัส/i.test(B.row.act+B.row.line);
      if(isTransit){
        legs.push({from:A,to:B,type:'transit',label:B.row.line,coords:null});
      }else{
        const w=await walkRoute(A.geo,B.geo);
        if(w&&w.coords&&w.coords.length>1) legs.push({from:A,to:B,type:'walk',coords:w.coords,meters:w.meters,minutes:w.minutes});
        else legs.push({from:A,to:B,type:'walk',coords:[[A.geo.lat,A.geo.lng],[B.geo.lat,B.geo.lng]],meters:0,minutes:null,straight:true});
      }
      if(onProgress) onProgress(i+1,resolved.length-1);
    }
    return {stops:resolved, legs};
  }

  return {geocode, walkRoute, buildDayRoute, decodePolyline, loadBaked};
})();
