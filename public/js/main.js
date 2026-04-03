// ============================================
// iPeep - Main JavaScript
// Spinner, debounce, touch handling, UX polish
// Ad interstitial triggers
// ============================================

// ---- Loading Spinner ----
var spinner = document.getElementById('ipeepSpinner');

function showSpinner(msg) {
  if (!spinner) return;
  var txt = spinner.querySelector('.ipeep-spinner-text');
  if (txt && msg) txt.textContent = msg;
  spinner.classList.add('active');
}

function hideSpinner() {
  if (spinner) spinner.classList.remove('active');
}

// Safety: hide spinner if page is loaded from bfcache (back button)
window.addEventListener('pageshow', function(e) {
  if (e.persisted) hideSpinner();
  document.querySelectorAll('[data-ipeep-submitted]').forEach(function(btn) {
    btn.disabled = false;
    btn.removeAttribute('data-ipeep-submitted');
  });
});

// ---- Mobile menu toggle ----
function toggleMobileMenu() {
  var navMenu = document.querySelector('.nav-menu');
  if (navMenu) navMenu.classList.toggle('mobile-open');
}

// Close mobile menu when a link is tapped
document.addEventListener('click', function(e) {
  var link = e.target.closest('.nav-menu.mobile-open .nav-link');
  if (link) {
    var menu = document.querySelector('.nav-menu');
    if (menu) menu.classList.remove('mobile-open');
  }
});

// ---- Close anchor ad ----
function closeAnchorAd() {
  var ad = document.getElementById('anchorAd');
  if (ad) {
    ad.style.display = 'none';
    sessionStorage.setItem('anchorAdClosed', 'true');
  }
}

// ---- Profile view counter for interstitial trigger ----
function trackProfileView() {
  if (window.location.pathname.startsWith('/profile/')) {
    var count = parseInt(sessionStorage.getItem('ipeep_profile_views') || '0', 10);
    count++;
    sessionStorage.setItem('ipeep_profile_views', count.toString());
    if (count >= 3 && !sessionStorage.getItem('ipeep_interstitial_3')) {
      sessionStorage.setItem('ipeep_interstitial_3', '1');
      triggerInterstitialAd();
    }
  }
}

// ---- Interstitial ad trigger ----
function triggerInterstitialAd() {
  // Monetag/Adsterra interstitial — opens a new window (popunder behavior)
  // The Monetag multitag and Adsterra social bar scripts handle this automatically
  // We just need to simulate a user-initiated action context
  // This is handled by the ad scripts already loaded in <head>
  // Additional trigger: open a blank that ad networks can intercept
  if (sessionStorage.getItem('ipeep_last_interstitial')) {
    var lastTime = parseInt(sessionStorage.getItem('ipeep_last_interstitial'), 10);
    if (Date.now() - lastTime < 120000) return; // 2 min cooldown
  }
  sessionStorage.setItem('ipeep_last_interstitial', Date.now().toString());
}

// ---- DOMContentLoaded ----
document.addEventListener('DOMContentLoaded', function() {
  // Restore anchor ad state
  if (sessionStorage.getItem('anchorAdClosed') === 'true') {
    var ad = document.getElementById('anchorAd');
    if (ad) ad.style.display = 'none';
  }

  // Auto-focus search on homepage (desktop only)
  var heroSearch = document.querySelector('.search-input-large');
  if (heroSearch && window.location.pathname === '/' && window.innerWidth > 768) {
    heroSearch.focus();
  }

  // Track profile views
  trackProfileView();

  // Attach interstitial triggers to download and stories buttons
  setTimeout(function() {
    // Download buttons
    document.querySelectorAll('.ipeep-download-btn, [download]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        triggerInterstitialAd();
      });
    });

    // View Stories buttons
    document.querySelectorAll('.ipeep-stories-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        triggerInterstitialAd();
      });
    });
  }, 500);
});

// ---- Search form handling: clean username + show spinner + debounce ----
document.querySelectorAll('.search-form, .search-form-large').forEach(function(form) {
  var submitted = false;

  form.addEventListener('submit', function(e) {
    if (submitted) { e.preventDefault(); return; }

    var input = form.querySelector('input[name="q"]');
    if (input) {
      var value = input.value.trim();
      if (!value) { e.preventDefault(); input.focus(); return; }
      value = value.replace(/^@/, '');
      value = value.replace(/^https?:\/\/(www\.)?instagram\.com\//, '');
      value = value.replace(/\/$/, '');
      value = value.split('?')[0];
      input.value = value;
    }

    submitted = true;
    var btn = form.querySelector('button[type="submit"]');
    if (btn) {
      btn.disabled = true;
      btn.setAttribute('data-ipeep-submitted', '1');
    }

    showSpinner('Looking up profile\u2026');

    setTimeout(function() { submitted = false; hideSpinner(); if (btn) btn.disabled = false; }, 15000);
  });
});

// ---- Make search buttons respond instantly on mobile ----
document.querySelectorAll('.search-btn, .search-btn-large').forEach(function(btn) {
  btn.addEventListener('touchend', function(e) {
    e.preventDefault();
    var form = btn.closest('form');
    if (form) form.requestSubmit();
  });
});

// ---- Debounce all .btn and .action-btn clicks (prevent double-tap) ----
document.addEventListener('click', function(e) {
  var btn = e.target.closest('.btn:not([disabled]), .action-btn:not([disabled]), .control-btn:not([disabled])');
  if (!btn) return;
  if (btn.closest('form') && btn.type === 'submit') return;
  if (btn.tagName === 'A' && btn.href && !btn.href.startsWith('javascript') && !btn.hasAttribute('download') && !btn.target) {
    showSpinner('Loading\u2026');
  }
}, { passive: true });

// ---- Error image handler ----
document.addEventListener('error', function(e) {
  if (e.target.tagName === 'IMG') {
    e.target.src = '/images/default-avatar.jpg';
    e.target.onerror = null;
  }
}, true);

// ---- Console branding ----
console.log('%c iPeep ', 'background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888); color: white; font-size: 18px; font-weight: bold; padding: 8px 16px; border-radius: 4px;');
console.log('%c Anonymous Instagram Viewer', 'color: #a0a0a0; font-size: 12px;');
