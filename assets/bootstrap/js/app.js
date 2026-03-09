// Populate current year
document.getElementById('year').textContent = new Date().getFullYear();

// -------------------- THEME TOGGLE (persist) --------------------
const themeToggle = document.getElementById('themeToggle');
const storedTheme = localStorage.getItem('site-theme');
const body = document.body;
const themeIcon = themeToggle?.querySelector('i');

if (storedTheme === 'dark') {
  body.classList.add('dark-theme');
  if (themeIcon) themeIcon.className = 'bi bi-sun-fill';
} else {
  body.classList.remove('dark-theme');
  if (themeIcon) themeIcon.className = 'bi bi-moon-fill';
}

themeToggle?.addEventListener('click', () => {
  body.classList.toggle('dark-theme');
  const isDark = body.classList.contains('dark-theme');
  localStorage.setItem('site-theme', isDark ? 'dark' : 'light');
  if (themeIcon) themeIcon.className = isDark ? 'bi bi-sun-fill' : 'bi bi-moon-fill';
});

// -------------------- NAV SCROLL EFFECT & ACTIVE LINKS --------------------
const mainNav = document.getElementById('mainNav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) mainNav.classList.add('nav-scroll');
  else mainNav.classList.remove('nav-scroll');

  // highlight active nav link
  const sections = document.querySelectorAll('section[id], header#home');
  let current = '';
  sections.forEach(sec => {
    const rect = sec.getBoundingClientRect();
    if (rect.top <= 120 && rect.bottom >= 120) current = sec.id;
  });
  document.querySelectorAll('.nav-link').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
  });
});

// Smooth scroll for internal links (optional polyfill)
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', function(e){
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({top: y, behavior: 'smooth'});
      // Close navbar on mobile when clicked
      const bsCollapse = document.querySelector('.navbar-collapse.show');
      if (bsCollapse) {
        const bs = bootstrap.Collapse.getInstance(bsCollapse);
        bs?.hide();
      }
    }
  })
});



// -------------------- CONTACT FORM SIMULATION --------------------
const contactForm = document.getElementById('contactForm');
const toastEl = document.getElementById('liveToast');
const toast = new bootstrap.Toast(toastEl);

contactForm.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const submitBtn = contactForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';
  await new Promise(r=>setTimeout(r,900));
  submitBtn.disabled = false;
  submitBtn.textContent = 'Send Message';
  contactForm.reset();
  toast.show();
});

// -------------------- ANIMATE SKILL BARS WHEN VISIBLE --------------------
const skillBars = document.querySelectorAll('.progress-bar[data-progress]');
const skillsObserver = new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      const el = entry.target;
      const value = el.getAttribute('data-progress') || '0';
      el.style.width = value + '%';
      skillsObserver.unobserve(el);
    }
  })
},{threshold:0.25});

skillBars.forEach(sb => skillsObserver.observe(sb));

// Toggle navbar background when mobile menu opens
const navCollapse = document.getElementById("navCollapse");
const navbar = document.getElementById("mainNav");

navCollapse.addEventListener("shown.bs.collapse", () => {
  navbar.classList.add("nav-open");
});

navCollapse.addEventListener("hidden.bs.collapse", () => {
  navbar.classList.remove("nav-open");
});
