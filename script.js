"use strict";
/* ============================================================
   PARA SOFÍA — script.js
   Módulos: Cursor | Partículas | Flores | Scroll | UI | Cielo
   ============================================================ */

// ============================================================
// CURSOR
// ============================================================
const CursorModule = (() => {
  const el = document.getElementById('cursor');
  let mx = 0, my = 0, cx = 0, cy = 0;
  function init() {
    if (!el) return;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
    loop();
  }
  function loop() {
    cx += (mx - cx) * .14; cy += (my - cy) * .14;
    el.style.left = cx + 'px'; el.style.top = cy + 'px';
    requestAnimationFrame(loop);
  }
  function setFlower(on) { el?.classList.toggle('big', on); }
  return { init, setFlower };
})();


// ============================================================
// PARTÍCULAS
// ============================================================
const ParticleModule = (() => {
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas?.getContext('2d');
  let pts = [], trail = [];

  function resize() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  const GOLDS = [
    'rgba(255,215,0,', 'rgba(255,200,50,', 'rgba(255,235,120,',
    'rgba(255,170,30,', 'rgba(255,245,160,'
  ];
  function rg() { return GOLDS[Math.random() * GOLDS.length | 0]; }

  class P {
    constructor(x, y, o = {}) {
      this.x = x; this.y = y;
      this.vx = (Math.random() - .5) * (o.sp || 4);
      this.vy = -(Math.random() * (o.up || 4) + 1.2);
      this.a = 1;
      this.sz = Math.random() * (o.mxs || 5) + (o.mns || 2);
      this.d = o.d || (Math.random() * .014 + .011);
      this.g = o.g || .05;
      this.sh = Math.random() * Math.PI * 2;
      this.shsp = Math.random() * .09 + .04;
      this.c = o.c || rg();
      this.star = Math.random() > .55;
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      this.vy += this.g; this.vx *= .99;
      this.a -= this.d; this.sh += this.shsp; this.sz *= .996;
    }
    draw() {
      if (this.a <= 0 || !ctx) return;
      const sa = this.a * (.7 + .3 * Math.sin(this.sh));
      ctx.save(); ctx.globalAlpha = sa;
      if (this.star) {
        ctx.save(); ctx.translate(this.x, this.y);
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const a1 = (i * 4 * Math.PI / 5) - Math.PI / 2;
          const a2 = a1 + Math.PI / 5;
          i === 0 ? ctx.moveTo(Math.cos(a1)*this.sz, Math.sin(a1)*this.sz)
                  : ctx.lineTo(Math.cos(a1)*this.sz, Math.sin(a1)*this.sz);
          ctx.lineTo(Math.cos(a2)*this.sz*.4, Math.sin(a2)*this.sz*.4);
        }
        ctx.closePath();
        ctx.fillStyle = `${this.c}${sa})`;
        ctx.fill(); ctx.restore();
      } else {
        ctx.beginPath(); ctx.arc(this.x, this.y, this.sz, 0, Math.PI*2);
        ctx.fillStyle = `${this.c}${sa})`; ctx.fill();
        ctx.beginPath(); ctx.arc(this.x, this.y, this.sz*.5, 0, Math.PI*2);
        ctx.fillStyle = `rgba(255,255,200,${sa*.9})`; ctx.fill();
      }
      ctx.restore();
    }
    alive() { return this.a > 0; }
  }

  class Trail {
    constructor(x, y) {
      this.x = x; this.y = y; this.a = .55;
      this.sz = Math.random() * 3 + 1; this.d = Math.random() * .04 + .03;
    }
    update() { this.a -= this.d; this.sz *= .95; }
    draw() {
      if (!ctx || this.a <= 0) return;
      ctx.save(); ctx.globalAlpha = this.a;
      ctx.beginPath(); ctx.arc(this.x, this.y, this.sz, 0, Math.PI*2);
      ctx.fillStyle = `rgba(255,230,80,${this.a})`; ctx.fill(); ctx.restore();
    }
    alive() { return this.a > 0; }
  }

  let trailOn = false, trailTimer, tlx = 0, tly = 0;
  function enableTrail() {
    trailOn = true; clearTimeout(trailTimer);
    trailTimer = setTimeout(() => trailOn = false, 1200);
  }
  function addTrail(x, y) {
    if (Math.hypot(x-tlx, y-tly) > 9) {
      trail.push(new Trail(x, y)); tlx=x; tly=y;
    }
  }

  let amb = 0;
  function ambient() {
    amb++;
    if (amb % 45 === 0) {
      pts.push(new P(Math.random() * canvas.width, canvas.height + 10, {
        sp:.7, up:.7, mxs:2.5, mns:.8, d:.004, g:-.018, c:'rgba(255,215,0,'
      }));
    }
  }

  function burst(x, y, n = 20) {
    for (let i = 0; i < n; i++) pts.push(new P(x, y, { sp:5.5, up:5.5, mxs:7, mns:2, d:.013, g:.055 }));
    for (let i = 0; i < 5; i++) pts.push(new P(x, y, { sp:3, up:7, mxs:11, mns:7, d:.008, g:.03, c:'rgba(255,255,180,' }));
  }

  function loop() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ambient();
    trail = trail.filter(t => { t.update(); t.draw(); return t.alive(); });
    pts   = pts.filter(p => { p.update(); p.draw(); return p.alive(); });
    requestAnimationFrame(loop);
  }

  function init() {
    resize(); window.addEventListener('resize', resize); loop();
    document.addEventListener('mousemove', e => {
      if (trailOn) addTrail(e.clientX, e.clientY);
    });
  }
  return { init, burst, enableTrail };
})();


