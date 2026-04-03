// ============================================
// iPeep - Main JavaScript
// Spinner, debounce, touch handling, UX polish
// ============================================

// ---- Loading Spinner ----
const spinner = document.getElementById('ipeepSpinner');

function showSpinner(msg) {
  if (!spinner) return;
  const txt = spinner.querySelector('.ipeep-spinner-text');
  if (txt && msg) txt.textContent = msg;
  spinner.classList.add('active');
}

function hideSpinner() {
  if (spinner) spinner.classList.remove('active');
}

// Safety: hide spinner if page is loaded from bfcache (back button)
window.addEventListener('pageshow', (e) => {
  if (e.persisted) hideSpinner();
  // Also re-enable any disabled buttons
  document.querySelectorAll('[data-ipeep-submitted]').forEach(btn => {
    btn.disabled = false;
    btn.removeAttribute('data-ipeep-submitted');
  });
});

// ---- Mobile menu toggle ----
function toggleMobileMenu() {
  const navMenu = document.querySelector('.nav-menu');
  if (navMenu) navMenu.classList.toggle('mobile-open');
}

// Close mobile menu when a link is tapped
document.addEventListener('click', (e) => {
  const link = e.target.closest('.nav-menu.mobile-open .nav-link');
  if (link) {
    document.querySelector('.nav-menu')?.classList.remove('mobile-open');
  }
});

// ---- Close anchor ad ----
function closeAnchorAd() {
  const ad = document.getElementById('anchorAd');
  if (ad) {
    ad.style.display = 'none';
    sessionStorage.setItem('anchorAdClosed', 'true');
  }
}

// ---- DOMContentLoaded ----
document.addEventListener('DOMContentLoaded', () => {
  // Restore anchor ad state
  if (sessionStorage.getItem('anchorAdClosed') === 'true') {
    const ad = document.getElementById('anchorAd');
    if (ad) ad.style.display = 'none';
  }

  // Auto-focus search on homepage (desktop only)
  const heroSearch = document.querySelector('.search-input-large');
  if (heroSearch && window.location.pathname === '/' && window.innerWidth > 768) {
    heroSearch.focus();
  }
});

// ---- Search form handling: clean username + show spinner + debounce ----
document.querySelectorAll('.search-form, .search-form-large').forEach(form => {
  let submitted = false;

  form.addEventListener('submit', (e) => {
    if (submitted) { e.preventDefault(); return; }

    const input = form.querySelector('input[name="q"]');
    if (input) {
      let value = input.value.trim();
      if (!value) { e.preventDefault(); input.focus(); return; }
      // Clean username
      value = value.replace(/^@/, '');
      value = value.replace(/^https?:\/\/(www\.)?instagram\.com\//, '');
      value = value.replace(/\/$/, '');
      value = value.split('?')[0];
      input.value = value;
    }

    // Mark submitted — prevent double submit
    submitted = true;
    const btn = form.querySelector('button[type="submit"]');
    if (btn) {
      btn.disabled = true;
      btn.setAttribute('data-ipeep-submitted', '1');
    }

    // Show spinner
    showSpinner('Looking up profile…');

    // Reset after 15s in case of slow load / nav doesn't happen
    setTimeout(() => { submitted = false; hideSpinner(); if (btn) btn.disabled = false; }, 15000);
  });
});

// ---- Make search buttons respond instantly on mobile ----
document.querySelectorAll('.search-btn, .search-btn-large').forEach(btn => {
  btn.addEventListener('touchend', (e) => {
    e.preventDefault();
    btn.closest('form')?.requestSubmit();
  });
});

// ---- Debounce all .btn and .action-btn clicks (prevent double-tap) ----
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn:not([disabled]), .action-btn:not([disabled]), .control-btn:not([disabled])');
  if (!btn) return;
  // If it's inside a form, the form handler manages it
  if (btn.closest('form') && btn.type === 'submit') return;
  // If it's a link, show spinner for navigation
  if (btn.tagName === 'A' && btn.href && !btn.href.startsWith('javascript') && !btn.hasAttribute('download') && !btn.target) {
    showSpinner('Loading…');
  }
}, { passive: true });

// ---- Error image handler ----
document.addEventListener('error', (e) => {
  if (e.target.tagName === 'IMG') {
    e.target.src = '/images/default-avatar.jpg';
    e.target.onerror = null;
  }
}, true);

// ---- Console branding ----
console.log('%c iPeep ', 'background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888); color: white; font-size: 18px; font-weight: bold; padding: 8px 16px; border-radius: 4px;');
console.log('%c Anonymous Instagram Viewer', 'color: #a0a0a0; font-size: 12px;');
