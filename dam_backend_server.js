require('dotenv').config();
const express = require('express');
const axios   = require('axios');
const cors    = require('cors');

const app  = express();
const PORT = process.env.PORT || 3001;
app.use(cors({ origin: '*' }));
app.use(express.json());

// index.html 정적 파일 제공
app.use(express.static(__dirname));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// ─────────────────────────────────────────────
// API 키
// ─────────────────────────────────────────────
const HRFCO_KEY = process.env.HRFCO_KEY || 'FD7E358E-2151-4EAA-A61A-8918D2795907';
const KMA_KEY   = process.env.KMA_API_KEY || '';   // 기상청 (선택)

// ─────────────────────────────────────────────
// 댐 마스터 데이터 (관측소코드 → 댐 정보)
// lat/lng 추가, 수혜도시/유역 포함
// ─────────────────────────────────────────────
const DAM_OBS = {
  '1003655': {
    id:'chungju', name:'충주댐', river:'남한강',
    full:2750, minL:115, maxL:145,
    lat:37.0167, lng:128.0167,
    supply_city:'서울·경기·충북',
    watershed:{ area_km2:6648, cities:['제천','단양','충주'], supply:['서울','경기','충북'] },
    grid:{ nx:76, ny:122, city:'충주' },
  },
  '1010660': {
    id:'soyang', name:'소양강댐', river:'북한강',
    full:2900, minL:150, maxL:198,
    lat:37.9833, lng:127.7167,
    supply_city:'춘천·서울·경기 북부',
    watershed:{ area_km2:2703, cities:['인제','양구','춘천'], supply:['춘천','서울','경기 북부'] },
    grid:{ nx:73, ny:134, city:'춘천' },
  },
  '3008690': {
    id:'daecheong', name:'대청댐', river:'금강',
    full:1490, minL:60, maxL:80,
    lat:36.4833, lng:127.5000,
    supply_city:'대전·청주·세종',
    watershed:{ area_km2:4134, cities:['보은','옥천','청주'], supply:['대전','청주','세종'] },
    grid:{ nx:66, ny:103, city:'청주' },
  },
  '3001690': {
    id:'yongdam', name:'용담댐', river:'금강',
    full:815, minL:220, maxL:265,
    lat:35.9667, lng:127.5500,
    supply_city:'전주·군산·익산',
    watershed:{ area_km2:930, cities:['진안','무주'], supply:['전주','군산','익산'] },
    grid:{ nx:68, ny:100, city:'진안' },
  },
  '2015680': {
    id:'hapcheon', name:'합천댐', river:'황강',
    full:790, minL:155, maxL:179,
    lat:35.7500, lng:128.0833,
    supply_city:'합천·창원·부산',
    watershed:{ area_km2:925, cities:['거창','합천'], supply:['합천','창원','부산'] },
    grid:{ nx:82, ny:87, city:'합천' },
  },
  '2004610': {
    id:'yeongju', name:'영주댐', river:'내성천',
    full:181.6, minL:155, maxL:170,
    lat:36.8667, lng:128.5167,
    supply_city:'영주·예천',
    watershed:{ area_km2:842, cities:['영주','예천'], supply:['영주','예천'] },
    grid:{ nx:89, ny:115, city:'영주' },
  },
  '3203640': {
    id:'boryeong', name:'보령댐', river:'웅천천',
    full:116.9, minL:57, maxL:90,
    lat:36.3333, lng:126.7000,
    supply_city:'보령·서천·홍성',
    watershed:{ area_km2:163, cities:['청양','홍성'], supply:['보령','서천','홍성'] },
    grid:{ nx:55, ny:103, city:'보령' },
  },
  '2001685': {
    id:'andong', name:'안동댐', river:'낙동강',
    full:1248, minL:130, maxL:160,
    lat:36.5833, lng:128.8167,
    supply_city:'안동·구미·대구',
    watershed:{ area_km2:1584, cities:['안동','예천'], supply:['안동','구미','대구'] },
    grid:{ nx:91, ny:107, city:'안동' },
  },
  '2002677': {
    id:'imha', name:'임하댐', river:'반변천',
    full:595, minL:141, maxL:163,
    lat:36.6000, lng:129.0167,
    supply_city:'안동·영덕·포항',
    watershed:{ area_km2:1361, cities:['청송','영양'], supply:['안동','영덕','포항'] },
    grid:{ nx:95, ny:107, city:'청송' },
  },
  '1012670': {
    id:'seomjin', name:'섬진강댐', river:'섬진강',
    full:466, minL:173, maxL:196,
    lat:35.5667, lng:127.2333,
    supply_city:'전남 동부',
    watershed:{ area_km2:763, cities:['임실','남원'], supply:['전남 동부'] },
    grid:{ nx:76, ny:80, city:'구례' },
  },
  '4007660': {
    id:'juam', name:'주암댐', river:'보성강',
    full:457, minL:140, maxL:170,
    lat:35.0000, lng:127.2167,
    supply_city:'광주·순천·여수',
    watershed:{ area_km2:1019, cities:['순천','보성'], supply:['광주','순천','여수'] },
    grid:{ nx:74, ny:77, city:'순천' },
  },
  '2021620': {
    id:'miryang', name:'밀양댐', river:'밀양강',
    full:73.6, minL:130, maxL:172,
    lat:35.5333, lng:128.7500,
    supply_city:'밀양·양산',
    watershed:{ area_km2:104, cities:['밀양'], supply:['밀양','양산'] },
    grid:{ nx:90, ny:81, city:'밀양' },
  },
  '5002620': {
    id:'buan', name:'부안댐', river:'백천',
    full:50.0, minL:78, maxL:101,
    lat:35.7833, lng:126.7333,
    supply_city:'부안·군산',
    watershed:{ area_km2:104, cities:['부안'], supply:['부안','군산'] },
    grid:{ nx:57, ny:93, city:'부안' },
  },
  '5101631': {
    id:'janghung', name:'장흥댐', river:'탐진강',
    full:43.7, minL:65, maxL:126,
    lat:34.7167, lng:126.9167,
    supply_city:'장흥·강진',
    watershed:{ area_km2:502, cities:['장흥','강진'], supply:['장흥','강진'] },
    grid:{ nx:72, ny:71, city:'장흥' },
  },
  '1009652': {
    id:'hwacheon', name:'화천댐', river:'북한강',
    full:1018, minL:172, maxL:181,
    lat:38.1000, lng:127.7000,
    supply_city:'춘천·화천',
    watershed:{ area_km2:3901, cities:['화천','양구'], supply:['춘천','화천'] },
    grid:{ nx:71, ny:136, city:'화천' },
  },
};

