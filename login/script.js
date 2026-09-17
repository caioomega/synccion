// =============================================================
// SYNCCION — login: fundo em rede, entrada animada e validação
// =============================================================

const reduceMotion =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
  !/[?&]motion=1/.test(window.location.search);
const hasGsap = typeof gsap !== 'undefined';

// -------------------------------------------------------------
// Fundo: rede de nós conectados (canvas)
// -------------------------------------------------------------
(function initNetwork() {
  const canvas = document.getElementById('net');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const isMobile = window.matchMedia('(max-width: 700px)').matches;
  const COUNT = isMobile ? 40 : 90;
  const LINK_DIST = isMobile ? 110 : 150;
  const mouse = { x: -9999, y: -9999 };
  let nodes = [];
  let w = 0;
  let h = 0;
  let dpr = 1;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function seed() {
    nodes = Array.from({ length: COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: 1.2 + Math.random() * 1.8,
      hot: Math.random() < 0.12, // alguns nós "ativos", mais brilhantes
    }));
  }

  function step() {
    ctx.clearRect(0, 0, w, h);

    // linhas
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d = Math.hypot(dx, dy);
        if (d < LINK_DIST) {
          const alpha = (1 - d / LINK_DIST) * 0.35;
          ctx.strokeStyle = `rgba(96, 155, 255, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // nós
    for (const n of nodes) {
      const dx = n.x - mouse.x;
      const dy = n.y - mouse.y;
      const dm = Math.hypot(dx, dy);
      if (dm < 140) {
        // leve atração para o cursor
        n.vx -= (dx / dm) * 0.01;
        n.vy -= (dy / dm) * 0.01;
      }

      if (!reduceMotion) {
        n.x += n.vx;
        n.y += n.vy;
        // amortece velocidade para não acelerar demais
        n.vx *= 0.995;
        n.vy *= 0.995;
      }

      if (n.x < -20) n.x = w + 20;
      if (n.x > w + 20) n.x = -20;
      if (n.y < -20) n.y = h + 20;
      if (n.y > h + 20) n.y = -20;

      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = n.hot ? 'rgba(96, 165, 250, 0.95)' : 'rgba(147, 174, 207, 0.7)';
      ctx.fill();

      if (n.hot) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + 4, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(96, 165, 250, 0.25)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    if (!reduceMotion) requestAnimationFrame(step);
  }

  window.addEventListener('resize', () => { resize(); seed(); });
  window.addEventListener('pointermove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('pointerleave', () => { mouse.x = -9999; mouse.y = -9999; });

  resize();
  seed();
  step();
})();

// -------------------------------------------------------------
// Entrada animada
// -------------------------------------------------------------
const card = document.getElementById('login-card');

function runEntrance() {
  if (!(hasGsap && card && !reduceMotion)) return;
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.fromTo('.glow', { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.2, ease: 'power2.out' })
    .fromTo(card, { y: 48, opacity: 0, scale: 0.97 }, { y: 0, opacity: 1, scale: 1, duration: 0.8 }, '-=0.9')
    .fromTo('.logo-c1', { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.45, ease: 'back.out(2)' }, '-=0.4')
    .fromTo('.logo-c2', { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.45, ease: 'back.out(2)' }, '-=0.3')
    .fromTo('.logo-link', { scaleX: 0, transformOrigin: '50% 50%' }, { scaleX: 1, duration: 0.3 }, '-=0.15')
    .fromTo('.card-logo span, .card-tag', { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.4, stagger: 0.08 }, '-=0.2')
    .fromTo('.auth-tabs', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.25')
    .fromTo('.auth-panel.is-active .card-title > *', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 }, '-=0.3')
    .fromTo(panels[activePanel].querySelectorAll('.field, .options-row, .strength, .plan-pick, .check, .btn-submit, .card-foot'),
      { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.07 }, '-=0.3')
    .fromTo('#back-link, #login-footer', { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 }, '-=0.5');

  // leve inclinação 3D acompanhando o cursor (só com mouse)
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const rotX = gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power3.out' });
    const rotY = gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power3.out' });

    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      rotY(px * 6);
      rotX(-py * 6);
    });
    card.addEventListener('pointerleave', () => { rotX(0); rotY(0); });
  }
}

// -------------------------------------------------------------
// Abas: entrar / criar conta
// -------------------------------------------------------------
const tabs = document.getElementById('auth-tabs');
const tabPill = document.getElementById('auth-tab-pill');
const panels = {
  login: document.getElementById('panel-login'),
  signup: document.getElementById('panel-signup'),
};
let activePanel = 'login';

function movePill(animate) {
  const btn = tabs.querySelector(`.auth-tab[data-panel="${activePanel}"]`);
  const x = btn.offsetLeft - 4;
  if (hasGsap && animate && !reduceMotion) gsap.to(tabPill, { x, duration: 0.4, ease: 'power3.out' });
  else if (hasGsap) gsap.set(tabPill, { x });
  else tabPill.style.transform = `translateX(${x}px)`;
}

function showPanel(name, animate = true) {
  if (!panels[name] || name === activePanel) return;
  const prev = panels[activePanel];
  const next = panels[name];
  activePanel = name;

  tabs.querySelectorAll('.auth-tab').forEach((t) => {
    const on = t.dataset.panel === name;
    t.classList.toggle('is-active', on);
    t.setAttribute('aria-selected', String(on));
  });
  movePill(animate);
  card.classList.toggle('is-signup', name === 'signup');

  prev.classList.remove('is-active');
  prev.hidden = true;
  next.hidden = false;
  next.classList.add('is-active');

  if (hasGsap && animate && !reduceMotion) {
    const dir = name === 'signup' ? 1 : -1;
    gsap.fromTo(next, { opacity: 0, x: 24 * dir }, { opacity: 1, x: 0, duration: 0.45, ease: 'power3.out' });
    gsap.fromTo(next.querySelectorAll('.field, .strength, .plan-pick, .check, .btn-submit, .card-foot'),
      { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.05, ease: 'power3.out', delay: 0.08 });
  }

  history.replaceState(null, '', name === 'signup' ? '#criar-conta' : '#entrar');
  const first = next.querySelector('input:not([type="hidden"]):not([type="radio"]):not([type="checkbox"])');
  if (first && animate) first.focus({ preventScroll: true });
}

if (tabs) {
  tabs.querySelectorAll('.auth-tab').forEach((t) => t.addEventListener('click', () => showPanel(t.dataset.panel)));
  document.querySelectorAll('[data-goto]').forEach((b) => b.addEventListener('click', () => showPanel(b.dataset.goto)));
  const ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  ready.then(() => movePill(false));
  window.addEventListener('resize', () => movePill(false));
}

// -------------------------------------------------------------
// Mostrar / ocultar senha (todos os campos)
// -------------------------------------------------------------
document.querySelectorAll('.toggle-password').forEach((btn) => {
  const input = document.getElementById(btn.dataset.toggle);
  if (!input) return;
  btn.addEventListener('click', () => {
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    btn.setAttribute('aria-pressed', String(show));
    btn.setAttribute('aria-label', show ? 'Ocultar senha' : 'Mostrar senha');
    input.focus({ preventScroll: true });
  });
});

// -------------------------------------------------------------
// Entrar
// -------------------------------------------------------------
const loginForm = document.getElementById('loginForm');
const passwordInput = document.getElementById('password');
const emailInput = document.getElementById('email');
const btnSubmit = document.getElementById('btnSubmit');
const alertBox = document.getElementById('alert');
const alertText = document.getElementById('alert-text');

// mensagens de erro vindas do PHP via ?error=
const errorMessages = {
  campos_invalidos: 'Preencha e-mail e senha para continuar.',
  credenciais_incorretas: 'E-mail ou senha inválidos.',
  cadastro_invalido: 'Confira os dados informados e tente criar a conta novamente.',
};
const params = new URLSearchParams(window.location.search);
const errorParam = params.get('error');

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    resetErrors(loginForm);
    let valid = true;

    if (!validateEmail(emailInput.value.trim())) {
      showError(emailInput, 'Informe um e-mail válido.');
      valid = false;
    }
    if (!passwordInput.value.trim()) {
      showError(passwordInput, 'A senha é obrigatória.');
      valid = false;
    }

    if (!valid) {
      e.preventDefault();
      shake();
      return;
    }

    // deixa o PHP receber o POST; só mostra o estado de envio
    btnSubmit.classList.add('is-loading');
    btnSubmit.querySelector('.btn-label').textContent = 'Entrando…';
  });
}

// -------------------------------------------------------------
// Criar conta
// -------------------------------------------------------------
const signupForm = document.getElementById('signupForm');

if (signupForm) {
  const name = document.getElementById('su-name');
  const company = document.getElementById('su-company');
  const email = document.getElementById('su-email');
  const pass = document.getElementById('su-password');
  const confirm = document.getElementById('su-confirm');
  const consent = document.getElementById('su-consent');
  const consentError = document.getElementById('su-consent-error');
  const btnSignup = document.getElementById('btnSignup');
  const strength = document.getElementById('strength');
  const strengthLabel = document.getElementById('strength-label');
  const cycleInput = document.getElementById('su-cycle');
  const cycleBtns = document.querySelectorAll('#cycle-pick .cycle-btn');
  const planInputs = signupForm.querySelectorAll('input[name="plano"]');
  const fmt = (n) => n.toLocaleString('pt-BR');

  // força da senha
  function scorePassword(v) {
    if (!v) return 0;
    let s = 0;
    if (v.length >= 8) s++;
    if (/[a-z]/.test(v) && /[A-Z]/.test(v)) s++;
    if (/\d/.test(v)) s++;
    if (/[^A-Za-z0-9]/.test(v) || v.length >= 14) s++;
    return Math.min(4, s);
  }
  const strengthText = ['Mínimo de 8 caracteres, com letras e números', 'Senha fraca', 'Dá para melhorar', 'Boa senha', 'Senha forte'];
  pass.addEventListener('input', () => {
    const s = scorePassword(pass.value);
    strength.dataset.score = String(s);
    strengthLabel.textContent = strengthText[s];
  });

  // ciclo mensal / anual — anual = 12x
  function applyCycle(cycle) {
    cycleInput.value = cycle;
    cycleBtns.forEach((b) => {
      const on = b.dataset.cycle === cycle;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    planInputs.forEach((input) => {
      const monthly = Number(input.dataset.monthly);
      const price = input.parentElement.querySelector('[data-price]');
      price.textContent = cycle === 'anual' ? `R$ ${fmt(monthly * 12)}/ano` : `R$ ${fmt(monthly)}/mês`;
      if (hasGsap && !reduceMotion) gsap.fromTo(price, { opacity: 0.3 }, { opacity: 1, duration: 0.35 });
    });
  }
  cycleBtns.forEach((b) => b.addEventListener('click', () => applyCycle(b.dataset.cycle)));

  // pré-seleção vinda da página de planos (?plano=...&ciclo=...)
  const planParam = params.get('plano');
  const cycleParam = params.get('ciclo');
  planInputs.forEach((input) => { if (input.value === planParam) input.checked = true; });
  applyCycle(cycleParam === 'anual' ? 'anual' : 'mensal');
  if (planParam || errorParam === 'cadastro_invalido' || window.location.hash === '#criar-conta') showPanel('signup', false);
  // validação
  signupForm.addEventListener('submit', (e) => {
    resetErrors(signupForm);
    consentError.classList.remove('is-on');
    consent.closest('.check').classList.remove('has-error');
    let valid = true;

    if (name.value.trim().length < 2) { showError(name, 'Informe seu nome.'); valid = false; }
    if (company.value.trim().length < 2) { showError(company, 'Informe o nome da empresa.'); valid = false; }
    if (!validateEmail(email.value.trim())) { showError(email, 'Informe um e-mail válido.'); valid = false; }
    if (pass.value.length < 8) { showError(pass, 'Use pelo menos 8 caracteres.'); valid = false; }
    else if (!/\d/.test(pass.value) || !/[A-Za-z]/.test(pass.value)) { showError(pass, 'Misture letras e números.'); valid = false; }
    if (confirm.value !== pass.value || !confirm.value) { showError(confirm, 'As senhas não conferem.'); valid = false; }
    if (!consent.checked) {
      consentError.textContent = 'Para criar a conta, precisamos do seu aceite.';
      consentError.classList.add('is-on');
      consent.closest('.check').classList.add('has-error');
      valid = false;
    }

    if (!valid) {
      e.preventDefault();
      shake();
      const firstBad = signupForm.querySelector('.has-error input');
      if (firstBad) firstBad.focus({ preventScroll: true });
      return;
    }

    btnSignup.classList.add('is-loading');
    btnSignup.querySelector('.btn-label').textContent = 'Criando conta…';
  });

  consent.addEventListener('change', () => {
    consentError.classList.remove('is-on');
    consent.closest('.check').classList.remove('has-error');
  });
}

// alerta de erro vindo do PHP (?error=...), no painel que estiver aberto
if (errorParam) {
  if (activePanel === 'signup' && signupForm) signupForm.parentNode.insertBefore(alertBox, signupForm);
  showAlert(errorMessages[errorParam] || 'Não foi possível continuar. Tente novamente.');
}

// limpa o erro do campo assim que o usuário volta a digitar
document.querySelectorAll('.field input').forEach((input) => {
  input.addEventListener('input', () => input.closest('.field').classList.remove('has-error'));
});

// -------------------------------------------------------------
// Utilidades
// -------------------------------------------------------------
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showError(input, message) {
  const field = input.closest('.field');
  field.classList.add('has-error');
  field.querySelector('.error-msg').textContent = message;
}

function resetErrors(scope = document) {
  scope.querySelectorAll('.field.has-error').forEach((f) => f.classList.remove('has-error'));
}

function showAlert(message) {
  if (!alertBox) return;
  alertText.textContent = message;
  alertBox.hidden = false;
  if (hasGsap) gsap.fromTo(alertBox, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' });
}

function shake() {
  if (!hasGsap || !card || reduceMotion) return;
  gsap.fromTo(card, { x: 0 }, {
    keyframes: [{ x: -10 }, { x: 10 }, { x: -7 }, { x: 7 }, { x: 0 }],
    duration: 0.45,
    ease: 'power1.inOut',
  });
}

// entrada: roda por último, depois de escolher a aba inicial (?plano= / #criar-conta)
runEntrance();