// ============================================================
// FLORES — SVG BONITAS DIBUJADAS A MANO
// ============================================================
const FlowerModule = (() => {

  // Genera un girasol SVG detallado
  function makeSunflower(w, h, variant = 0) {
    // w = ancho total, h = alto total (incluye tallo)
    const fx = w / 2;          // centro X de la flor
    const fy = w * .52;        // centro Y de la flor
    const R  = w * .38;        // radio petalo largo
    const r  = w * .22;        // radio petalo corto
    const cr = w * .155;       // radio centro
    const stemBot = h;         // base del tallo
    const stemLen = h - w * .95;
    const stemTop = w * .78;

    // colores según variante
    const petalColors = [
      ['#FFD700','#FFC200','#FFE566','#F5A623'],
      ['#FFE033','#FFBE00','#FFF0A0','#F0A010'],
      ['#FFCC00','#FFB800','#FFE580','#E8900A'],
    ][variant % 3];

    const pc1 = petalColors[0], pc2 = petalColors[1],
          pc3 = petalColors[2], pc4 = petalColors[3];

    // inclinación aleatoria leve del tallo
    const tiltX = (Math.random() - .5) * w * .06;

    // pétalos: 16 exteriores + 8 interiores
    let petals = '';
    const NP = 16;
    for (let i = 0; i < NP; i++) {
      const ang = (360 / NP) * i;
      const rad = ang * Math.PI / 180;
      const even = i % 2 === 0;
      const len  = even ? R : R * .85;
      const wid  = even ? w * .075 : w * .065;
      const col  = even ? pc1 : pc3;
      const scol = even ? pc2 : pc4;
      petals += `
        <ellipse cx="${fx}" cy="${fy - len * .55}"
          rx="${wid}" ry="${len * .62}"
          fill="${col}" stroke="${scol}" stroke-width=".8"
          transform="rotate(${ang},${fx},${fy})"
          opacity="${even ? .92 : .82}"
        />`;
    }
    // capa interior de pétalos más cortos
    const NI = 8;
    for (let i = 0; i < NI; i++) {
      const ang = (360 / NI) * i + 22.5;
      petals += `
        <ellipse cx="${fx}" cy="${fy - R*.45}"
          rx="${w*.058}" ry="${R*.5}"
          fill="${pc4}" stroke="${pc2}" stroke-width=".5"
          transform="rotate(${ang},${fx},${fy})"
          opacity=".65"
        />`;
    }

    // hoja y variaciones
    const leafSize = w * .22;
    const leafY = stemTop + stemLen * .35;
    const leafSide = variant % 2 === 0 ? -1 : 1;

    return `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" overflow="visible">
  <!-- Tallo -->
  <path d="M${fx} ${stemTop} Q${fx + tiltX} ${stemTop + stemLen*.5} ${fx + tiltX*.5} ${stemBot}"
    stroke="#3A7A2A" stroke-width="${w*.045}" fill="none" stroke-linecap="round"/>
  <!-- Hoja 1 -->
  <ellipse cx="${fx + leafSide * leafSize * .8}" cy="${leafY}"
    rx="${leafSize}" ry="${leafSize * .38}"
    fill="#2D6A1E"
    transform="rotate(${leafSide * -38}, ${fx + leafSide * leafSize * .8}, ${leafY})"
    opacity=".9"/>
  <!-- Hoja 2 -->
  <ellipse cx="${fx - leafSide * leafSize * .7}" cy="${leafY + stemLen*.25}"
    rx="${leafSize * .85}" ry="${leafSize * .32}"
    fill="#3A8A28"
    transform="rotate(${leafSide * 32}, ${fx - leafSide * leafSize * .7}, ${leafY + stemLen*.25})"
    opacity=".85"/>
  <!-- Pétalos -->
  ${petals}
  <!-- Centro oscuro -->
  <circle cx="${fx}" cy="${fy}" r="${cr * 1.05}" fill="#3C2508"/>
  <!-- Patrón del centro (espiral de semillas) -->
  ${(()=>{
    let dots = '';
    // anillo exterior
    for(let i=0;i<13;i++){
      const a=i*27.7*Math.PI/180;
      const dr=cr*.72;
      dots+=`<circle cx="${fx+Math.cos(a)*dr}" cy="${fy+Math.sin(a)*dr}" r="${cr*.1}" fill="#A06820" opacity=".85"/>`;
    }
    // anillo medio
    for(let i=0;i<8;i++){
      const a=i*45*Math.PI/180+0.3;
      const dr=cr*.44;
      dots+=`<circle cx="${fx+Math.cos(a)*dr}" cy="${fy+Math.sin(a)*dr}" r="${cr*.09}" fill="#C08030" opacity=".8"/>`;
    }
    // centro
    dots+=`<circle cx="${fx}" cy="${fy}" r="${cr*.22}" fill="#D09040" opacity=".75"/>`;
    return dots;
  })()}
  <!-- Brillo centro -->
  <circle cx="${fx}" cy="${fy}" r="${cr*1.08}" fill="rgba(255,180,0,.07)"/>
</svg>`;
  }

  // Configuración del jardín: [sceneId, count, minW, maxW, minH, maxH]
  // más flores en cada escena sucesiva
  const GARDENS = [
    { id: 'scene-intro',      count: 6,  minW: 55,  maxW: 85,  minH: 130, maxH: 190 },
    { id: 'scene-start',      count: 8,  minW: 60,  maxW: 95,  minH: 140, maxH: 200 },
    { id: 'scene-change',     count: 12, minW: 60,  maxW: 100, minH: 145, maxH: 210 },
    { id: 'scene-growth',     count: 18, minW: 65,  maxW: 110, minH: 150, maxH: 220 },
    { id: 'scene-sunset',     count: 22, minW: 65,  maxW: 115, minH: 150, maxH: 230 },
    { id: 'scene-confession', count: 26, minW: 70,  maxW: 120, minH: 160, maxH: 240 },
    { id: 'scene-final',      count: 38, minW: 70,  maxW: 130, minH: 165, maxH: 260 },
    { id: 'scene-extra',      count: 20, minW: 65,  maxW: 110, minH: 150, maxH: 220 },
  ];

  function buildGardens() {
    GARDENS.forEach(({ id, count, minW, maxW, minH, maxH }, gi) => {
      const scene = document.getElementById(id);
      if (!scene) return;

      // Ground strip
      const ground = document.createElement('div');
      ground.className = 'ground-strip';
      scene.appendChild(ground);

      // Garden container
      const garden = document.createElement('div');
      garden.className = 'garden';
      scene.appendChild(garden);

      // Distribuir flores uniformemente a lo ancho
      const slots = spreadPositions(count, 2, 98);

      slots.forEach((leftPct, idx) => {
        const w  = randBetween(minW, maxW);
        const h  = randBetween(minH, maxH);
        const variant = (gi + idx) % 3;
        const lean = (Math.random() - .5) * 8; // grados de inclinación
        const swDur  = (3.5 + Math.random() * 2.5).toFixed(2);
        const swDelay = (Math.random() * -5).toFixed(2);
        const bloomDelay = idx * 80; // escalonado

        const sf = document.createElement('div');
        sf.className = 'sunflower';
        sf.style.left   = leftPct + '%';
        sf.style.width  = w + 'px';
        sf.style.transitionDelay = bloomDelay + 'ms';
        sf.style.setProperty('--lean', lean + 'deg');
        sf.style.setProperty('--sw',   swDur + 's');
        sf.style.setProperty('--sd',   swDelay + 's');
        sf.dataset.bloomDelay = bloomDelay;
        sf.innerHTML = makeSunflower(w, h, variant);

        // interacción hover
        sf.addEventListener('mouseenter', e => {
          CursorModule.setFlower(true);
          triggerInteract(sf, e.clientX, e.clientY);
          ParticleModule.enableTrail();
        });
        sf.addEventListener('mouseleave', () => CursorModule.setFlower(false));
        // touch
        sf.addEventListener('touchstart', e => {
          e.preventDefault();
          const t = e.touches[0];
          triggerInteract(sf, t.clientX, t.clientY);
        }, { passive: false });

        garden.appendChild(sf);
      });
    });
  }

  function triggerInteract(sf, x, y) {
    sf.classList.remove('interacting');
    void sf.offsetWidth;
    sf.classList.add('interacting');
    ParticleModule.burst(x, y, 18);
    sf.addEventListener('animationend', () => sf.classList.remove('interacting'), { once: true });
  }

  // Distribuir N posiciones con jitter natural (no perfectamente uniformes)
  function spreadPositions(n, minPct, maxPct) {
    const range = maxPct - minPct;
    const step  = range / n;
    const pos   = [];
    for (let i = 0; i < n; i++) {
      const base  = minPct + i * step;
      const jitter = (Math.random() - .5) * step * .6;
      pos.push(Math.max(minPct, Math.min(maxPct, base + jitter)));
    }
    // shuffle leve para que no sea tan ordenado
    for (let i = pos.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pos[i], pos[j]] = [pos[j], pos[i]];
    }
    return pos;
  }

  function randBetween(a, b) { return a + Math.random() * (b - a); }

  function bloomScene(sceneId) {
    const scene = document.getElementById(sceneId);
    if (!scene) return;
    scene.querySelectorAll('.sunflower').forEach(sf => {
      const d = parseInt(sf.dataset.bloomDelay || 0);
      setTimeout(() => sf.classList.add('bloomed'), d);
    });
  }

  function init() { buildGardens(); }
  return { init, bloomScene };
})();