// obscd로 빠르게 찾기 위한 역색인
const ID_TO_OBSCD = {};
Object.entries(DAM_OBS).forEach(([obscd, info]) => { ID_TO_OBSCD[info.id] = obscd; });


// ─────────────────────────────────────────────
// 유틸: 수위 → 저수율/저수량 추정
// (실제 H-V 곡선 없을 때 선형 근사)
// ─────────────────────────────────────────────
function levelToRate(level, minL, maxL) {
  if (level <= minL) return 0;
  if (level >= maxL) return 100;
  return Math.round(((level - minL) / (maxL - minL)) * 1000) / 10;
}

function rateToVolume(rate, full) {
  return Math.round(rate / 100 * full * 10) / 10;
}

function alertFromRate(rate) {
  if (rate >= 85) return { level:'danger',  color:'#FF4444', message:'⚠️ 홍수 경보', code:3 };
  if (rate >= 70) return { level:'warning', color:'#FF8C00', message:'🔶 주의',       code:2 };
  if (rate <= 20) return { level:'drought', color:'#CC7700', message:'🏜️ 가뭄 경보', code:2 };
  if (rate <= 35) return { level:'low',     color:'#FFD700', message:'💧 저수 주의',  code:1 };
  return              { level:'normal',  color:'#00CC66', message:'✅ 정상',       code:0 };
}

