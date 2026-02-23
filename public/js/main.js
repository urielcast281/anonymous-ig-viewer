// ============================================
// InstaViewer - Main JavaScript
// ============================================

// Mobile menu toggle
function toggleMobileMenu() {
  const navMenu = document.querySelector('.nav-menu');
  if (navMenu) {
    navMenu.classList.toggle('mobile-open');
  }
}

// Close anchor ad
function closeAnchorAd() {
  const ad = document.getElementById('anchorAd');
  if (ad) {
    ad.style.display = 'none';
    // Remember closure for session
    sessionStorage.setItem('anchorAdClosed', 'true');
  }
}

// Check if anchor ad was closed
document.addEventListener('DOMContentLoaded', () => {
  if (sessionStorage.getItem('anchorAdClosed') === 'true') {
    const ad = document.getElementById('anchorAd');
    if (ad) ad.style.display = 'none';
  }
  
  // Auto-focus search on homepage
  const heroSearch = document.querySelector('.search-input-large');
  if (heroSearch && window.location.pathname === '/') {
    // Don't auto-focus on mobile (keyboard is annoying)
    if (window.innerWidth > 768) {
      heroSearch.focus();
    }
  }
  
  // Lazy load images with IntersectionObserver
  if ('IntersectionObserver' in window) {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
          }
          imageObserver.unobserve(img);
        }
      });
    });
    
    lazyImages.forEach(img => imageObserver.observe(img));
  }
});

// Handle search form submission - clean username
document.querySelectorAll('.search-form, .search-form-large').forEach(form => {
  form.addEventListener('submit', (e) => {
    const input = form.querySelector('input[name="q"]');
    if (input) {
      let value = input.value.trim();
      // Remove @ prefix if user added it
      value = value.replace(/^@/, '');
      // Remove Instagram URL prefix
      value = value.replace(/^https?:\/\/(www\.)?instagram\.com\//, '');
      // Remove trailing slash
      value = value.replace(/\/$/, '');
      // Remove query params
      value = value.split('?')[0];
      input.value = value;
    }
  });
});

// Error image handler
document.addEventListener('error', (e) => {
  if (e.target.tagName === 'IMG') {
    e.target.src = '/images/default-avatar.jpg';
    e.target.onerror = null;
  }
}, true);

// Console branding
console.log('%c InstaViewer ', 'background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888); color: white; font-size: 18px; font-weight: bold; padding: 8px 16px; border-radius: 4px;');
console.log('%c Anonymous Instagram Viewer', 'color: #a0a0a0; font-size: 12px;');