// ============================================================
// CIELO — nubes, estrellas, luna
// ============================================================
const SkyModule = (() => {

  function addClouds(sceneId, n = 3) {
    const scene = document.getElementById(sceneId);
    if (!scene) return;
    for (let i = 0; i < n; i++) {
      const size = 80 + Math.random() * 120;
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', size * 2.8);
      svg.setAttribute('height', size);
      svg.setAttribute('viewBox', `0 0 ${size * 2.8} ${size}`);
      svg.classList.add('cloud-svg');
      const dur   = (22 + Math.random() * 18).toFixed(0) + 's';
      const delay = -(Math.random() * 22).toFixed(0) + 's';
      const top   = (8 + Math.random() * 25).toFixed(0) + '%';
      svg.style.setProperty('--cdur', dur);
      svg.style.setProperty('--cdelay', delay);
      svg.style.setProperty('--ctop', top);
      svg.style.top = top;
      // nube con círculos
      const cx = size * 1.4, cy = size * .65, r = size * .38;
      svg.innerHTML = `
        <ellipse cx="${cx}" cy="${cy}" rx="${r*1.8}" ry="${r*.7}" fill="white" opacity=".85"/>
        <circle  cx="${cx-.6*r}" cy="${cy-.4*r}" r="${r*.7}" fill="white" opacity=".9"/>
        <circle  cx="${cx+.5*r}" cy="${cy-.35*r}" r="${r*.55}" fill="white" opacity=".85"/>
        <circle  cx="${cx+1.1*r}" cy="${cy-.1*r}" r="${r*.45}" fill="white" opacity=".8"/>
        <circle  cx="${cx-1.2*r}" cy="${cy-.05*r}" r="${r*.38}" fill="white" opacity=".75"/>
      `;
      scene.appendChild(svg);
    }
  }

  function addStars(sceneId, n = 60) {
    const scene = document.getElementById(sceneId);
    if (!scene) return;
    for (let i = 0; i < n; i++) {
      const s = document.createElement('div');
      s.className = 'star';
      const sz = Math.random() * 2.5 + .5;
      s.style.cssText = `
        left:${Math.random()*100}%; top:${Math.random()*55}%;
        width:${sz}px; height:${sz}px;
        --tdur:${(Math.random()*3+1.5).toFixed(2)}s;
        --tdelay:${-(Math.random()*4).toFixed(2)}s;
      `;
      scene.appendChild(s);
    }
  }

  function addMoon(sceneId) {
    const scene = document.getElementById(sceneId);
    if (!scene) return;
    const moon = document.createElement('div');
    moon.className = 'moon';
    scene.appendChild(moon);
    return moon;
  }

  function init() {
    // Nubes en escenas de día
    addClouds('scene-intro', 10);
    addClouds('scene-start', 8);
    addClouds('scene-change', 6);

    // Estrellas en escenas nocturnas
    addStars('scene-confession', 50);
    addStars('scene-final', 90);
    addStars('scene-extra', 70);

    // Luna
    addMoon('scene-confession');
    addMoon('scene-final');
    addMoon('scene-extra');
  }

  function showMoon(sceneId) {
    document.querySelectorAll(`#${sceneId} .moon`).forEach(m => m.classList.add('visible'));
  }

  return { init, showMoon };
})();


