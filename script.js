const hamburger = document.getElementById("hamburger");
const mobileNav = document.getElementById("mobileNav");
const navLinks = document.querySelectorAll(".mobile-nav a");
const body = document.body;

if (hamburger) {
  hamburger.addEventListener("click", () => {
    mobileNav.classList.toggle("show");
    body.classList.toggle("no-scroll");
    const expanded = hamburger.getAttribute("aria-expanded") === "true";
    hamburger.setAttribute("aria-expanded", String(!expanded));
  });
}

// Close mobile navigation when a link is clicked
navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    mobileNav.classList.remove("show");
    body.classList.remove("no-scroll");
    if (hamburger) hamburger.setAttribute("aria-expanded", "false");
  });
});

// Animations on scroll
const observerOptions = {
  root: null,
  rootMargin: "0px",
  threshold: 0.2,
};

const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("fade-in-up");
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

const animatedElements = document.querySelectorAll(".animate-on-scroll");
animatedElements.forEach((el) => observer.observe(el));

/* ===== New: tiny helpers for forms & active nav (kept minimal and vanilla) ===== */
(function () {
  // Mark active link based on pathname
  const path = location.pathname.split('/').pop() || "index.html";
  const allLinks = document.querySelectorAll('nav a, .mobile-nav a, .header-cta .link');
  allLinks.forEach(a => {
    const href = a.getAttribute('href');
    if (href && href.indexOf(path) !== -1) {
      a.setAttribute('aria-current', 'page');
    } else if (path === "index.html" && href === "index.html") {
      a.setAttribute('aria-current', 'page');
    }
  });

  // Small helper to show success message inline
  function showSuccess(form, msg) {
    let note = form.querySelector(".form-note");
    if (!note) {
      note = document.createElement("div");
      note.className = "form-note";
      note.setAttribute("role", "status");
      note.style.marginTop = "10px";
      note.style.padding = "10px 12px";
      note.style.border = "1px solid #81c784";
      note.style.borderRadius = "12px";
      note.style.background = "#c8e6c9";
      note.style.color = "#2e7d32";
      note.style.fontWeight = "600";
      form.appendChild(note);
    }
    note.textContent = msg;
  }

  function isValidEmail(v) {
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);
  }

  // Newsletter form
  const nlForm = document.querySelector('form[action="#"][method="post"]:has(#nl-email)') || document.getElementById("newsletter-form");
  if (nlForm) {
    nlForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = nlForm.querySelector("#nl-name");
      const email = nlForm.querySelector("#nl-email");
      if (!name.value.trim() || name.value.trim().length < 2) {
        name.focus();
        return;
      }
      if (!isValidEmail(email.value.trim())) {
        email.focus();
        return;
      }
      nlForm.reset();
      showSuccess(nlForm, "Thanks for subscribing! Check your inbox for a welcome email.");
    });
  }

  // Training programs form
  const tpForm = document.querySelector('form[action="#"][method="post"]:has(#tp-email)');
  if (tpForm) {
    tpForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = tpForm.querySelector("#tp-name");
      const email = tpForm.querySelector("#tp-email");
      const program = tpForm.querySelector("#tp-program");
      if (!name.value.trim() || name.value.trim().length < 2) { name.focus(); return; }
      if (!isValidEmail(email.value.trim())) { email.focus(); return; }
      if (!program.value) { program.focus(); return; }
      tpForm.reset();
      showSuccess(tpForm, "You're enrolled! We'll email cohort details shortly.");
    });
  }

  // Contact & Book forms
  const contactForm = document.querySelector('form[action="#"][method="post"]:has(#c-email)');
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = contactForm.querySelector("#c-name");
      const email = contactForm.querySelector("#c-email");
      const msg = contactForm.querySelector("#c-msg");
      if (!name.value.trim() || name.value.trim().length < 2) { name.focus(); return; }
      if (!isValidEmail(email.value.trim())) { email.focus(); return; }
      if (!msg.value.trim()) { msg.focus(); return; }
      contactForm.reset();
      showSuccess(contactForm, "Message sent! We'll get back to you soon.");
    });
  }

  const bookForm = document.querySelector('form[action="#"][method="post"]:has(#b-email)');
  if (bookForm) {
    bookForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = bookForm.querySelector("#b-name");
      const email = bookForm.querySelector("#b-email");
      if (!name.value.trim() || name.value.trim().length < 2) { name.focus(); return; }
      if (!isValidEmail(email.value.trim())) { email.focus(); return; }
      bookForm.reset();
      showSuccess(bookForm, "Thanks! Our team will reach out to confirm your consultation.");
    });
  }
})();

/* ===== Carbon Footprint Calculator (very simple illustrative model) ===== */
(function(){
  const form = document.getElementById('calc-form');
  if(!form) return;
  const out = document.getElementById('calc-output');
  const number = (id)=> parseFloat((form.querySelector('#'+id)?.value||'0').replace(/,/g,'')) || 0;

  function fmt(n){ return new Intl.NumberFormat().format(Math.round(n)); }

  form.addEventListener('input', compute);
  form.addEventListener('submit', (e)=>{ e.preventDefault(); compute(); });

  function compute(){
    const household = Math.max(1, number('hh'));
    const elec_kwh = number('kwh');        // monthly kWh
    const gas_therms = number('therms');   // monthly therms
    const car_km = number('car');          // monthly km
    const flights = number('flights');     // short-haul flights / year

    // Extremely simplified factors (illustrative only):
    const EF_ELEC = 0.0004;    // tCO2e per kWh (depends on grid)
    const EF_GAS  = 0.0053;    // tCO2e per therm
    const EF_CAR  = 0.000192;  // tCO2e per km (~192 g/km)
    const EF_FLT  = 0.25;      // tCO2e per short-haul flight

    const monthly_t = (elec_kwh*EF_ELEC) + (gas_therms*EF_GAS) + (car_km*EF_CAR);
    const annual_t = (monthly_t * 12) + (flights * EF_FLT);
    const per_capita = annual_t / household;

    out.innerHTML = `
      <div class="calc-result">
        <div class="big">${per_capita.toFixed(2)} tCO₂e</div>
        <div class="muted">per person / year (est.)</div>
        <div style="margin-top:8px">Household total: <strong>${annual_t.toFixed(2)}</strong> tCO₂e / year</div>
        <ul style="margin:10px 0 0 18px; color:var(--muted)">
          <li>Electricity: ${fmt(elec_kwh*EF_ELEC*12)} kgCO₂e/yr</li>
          <li>Gas: ${fmt(gas_therms*EF_GAS*12)} kgCO₂e/yr</li>
          <li>Driving: ${fmt(car_km*EF_CAR*12)} kgCO₂e/yr</li>
          <li>Flights: ${fmt(flights*EF_FLT*1000)} kgCO₂e/yr</li>
        </ul>
      </div>`;
  }

  compute();
})();



/* === Active nav highlight (auto-apply aria-current) === */
(function () {
  try {
    var file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    document.querySelectorAll('nav a, .mobile-nav a, .header-cta .link').forEach(function(a){
      var href = (a.getAttribute('href') || '').split('#')[0].toLowerCase();
      if(!href) return;
      var match = (href === file) || (file === '' && href === 'index.html');
      if (match) { a.setAttribute('aria-current','page'); }
      else { a.removeAttribute('aria-current'); }
    });
  } catch(e) {}
})();

