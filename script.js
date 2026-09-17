// =============================================================
// SYNCCION — interações e animações (GSAP + ScrollTrigger)
// =============================================================

const reduceMotion =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
  !/[?&]motion=1/.test(window.location.search);
const hasGsap = typeof gsap !== 'undefined';

if (hasGsap) gsap.registerPlugin(ScrollTrigger);

// -------------------------------------------------------------
// Menu mobile — abre/fecha a navegação em telas pequenas
// -------------------------------------------------------------
const navToggle = document.getElementById('nav-toggle');
const mainNav = document.getElementById('main-nav');

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// -------------------------------------------------------------
// Boot — cortina de entrada
// -------------------------------------------------------------
const boot = document.getElementById('boot');

function endBoot() {
  document.body.classList.remove('is-booting');
  if (boot) boot.remove();
  if (hasGsap) ScrollTrigger.refresh();
}

if (!hasGsap || reduceMotion || !boot) {
  if (hasGsap) initScrollAnimations();
  endBoot();
} else {
  boot.style.display = 'grid';
  const tl = gsap.timeline({ onComplete: endBoot });
  tl.fromTo('.boot-c1', { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.45, ease: 'back.out(2)' })
    .fromTo('.boot-c2', { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.45, ease: 'back.out(2)' }, '-=0.25')
    .fromTo('.boot-link', { scaleX: 0, transformOrigin: '50% 50%' }, { scaleX: 1, duration: 0.3 }, '-=0.1')
    .fromTo('.boot-name', { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.4 }, '-=0.2')
    .to('.boot-line span', { scaleX: 1, duration: 0.8, ease: 'power2.inOut' }, '-=0.2')
    .fromTo('.boot-status', { opacity: 0 }, { opacity: 1, duration: 0.3 }, '<')
    .to('.boot-inner', { opacity: 0, y: -10, duration: 0.3 }, '+=0.1')
    .to(boot, { yPercent: -100, duration: 0.7, ease: 'power3.inOut' }, '-=0.1')
    .fromTo('#site-header', { y: -72, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, '-=0.35')
    // hero: só movimento de entrada — termina exatamente no estado original
    .fromTo('.hero .eyebrow, .hero-content h1, .hero-lead, .hero-actions',
      { opacity: 0, y: 26 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out', clearProps: 'transform' }, '-=0.35')
    .fromTo('.hero-photo-shape',
      { opacity: 0, scale: 0.9, transformOrigin: '60% 40%' },
      { opacity: 1, scale: 1, duration: 1.1, ease: 'power3.out', clearProps: 'transform' }, '<0.1')
    .fromTo('.hero-photo-img',
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out', clearProps: 'transform' }, '<0.15')
    .add(initScrollAnimations, '-=1');
}

// -------------------------------------------------------------
// Tudo que depende de scroll
// -------------------------------------------------------------
function initScrollAnimations() {
  if (!hasGsap) return;

  initHeader();

  if (reduceMotion) {
    // sem movimento: só aplica os estados finais
    initStatic();
    return;
  }

  initReveals();
  initBento();
  initHow();
  initWhy();

  // planos: cards sobem em cascata
  const plans = document.querySelectorAll('.plan');
  if (plans.length) {
    reveal(plans, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.12 }, '#plans', 'top 80%');
  }
}

// Header: sombra ao rolar + link ativo conforme a seção
function initHeader() {
  ScrollTrigger.create({
    start: 'top -24px',
    end: 'max',
    toggleClass: { targets: '#site-header', className: 'is-scrolled' },
  });

  const links = document.querySelectorAll('.main-nav a[href^="#"]');
  links.forEach((link) => {
    const section = document.querySelector(link.getAttribute('href'));
    if (!section) return;
    ScrollTrigger.create({
      trigger: section,
      start: 'top 45%',
      end: 'bottom 45%',
      onToggle: (self) => {
        if (self.isActive) {
          links.forEach((l) => l.classList.remove('is-active'));
          link.classList.add('is-active');
        } else if (link.classList.contains('is-active')) {
          link.classList.remove('is-active');
        }
      },
    });
  });
}

// Entrada disparada por scroll. Usa fromTo com valores finais explícitos:
// gsap.from() relê o destino do DOM ao reinicializar e, após um refresh do
// ScrollTrigger, pode acabar com início == fim (elemento preso invisível).
function reveal(targets, from, to, trigger, start = 'top 85%') {
  return gsap.fromTo(targets, from, {
    ...to,
    ease: to.ease || 'power3.out',
    scrollTrigger: { trigger: trigger || targets, start, once: true },
  });
}

// Revelação genérica de blocos (.reveal)
function initReveals() {
  document.querySelectorAll('.reveal').forEach((el) => {
    reveal(el, { y: 32, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 });
  });
}

// -------------------------------------------------------------
// Funcionalidades — bento grid
// -------------------------------------------------------------
function initBento() {
  const cards = document.querySelectorAll('.bento-card');
  if (!cards.length) return;

  // entrada em cascata
  reveal(cards, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.08 }, '#bento', 'top 80%');

  // brilho que segue o mouse
  cards.forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });

  const visuals = {
    list: animList,
    chart: animChart,
    dash: animDash,
    alert: animAlert,
    viz: animViz,
    search: animSearch,
  };

  cards.forEach((card) => {
    const fn = visuals[card.dataset.visual];
    if (!fn) return;
    ScrollTrigger.create({
      trigger: card,
      start: 'top 75%',
      once: true,
      onEnter: () => fn(card),
    });
  });
}

