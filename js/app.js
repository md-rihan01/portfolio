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

// -------------------- CONTACT FORM HANDLER --------------------
const contactForm = document.getElementById('contactForm');
const toastEl = document.getElementById('liveToast');
const toast = toastEl ? new bootstrap.Toast(toastEl) : null;

if (contactForm) {
  const feedbackEl = document.getElementById('contactFeedback');
  const submitBtn = contactForm.querySelector('button[type="submit"]');
  const timestampInput = document.getElementById('formTimestamp');

  const setFeedback = (message, isSuccess) => {
    if (!feedbackEl) return;
    feedbackEl.textContent = message;
    feedbackEl.className = isSuccess ? 'text-success small' : 'text-danger small';
  };

  const setButtonState = (isProcessing) => {
    if (!submitBtn) return;
    submitBtn.disabled = isProcessing;
    submitBtn.textContent = isProcessing ? 'Sending...' : 'Send Message';
  };

  const sanitize = (value) => (typeof value === 'string' ? value.trim() : '');
  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const validatePhone = (value) => value === '' || /^\+?[0-9\s().-]{7,20}$/.test(value);

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    setFeedback('', true);

    const apiUrl = contactForm.dataset.apiUrl;
    if (!apiUrl) {
      setFeedback('Contact service is not configured. Please try again later.', false);
      return;
    }

    if (apiUrl.includes('<YOUR_SERVERLESS_URL>')) {
      setFeedback('Configure the contact API URL first. Replace <YOUR_SERVERLESS_URL> with your deployed endpoint or local dev URL.', false);
      return;
    }

    const formData = new FormData(contactForm);
    const rawName = sanitize(formData.get('name') || '');
    const rawEmail = sanitize(formData.get('email') || '');
    const rawPhone = sanitize(formData.get('phone') || '');
    const rawSubject = sanitize(formData.get('subject') || 'New message from portfolio contact form');
    const rawMessage = sanitize(formData.get('message') || '');
    const honeypot = sanitize(formData.get('website') || '');
    const formStartedAt = Number(formData.get('formTimestamp') || '0');

    if (honeypot) {
      setFeedback('Spam protection prevented submission.', false);
      return;
    }

    if (formStartedAt && Date.now() - formStartedAt < 3000) {
      setFeedback('Please take a few seconds to complete the form before sending.', false);
      return;
    }

    if (!rawName || rawName.length < 2) {
      setFeedback('Please enter your name.', false);
      return;
    }

    if (!validateEmail(rawEmail)) {
      setFeedback('Please enter a valid email address.', false);
      return;
    }

    if (!validatePhone(rawPhone)) {
      setFeedback('Please enter a valid phone number or leave it blank.', false);
      return;
    }

    if (!rawMessage || rawMessage.length < 10) {
      setFeedback('Please enter a message with at least 10 characters.', false);
      return;
    }

    setButtonState(true);

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: rawName,
          email: rawEmail,
          phone: rawPhone,
          subject: rawSubject,
          message: rawMessage,
          website: honeypot,
          formTimestamp: formStartedAt,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        setFeedback(result.error || 'Unable to send your message now. Please try again later.', false);
        return;
      }

      setFeedback('Message sent successfully. I’ll reply soon.', true);
      contactForm.reset();
      if (timestampInput) timestampInput.value = String(Date.now());
      toast?.show();
    } catch (error) {
      console.error('Contact form submission error:', error);
      setFeedback('Network error while sending. Please try again later.', false);
    } finally {
      setButtonState(false);
    }
  });

  if (timestampInput) {
    timestampInput.value = String(Date.now());
  }
}

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