// ============================================================
// SCROLL OBSERVER
// ============================================================
const ScrollModule = (() => {
  const SCENES = ['scene-intro','scene-start','scene-change','scene-growth',
                  'scene-sunset','scene-confession','scene-final','scene-extra'];
  const bloomed = new Set();

  function init() {
    // texto aparece
    const textObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting)
          e.target.querySelectorAll('p').forEach((p, i) =>
            setTimeout(() => p.classList.add('visible'), i * 280)
          );
      });
    }, { threshold: .25 });
    document.querySelectorAll('.scene-text').forEach(el => textObs.observe(el));

    // flores y efectos por escena
    const sceneObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting || bloomed.has(e.target.id)) return;
        bloomed.add(e.target.id);
        const id = e.target.id;
        FlowerModule.bloomScene(id);

        // luna en escenas nocturnas
        if (['scene-confession','scene-final','scene-extra'].includes(id))
          SkyModule.showMoon(id);

        // burst de bienvenida al jardín final
        if (id === 'scene-final') {
          setTimeout(() => {
            ParticleModule.burst(window.innerWidth*.3, window.innerHeight*.7, 25);
            ParticleModule.burst(window.innerWidth*.7, window.innerHeight*.7, 25);
          }, 600);
        }
      });
    }, { threshold: .12 });
    SCENES.forEach(id => {
      const el = document.getElementById(id);
      if (el) sceneObs.observe(el);
    });

    // progress dots
    const dotObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        const idx = SCENES.indexOf(e.target.id);
        if (e.isIntersecting && idx >= 0) {
          document.querySelectorAll('#progress-dots .dot').forEach((d, i) =>
            d.classList.toggle('active', i === idx)
          );
        }
      });
    }, { threshold: .5 });
    SCENES.forEach(id => {
      const el = document.getElementById(id);
      if (el) dotObs.observe(el);
    });
  }
  return { init };
})();


