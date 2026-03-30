require('dotenv').config();
const express = require('express');
const axios   = require('axios');
const cors    = require('cors');

const app  = express();
const PORT = process.env.PORT || 3001;
app.use(cors({ origin: '*' }));
app.use(express.json());

const HRFCO_KEY = process.env.HRFCO_KEY || 'FD7E358E-2151-4EAA-A61A-8918D2795907';

const DAM_OBS = {
  '1003655': { id:'chungju',   name:'충주댐',   river:'남한강', full:2750, minL:115, maxL:145 },
  '1010660': { id:'soyang',    name:'소양강댐', river:'소양강', full:2900, minL:150, maxL:198 },
  '3008690': { id:'daecheong', name:'대청댐',   river:'금강',   full:1490, minL:60,  maxL:80  },
  '3001690': { id:'yongdam',   name:'용담댐',   river:'금강',   full:815,  minL:220, maxL:265 },
  '2015680': { id:'hapcheon',  name:'합천댐',   river:'황강',   full:790,  minL:155, maxL:179 },
  '2004610': { id:'yeongju',   name:'영주댐',   river:'내성천', full:181.6,minL:155, maxL:170 },
  '3203640': { id:'boryeong',  name:'보령댐',   river:'웅천천', full:116.9,minL:57,  maxL:90  },
  '2001685': { id:'andong',    name:'안동댐',   river:'낙동강', full:1248, minL:130, maxL:160 },
  '2002677': { id:'imha',      name:'임하댐',   river:'반변천', full:595,  minL:141, maxL:163 },
  '1012670': { id:'seomjin',   name:'섬진강댐', river:'섬진강', full:466,  minL:173, maxL:196 },
  '4007660': { id:'juam',      name:'주암댐',   river:'보성강', full:457,  minL:140, maxL:170 },
  '2021620': { id:'miryang',   name:'밀양댐',   river:'밀양강', full:73.6, minL:130, maxL:172 },
  '5002620': { id:'buan',      name:'부안댐',   river:'백천',   full:50.0, minL:78,  maxL:101 },
  '5101631': { id:'janghung',  name:'장흥댐',   river:'탐진강', full:43.7, minL:65,  maxL:126 },
  '1009652': { id:'pyeonghwa', name:'평화의댐', river:'북한강', full:2630, minL:155, maxL:230 },
};

function dateStr(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const ymd = d.toISOString().slice(0,10).replace(/-/g,'');
  return ymd + '0000';
}

async function getAllData() {
  const r = await axios.get(`https://api.hrfco.go.kr/${HRFCO_KEY}/waterlevel/list/1H.json`, { timeout:30000 });
  return r.data?.content || [];
}

// 1. 실시간 전체 댐 현황
app.get('/api/dams/current', async (req, res) => {
  try {
    const all = await getAllData();
    const result = [];
    for (const [obscd, info] of Object.entries(DAM_OBS)) {
      const found = all.find(d => d.wlobscd === obscd);
      if (found) {
        const level = parseFloat(found.wl);
        result.push({
          id: info.id, obscd, name: info.name, river: info.river,
          level, full: info.full, minL: info.minL, maxL: info.maxL,
          inRange: level >= info.minL && level <= info.maxL,
          time: found.ymdhm,
        });
      }
    }
    res.json({ success:true, source:'환경부 한강홍수통제소', time:new Date().toISOString(), count:result.length, data:result });
  } catch(e) {
    res.status(502).json({ success:false, error:e.message });
  }
});

// 2. 지난 7일 시계열 (추세 그래프용)
app.get('/api/dams/trend', async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error:'id 필요 (예: soyang)' });

  // id로 obscd 찾기
  const entry = Object.entries(DAM_OBS).find(([,info]) => info.id === id);
  if (!entry) return res.status(404).json({ error:'댐 없음' });

  const [obscd, info] = entry;
  const sdt = dateStr(7);
  const edt = dateStr(0);

  try {
    const url = `https://api.hrfco.go.kr/${HRFCO_KEY}/waterlevel/list/1H/${obscd}/${sdt}/${edt}.json`;
    const r = await axios.get(url, { timeout:15000 });
    const raw = r.data?.content || [];

    // 6시간 간격으로 샘플링 (너무 많으면 느려서)
    const sampled = raw.filter((_,i) => i % 6 === 0).map(d => ({
      time: d.ymdhm,
      level: parseFloat(d.wl),
    }));

    res.json({
      success: true,
      id, obscd, name: info.name,
      minL: info.minL, maxL: info.maxL, full: info.full,
      data: sampled,
    });
  } catch(e) {
    res.status(502).json({ success:false, error:e.message });
  }
});

// 3. 상태 확인
app.get('/api/health', (req, res) => {
  res.json({ status:'ok', version:'v13', time:new Date().toISOString(), damCount: Object.keys(DAM_OBS).length });
});

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║   DAM VOLUME MASTER — Backend v13       ║
  ║   http://localhost:${PORT}               ║
  ╠══════════════════════════════════════════╣
  ║  GET /api/dams/current       (실시간)   ║
  ║  GET /api/dams/trend?id=soyang (7일)   ║
  ║  GET /api/health                        ║
  ╚══════════════════════════════════════════╝
  `);
});
