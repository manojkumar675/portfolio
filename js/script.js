/* ═══════════════════════════════════════════════════════
   MANOJ KUMAR POLA – PORTFOLIO  |  script.js
   Particle Canvas · Typing · Cursor · Scroll animations
   Count-up · Skill bars · 3D Tilt · Navigation
   ═══════════════════════════════════════════════════════ */

'use strict';

/* ── Utility ─────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ═══════════════════════════════════════════════════════
   1. PARTICLE / STARFIELD CANVAS
   ═══════════════════════════════════════════════════════ */
(function initParticles() {
  const canvas = $('#particleCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles = [], mouse = { x: W / 2, y: H / 2 };
  const COUNT = Math.min(120, Math.floor(window.innerWidth / 10));

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function randomBetween(a, b) { return a + Math.random() * (b - a); }

  function createParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: randomBetween(0.5, 2.2),
      vx: randomBetween(-0.25, 0.25),
      vy: randomBetween(-0.25, 0.25),
      alpha: randomBetween(0.3, 0.9),
      color: Math.random() > 0.5 ? '108,99,255' : '168,85,247',
    };
  }

  function initParticleArray() {
    particles = Array.from({ length: COUNT }, createParticle);
  }

  function drawLine(p1, p2, dist, maxDist) {
    const alpha = (1 - dist / maxDist) * 0.25;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.strokeStyle = `rgba(108,99,255,${alpha})`;
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

  let raf;
  function animate() {
    ctx.clearRect(0, 0, W, H);
    const maxDist = 120;

    particles.forEach((p, i) => {
      // Move
      p.x += p.vx;
      p.y += p.vy;

      // Subtle mouse attraction
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 180) {
        p.vx += (dx / dist) * 0.008;
        p.vy += (dy / dist) * 0.008;
      }

      // Clamp velocity
      p.vx = Math.max(-0.8, Math.min(0.8, p.vx));
      p.vy = Math.max(-0.8, Math.min(0.8, p.vy));

      // Wrap edges
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

      // Draw
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
      ctx.fill();

      // Connect nearby particles
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < maxDist) drawLine(p, q, d, maxDist);
      }
    });

    raf = requestAnimationFrame(animate);
  }

  window.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  window.addEventListener('resize', () => { resize(); initParticleArray(); });

  resize();
  initParticleArray();
  animate();
})();


/* ═══════════════════════════════════════════════════════
   2. CUSTOM CURSOR
   ═══════════════════════════════════════════════════════ */
(function initCursor() {
  const cursor   = $('#cursor');
  const follower = $('#cursorFollower');
  if (!cursor || !follower) return;
  if (window.innerWidth < 769) return;  // disable on mobile

  let fx = 0, fy = 0, cx = 0, cy = 0;

  document.addEventListener('mousemove', e => {
    cx = e.clientX;
    cy = e.clientY;
    cursor.style.left = cx + 'px';
    cursor.style.top  = cy + 'px';
  });

  function movFollower() {
    fx += (cx - fx) * 0.14;
    fy += (cy - fy) * 0.14;
    follower.style.left = fx + 'px';
    follower.style.top  = fy + 'px';
    requestAnimationFrame(movFollower);
  }
  movFollower();

  // Hover grow effect on interactive elements
  const interactables = 'a, button, input, textarea, .skill-pill, .project-card, .cert-card';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(interactables)) {
      cursor.classList.add('hovered');
      follower.classList.add('hovered');
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(interactables)) {
      cursor.classList.remove('hovered');
      follower.classList.remove('hovered');
    }
  });
})();


/* ═══════════════════════════════════════════════════════
   3. NAVIGATION
   ═══════════════════════════════════════════════════════ */
(function initNav() {
  const navbar    = $('#navbar');
  const hamburger = $('#hamburger');
  const navLinks  = $('#navLinks');
  const links     = $$('.nav-link');

  // Scrolled class
  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 40);

    // Back-to-top
    const btt = $('#backToTop');
    if (btt) btt.classList.toggle('visible', window.scrollY > 300);

    // Scroll-spy
    let current = 'hero';
    $$('section[id]').forEach(sec => {
      if (window.scrollY + 90 >= sec.offsetTop) current = sec.id;
    });
    links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + current));
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Hamburger
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  // Close menu on link click
  links.forEach(l => l.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  }));
})();


/* ═══════════════════════════════════════════════════════
   4. TYPING EFFECT
   ═══════════════════════════════════════════════════════ */