// ─────────────────────────────────────────────
// HRFCO 원시 데이터 조회
// ─────────────────────────────────────────────
async function fetchHRFCO() {
  const url = `https://api.hrfco.go.kr/${HRFCO_KEY}/waterlevel/list/1H.json`;
  const r = await axios.get(url, { timeout:12000 });
  return r.data?.content || [];
}

// ─────────────────────────────────────────────
// HRFCO 원시 → 프론트엔드 표준 댐 객체 변환
// ─────────────────────────────────────────────
function rawToDam(obscd, info, found) {
  const level       = parseFloat(found?.wl ?? ((info.minL + info.maxL) / 2));
  const storage_rate = levelToRate(level, info.minL, info.maxL);
  const volume      = rateToVolume(storage_rate, info.full);
  // 유입/방류: HRFCO 수위 API에는 없음 — 변화량으로 추정 (향후 개선)
  const inflow  = Math.round(Math.random() * 50 + 50);   // TODO: 유량 API 별도 연동
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


// ─────────────────────────────────────────────
// 날씨: 기상청 단기예보 (KMA_KEY 있을 때만)
// ─────────────────────────────────────────────
const weatherCache = {};
const CACHE_TTL_MS = 60 * 60 * 1000; // 1시간

async function fetchWeather(nx, ny) {
  const key = `${nx}_${ny}`;
  const now = Date.now();
  if (weatherCache[key] && now - weatherCache[key].at < CACHE_TTL_MS) {
    return weatherCache[key].data;
  }
  if (!KMA_KEY) return null;

  // 기상청 기준 시각 계산 (0200,0500,0800,1100,1400,1700,2000,2300)
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
      timeout: 10000,
    });
    const items = r.data?.response?.body?.items?.item || [];

    // 날짜별 집계
    const byDate = {};
    items.forEach(item => {
      const date = item.fcstDate;
      if (!byDate[date]) byDate[date] = [];
      byDate[date].push(item);
    });

    const days = Object.entries(byDate).slice(0,3).map(([date, its]) => {
      const pops  = its.filter(i=>i.category==='POP').map(i=>Number(i.fcstValue));
      const pcps  = its.filter(i=>i.category==='PCP').map(i=>{
        const v = i.fcstValue; return (v==='강수없음'||v==='0') ? 0 : parseFloat(v)||0;
      });
      const skies = its.filter(i=>i.category==='SKY').map(i=>i.fcstValue);
      const ptys  = its.filter(i=>i.category==='PTY').map(i=>i.fcstValue);

      const rain  = pcps.reduce((a,b)=>a+b, 0);
      const pop   = pops.length ? Math.max(...pops) : 0;
      const sky   = skies.length ? skies[Math.floor(skies.length/2)] : '1';
      const pty   = ptys.find(p=>p!=='0') ?? '0';
      const level = rain>80?'heavy' : rain>30?'moderate' : rain>5?'light' : 'none';
      const icon  = pty==='3'?'🌨️' : pty!=='0'?(rain>30?'🌧️':'🌦️') : sky==='4'?'☁️' : sky==='3'?'⛅':'☀️';

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
    console.warn('[날씨 API 오류]', e.message);
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
        icon:    ['☀️','⛅','🌧️'][i], is_rain: i>0,
      };
    }),
    total_rain_3day_mm: 80,
    is_mock: true,
  };
}


// ══════════════════════════════════════════════
// 엔드포인트
// ══════════════════════════════════════════════

// ── 1. /api/all  (프론트 대시보드 메인) ──────
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
      source:         'HRFCO 한강홍수통제소',
      is_mock:        dams.every(d=>d.is_mock),
    });
  } catch(e) {
    console.error('[/api/all 오류]', e.message);
    res.status(502).json({ error: e.message });
  }
});


