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
  // e.preventDefault();
  const submitBtn = contactForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';
  await new Promise(r=>setTimeout(r,900));
  submitBtn.disabled = false;
  submitBtn.textContent = 'Send Message';
  contactForm.reset();
  toast.show();
});

// -------------------- AJAX CONTACT FORM --------------------
document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#contactForm");
    const submitButton = form.querySelector("button[type='submit']");
    const toastEl = document.querySelector("#toastMessage");
    const toastBody = toastEl.querySelector(".toast-body");
    const toast = new bootstrap.Toast(toastEl);

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        // Disable button and show loading state
        submitButton.disabled = true;
        submitButton.innerHTML = `
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Sending...
        `;

        const formData = new FormData(form);

        try {
            const response = await fetch("contact.php", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();

            if (result.status === "success") {
                // Show success toast
                toastBody.textContent = "Message Sent! I'll get back to you soon.";
                toastEl.classList.remove("bg-danger");
                toastEl.classList.add("bg-success");
                toast.show();

                // Reset form
                form.reset();
            } else {
                // Show error toast
                toastBody.textContent = result.message || "Something went wrong. Please try again.";
                toastEl.classList.remove("bg-success");
                toastEl.classList.add("bg-danger");
                toast.show();
            }
        } catch (error) {
            // Handle network errors
            toastBody.textContent = "Network error. Please try again later.";
            toastEl.classList.remove("bg-success");
            toastEl.classList.add("bg-danger");
            toast.show();
        } finally {
            // Restore button state
            submitButton.disabled = false;
            submitButton.innerHTML = "Send Message";
        }
    });
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
