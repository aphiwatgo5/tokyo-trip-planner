#!/usr/bin/env node
// ===== build-places.mjs — precompute place coordinates for the trip planner =====
// Geocodes every activity in the plan via Nominatim (1.1s spacing, successes cached)
// and writes places.json next to the app — so the deployed site works fully offline.
//
// Usage:
//   node scripts/build-places.mjs                 # uses ../data.js SEED (Tokyo trip)
//   node scripts/build-places.mjs plan.json       # uses a JSON export from the app (⬇︎ JSON)
//
// Re-run any time the plan changes ("สั่ง run ผ่าน Claude ได้") — geo-cache.json keeps
// already-resolved places, so only new names hit Nominatim. Misses are retried next run.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE=path.dirname(fileURLToPath(import.meta.url));
const ROOT=path.resolve(HERE,'..');
const UA='tokyo-trip-planner/1.0 (github.com/aphiwatgo5/tokyo-trip-planner)';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const ALIAS=JSON.parse(fs.readFileSync(path.join(ROOT,'places-alias.json'),'utf8')).aliases;

function loadPlan(){
  const arg=process.argv[2];
  if(arg){
    const j=JSON.parse(fs.readFileSync(path.resolve(arg),'utf8'));
    return {settings:j.settings, days:j.days};
  }
  const src=fs.readFileSync(path.join(ROOT,'data.js'),'utf8');
  const sandboxStorage={getItem:()=>null,setItem:()=>{},removeItem:()=>{}};
  const fn=new Function('localStorage','window', src+'\n;return {SEED};');
  const {SEED}=fn(sandboxStorage,undefined);
  return {settings:SEED.settings, days:SEED.days};
}

// clean an activity title into a geocodable query using the alias table
function searchQuery(act){
  const clean=String(act||'').replace(/\(.*?\)/g,' ').replace(/（.*?）/g,' ').trim();
  const low=clean.toLowerCase();
  for(const [frag,q] of Object.entries(ALIAS)){
    if(q && low.includes(frag)) return q;
  }
  // fallback: keep only the Latin/ASCII leading part before separators
  const latin=clean.split(/[+/·,]/)[0].trim();
  return /[A-Za-z]/.test(latin)?latin:null;
}

// which rows are worth geocoding at all
function rowPlace(row){
  const a=String(row.act||'').trim();
  if(!a) return null;
  if(/งีบ|พัก|เช็กอิน|เช็กเอาท์|ฝากกระเป๋า|ซักผ้า|เก็บกระเป๋า|อาหารเช้า|มื้อ|TG68\d|เครื่องลง|ปรับตัว|รอบ|สัมภาษณ์/.test(a)) return null;
  let name=a;
  const m=a.match(/^(?:ไป|กลับ)\s+(.+)$/);
  if(m) name=m[1];
  const q=searchQuery(name);
  if(!q) return null;
  const ft=String(row.ft||'').trim().toLowerCase();
  const keys=[name.toLowerCase()+'|'+ft];
  const m2=name.match(/^(?:ไป|กลับ|เดินทางไป|เดินทางกลับ)\s+(.+)$/);
  if(m2) keys.push(m2[1].toLowerCase()+'|'+ft);
  return {keys, q};
}

async function geocode(q, cache){
  if(cache[q]!==undefined){ console.log('cache  '+q); return cache[q]; }
  try{
    const url='https://nominatim.openstreetmap.org/search?q='+encodeURIComponent(q)+', Japan&format=json&limit=1';
    const r=await fetch(url,{headers:{'User-Agent':UA,'Accept':'application/json'}});
    if(!r.ok) throw new Error('HTTP '+r.status);
    const j=await r.json();
    const hit=j&&j[0]?{lat:+j[0].lat,lng:+j[0].lon}:null;
    if(hit){ cache[q]=hit; console.log('found  '+q+' → '+hit.lat.toFixed(5)+','+hit.lng.toFixed(5)); }
    else console.log('MISS   '+q);
    return hit;
  }catch(e){
    console.log('ERROR  '+q+': '+e.message);
    return null;
  }finally{ await sleep(1100); }   // Nominatim policy: max 1 req/s
}

async function main(){
  const plan=loadPlan();
  const cachePath=path.join(HERE,'geo-cache.json');
  const cache=fs.existsSync(cachePath)?JSON.parse(fs.readFileSync(cachePath,'utf8')):{};

  const places=new Map();
  for(const d of plan.days||[]){
    for(const v of d.variants||[]){
      for(const r of v.rows||[]){
        const p=rowPlace(r);
        if(p) for(const k of p.keys) places.set(k, p);
      }
    }
  }
  console.log('Geocoding '+(places.size+1)+' unique queries…');
  await geocode('Ueno Station Tokyo', cache);
  for(const [key,p] of places){
    const hit=await geocode(p.q, cache);
    if(hit) p.geo=hit;
  }
  fs.writeFileSync(cachePath, JSON.stringify(cache,null,1));

  // write places.json in routing.js lookup format: key "act|ft" → {lat,lng}
  const out={};
  for(const [key,p] of places){ if(p.geo) out[key]=p.geo; }  // Map collapsed to unique keys already
  out['hotel base|ueno']={lat:35.7121,lng:139.7780};   // hotel fixed at Ueno (matches settings.base)
  fs.writeFileSync(path.join(ROOT,'places.json'), JSON.stringify(out,null,1));
  console.log('places.json written: '+Object.keys(out).length+' entries');
}

main().catch(e=>{ console.error(e); process.exit(1); });