// ============================================================
// UI — botones, extras
// ============================================================
const UIModule = (() => {
  function init() {
    // Botón intro → scroll al inicio
    document.getElementById('btn-start')?.addEventListener('click', e => {
      document.getElementById('scene-start')?.scrollIntoView({ behavior: 'smooth' });
      const r = e.target.getBoundingClientRect();
      ParticleModule.burst(r.left + r.width/2, r.top + r.height/2, 22);
    });

    // Botón extra → revelar mensaje
    const btnEx = document.getElementById('btn-extra');
    const msgEx = document.getElementById('extra-message');
    btnEx?.addEventListener('click', e => {
      btnEx.style.opacity = '0'; btnEx.style.pointerEvents = 'none';
      const r = e.target.getBoundingClientRect();
      ParticleModule.burst(r.left + r.width/2, r.top + r.height/2, 30);
      setTimeout(() => {
        msgEx?.classList.add('revealed');
        // cascada de bursts
        [.2,.45,.7,.95].forEach((t, i) =>
          setTimeout(() =>
            ParticleModule.burst(
              window.innerWidth * t,
              window.innerHeight * (.4 + Math.random() * .4),
              16
            ), i * 250)
        );
      }, 350);
    });

    // Pétalos flotantes — arrancan desde scene-growth
    const growthObs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { startPetals(); growthObs.disconnect(); }
    }, { threshold: .2 });
    const g = document.getElementById('scene-growth');
    if (g) growthObs.observe(g);
  }

  let petalsStarted = false;
  function startPetals() {
    if (petalsStarted) return; petalsStarted = true;
    for (let i = 0; i < 10; i++) setTimeout(spawnPetal, i * 1000);
    setInterval(spawnPetal, 2200);
  }
  function spawnPetal() {
    const p = document.createElement('div');
    p.className = 'fp';
    p.textContent = Math.random() > .4 ? '🌻' : '✨';
    const dur = (7 + Math.random() * 6).toFixed(2);
    const dx  = ((Math.random() - .5) * 120).toFixed(0);
    p.style.cssText = `
      left:${(Math.random()*95).toFixed(1)}%;
      --fpd:${dur}s; --fpdd:0s; --fpx:${dx}px;
      --fps:${(.7 + Math.random()*.8).toFixed(2)}rem;
    `;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), (parseFloat(dur) + 1) * 1000);
  }

  return { init };
})();


// ============================================================
// PROGRESS DOTS — crear los puntos
// ============================================================
const ProgressModule = (() => {
  function init() {
    const c = document.getElementById('progress-dots');
    if (!c) return;
    const n = 8; // número de escenas
    for (let i = 0; i < n; i++) {
      const d = document.createElement('div');
      d.className = 'dot' + (i === 0 ? ' active' : '');
      c.appendChild(d);
    }
  }
  return { init };
})();


// ============================================================
// ARRANQUE
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  ProgressModule.init();
  CursorModule.init();
  FlowerCursorModule.init();
  ParticleModule.init();
  SkyModule.init();
  GodRaysModule.init();
  MistModule.init();
  FireflyModule.init();
  ShootingStarsModule.init();
  FlowerModule.init();
  HeartsModule.init();
  TypewriterModule.init();
  GlowLettersModule.init();
  DaysCounterModule.init();
  ScrollModule.init();
  ScrollSoundModule.init();
  UIModule.init();

  // Bloom automático de la primera escena
  setTimeout(() => FlowerModule.bloomScene('scene-intro'), 500);

  // Mini burst de bienvenida
  setTimeout(() => ParticleModule.burst(window.innerWidth/2, window.innerHeight*.7, 18), 900);

  // Conectar confeti y sonido romántico al botón extra
  const btnEx = document.getElementById('btn-extra');
  if (btnEx) {
    btnEx.addEventListener('click', (e) => {
      const r = e.target.getBoundingClientRect();
      const ox = r.left + r.width / 2;
      const oy = r.top + r.height / 2;
      ConfettiModule.launch(ox, oy, 90);
      SoundModule.romanticChord();
    }, { once: true });
  }

  // Campanita cuando brotan las flores de la escena final
  const finalObs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      [0,300,600,900,1200].forEach(d =>
        setTimeout(() => SoundModule.chime(523 + Math.random()*300, 0.04), d)
      );
      finalObs.disconnect();
    }
  }, { threshold: .2 });
  const sf = document.getElementById('scene-final');
  if (sf) finalObs.observe(sf);
});