// ── 2. /api/dam/:id  (댐 상세 모달) ──────────
app.get('/api/dam/:id', async (req, res) => {
  const { id } = req.params;
  const obscd = ID_TO_OBSCD[id];
  const info  = obscd ? DAM_OBS[obscd] : null;
  if (!info) return res.status(404).json({ error: '댐 없음: ' + id });

  try {
    const raw   = await fetchHRFCO();
    const found = raw.find(d => d.wlobscd === obscd);
    const dam   = rawToDam(obscd, info, found);

    // 48시간 추세 (모의)
    const history = Array.from({length:48}, (_,i) => ({
      time:    String(202604010000 + i * 100).padStart(12,'0'),
      level:   +(dam.level + (Math.random()-0.5)*0.4).toFixed(2),
      inflow:  +(dam.inflow  + (Math.random()-0.5)*30).toFixed(1),
      outflow: +(dam.outflow + (Math.random()-0.5)*20).toFixed(1),
    }));

    // H-V 곡선 (스플라인 근사)
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

    // 직관적 비교
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
    console.error('[/api/dam 오류]', e.message);
    res.status(502).json({ error: e.message });
  }
});


// ── 3. /api/weather/:id  (기상·예비방류 탭) ──
app.get('/api/weather/:id', async (req, res) => {
  const { id } = req.params;
  const obscd  = ID_TO_OBSCD[id];
  const info   = obscd ? DAM_OBS[obscd] : null;
  if (!info) return res.status(404).json({ error: '댐 없음' });

  const ws = info.watershed || { area_km2:2000, cities:['인근 시군'], supply:['해당 지역'] };

  // 기상청 예보 시도
  let forecast = null;
  if (info.grid && KMA_KEY) {
    forecast = await fetchWeather(info.grid.nx, info.grid.ny);
  }
  if (!forecast) forecast = mockWeather();

  // 유역면적 기반 예상 유입량 계산
  forecast.forecast_days.forEach(day => {
    day.estimated_inflow_m3s = +(day.rain_mm * ws.area_km2 * 1000 * 0.7 / 86400).toFixed(1);
  });

  res.json({ dam_id:id, watershed:ws, ...forecast });
});


// ── 4. /api/dams/current  (기존 엔드포인트 유지) ──
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


// ── 5. /api/dams/trend?id=soyang  (7일 추세) ──
app.get('/api/dams/trend', async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error:'id 필요 (예: ?id=soyang)' });

  const obscd = ID_TO_OBSCD[id];
  const info  = obscd ? DAM_OBS[obscd] : null;
  if (!info) return res.status(404).json({ error:'댐 없음' });

  const now = new Date();
  const sdt = new Date(now-7*86400000).toISOString().slice(0,10).replace(/-/g,'')+`0000`;
  const edt = now.toISOString().slice(0,10).replace(/-/g,'')+`2300`;

  try {
    const url = `https://api.hrfco.go.kr/${HRFCO_KEY}/waterlevel/list/1H/${obscd}/${sdt}/${edt}.json`;
    const r   = await axios.get(url, { timeout:15000 });
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


// ── 6. /api/health ────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status:   'ok',
    version:  'v14',
    time:     new Date().toISOString(),
    damCount: Object.keys(DAM_OBS).length,
    weather:  KMA_KEY ? 'KMA 연동' : '모의 데이터 (KMA_KEY 미설정)',
    ports:    PORT,
  });
});


// ── 서버 시작 ─────────────────────────────────
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════╗
  ║   댐워치 백엔드  v14                        ║
  ║   http://localhost:${PORT}                   ║
  ╠══════════════════════════════════════════════╣
  ║  GET  /api/all                 대시보드 전체 ║
  ║  GET  /api/dam/:id             댐 상세       ║
  ║  GET  /api/weather/:id         기상·예비방류 ║
  ║  GET  /api/dams/current        기존 호환     ║
  ║  GET  /api/dams/trend?id=xxx   7일 추세      ║
  ║  GET  /api/health              상태 확인     ║
  ╠══════════════════════════════════════════════╣
  ║  HRFCO:  ${HRFCO_KEY.slice(0,8)}...           ║
  ║  날씨:   ${KMA_KEY ? 'KMA API 연동 ✅' : '⚠️ KMA_KEY 미설정 (모의)  '}   ║
  ╚══════════════════════════════════════════════╝
  `);
});