(function initTyping() {
  const el = $('#typingText');
  if (!el) return;

  const phrases = [
    'Java Full Stack Apps.',
    'RESTful APIs.',
    'Spring Boot Solutions.',
    'Scalable Backends.',
    'Modern Web Apps.',
  ];

  let phraseIdx = 0, charIdx = 0, deleting = false;

  function tick() {
    const phrase = phrases[phraseIdx];

    if (!deleting) {
      charIdx++;
      el.textContent = phrase.slice(0, charIdx);
      if (charIdx === phrase.length) {
        deleting = true;
        setTimeout(tick, 2000);
        return;
      }
      setTimeout(tick, 90);
    } else {
      charIdx--;
      el.textContent = phrase.slice(0, charIdx);
      if (charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        setTimeout(tick, 400);
        return;
      }
      setTimeout(tick, 50);
    }
  }
  tick();
})();


/* ═══════════════════════════════════════════════════════
   5. INTERSECTION OBSERVER – REVEAL ANIMATIONS
   ═══════════════════════════════════════════════════════ */
(function initReveal() {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Stagger children in the same parent
          const siblings = $$('.reveal', entry.target.parentElement);
          const idx = siblings.indexOf(entry.target);
          entry.target.style.transitionDelay = `${idx * 80}ms`;
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  $$('.reveal').forEach(el => observer.observe(el));
})();


/* ═══════════════════════════════════════════════════════
   6. COUNT-UP ANIMATION
   ═══════════════════════════════════════════════════════ */
(function initCountUp() {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target   = parseFloat(el.dataset.target);
        const suffix   = el.dataset.suffix || '';
        const decimals = parseInt(el.dataset.decimals || '0', 10);
        const duration = 1600;
        const start    = performance.now();

        function step(now) {
          const pct = Math.min((now - start) / duration, 1);
          const val = target * easeOut(pct);
          el.textContent = val.toFixed(decimals) + suffix;
          if (pct < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        observer.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );

  $$('[data-target]').forEach(el => observer.observe(el));

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
})();


/* ═══════════════════════════════════════════════════════
   7. SKILL BARS
   ═══════════════════════════════════════════════════════ */
(function initSkillBars() {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        $$('.skill-fill', entry.target).forEach(bar => {
          bar.style.width = bar.dataset.pct + '%';
        });
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.3 }
  );

  $$('.skill-category').forEach(el => observer.observe(el));
})();


/* ═══════════════════════════════════════════════════════
   8. 3D TILT EFFECT ON PROJECT CARDS
   ═══════════════════════════════════════════════════════ */
(function initTilt() {
  if (window.innerWidth < 769) return;  // skip on mobile

  $$('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect   = card.getBoundingClientRect();
      const x      = e.clientX - rect.left;
      const y      = e.clientY - rect.top;
      const cx     = rect.width  / 2;
      const cy     = rect.height / 2;
      const rotX   = ((y - cy) / cy) * -10;
      const rotY   = ((x - cx) / cx) *  10;
      card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.03)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)';
      card.style.transition = 'transform 0.4s ease';
    });
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'none';
    });
  });
})();


/* ═══════════════════════════════════════════════════════
   9. CONTACT FORM
   ═══════════════════════════════════════════════════════ */
(function initContactForm() {
  const form = $('#contactForm');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const original = btn.innerHTML;

    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…';
    btn.disabled = true;

    try {
      const data = new FormData(form);
      const res  = await fetch(form.action, {
        method:  'POST',
        body:    data,
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        btn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
        btn.style.background = 'linear-gradient(135deg,#22c55e,#16a34a)';
        form.reset();
        setTimeout(() => {
          btn.innerHTML = original;
          btn.style.background = '';
          btn.disabled = false;
        }, 4000);
      } else {
        throw new Error('Network error');
      }
    } catch {
      // Fallback – open mailto
      const name    = form.querySelector('#name').value;
      const email   = form.querySelector('#email').value;
      const message = form.querySelector('#message').value;
      window.location.href =
        `mailto:manojkumar.mk0965@gmail.com?subject=Portfolio%20Contact%20from%20${encodeURIComponent(name)}&body=${encodeURIComponent(`From: ${name} (${email})\n\n${message}`)}`;

      btn.innerHTML = original;
      btn.disabled  = false;
    }
  });
})();


/* ═══════════════════════════════════════════════════════
   10. SMOOTH SCROLL for # links
   ═══════════════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth' });
  });
});
