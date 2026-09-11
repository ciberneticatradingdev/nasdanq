(() => {
  const CA = '9WRSxYeMzHBguGYG57KPzARcWepM7TeQCPLfVLxgSTNK';
  const QQQX = 'Xs8S1uUs1zvS2p7iwtsG3b6fkhpvmwz4GYU3gWAmWHZ';

  /* ---------- ticker tape ---------- */
  const tickers = [
    ['NASDANQ', 0.0001, 420.69, true],
    ['DOGE', 0.42, 12.4], ['PEPE', 0.000021, 8.8], ['CAT', 0.019, 31.2], ['BULL', 69.42, 4.2],
    ['GNOME', 1.11, 111.1], ['QQQx', 715.74, 1.3], ['WOW', 0.7, 7.7], ['FEELS', 0.5, -2.1],
    ['SCREAM', 3.33, 33.3], ['HAT', 9.99, 9.9], ['BELL', 9.30, 0.9], ['GREEN', 1.00, 100.0],
    ['CANDLE', 4.20, 42.0], ['PODIUM', 2.50, -0.4], ['USA', 17.76, 17.8], ['TIMES SQ', 8.40, 3.1],
  ];
  const fmt = (n) => n < 0.01 ? n.toFixed(6) : n < 1 ? n.toFixed(4) : n.toFixed(2);
  const track = document.getElementById('tapeTrack');
  const html = tickers.map(([s, p, c, hot]) =>
    `<span class="tk${hot ? ' hot' : ''}"><span class="tk-s">${s}</span><span class="tk-p">${fmt(p)}</span><span class="tk-c${c < 0 ? ' dn' : ''}">${Math.abs(c).toFixed(2)}%</span></span>`
  ).join('');
  track.innerHTML = html + html; // duplicate for seamless loop

  /* ---------- copy CA ---------- */
  const caBtn = document.getElementById('caBtn');
  const toast = document.getElementById('toast');
  let toastT;
  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add('on');
    clearTimeout(toastT);
    toastT = setTimeout(() => toast.classList.remove('on'), 1800);
  };
  const copyCA = async () => {
    try {
      await navigator.clipboard.writeText(CA);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = CA; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); ta.remove();
    }
    caBtn.classList.add('copied');
    document.getElementById('caCopy').textContent = 'COPIED';
    showToast('CA copied to clipboard');
    setTimeout(() => { caBtn.classList.remove('copied'); document.getElementById('caCopy').textContent = 'COPY'; }, 1800);
  };
  caBtn.addEventListener('click', copyCA);
  document.getElementById('footCa').addEventListener('click', copyCA);

  /* ---------- the bell ---------- */
  const bellBtn = document.getElementById('bellBtn');
  const bellFlash = document.getElementById('bellFlash');
  const bellSection = document.getElementById('bell');
  const bellCountEl = document.getElementById('bellCount');
  let bells = 0;
  try { bells = parseInt(localStorage.getItem('nasdanq_bells') || '0', 10) || 0; } catch {}
  bellCountEl.textContent = bells.toLocaleString();

  let audio;
  const ringSound = () => {
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === 'suspended') audio.resume();
      const t = audio.currentTime;
      const master = audio.createGain();
      master.gain.setValueAtTime(0.0001, t);
      master.gain.exponentialRampToValueAtTime(0.5, t + 0.01);
      master.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);
      master.connect(audio.destination);
      // bell partials (inharmonic, like a real brass bell)
      [[1, 1], [2.01, .55], [2.95, .35], [4.2, .22], [5.4, .14], [6.8, .08]].forEach(([r, g]) => {
        const o = audio.createOscillator();
        const gn = audio.createGain();
        o.type = 'sine';
        o.frequency.value = 880 * r;
        gn.gain.setValueAtTime(g, t);
        gn.gain.exponentialRampToValueAtTime(0.0001, t + 2.2 / Math.sqrt(r));
        o.connect(gn).connect(master);
        o.start(t); o.stop(t + 2.6);
      });
      // strike click
      const n = audio.createBufferSource();
      const buf = audio.createBuffer(1, audio.sampleRate * 0.03, audio.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
      n.buffer = buf;
      const ng = audio.createGain(); ng.gain.value = 0.3;
      n.connect(ng).connect(master); n.start(t);
    } catch {}
  };

  const spawnCandles = () => {
    const rect = bellSection.getBoundingClientRect();
    const count = 26;
    for (let i = 0; i < count; i++) {
      const c = document.createElement('span');
      c.className = 'candle';
      c.style.left = Math.random() * 100 + '%';
      c.style.height = 20 + Math.random() * 70 + 'px';
      c.style.setProperty('--h', rect.height * (0.5 + Math.random() * 0.7) + 'px');
      c.style.setProperty('--d', 1.4 + Math.random() * 1.6 + 's');
      c.style.animationDelay = Math.random() * 0.4 + 's';
      c.style.opacity = '0';
      bellSection.appendChild(c);
      setTimeout(() => c.remove(), 3600);
    }
  };

  bellBtn.addEventListener('click', () => {
    ringSound();
    bellBtn.classList.remove('ringing');
    bellFlash.classList.remove('on');
    void bellBtn.offsetWidth; // restart animation
    bellBtn.classList.add('ringing');
    bellFlash.classList.add('on');
    spawnCandles();
    bells += 1;
    bellCountEl.textContent = bells.toLocaleString();
    try { localStorage.setItem('nasdanq_bells', String(bells)); } catch {}
    if (bells === 1) showToast('MARKET OPEN. The gnome nods.');
    else if (bells % 10 === 0) showToast(`${bells} bells. The bull is pleased.`);
  });

  /* ---------- live stats (best effort, silent on failure) ---------- */
  const usd = (n) => n >= 1e6 ? '$' + (n / 1e6).toFixed(2) + 'M' : n >= 1e3 ? '$' + (n / 1e3).toFixed(1) + 'K' : '$' + n.toFixed(2);
  const setStat = (id, v, up) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = v;
    if (up) el.classList.add('up');
  };
  const loadStats = async () => {
    try {
      const r = await fetch(`https://lite-api.jup.ag/tokens/v2/search?query=${CA},${QQQX}`, { cache: 'no-store' });
      const list = await r.json();
      const coin = list.find((x) => x.id === CA);
      const qqq = list.find((x) => x.id === QQQX);
      if (qqq && qqq.usdPrice) setStat('statQqq', '$' + Number(qqq.usdPrice).toLocaleString(undefined, { maximumFractionDigits: 2 }), true);
      if (coin && (coin.mcap || coin.fdv)) setStat('statMc', usd(Number(coin.mcap || coin.fdv)), true);
      else throw new Error('no mcap');
    } catch {
      try {
        const r = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${CA}`, { cache: 'no-store' });
        const j = await r.json();
        const p = (j.pairs || [])[0];
        if (p && (p.marketCap || p.fdv)) setStat('statMc', usd(Number(p.marketCap || p.fdv)), true);
      } catch {}
    }
  };
  loadStats();
  setInterval(loadStats, 60000);
})();
