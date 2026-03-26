/* ============================================
   DreamWork — App JavaScript
   Mock data & lightweight interactivity
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  initSidebar();
});

/* ---------- Scroll-based fade-in ---------- */
function initScrollAnimations() {
  const elements = document.querySelectorAll(
    '.animate-fade-in-up, .animate-fade-in, .animate-slide-left'
  );

  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = 'running';
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach((el) => {
    el.style.animationPlayState = 'paused';
    observer.observe(el);
  });
}

/* ---------- Sidebar mobile toggle ---------- */
function initSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  // Create hamburger button for mobile
  const topbar = document.querySelector('.topbar');
  if (topbar && window.innerWidth <= 768) {
    const toggle = document.createElement('button');
    toggle.className = 'btn btn-icon btn-ghost';
    toggle.innerHTML = '☰';
    toggle.style.fontSize = '1.4rem';
    toggle.id = 'sidebarToggle';
    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
    topbar.insertBefore(toggle, topbar.firstChild);
  }
}

/* ---------- Login handler (demo) ---------- */
function handleLogin() {
  const email = document.getElementById('email');
  const password = document.getElementById('password');

  if (!email || !password) return;

  if (!email.value || !password.value) {
    shakeElement(email.value ? password : email);
    return;
  }

  const btn = document.getElementById('loginBtn');
  if (btn) {
    btn.textContent = 'Signing in…';
    btn.style.opacity = '0.7';
    btn.style.pointerEvents = 'none';
  }

  setTimeout(() => {
    window.location.href = 'dashboard.html';
  }, 1200);
}

/* ---------- Register handler (demo) ---------- */
function handleRegister() {
  const pw = document.getElementById('regPassword');
  const confirm = document.getElementById('confirmPassword');

  if (pw && confirm && pw.value !== confirm.value) {
    confirm.style.borderColor = 'var(--color-error)';
    confirm.style.boxShadow = '0 0 0 3px rgba(199,91,91,0.15)';
    shakeElement(confirm);
    setTimeout(() => {
      confirm.style.borderColor = '';
      confirm.style.boxShadow = '';
    }, 2000);
    return;
  }

  const btn = document.getElementById('registerBtn');
  if (btn) {
    btn.textContent = 'Creating account…';
    btn.style.opacity = '0.7';
    btn.style.pointerEvents = 'none';
  }

  setTimeout(() => {
    window.location.href = 'dashboard.html';
  }, 1500);
}

/* ---------- Simulation handler (demo) ---------- */
function runSimulation() {
  const btn = document.querySelector('#simForm button[type="submit"]');
  if (btn) {
    btn.textContent = 'Running simulation…';
    btn.style.opacity = '0.7';
    btn.style.pointerEvents = 'none';
  }

  const targetIncome = parseInt(document.getElementById('targetIncome')?.value || '95000');
  const hours = parseInt(document.getElementById('hoursPerWeek')?.value || '15');
  const months = parseInt(document.getElementById('timeframe')?.value || '6');

  const totalHours = hours * 4 * months;
  const expectedSalary = Math.round(targetIncome * (0.75 + Math.random() * 0.2));
  const roi = Math.round((expectedSalary / (totalHours * 25)) * 100);

  setTimeout(() => {
    // Update result values with animation
    animateValue('projSalary', `$${expectedSalary.toLocaleString()}`);
    animateValue('projROI', `${roi}%`);
    animateValue('projHours', `${totalHours}`);

    const difficulty = totalHours > 500 ? 'Hard' : totalHours > 250 ? 'Medium' : 'Easy';
    animateValue('projDifficulty', difficulty);

    // Animate skill bars
    const skillBars = document.querySelectorAll('.skill-current');
    skillBars.forEach((bar) => {
      const current = parseInt(bar.style.width);
      const jitter = Math.round((Math.random() - 0.3) * 15);
      const newWidth = Math.min(100, Math.max(10, current + jitter));
      bar.style.width = newWidth + '%';

      const row = bar.closest('.skill-gap-row');
      if (row) {
        const pct = row.querySelector('.skill-gap-percent');
        if (pct) pct.textContent = newWidth + '%';
      }
    });

    if (btn) {
      btn.textContent = 'Run Simulation';
      btn.style.opacity = '1';
      btn.style.pointerEvents = 'auto';
    }
  }, 1500);
}

/* ---------- Utilities ---------- */

function shakeElement(el) {
  el.style.animation = 'none';
  el.offsetHeight; // trigger reflow
  el.style.animation = 'shake 0.4s ease';
  setTimeout(() => { el.style.animation = ''; }, 400);
}

function animateValue(elementId, newValue) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.style.opacity = '0';
  el.style.transform = 'translateY(8px)';
  setTimeout(() => {
    el.textContent = newValue;
    el.style.transition = 'all 0.4s cubic-bezier(0.25,0.46,0.45,0.94)';
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  }, 200);
}

/* Shake keyframes (injected once) */
if (!document.getElementById('shake-style')) {
  const style = document.createElement('style');
  style.id = 'shake-style';
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-6px); }
      50% { transform: translateX(6px); }
      75% { transform: translateX(-4px); }
    }
  `;
  document.head.appendChild(style);
}
