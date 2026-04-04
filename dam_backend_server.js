require('dotenv').config();
const express = require('express');
const axios   = require('axios');
const cors    = require('cors');

const app  = express();
const PORT = process.env.PORT || 3001;
app.use(cors({ origin: '*' }));
app.use(express.json());

// ?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€
// API ??// ?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€
const HRFCO_KEY = process.env.HRFCO_KEY || 'FD7E358E-2151-4EAA-A61A-8918D2795907';
const KMA_KEY   = process.env.KMA_API_KEY || '';   // ê¸°ìƒì²?(? íƒ)

// ?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€
// ??ë§ˆìŠ¤???°ì´??(ê´€ì¸¡ì†Œì½”ë“œ ?????•ë³´)
// lat/lng ì¶”ê?, ?˜í˜œ?„ì‹œ/? ì—­ ?¬í•¨
// ?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€
const DAM_OBS = {
  '1003655': {
    id:'chungju', name:'ì¶©ì£¼??, river:'?¨í•œê°?,
    full:2750, minL:115, maxL:145,
    lat:37.0167, lng:128.0167,
    supply_city:'?œìš¸Â·ê²½ê¸°Â·ì¶©ë¶',
    watershed:{ area_km2:6648, cities:['?œì²œ','?¨ì–‘','ì¶©ì£¼'], supply:['?œìš¸','ê²½ê¸°','ì¶©ë¶'] },
    grid:{ nx:76, ny:122, city:'ì¶©ì£¼' },
  },
  '1010660': {
    id:'soyang', name:'?Œì–‘ê°•ëŒ', river:'ë¶í•œê°?,
    full:2900, minL:150, maxL:198,
    lat:37.9833, lng:127.7167,
    supply_city:'ì¶˜ì²œÂ·?œìš¸Â·ê²½ê¸° ë¶ë?',
    watershed:{ area_km2:2703, cities:['?¸ì œ','?‘êµ¬','ì¶˜ì²œ'], supply:['ì¶˜ì²œ','?œìš¸','ê²½ê¸° ë¶ë?'] },
    grid:{ nx:73, ny:134, city:'ì¶˜ì²œ' },
  },
  '3008690': {
    id:'daecheong', name:'?€ì²?Œ', river:'ê¸ˆê°•',
    full:1490, minL:60, maxL:80,
    lat:36.4833, lng:127.5000,
    supply_city:'?€?„Â·ì²­ì£¼Â·ì„¸ì¢?,
    watershed:{ area_km2:4134, cities:['ë³´ì?','?¥ì²œ','ì²?£¼'], supply:['?€??,'ì²?£¼','?¸ì¢…'] },
    grid:{ nx:66, ny:103, city:'ì²?£¼' },
  },
  '3001690': {
    id:'yongdam', name:'?©ë‹´??, river:'ê¸ˆê°•',
    full:815, minL:220, maxL:265,
    lat:35.9667, lng:127.5500,
    supply_city:'?„ì£¼Â·êµ°ì‚°Â·?µì‚°',
    watershed:{ area_km2:930, cities:['ì§„ì•ˆ','ë¬´ì£¼'], supply:['?„ì£¼','êµ°ì‚°','?µì‚°'] },
    grid:{ nx:68, ny:100, city:'ì§„ì•ˆ' },
  },
  '2015680': {
    id:'hapcheon', name:'?©ì²œ??, river:'?©ê°•',
    full:790, minL:155, maxL:179,
    lat:35.7500, lng:128.0833,
    supply_city:'?©ì²œÂ·ì°½ì›Â·ë¶€??,
    watershed:{ area_km2:925, cities:['ê±°ì°½','?©ì²œ'], supply:['?©ì²œ','ì°½ì›','ë¶€??] },
    grid:{ nx:82, ny:87, city:'?©ì²œ' },
  },
  '2004610': {
    id:'yeongju', name:'?ì£¼??, river:'?´ì„±ì²?,
    full:181.6, minL:155, maxL:170,
    lat:36.8667, lng:128.5167,
    supply_city:'?ì£¼Â·?ˆì²œ',
    watershed:{ area_km2:842, cities:['?ì£¼','?ˆì²œ'], supply:['?ì£¼','?ˆì²œ'] },
    grid:{ nx:89, ny:115, city:'?ì£¼' },
  },
  '3203640': {
    id:'boryeong', name:'ë³´ë ¹??, river:'?…ì²œì²?,
    full:116.9, minL:57, maxL:90,
    lat:36.3333, lng:126.7000,
    supply_city:'ë³´ë ¹Â·?œì²œÂ·?ì„±',
    watershed:{ area_km2:163, cities:['ì²?–‘','?ì„±'], supply:['ë³´ë ¹','?œì²œ','?ì„±'] },
    grid:{ nx:55, ny:103, city:'ë³´ë ¹' },
  },
  '2001685': {
    id:'andong', name:'?ˆë™??, river:'?™ë™ê°?,
    full:1248, minL:130, maxL:160,
    lat:36.5833, lng:128.8167,
    supply_city:'?ˆë™Â·êµ¬ë?Â·?€êµ?,
    watershed:{ area_km2:1584, cities:['?ˆë™','?ˆì²œ'], supply:['?ˆë™','êµ¬ë?','?€êµ?] },
    grid:{ nx:91, ny:107, city:'?ˆë™' },
  },
  '2002677': {
    id:'imha', name:'?„í•˜??, river:'ë°˜ë?ì²?,
    full:595, minL:141, maxL:163,
    lat:36.6000, lng:129.0167,
    supply_city:'?ˆë™Â·?ë•Â·?¬í•­',
    watershed:{ area_km2:1361, cities:['ì²?†¡','?ì–‘'], supply:['?ˆë™','?ë•','?¬í•­'] },
    grid:{ nx:95, ny:107, city:'ì²?†¡' },
  },
  '1012670': {
    id:'seomjin', name:'?¬ì§„ê°•ëŒ', river:'?¬ì§„ê°?,
    full:466, minL:173, maxL:196,
    lat:35.5667, lng:127.2333,
    supply_city:'?„ë‚¨ ?™ë?',
    watershed:{ area_km2:763, cities:['?„ì‹¤','?¨ì›'], supply:['?„ë‚¨ ?™ë?'] },
    grid:{ nx:76, ny:80, city:'êµ¬ë?' },
  },
  '4007660': {
    id:'juam', name:'ì£¼ì•”??, river:'ë³´ì„±ê°?,
    full:457, minL:140, maxL:170,
    lat:35.0000, lng:127.2167,
    supply_city:'ê´‘ì£¼Â·?œì²œÂ·?¬ìˆ˜',
    watershed:{ area_km2:1019, cities:['?œì²œ','ë³´ì„±'], supply:['ê´‘ì£¼','?œì²œ','?¬ìˆ˜'] },
    grid:{ nx:74, ny:77, city:'?œì²œ' },
  },
  '2021620': {
    id:'miryang', name:'ë°€?‘ëŒ', river:'ë°€?‘ê°•',
    full:73.6, minL:130, maxL:172,
    lat:35.5333, lng:128.7500,
    supply_city:'ë°€?‘Â·ì–‘??,
    watershed:{ area_km2:104, cities:['ë°€??], supply:['ë°€??,'?‘ì‚°'] },
    grid:{ nx:90, ny:81, city:'ë°€?? },
  },
  '5002620': {
    id:'buan', name:'ë¶€?ˆëŒ', river:'ë°±ì²œ',
    full:50.0, minL:78, maxL:101,
    lat:35.7833, lng:126.7333,
    supply_city:'ë¶€?ˆÂ·êµ°??,
    watershed:{ area_km2:104, cities:['ë¶€??], supply:['ë¶€??,'êµ°ì‚°'] },
    grid:{ nx:57, ny:93, city:'ë¶€?? },
  },
  '5101631': {
    id:'janghung', name:'?¥í¥??, river:'?ì§„ê°?,
    full:43.7, minL:65, maxL:126,
    lat:34.7167, lng:126.9167,
    supply_city:'?¥í¥Â·ê°•ì§„',
    watershed:{ area_km2:502, cities:['?¥í¥','ê°•ì§„'], supply:['?¥í¥','ê°•ì§„'] },
    grid:{ nx:72, ny:71, city:'?¥í¥' },
  },
  '1009652': {
    id:'hwacheon', name:'?”ì²œ??, river:'ë¶í•œê°?,
    full:1018, minL:172, maxL:181,
    lat:38.1000, lng:127.7000,
    supply_city:'ì¶˜ì²œÂ·?”ì²œ',
    watershed:{ area_km2:3901, cities:['?”ì²œ','?‘êµ¬'], supply:['ì¶˜ì²œ','?”ì²œ'] },
    grid:{ nx:71, ny:136, city:'?”ì²œ' },
  },
};

// obscdë¡?ë¹ ë¥´ê²?ì°¾ê¸° ?„í•œ ??ƒ‰??const ID_TO_OBSCD = {};
Object.entries(DAM_OBS).forEach(([obscd, info]) => { ID_TO_OBSCD[info.id] = obscd; });


// ?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€
// ? í‹¸: ?˜ìœ„ ???€?˜ìœ¨/?€?˜ëŸ‰ ì¶”ì •
// (?¤ì œ H-V ê³¡ì„  ?†ì„ ??? í˜• ê·¼ì‚¬)
// ?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€
function levelToRate(level, minL, maxL) {
  if (level <= minL) return 0;
  if (level >= maxL) return 100;
  return Math.round(((level - minL) / (maxL - minL)) * 1000) / 10;
}

function rateToVolume(rate, full) {
  return Math.round(rate / 100 * full * 10) / 10;
}

function alertFromRate(rate) {
  if (rate >= 85) return { level:'danger',  color:'#FF4444', message:'? ï¸ ?ìˆ˜ ê²½ë³´', code:3 };
  if (rate >= 70) return { level:'warning', color:'#FF8C00', message:'?”¶ ì£¼ì˜',       code:2 };
  if (rate <= 20) return { level:'drought', color:'#CC7700', message:'?œï¸?ê°€ë­?ê²½ë³´', code:2 };
  if (rate <= 35) return { level:'low',     color:'#FFD700', message:'?’§ ?€??ì£¼ì˜',  code:1 };
  return              { level:'normal',  color:'#00CC66', message:'???•ìƒ',       code:0 };
}

// ?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€
// HRFCO ?ì‹œ ?°ì´??ì¡°íšŒ
// ?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€
async function fetchHRFCO() {
  const url = `https://api.hrfco.go.kr/${HRFCO_KEY}/waterlevel/list/1H.json`;
  const r = await axios.get(url, { timeout:30000 });
  return r.data?.content || [];
}

// ?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€
// HRFCO ?ì‹œ ???„ë¡ ?¸ì—”???œì? ??ê°ì²´ ë³€??// ?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€
function rawToDam(obscd, info, found) {
  const level       = parseFloat(found?.wl ?? ((info.minL + info.maxL) / 2));
  const storage_rate = levelToRate(level, info.minL, info.maxL);
  const volume      = rateToVolume(storage_rate, info.full);
  // ? ìž…/ë°©ë¥˜: HRFCO ?˜ìœ„ API?ëŠ” ?†ìŒ ??ë³€?”ëŸ‰?¼ë¡œ ì¶”ì • (?¥í›„ ê°œì„ )
  const inflow  = Math.round(Math.random() * 50 + 50);   // TODO: ? ëŸ‰ API ë³„ë„ ?°ë™
  const outflow = Math.round(Math.random() * 30 + 40);

  return {
    id:           info.id,
    name:         info.name,
    river:        info.river,
    lat:          info.lat,
    lng:          info.lng,
    full:         info.full,
    level:        level,
    volume:       volume,
    storage_rate: storage_rate,
    inflow:       inflow,
    outflow:      outflow,
    time:         found?.ymdhm ?? new Date().toISOString().replace(/\D/g,'').slice(0,12),
    is_mock:      !found,
    alert:        alertFromRate(storage_rate),
    supply_city:  info.supply_city,
  };
}


// ?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€
// ? ì”¨: ê¸°ìƒì²??¨ê¸°?ˆë³´ (KMA_KEY ?ˆì„ ?Œë§Œ)
// ?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€
const weatherCache = {};
const CACHE_TTL_MS = 60 * 60 * 1000; // 1?œê°„

async function fetchWeather(nx, ny) {
  const key = `${nx}_${ny}`;
  const now = Date.now();
  if (weatherCache[key] && now - weatherCache[key].at < CACHE_TTL_MS) {
    return weatherCache[key].data;
  }
  if (!KMA_KEY) return null;

  // ê¸°ìƒì²?ê¸°ì? ?œê° ê³„ì‚° (0200,0500,0800,1100,1400,1700,2000,2300)
  const d = new Date();
  const hours = [2,5,8,11,14,17,20,23];
  const h = d.getHours();
  const baseH = [...hours].reverse().find(bh => bh <= (h - 1 + 24) % 24) ?? 23;
  const baseDate = h < baseH
    ? new Date(d - 86400000).toISOString().slice(0,10).replace(/-/g,'')
    : d.toISOString().slice(0,10).replace(/-/g,'');
  const baseTime = String(baseH).padStart(2,'0') + '00';

  try {
    const url = 'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst';
    const r = await axios.get(url, {
      params: {
        serviceKey: KMA_KEY, pageNo:1, numOfRows:1000,
        dataType:'JSON', base_date:baseDate, base_time:baseTime, nx, ny,
      },
      timeout: 25000,
    });
    const items = r.data?.response?.body?.items?.item || [];

    // ? ì§œë³?ì§‘ê³„
    const byDate = {};
    items.forEach(item => {
      const date = item.fcstDate;
      if (!byDate[date]) byDate[date] = [];
      byDate[date].push(item);
    });

    const days = Object.entries(byDate).slice(0,3).map(([date, its]) => {
      const pops  = its.filter(i=>i.category==='POP').map(i=>Number(i.fcstValue));
      const pcps  = its.filter(i=>i.category==='PCP').map(i=>{
        const v = i.fcstValue; return (v==='ê°•ìˆ˜?†ìŒ'||v==='0') ? 0 : parseFloat(v)||0;
      });
      const skies = its.filter(i=>i.category==='SKY').map(i=>i.fcstValue);
      const ptys  = its.filter(i=>i.category==='PTY').map(i=>i.fcstValue);

      const rain  = pcps.reduce((a,b)=>a+b, 0);
      const pop   = pops.length ? Math.max(...pops) : 0;
      const sky   = skies.length ? skies[Math.floor(skies.length/2)] : '1';
      const pty   = ptys.find(p=>p!=='0') ?? '0';
      const level = rain>80?'heavy' : rain>30?'moderate' : rain>5?'light' : 'none';
      const icon  = pty==='3'?'?Œ¨ï¸? : pty!=='0'?(rain>30?'?Œ§ï¸?:'?Œ¦ï¸?) : sky==='4'?'?ï¸' : sky==='3'?'??:'?€ï¸?;

      return { date, rain_mm:Math.round(rain*10)/10, pop_pct:pop, level, icon, is_rain:pty!=='0' };
    });

    const result = {
      forecast_days: days,
      total_rain_3day_mm: Math.round(days.reduce((a,d)=>a+d.rain_mm,0)*10)/10,
      is_mock: false,
    };
    weatherCache[key] = { at:now, data:result };
    return result;
  } catch(e) {
    console.warn('[? ì”¨ API ?¤ë¥˜]', e.message);
    return null;
  }
}

function mockWeather() {
  const now = new Date();
  return {
    forecast_days: [0,1,2].map(i => {
      const d = new Date(now); d.setDate(d.getDate()+i);
      const rain = [0,25,55][i];
      return {
        date:    d.toISOString().slice(0,10).replace(/-/g,''),
        rain_mm: rain, pop_pct:[10,50,80][i],
        level:   ['none','light','moderate'][i],
        icon:    ['?€ï¸?,'??,'?Œ§ï¸?][i], is_rain: i>0,
      };
    }),
    total_rain_3day_mm: 80,
    is_mock: true,
  };
}


// ?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•
// ?”ë“œ?¬ì¸??// ?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•

// ?€?€ 1. /api/all  (?„ë¡ ???€?œë³´??ë©”ì¸) ?€?€?€?€?€?€
app.get('/api/all', async (req, res) => {
  try {
    const raw = await fetchHRFCO();
    const dams = Object.entries(DAM_OBS).map(([obscd, info]) => {
      const found = raw.find(d => d.wlobscd === obscd);
      return rawToDam(obscd, info, found);
    });

    const total_storage  = dams.reduce((a,d)=>a+d.volume, 0);
    const total_capacity = dams.reduce((a,d)=>a+d.full, 0);

    res.json({
      dams,
      updated:        new Date().toISOString(),
      total_storage:  Math.round(total_storage*10)/10,
      total_capacity: Math.round(total_capacity),
      source:         'HRFCO ?œê°•?ìˆ˜?µì œ??,
      is_mock:        dams.every(d=>d.is_mock),
    });
  } catch(e) {
    console.error('[/api/all ?¤ë¥˜]', e.message);
    res.status(502).json({ error: e.message });
  }
});


// ?€?€ 2. /api/dam/:id  (???ì„¸ ëª¨ë‹¬) ?€?€?€?€?€?€?€?€?€?€
app.get('/api/dam/:id', async (req, res) => {
  const { id } = req.params;
  const obscd = ID_TO_OBSCD[id];
  const info  = obscd ? DAM_OBS[obscd] : null;
  if (!info) return res.status(404).json({ error: '???†ìŒ: ' + id });

  try {
    const raw   = await fetchHRFCO();
    const found = raw.find(d => d.wlobscd === obscd);
    const dam   = rawToDam(obscd, info, found);

    // 48?œê°„ ì¶”ì„¸ (ëª¨ì˜)
    const history = Array.from({length:48}, (_,i) => ({
      time:    String(202604010000 + i * 100).padStart(12,'0'),
      level:   +(dam.level + (Math.random()-0.5)*0.4).toFixed(2),
      inflow:  +(dam.inflow  + (Math.random()-0.5)*30).toFixed(1),
      outflow: +(dam.outflow + (Math.random()-0.5)*20).toFixed(1),
    }));

    // H-V ê³¡ì„  (?¤í”Œ?¼ì¸ ê·¼ì‚¬)
    const pts = 51;
    const hv = {
      spline: Array.from({length:pts},(_,i)=>{
        const l = info.minL + i*(info.maxL-info.minL)/(pts-1);
        const r = levelToRate(l, info.minL, info.maxL)/100;
        return { level:+l.toFixed(2), volume:+(info.full * Math.pow(r,1.8)).toFixed(1) };
      }),
      linear: Array.from({length:pts},(_,i)=>{
        const l = info.minL + i*(info.maxL-info.minL)/(pts-1);
        const r = levelToRate(l, info.minL, info.maxL)/100;
        return { level:+l.toFixed(2), volume:+(info.full * r).toFixed(1) };
      }),
      points: [
        [info.minL, 0],
        [info.minL+(info.maxL-info.minL)*0.25, info.full*0.08],
        [info.minL+(info.maxL-info.minL)*0.5,  info.full*0.35],
        [info.minL+(info.maxL-info.minL)*0.75, info.full*0.68],
        [info.maxL, info.full],
      ],
    };

    // ì§ê???ë¹„êµ
    const v = dam.volume;
    const intuitive = {
      olympic_pools:       Math.round(v * 1e6 / 2500),
      seoul_citizens_years: (v * 1e6 / (600 * 365 * 9700000)).toFixed(1),
      acre_feet:           Math.round(v * 810.71),
      korea_population_days: (v * 1e6 / (600 * 50000000 / 1000)).toFixed(1),
    };

    const net = dam.inflow - dam.outflow;
    const toFull = net > 0
      ? { hours: Math.round((info.full-v)*1e6/(net*3600)), days:0 }
      : null;

    res.json({
      id: dam.id,
      info: {
        name:    info.name,
        river:   info.river,
        full:    info.full,
        lat:     info.lat,
        lng:     info.lng,
        minL:    info.minL,
        maxL:    info.maxL,
        area_km2: info.watershed?.area_km2 || 2000,
      },
      realtime: {
        level:        dam.level,
        volume:       dam.volume,
        volume_linear: rateToVolume(levelToRate(dam.level, info.minL, info.maxL)*0.95, info.full),
        storage_rate: dam.storage_rate,
        inflow:       dam.inflow,
        outflow:      dam.outflow,
        time:         dam.time,
        is_mock:      dam.is_mock,
      },
      alert:      dam.alert,
      prediction: { net_flow_cms: net, to_full: toFull },
      intuitive,
      hv_curve:   hv,
      history,
    });
  } catch(e) {
    console.error('[/api/dam ?¤ë¥˜]', e.message);
    res.status(502).json({ error: e.message });
  }
});


// ?€?€ 3. /api/weather/:id  (ê¸°ìƒÂ·?ˆë¹„ë°©ë¥˜ ?? ?€?€
app.get('/api/weather/:id', async (req, res) => {
  const { id } = req.params;
  const obscd  = ID_TO_OBSCD[id];
  const info   = obscd ? DAM_OBS[obscd] : null;
  if (!info) return res.status(404).json({ error: '???†ìŒ' });

  const ws = info.watershed || { area_km2:2000, cities:['?¸ê·¼ ?œêµ°'], supply:['?´ë‹¹ ì§€??] };

  // ê¸°ìƒì²??ˆë³´ ?œë„
  let forecast = null;
  if (info.grid && KMA_KEY) {
    forecast = await fetchWeather(info.grid.nx, info.grid.ny);
  }
  if (!forecast) forecast = mockWeather();

  // ? ì—­ë©´ì  ê¸°ë°˜ ?ˆìƒ ? ìž…??ê³„ì‚°
  forecast.forecast_days.forEach(day => {
    day.estimated_inflow_m3s = +(day.rain_mm * ws.area_km2 * 1000 * 0.7 / 86400).toFixed(1);
  });

  res.json({ dam_id:id, watershed:ws, ...forecast });
});


// ?€?€ 4. /api/dams/current  (ê¸°ì¡´ ?”ë“œ?¬ì¸??? ì?) ?€?€
app.get('/api/dams/current', async (req, res) => {
  try {
    const raw = await fetchHRFCO();
    const result = Object.entries(DAM_OBS).map(([obscd, info]) => {
      const found = raw.find(d => d.wlobscd === obscd);
      const level = parseFloat(found?.wl ?? ((info.minL+info.maxL)/2));
      return {
        id:obscd, damId:info.id, name:info.name, river:info.river,
        level, full:info.full, minL:info.minL, maxL:info.maxL,
        storage_rate: levelToRate(level, info.minL, info.maxL),
        inRange: level>=info.minL && level<=info.maxL,
        time: found?.ymdhm ?? '',
      };
    });
    res.json({ success:true, source:'HRFCO', time:new Date().toISOString(), count:result.length, data:result });
  } catch(e) {
    res.status(502).json({ success:false, error:e.message });
  }
});


// ?€?€ 5. /api/dams/trend?id=soyang  (7??ì¶”ì„¸) ?€?€
app.get('/api/dams/trend', async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error:'id ?„ìš” (?? ?id=soyang)' });

  const obscd = ID_TO_OBSCD[id];
  const info  = obscd ? DAM_OBS[obscd] : null;
  if (!info) return res.status(404).json({ error:'???†ìŒ' });

  const now = new Date();
  const sdt = new Date(now-7*86400000).toISOString().slice(0,10).replace(/-/g,'')+`0000`;
  const edt = now.toISOString().slice(0,10).replace(/-/g,'')+`2300`;

  try {
    const url = `https://api.hrfco.go.kr/${HRFCO_KEY}/waterlevel/list/1H/${obscd}/${sdt}/${edt}.json`;
    const r   = await axios.get(url, { timeout:30000 });
    const raw = r.data?.content || [];
    const sampled = raw
      .filter((_,i) => i%6===0)
      .map(d => ({
        time:         d.ymdhm,
        level:        parseFloat(d.wl),
        storage_rate: levelToRate(parseFloat(d.wl), info.minL, info.maxL),
      }));

    res.json({ success:true, id, name:info.name, minL:info.minL, maxL:info.maxL, full:info.full, data:sampled });
  } catch(e) {
    res.status(502).json({ success:false, error:e.message });
  }
});


// ?€?€ 6. /api/health ?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€
app.get('/api/health', (req, res) => {
  res.json({
    status:   'ok',
    version:  'v14',
    time:     new Date().toISOString(),
    damCount: Object.keys(DAM_OBS).length,
    weather:  KMA_KEY ? 'KMA ?°ë™' : 'ëª¨ì˜ ?°ì´??(KMA_KEY ë¯¸ì„¤??',
    ports:    PORT,
  });
});


// ?€?€ ?œë²„ ?œìž‘ ?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€
app.listen(PORT, () => {
  console.log(`
  ?”â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•—
  ??  ?ì›Œì¹?ë°±ì—”?? v14                        ??  ??  http://localhost:${PORT}                   ??  ? â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•£
  ?? GET  /api/all                 ?€?œë³´???„ì²´ ??  ?? GET  /api/dam/:id             ???ì„¸       ??  ?? GET  /api/weather/:id         ê¸°ìƒÂ·?ˆë¹„ë°©ë¥˜ ??  ?? GET  /api/dams/current        ê¸°ì¡´ ?¸í™˜     ??  ?? GET  /api/dams/trend?id=xxx   7??ì¶”ì„¸      ??  ?? GET  /api/health              ?íƒœ ?•ì¸     ??  ? â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•£
  ?? HRFCO:  ${HRFCO_KEY.slice(0,8)}...           ??  ?? ? ì”¨:   ${KMA_KEY ? 'KMA API ?°ë™ ?? : '? ï¸ KMA_KEY ë¯¸ì„¤??(ëª¨ì˜)  '}   ??  ?šâ•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•
  `);
});