function animList(card) {
  gsap.fromTo(card.querySelectorAll('.mini-row'),
    { x: -18, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.5, stagger: 0.15, ease: 'power2.out', delay: 0.2 });
  gsap.fromTo(card.querySelectorAll('.mini-check'),
    { scale: 0 },
    { scale: 1, duration: 0.4, stagger: 0.15, ease: 'back.out(3)', delay: 0.55 });
}

function animChart(card) {
  const line = card.querySelector('.chart-line');
  const area = card.querySelector('.chart-area');
  const dot = card.querySelector('.chart-dot');
  const len = line.getTotalLength();
  gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
  gsap.set(area, { opacity: 0 });
  gsap.timeline({ delay: 0.2 })
    .to(line, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' })
    .to(area, { opacity: 1, duration: 0.6 }, '-=0.5')
    .add(() => dot.classList.add('is-live'), '-=0.3');
}

function animDash(card) {
  card.querySelectorAll('[data-count]').forEach((el, i) => countUp(el, 1.2, 0.2 + i * 0.1));
  gsap.to(card.querySelectorAll('.mini-bars i'), {
    scaleY: 1,
    duration: 0.7,
    stagger: 0.06,
    ease: 'power3.out',
    delay: 0.3,
  });
}

function animAlert(card) {
  const line = card.querySelector('.alert-line');
  const len = line.getTotalLength();
  gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
  gsap.timeline({ delay: 0.2 })
    .to(line, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut' })
    .to(card.querySelector('.alert-point'), { opacity: 1, duration: 0.2 }, '-=0.5')
    .add(() => card.querySelector('.alert-ring').classList.add('is-on'), '-=0.4')
    .fromTo(card.querySelector('.alert-badge'), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4, ease: 'back.out(2)' }, '-=0.3');
}

function animViz(card) {
  gsap.to(card.querySelector('.donut-fg'), {
    strokeDashoffset: 201 * (1 - 0.92),
    duration: 1.4,
    ease: 'power2.inOut',
    delay: 0.2,
  });
  gsap.fromTo(card.querySelector('.donut-text'), { opacity: 0 }, { opacity: 1, duration: 0.5, delay: 0.9 });
  card.querySelectorAll('.mini-hbar').forEach((bar, i) => {
    gsap.delayedCall(0.3 + i * 0.12, () => bar.classList.add('is-on'));
  });
}

function animSearch(card) {
  const textEl = card.querySelector('.mini-search-text');
  const text = textEl.dataset.text || '';
  const state = { n: 0 };
  gsap.timeline({ delay: 0.3 })
    .to(state, {
      n: text.length,
      duration: 1.1,
      ease: 'none',
      onUpdate: () => { textEl.textContent = text.slice(0, Math.round(state.n)); },
    })
    .to(card.querySelectorAll('.mini-result'), {
      opacity: 1,
      y: 0,
      duration: 0.4,
      stagger: 0.12,
      ease: 'power2.out',
      startAt: { y: 8 },
    }, '+=0.15');
}

// Contador numérico
function countUp(el, duration = 1.4, delay = 0) {
  const target = Number(el.dataset.count || 0);
  const state = { v: 0 };
  gsap.to(state, {
    v: target,
    duration,
    delay,
    ease: 'power2.out',
    onUpdate: () => { el.textContent = Math.round(state.v); },
  });
}

// -------------------------------------------------------------
// Estados finais sem animação (prefers-reduced-motion)
// -------------------------------------------------------------
function initStatic() {
  document.querySelectorAll('[data-count]').forEach((el) => { el.textContent = el.dataset.count; });
  gsap.set('.mini-bars i', { scaleY: 1 });
  gsap.set('.alert-point, .alert-badge, .mini-result', { opacity: 1 });
  gsap.set('.donut-fg', { strokeDashoffset: 201 * (1 - 0.92) });
  document.querySelectorAll('.mini-hbar').forEach((b) => b.classList.add('is-on'));
  document.querySelectorAll('.chart-dot').forEach((d) => d.classList.add('is-live'));
  document.querySelectorAll('.mini-search-text').forEach((t) => { t.textContent = t.dataset.text || ''; });
}

// -------------------------------------------------------------
// Como funciona — títulos palavra por palavra + parallax suave
// -------------------------------------------------------------
function splitWords(el) {
  const words = el.textContent.trim().split(/\s+/);
  el.textContent = '';
  words.forEach((w, i) => {
    const span = document.createElement('span');
    span.className = 'word';
    span.textContent = i < words.length - 1 ? `${w} ` : w;
    el.appendChild(span);
  });
  return el.querySelectorAll('.word');
}

function initHow() {
  const steps = document.querySelectorAll('.how-step');
  if (!steps.length) return;

  steps.forEach((step) => {
    const text = step.querySelector('.how-text');
    const words = splitWords(step.querySelector('.split'));
    const card = step.querySelector('.how-card');

    // texto: número, título (palavra a palavra) e parágrafo
    const tl = gsap.timeline({
      scrollTrigger: { trigger: step, start: 'top 75%', once: true },
    });
    tl.fromTo(text.querySelector('.how-num'), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' })
      .fromTo(words, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.07, ease: 'power3.out' }, '-=0.3')
      .fromTo(text.querySelector('p'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.35');

    // cartão: entra suave e ganha parallax leve enquanto passa pela tela
    reveal(card, { opacity: 0, y: 40, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.9 }, step, 'top 78%');
    gsap.fromTo(card, { yPercent: 6 }, {
      yPercent: -6,
      ease: 'none',
      scrollTrigger: { trigger: step, start: 'top bottom', end: 'bottom top', scrub: 0.8 },
    });

    // detalhes de cada cartão
    const inner = card.querySelectorAll('.hc-tag, .hc-toast, .hc-summary-row');
    if (inner.length) {
      gsap.fromTo(inner, { opacity: 0, y: 16 }, {
        opacity: 1, y: 0, duration: 0.6, stagger: 0.18, ease: 'power3.out', delay: 0.35,
        scrollTrigger: { trigger: step, start: 'top 70%', once: true },
      });
    }
    const spark = card.querySelector('.hc-spark path');
    if (spark) {
      const len = spark.getTotalLength();
      gsap.fromTo(spark, { strokeDasharray: len, strokeDashoffset: len }, {
        strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut', delay: 0.6,
        scrollTrigger: { trigger: step, start: 'top 70%', once: true },
      });
    }
  });
}

// -------------------------------------------------------------
// Por que Synccion — manifesto que acende com o scroll + benefícios
// -------------------------------------------------------------
function initWhy() {
  const manifesto = document.getElementById('manifesto');
  if (manifesto) {
    const words = splitWords(manifesto);
    gsap.fromTo(words, { opacity: 0.18 }, {
      opacity: 1,
      stagger: 0.08,
      ease: 'none',
      scrollTrigger: { trigger: manifesto, start: 'top 80%', end: 'bottom 45%', scrub: 0.6 },
    });
  }

  const benefits = document.querySelectorAll('.benefit');
  if (benefits.length) {
    reveal(benefits, { opacity: 0, y: 36 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.12 }, '#benefits', 'top 82%');
  }
}

// -------------------------------------------------------------
// Newsletter — validação, envio e estado de sucesso
// (sem backend ainda: só simula o envio e mostra a confirmação)
// -------------------------------------------------------------
(function initNewsletter() {
  const form = document.getElementById('news-form');
  if (!form) return;
  const email = document.getElementById('news-email');
  const consent = document.getElementById('news-consent');
  const btn = document.getElementById('news-btn');
  const error = document.getElementById('news-error');
  const success = document.getElementById('news-success');
  const sentTo = document.getElementById('news-sent-to');
  const plane = document.getElementById('news-plane');

  function showError(msg, isConsent) {
    error.textContent = msg;
    form.classList.add('has-error');
    form.classList.toggle('consent-error', !!isConsent);
    if (hasGsap && !reduceMotion) {
      gsap.fromTo(form, { x: 0 }, { keyframes: [{ x: -8 }, { x: 8 }, { x: -5 }, { x: 5 }, { x: 0 }], duration: 0.4 });
    }
  }

  function clearError() {
    form.classList.remove('has-error', 'consent-error');
  }

  email.addEventListener('input', clearError);
  consent.addEventListener('change', clearError);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearError();
    const value = email.value.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      showError('Informe um e-mail válido para continuar.');
      email.focus();
      return;
    }
    if (!consent.checked) {
      showError('Para receber a newsletter, precisamos do seu aceite.', true);
      return;
    }

    btn.classList.add('is-loading');
    btn.querySelector('.news-btn-label').textContent = 'Enviando…';

    // aqui entra a chamada real ao backend; por enquanto simula 900ms
    setTimeout(() => {
      sentTo.textContent = value;
      form.classList.add('is-done');
      success.hidden = false;

      if (hasGsap && !reduceMotion) {
        const ring = success.querySelector('.news-success-ring');
        const check = success.querySelector('.news-success-check');
        const ringLen = ring.getTotalLength();
        const checkLen = check.getTotalLength();
        gsap.timeline()
          .fromTo(success, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' })
          .fromTo(ring, { strokeDasharray: ringLen, strokeDashoffset: ringLen }, { strokeDashoffset: 0, duration: 0.7, ease: 'power2.inOut' }, '<')
          .fromTo(check, { strokeDasharray: checkLen, strokeDashoffset: checkLen }, { strokeDashoffset: 0, duration: 0.4, ease: 'power2.out' }, '-=0.2');

        // o aviãozinho decola
        if (plane) {
          gsap.timeline()
            .to(plane, { x: -8, y: 6, rotation: -8, duration: 0.25, ease: 'power2.in' })
            .to(plane, { x: 220, y: -160, rotation: 12, opacity: 0, duration: 0.9, ease: 'power3.in' });
        }
      }
    }, 900);
  });
})();

// -------------------------------------------------------------
// Planos — mensal / anual (anual = 12x, sem desconto)
// -------------------------------------------------------------
(function initPricing() {
  const toggle = document.getElementById('billing-toggle');
  const plans = document.querySelectorAll('.plan');
  if (!toggle || !plans.length) return;

  const pill = document.getElementById('billing-pill');
  const buttons = toggle.querySelectorAll('.billing-btn');
  const fmt = (n) => n.toLocaleString('pt-BR');
  let cycle = 'mensal';

  function movePill(btn, animate) {
    const x = btn.offsetLeft - 4; // compensa o padding do toggle
    const w = btn.offsetWidth;
    if (hasGsap && animate && !reduceMotion) {
      gsap.to(pill, { x, width: w, duration: 0.4, ease: 'power3.out' });
    } else if (hasGsap) {
      gsap.set(pill, { x, width: w });
    } else {
      pill.style.transform = `translateX(${x}px)`;
      pill.style.width = `${w}px`;
    }
  }

  function apply(next, animate) {
    cycle = next;
    buttons.forEach((b) => {
      const on = b.dataset.cycle === cycle;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    movePill(toggle.querySelector(`[data-cycle="${cycle}"]`), animate);

    plans.forEach((plan) => {
      const monthly = Number(plan.dataset.monthly);
      const target = cycle === 'anual' ? monthly * 12 : monthly;
      const amount = plan.querySelector('[data-amount]');
      const period = plan.querySelector('[data-period]');
      const note = plan.querySelector('[data-note]');
      const cta = plan.querySelector('[data-cta]');

      period.textContent = cycle === 'anual' ? '/ano' : '/mês';
      note.textContent = cycle === 'anual'
        ? `12 × R$ ${fmt(monthly)} · cobrado uma vez por ano`
        : 'Cobrado mensalmente';
      cta.href = cta.href.replace(/ciclo=[^&#]*/, `ciclo=${cycle}`);

      // número "rola" do valor atual até o novo
      const current = Number(amount.textContent.replace(/\./g, '')) || 0;
      if (hasGsap && animate && !reduceMotion) {
        const state = { v: current };
        gsap.to(state, {
          v: target,
          duration: 0.6,
          ease: 'power2.out',
          onUpdate: () => { amount.textContent = fmt(Math.round(state.v)); },
        });
        gsap.fromTo(period, { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: 0.35, delay: 0.1 });
      } else {
        amount.textContent = fmt(target);
      }
    });
  }

  buttons.forEach((b) => b.addEventListener('click', () => {
    if (b.dataset.cycle !== cycle) apply(b.dataset.cycle, true);
  }));
  window.addEventListener('resize', () => movePill(toggle.querySelector('.billing-btn.is-active'), false));

  // posiciona a pílula depois das fontes carregarem (largura correta)
  const ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  ready.then(() => apply('mensal', false));
})();