// ============================================================
// FLORECITA CURSOR — sigue el mouse con suavizado
// ============================================================
const FlowerCursorModule = (() => {
  const el = document.getElementById('flower-cursor');
  let mx = 0, my = 0, cx = 0, cy = 0;
  function init() {
    if (!el || window.innerWidth <= 600) { el && (el.style.display = 'none'); return; }
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
    loop();
  }
  function loop() {
    cx += (mx - cx) * .07; cy += (my - cy) * .07;
    el.style.left = cx + 'px'; el.style.top = cy + 'px';
    requestAnimationFrame(loop);
  }
  return { init };
})();


// ============================================================
// SONIDO — Web Audio API (sin archivos externos)
// ============================================================
const SoundModule = (() => {
  let ctx = null;
  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  }

  // Campanita delicada al aparecer una flor
  function chime(freq = 880, vol = 0.06) {
    try {
      const ac = getCtx();
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain); gain.connect(ac.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ac.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ac.currentTime + .12);
      osc.frequency.exponentialRampToValueAtTime(freq * .7, ac.currentTime + .6);
      gain.gain.setValueAtTime(0, ac.currentTime);
      gain.gain.linearRampToValueAtTime(vol, ac.currentTime + .03);
      gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + .8);
      osc.start(ac.currentTime);
      osc.stop(ac.currentTime + .8);
    } catch(e) {}
  }

  // Viento suave (ruido blanco filtrado)
  function wind(vol = 0.015, dur = 2.5) {
    try {
      const ac = getCtx();
      const bufSize = ac.sampleRate * dur;
      const buf = ac.createBuffer(1, bufSize, ac.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1);
      const src = ac.createBufferSource();
      src.buffer = buf;
      const filter = ac.createBiquadFilter();
      filter.type = 'bandpass'; filter.frequency.value = 400; filter.Q.value = 0.5;
      const gain = ac.createGain();
      src.connect(filter); filter.connect(gain); gain.connect(ac.destination);
      gain.gain.setValueAtTime(0, ac.currentTime);
      gain.gain.linearRampToValueAtTime(vol, ac.currentTime + .4);
      gain.gain.linearRampToValueAtTime(0, ac.currentTime + dur);
      src.start(); src.stop(ac.currentTime + dur);
    } catch(e) {}
  }

  // Acorde romántico al revelar el mensaje extra
  function romanticChord() {
    try {
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
        setTimeout(() => chime(f, 0.05), i * 120);
      });
    } catch(e) {}
  }

  return { chime, wind, romanticChord };
})();


// ============================================================
// GOD RAYS — rayos de luz solar (escenas de día)
// ============================================================
const GodRaysModule = (() => {
  function addRays(sceneId, count = 6) {
    const scene = document.getElementById(sceneId);
    if (!scene) return;
    const container = document.createElement('div');
    container.className = 'god-rays';
    for (let i = 0; i < count; i++) {
      const ray = document.createElement('div');
      ray.className = 'god-ray';
      const leftPct = 5 + (i / count) * 90;
      const angle   = (Math.random() - .5) * 20;
      const width   = 40 + Math.random() * 80;
      const dur     = (4 + Math.random() * 4).toFixed(2);
      const delay   = -(Math.random() * 5).toFixed(2);
      ray.style.setProperty('--grl',  leftPct + '%');
      ray.style.setProperty('--gra',  angle + 'deg');
      ray.style.setProperty('--grw',  width + 'px');
      ray.style.setProperty('--grd',  dur + 's');
      ray.style.setProperty('--grdd', delay + 's');
      container.appendChild(ray);
    }
    scene.prepend(container);
  }

  function init() {
    addRays('scene-intro', 8);
    addRays('scene-start', 6);
    addRays('scene-change', 4);
  }
  return { init };
})();


// ============================================================
// NIEBLA — jardín nocturno
// ============================================================
const MistModule = (() => {
  function addMist(sceneId) {
    const scene = document.getElementById(sceneId);
    if (!scene) return;
    const m1 = document.createElement('div'); m1.className = 'mist-layer';
    const m2 = document.createElement('div'); m2.className = 'mist-layer-2';
    scene.appendChild(m1); scene.appendChild(m2);
  }
  function init() {
    addMist('scene-confession');
    addMist('scene-final');
    addMist('scene-extra');
  }
  return { init };
})();


