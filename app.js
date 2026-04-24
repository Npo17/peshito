(function () {
  "use strict";

  const HOOK =
    "Si mi mamá fuese una pesha y mi papá fuese un pesho...";
  const TITLE = "un lindo peeeeshito";

  const nebulaCanvas = document.getElementById("nebula");
  const particleCanvas = document.getElementById("particles");
  const confettiCanvas = document.getElementById("confetti");
  const hookTyped = document.getElementById("hookTyped");
  const hookCursor = document.getElementById("hookCursor");
  const cta = document.getElementById("cta");
  const intro = document.getElementById("intro");
  const reveal = document.getElementById("reveal");
  const revealTitle = document.getElementById("revealTitle");

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---------- Audio: suspenso al entrar, festejo al botón ---------- */
  let audioCtxSingleton = null;
  let suspenseStarted = false;
  let suspenseFallbackHandler = null;
  /** Gain de salida del suspenso; se atenúa de golpe al festejo para no solaparse */
  let suspenseOutGain = null;

  function getAudioContext() {
    if (audioCtxSingleton) return audioCtxSingleton;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtxSingleton = new AC();
    return audioCtxSingleton;
  }

  async function resumeAudioContext() {
    const ctx = getAudioContext();
    if (!ctx) return false;
    if (ctx.state === "suspended") await ctx.resume();
    return ctx.state === "running";
  }

  function isRevealButtonTarget(el) {
    return Boolean(
      el && (el === cta || el.closest?.("#cta") === cta)
    );
  }

  function detachSuspenseFallback() {
    if (suspenseFallbackHandler) {
      document.removeEventListener(
        "pointerdown",
        suspenseFallbackHandler,
        true
      );
      suspenseFallbackHandler = null;
    }
  }

  function playSuspense() {
    if (prefersReducedMotion || suspenseStarted) return;
    suspenseStarted = true;
    const ctx = getAudioContext();
    if (!ctx) {
      suspenseStarted = false;
      return;
    }
    detachSuspenseFallback();

    const now = ctx.currentTime;
    const master = ctx.createGain();
    suspenseOutGain = master;
    window.setTimeout(() => {
      if (suspenseOutGain === master) suspenseOutGain = null;
    }, 16000);

    master.gain.setValueAtTime(0.001, now);
    master.gain.exponentialRampToValueAtTime(0.22, now + 2.8);
    master.gain.linearRampToValueAtTime(0.18, now + 9);
    master.gain.exponentialRampToValueAtTime(0.001, now + 15.5);
    master.connect(ctx.destination);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(90, now);
    filter.frequency.exponentialRampToValueAtTime(520, now + 9);
    filter.Q.setValueAtTime(0.6, now);
    filter.connect(master);

    const osc1 = ctx.createOscillator();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(52, now);
    osc1.frequency.exponentialRampToValueAtTime(78, now + 12);
    const g1 = ctx.createGain();
    g1.gain.setValueAtTime(0.9, now);
    osc1.connect(g1).connect(filter);

    const osc2 = ctx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(55.3, now);
    osc2.frequency.exponentialRampToValueAtTime(80, now + 12);
    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(0.85, now);
    osc2.connect(g2).connect(filter);

    const osc3 = ctx.createOscillator();
    osc3.type = "triangle";
    osc3.frequency.setValueAtTime(78, now);
    osc3.frequency.exponentialRampToValueAtTime(104, now + 11);
    const g3 = ctx.createGain();
    g3.gain.setValueAtTime(0.001, now);
    g3.gain.exponentialRampToValueAtTime(0.14, now + 3.5);
    g3.gain.linearRampToValueAtTime(0.09, now + 11);
    osc3.connect(g3).connect(filter);

    const dur = 15.5;
    osc1.start(now);
    osc2.start(now);
    osc3.start(now);
    osc1.stop(now + dur);
    osc2.stop(now + dur);
    osc3.stop(now + dur);
  }

  function duckSuspenseForCelebration() {
    const g = suspenseOutGain;
    if (!g) return;
    const ctx = g.context;
    const t = ctx.currentTime;
    try {
      g.gain.cancelScheduledValues(t);
    } catch (e) {
      /* ignore */
    }
    const cur = Math.min(Math.max(g.gain.value, 0.0001), 0.35);
    g.gain.setValueAtTime(cur, t);
    g.gain.linearRampToValueAtTime(0.0001, t + 0.07);
  }

  function playCelebration() {
    if (prefersReducedMotion) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    duckSuspenseForCelebration();

    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.connect(ctx.destination);

    const holdUntil = now + 1.32;
    master.gain.setValueAtTime(0.22, now);
    master.gain.setValueAtTime(0.22, holdUntil);
    master.gain.linearRampToValueAtTime(0, holdUntil + 0.28);

    window.setTimeout(() => {
      try {
        master.disconnect();
      } catch (e) {
        /* ignore */
      }
    }, 1800);

    const notes = [
      { f: 523.25, t: 0 },
      { f: 659.25, t: 0.08 },
      { f: 783.99, t: 0.16 },
      { f: 1046.5, t: 0.24 },
      { f: 1318.51, t: 0.36 },
      { f: 1567.98, t: 0.48 },
    ];

    notes.forEach(({ f, t }) => {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.setValueAtTime(f, now + t);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.001, now + t);
      g.gain.exponentialRampToValueAtTime(0.18, now + t + 0.02);
      g.gain.linearRampToValueAtTime(0, now + t + 0.32);
      o.connect(g).connect(master);
      o.start(now + t);
      o.stop(now + t + 0.34);
    });

    const chordT = now + 0.52;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.setValueAtTime(f, chordT + i * 0.015);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, chordT);
      g.gain.linearRampToValueAtTime(0.1, chordT + 0.04);
      g.gain.linearRampToValueAtTime(0, chordT + 0.72);
      o.connect(g).connect(master);
      o.start(chordT);
      o.stop(chordT + 0.74);
    });

    const noise = ctx.createBufferSource();
    const noiseBuf = ctx.createBuffer(
      1,
      Math.ceil(ctx.sampleRate * 0.06),
      ctx.sampleRate
    );
    const ch = noiseBuf.getChannelData(0);
    for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
    noise.buffer = noiseBuf;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.setValueAtTime(2200, now);
    bp.Q.setValueAtTime(0.35, now);
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0, now + 0.48);
    ng.gain.linearRampToValueAtTime(0.045, now + 0.5);
    ng.gain.linearRampToValueAtTime(0, now + 0.58);
    noise.connect(bp).connect(ng).connect(master);
    noise.start(now + 0.48);
    noise.stop(now + 0.59);
  }

  async function tryStartSuspense() {
    if (prefersReducedMotion || suspenseStarted) return;
    const ok = await resumeAudioContext();
    if (ok) playSuspense();
  }

  function attachSuspenseFallback() {
    if (prefersReducedMotion) return;
    suspenseFallbackHandler = (ev) => {
      if (isRevealButtonTarget(ev.target)) return;
      void tryStartSuspense();
    };
    document.addEventListener("pointerdown", suspenseFallbackHandler, true);
  }

  /* ---------- Nebula background ---------- */
  function initNebula() {
    const ctx = nebulaCanvas.getContext("2d");
    let w = 0;
    let h = 0;
    let t = 0;

    function resize() {
      w = nebulaCanvas.width = window.innerWidth * devicePixelRatio;
      h = nebulaCanvas.height = window.innerHeight * devicePixelRatio;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    }

    function draw() {
      const cw = window.innerWidth;
      const ch = window.innerHeight;
      ctx.fillStyle = "#030510";
      ctx.fillRect(0, 0, cw, ch);

      const g1 = ctx.createRadialGradient(
        cw * 0.2,
        ch * 0.25,
        0,
        cw * 0.35,
        ch * 0.4,
        Math.max(cw, ch) * 0.55
      );
      g1.addColorStop(0, "rgba(0, 245, 255, 0.22)");
      g1.addColorStop(1, "rgba(3, 5, 16, 0)");
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, cw, ch);

      const g2 = ctx.createRadialGradient(
        cw * 0.85,
        ch * 0.15 + Math.sin(t * 0.0004) * 40,
        0,
        cw * 0.7,
        ch * 0.35,
        Math.max(cw, ch) * 0.5
      );
      g2.addColorStop(0, "rgba(255, 45, 166, 0.18)");
      g2.addColorStop(1, "rgba(3, 5, 16, 0)");
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, cw, ch);

      const g3 = ctx.createRadialGradient(
        cw * 0.5 + Math.cos(t * 0.00035) * 80,
        ch * 0.85,
        0,
        cw * 0.5,
        ch * 0.75,
        Math.max(cw, ch) * 0.45
      );
      g3.addColorStop(0, "rgba(179, 102, 255, 0.14)");
      g3.addColorStop(1, "rgba(3, 5, 16, 0)");
      ctx.fillStyle = g3;
      ctx.fillRect(0, 0, cw, ch);

      t += prefersReducedMotion ? 0 : 16;
    }

    function loop() {
      draw();
      requestAnimationFrame(loop);
    }

    window.addEventListener("resize", resize);
    resize();
    loop();
  }

  /* ---------- Floating particles + lines ---------- */
  function initParticles() {
    const ctx = particleCanvas.getContext("2d");
    const nodes = [];
    const NODE_COUNT = prefersReducedMotion ? 28 : 52;
    let w = 0;
    let h = 0;

    function resize() {
      w = particleCanvas.width = window.innerWidth * devicePixelRatio;
      h = particleCanvas.height = window.innerHeight * devicePixelRatio;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    }

    function spawn() {
      nodes.length = 0;
      const cw = window.innerWidth;
      const ch = window.innerHeight;
      for (let i = 0; i < NODE_COUNT; i++) {
        nodes.push({
          x: Math.random() * cw,
          y: Math.random() * ch,
          vx: (Math.random() - 0.5) * (prefersReducedMotion ? 0.08 : 0.35),
          vy: (Math.random() - 0.5) * (prefersReducedMotion ? 0.08 : 0.35),
          r: Math.random() * 1.8 + 0.4,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    function step() {
      const cw = window.innerWidth;
      const ch = window.innerHeight;
      ctx.clearRect(0, 0, cw, ch);

      const linkDist = prefersReducedMotion ? 100 : 130;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        a.x += a.vx;
        a.y += a.vy;
        if (a.x < 0 || a.x > cw) a.vx *= -1;
        if (a.y < 0 || a.y > ch) a.vy *= -1;
        a.phase += 0.02;

        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < linkDist) {
            const alpha = (1 - d / linkDist) * 0.35;
            ctx.strokeStyle = `rgba(0, 245, 255, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }

        const pulse = 0.5 + Math.sin(a.phase) * 0.5;
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r * (0.85 + pulse * 0.25), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 45, 166, ${0.25 + pulse * 0.35})`;
        ctx.fill();
      }

      requestAnimationFrame(step);
    }

    window.addEventListener("resize", () => {
      resize();
      spawn();
    });
    resize();
    spawn();
    step();
  }

  /* ---------- Confetti burst ---------- */
  function burstConfetti() {
    const ctx = confettiCanvas.getContext("2d");
    const dpr = devicePixelRatio || 1;
    let w = 0;
    let h = 0;
    const pieces = [];
    const colors = ["#00f5ff", "#ff2da6", "#b366ff", "#ffffff", "#7afcff"];

    function resizeOnce() {
      w = confettiCanvas.width = window.innerWidth * dpr;
      h = confettiCanvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resizeOnce();
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight * 0.42;
    const count = prefersReducedMotion ? 40 : 110;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 4 + Math.random() * 10;
      pieces.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed * (0.4 + Math.random()),
        vy: Math.sin(angle) * speed * (0.4 + Math.random()) - 3,
        g: 0.12 + Math.random() * 0.12,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.35,
        w: 4 + Math.random() * 6,
        h: 6 + Math.random() * 8,
        color: colors[(Math.random() * colors.length) | 0],
        life: 1,
      });
    }

    let start = performance.now();
    const duration = prefersReducedMotion ? 900 : 2400;

    function frame(now) {
      const cw = window.innerWidth;
      const ch = window.innerHeight;
      ctx.clearRect(0, 0, cw, ch);
      const elapsed = now - start;

      for (const p of pieces) {
        p.vy += p.g;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.life = Math.max(0, 1 - elapsed / duration);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = p.life * 0.9;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }

      if (elapsed < duration) {
        requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, cw, ch);
      }
    }

    requestAnimationFrame(frame);
  }

  /* ---------- Typewriter hook ---------- */
  function typeHook(done) {
    if (prefersReducedMotion) {
      hookTyped.textContent = HOOK;
      hookCursor.classList.add("is-off");
      done();
      return;
    }

    let i = 0;
    const base = prefersReducedMotion ? 0 : 28;

    function tick() {
      if (i <= HOOK.length) {
        hookTyped.textContent = HOOK.slice(0, i);
        i++;
        const ch = HOOK[i - 1];
        const delay =
          ch === " " ? base * 0.35 : ch === "." ? base * 2.2 : base;
        setTimeout(tick, delay);
      } else {
        hookCursor.classList.add("is-off");
        done();
      }
    }

    tick();
  }

  function buildTitleSpans() {
    revealTitle.textContent = "";
    [...TITLE].forEach((ch, idx) => {
      const span = document.createElement("span");
      span.className = "char";
      span.textContent = ch === " " ? "\u00a0" : ch;
      span.style.animationDelay = `${idx * 0.045}s`;
      revealTitle.appendChild(span);
    });
  }

  async function onReveal() {
    if (cta.disabled) return;
    cta.disabled = true;
    await resumeAudioContext();
    playCelebration();
    burstConfetti();

    intro.classList.add("is-hidden");
    reveal.hidden = false;
    buildTitleSpans();

    requestAnimationFrame(() => {
      reveal.classList.add("is-visible");
    });
  }

  initNebula();
  initParticles();
  attachSuspenseFallback();
  setTimeout(() => void tryStartSuspense(), 450);

  typeHook(() => {
    cta.disabled = false;
  });

  cta.addEventListener("click", onReveal);
})();
