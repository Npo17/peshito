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

  function onReveal() {
    if (cta.disabled) return;
    cta.disabled = true;
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
  typeHook(() => {
    cta.disabled = false;
  });

  cta.addEventListener("click", onReveal);
})();