// ============================================================
// LUCIÉRNAGAS
// ============================================================
const FireflyModule = (() => {
  function addFireflies(sceneId, count = 18) {
    const scene = document.getElementById(sceneId);
    if (!scene) return;
    for (let i = 0; i < count; i++) {
      const ff = document.createElement('div');
      ff.className = 'firefly';
      const x = 5 + Math.random() * 90;
      const y = 10 + Math.random() * 75;
      const rnd = () => ((Math.random() - .5) * 120).toFixed(0) + 'px';
      const dur  = (6 + Math.random() * 6).toFixed(2);
      const gDur = (1.5 + Math.random() * 2).toFixed(2);
      const dd   = -(Math.random() * 8).toFixed(2);
      const gdd  = -(Math.random() * 3).toFixed(2);
      ff.style.cssText = `
        left:${x}%; top:${y}%;
        --ffdur:${dur}s; --ffdd:${dd}s;
        --ffgd:${gDur}s; --ffgdd:${gdd}s;
        --ffx1:${rnd()}; --ffy1:${rnd()};
        --ffx2:${rnd()}; --ffy2:${rnd()};
        --ffx3:${rnd()}; --ffy3:${rnd()};
        --ffx4:${rnd()}; --ffy4:${rnd()};
      `;
      scene.appendChild(ff);
    }
  }
  function init() {
    addFireflies('scene-confession', 14);
    addFireflies('scene-final', 28);
    addFireflies('scene-extra', 18);
  }
  return { init };
})();


// ============================================================
// CORAZONES FLOTANTES
// ============================================================
const HeartsModule = (() => {
  const HEARTS = ['💛','💛','🌻','✨','💛','🤍'];
  let started = false;

  function spawnHeart() {
    const h = document.createElement('div');
    h.className = 'floating-heart';
    h.textContent = HEARTS[Math.random() * HEARTS.length | 0];
    const left  = (Math.random() * 90 + 5).toFixed(1);
    const dur   = (7 + Math.random() * 6).toFixed(2);
    const rot   = ((Math.random() - .5) * 30).toFixed(1);
    const dx    = ((Math.random() - .5) * 80).toFixed(0);
    const fs    = (.75 + Math.random() * .7).toFixed(2);
    h.style.cssText = `
      left:${left}%; bottom:5%;
      --hfd:${dur}s; --hfdd:0s;
      --hfr:${rot}deg; --hfx:${dx}px; --hfs:${fs}rem;
    `;
    document.body.appendChild(h);
    setTimeout(() => h.remove(), (parseFloat(dur) + 1) * 1000);
  }

  function init() {
    // empiezan en scene-confession
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !started) {
        started = true;
        for (let i = 0; i < 6; i++) setTimeout(spawnHeart, i * 800);
        setInterval(spawnHeart, 3000);
        obs.disconnect();
      }
    }, { threshold: .2 });
    const el = document.getElementById('scene-confession');
    if (el) obs.observe(el);
  }
  return { init };
})();


// ============================================================
// ESTRELLAS FUGACES
// ============================================================
const ShootingStarsModule = (() => {
  function addShootingStar(sceneId) {
    const scene = document.getElementById(sceneId);
    if (!scene) return;
    const ss = document.createElement('div');
    ss.className = 'shooting-star';
    const top   = (5 + Math.random() * 40).toFixed(1);
    const width = (80 + Math.random() * 120).toFixed(0);
    const angle = (-15 - Math.random() * 20).toFixed(1);
    const dur   = (6 + Math.random() * 8).toFixed(2);
    const delay = -(Math.random() * 10).toFixed(2);
    ss.style.setProperty('--sst',  top + '%');
    ss.style.setProperty('--ssw',  width + 'px');
    ss.style.setProperty('--ssr',  angle + 'deg');
    ss.style.setProperty('--ssd',  dur + 's');
    ss.style.setProperty('--ssdd', delay + 's');
    scene.appendChild(ss);
  }

  function init() {
    // varias por escena nocturna para que siempre haya alguna pasando
    for (let i = 0; i < 5; i++) addShootingStar('scene-confession');
    for (let i = 0; i < 8; i++) addShootingStar('scene-final');
    for (let i = 0; i < 5; i++) addShootingStar('scene-extra');
  }
  return { init };
})();


// ============================================================
// TYPEWRITER — escritura animada en textos clave
// ============================================================
const TypewriterModule = (() => {
  function wrapTypewriter(el, stepsPerChar = 1) {
    const text = el.textContent;
    el.textContent = '';
    const span = document.createElement('span');
    span.className = 'typewriter';
    span.textContent = text;
    const charCount = text.length;
    const dur = (charCount * 0.055).toFixed(2);
    span.style.setProperty('--tw-dur', dur + 's');
    span.style.setProperty('--tw-steps', charCount);
    span.style.setProperty('--tw-w', '100%');
    el.appendChild(span);
    return span;
  }

  function activateTypewriter(span) {
    if (span && !span.classList.contains('typing')) {
      span.classList.add('typing');
    }
  }

  // Aplica typewriter a los big-name y los p.emphasis en escenas de confesión y final
  function init() {
    const targets = document.querySelectorAll(
      '#scene-confession .big-name, #scene-final .big-name'
    );
    const wrapped = [];
    targets.forEach(el => {
      const span = wrapTypewriter(el);
      wrapped.push({ el, span });
    });

    // Activar al entrar en escena
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const match = wrapped.find(w => e.target.contains(w.el) || e.target === w.el);
          if (match) setTimeout(() => activateTypewriter(match.span), 400);
          // También activa otros en la misma sección
          wrapped.forEach(w => {
            if (e.target.contains(w.el)) {
              setTimeout(() => activateTypewriter(w.span), 400);
            }
          });
        }
      });
    }, { threshold: .3 });

    targets.forEach(el => {
      const section = el.closest('.scene');
      if (section) obs.observe(section);
    });
  }
  return { init };
})();


// ============================================================
// LETRAS BRILLANTES — hover letra por letra en énfasis
// ============================================================
const GlowLettersModule = (() => {
  function wrap(el) {
    const text = el.textContent;
    el.textContent = '';
    [...text].forEach(char => {
      if (char === ' ') {
        el.appendChild(document.createTextNode(' '));
      } else {
        const s = document.createElement('span');
        s.className = 'glow-letter';
        s.textContent = char;
        el.appendChild(s);
      }
    });
  }
  function init() {
    document.querySelectorAll(
      '#scene-confession .emphasis, #scene-final .emphasis, #scene-final .big-name'
    ).forEach(wrap);
  }
  return { init };
})();


// ============================================================
// CONTADOR DE DÍAS
// ============================================================
const DaysCounterModule = (() => {
  const START_DATE = new Date('2025-12-03T00:00:00');

  function getDays() {
    const now  = new Date();
    const diff = now - START_DATE;
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  }

  function animateNumber(el, target, duration = 2000) {
    const start = performance.now();
    function step(now) {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3); // ease-out-cubic
      el.textContent = Math.round(ease * target);
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }

  function init() {
    const counter = document.getElementById('days-counter');
    const numEl   = document.getElementById('days-number');
    if (!counter || !numEl) return;

    const days = getDays();

    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        counter.classList.add('visible');
        setTimeout(() => animateNumber(numEl, days, 2200), 600);
        obs.disconnect();
      }
    }, { threshold: .3 });
    obs.observe(counter);
  }
  return { init };
})();


// ============================================================
// CONFETI — explosión al presionar el botón extra
// ============================================================
const ConfettiModule = (() => {
  const COLORS = ['#FFD700','#FFC200','#FFE566','#FF9AA2','#FFB7B2','#FFDAC1','#E2F0CB','#B5EAD7','#C7CEEA'];
  const SHAPES = [
    { w:8, h:12, r:2 }, { w:10, h:5, r:50 }, { w:7, h:7, r:50 },
    { w:12, h:4, r:1  }, { w:5, h:15, r:1  },
  ];

  function launch(originX, originY, count = 80) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        const shape = SHAPES[Math.random() * SHAPES.length | 0];
        const color = COLORS[Math.random() * COLORS.length | 0];
        const dx    = ((Math.random() - .5) * window.innerWidth * .8).toFixed(0);
        const dy    = (200 + Math.random() * window.innerHeight * .7).toFixed(0);
        const rot   = (360 + Math.random() * 720).toFixed(0);
        const dur   = (2 + Math.random() * 1.5).toFixed(2);
        const delay = (Math.random() * .4).toFixed(2);
        piece.style.cssText = `
          left:${originX}px; top:${originY}px;
          --cw:${shape.w}px; --ch:${shape.h}px; --cr:${shape.r}px;
          --cc:${color};
          --cfx:${dx}px; --cfy:${dy}px; --cfr:${rot}deg;
          --cfd:${dur}s; --cfdd:${delay}s;
        `;
        document.body.appendChild(piece);
        setTimeout(() => piece.remove(), (parseFloat(dur) + parseFloat(delay) + .5) * 1000);
      }, Math.random() * 200);
    }
  }
  return { launch };
})();


// ============================================================
// SONIDO AL SCROLL — viento suave al cambiar escena
// ============================================================
const ScrollSoundModule = (() => {
  let lastScene = '';
  const FREQS = {
    'scene-intro': 880,
    'scene-start': 784,
    'scene-change': 698,
    'scene-growth': 659,
    'scene-sunset': 587,
    'scene-confession': 523,
    'scene-final': 440,
    'scene-extra': 392,
  };

  function init() {
    const SCENES = Object.keys(FREQS);
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && e.target.id !== lastScene) {
          lastScene = e.target.id;
          SoundModule.wind(0.012, 2);
          const freq = FREQS[e.target.id];
          if (freq) setTimeout(() => SoundModule.chime(freq, 0.04), 300);
        }
      });
    }, { threshold: .5 });
    SCENES.forEach(id => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
  }
  return { init };
})();