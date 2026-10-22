(function () {
  const header = document.querySelector(".site-header");
  if (header) {
    requestAnimationFrame(() => header.classList.remove("is-entering"));

    const onScroll = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!reduceMotion && "IntersectionObserver" in window) {
    const revealTargets = document.querySelectorAll("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" }
    );
    revealTargets.forEach((el) => observer.observe(el));
  } else {
    document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-visible"));
  }

  const timelineTrack = document.querySelector("[data-timeline]");
  if (timelineTrack) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      timelineTrack.classList.add("is-visible");
    } else {
      const timelineObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              timelineObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 }
      );
      timelineObserver.observe(timelineTrack);
    }
  }

  const carousels = document.querySelectorAll("[data-carousel]");
  carousels.forEach((carousel) => {
    const track = carousel.querySelector("[data-carousel-track]");
    const prev = carousel.querySelector("[data-carousel-prev]");
    const next = carousel.querySelector("[data-carousel-next]");
    if (!track) return;
    const scrollByCard = (direction) => {
      const card = track.querySelector("[data-carousel-item]");
      const distance = card ? card.getBoundingClientRect().width + 20 : 300;
      track.scrollBy({ left: direction * distance, behavior: reduceMotion ? "auto" : "smooth" });
    };
    prev?.addEventListener("click", () => scrollByCard(-1));
    next?.addEventListener("click", () => scrollByCard(1));
  });

  const calculator = document.querySelector("[data-roi-calculator]");
  if (calculator) {
    const liftButtons = calculator.querySelectorAll("[data-lift]");
    const customLiftField = calculator.querySelector("[data-lift-custom-field]");
    const serviceSelect = calculator.querySelector("[data-roi-service]");
    const outputs = {};
    calculator.querySelectorAll("[data-roi-output]").forEach((el) => {
      outputs[el.dataset.roiOutput] = el;
    });

    let currentLift = 0.05;

    const formatCurrency = (value) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(Number.isFinite(value) ? value : 0);

    const getValue = (name, fallback = 0) => {
      const el = calculator.querySelector(`[data-roi-input="${name}"]`);
      if (!el) return fallback;
      const value = parseFloat(el.value);
      return Number.isFinite(value) ? value : fallback;
    };

    function recalculate() {
      const conversionRate = getValue("conversionRate") / 100;
      const aov = getValue("aov");
      const sessions = getValue("sessions");
      const servicePrice = serviceSelect ? parseFloat(serviceSelect.value) || 0 : 0;

      const annualRevenue = conversionRate * aov * sessions * 12;
      const newConversion = conversionRate * (1 + currentLift);
      const newAnnualRevenue = newConversion * aov * sessions * 12;
      const increase = newAnnualRevenue - annualRevenue;
      const netRevenue = increase - servicePrice;

      if (outputs.annualRevenue) outputs.annualRevenue.textContent = formatCurrency(annualRevenue);
      if (outputs.newAnnualRevenue) outputs.newAnnualRevenue.textContent = formatCurrency(newAnnualRevenue);
      if (outputs.increase) outputs.increase.textContent = formatCurrency(increase);
      if (outputs.serviceCost) outputs.serviceCost.textContent = formatCurrency(servicePrice);
      if (outputs.netRevenue) outputs.netRevenue.textContent = formatCurrency(netRevenue);
    }

    calculator.querySelectorAll("[data-roi-input]").forEach((input) => {
      input.addEventListener("input", recalculate);
    });
    serviceSelect?.addEventListener("change", recalculate);

    liftButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        liftButtons.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        if (btn.dataset.lift === "custom") {
          if (customLiftField) customLiftField.style.display = "";
          currentLift = getValue("customLift", 15) / 100;
        } else {
          if (customLiftField) customLiftField.style.display = "none";
          currentLift = parseFloat(btn.dataset.lift);
        }
        recalculate();
      });
    });

    calculator.querySelector('[data-roi-input="customLift"]')?.addEventListener("input", () => {
      currentLift = getValue("customLift", 15) / 100;
      recalculate();
    });

    calculator.querySelectorAll("[data-store-type]").forEach((btn) => {
      btn.addEventListener("click", () => {
        calculator.querySelectorAll("[data-store-type]").forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
      });
    });

    recalculate();
  }

  const newsletterForm = document.querySelector("[data-newsletter-form]");
  if (newsletterForm) {
    const status = newsletterForm.parentElement.querySelector("[data-newsletter-status]");
    newsletterForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(newsletterForm);
      const submitBtn = newsletterForm.querySelector("button[type=submit]");
      submitBtn.disabled = true;
      status.textContent = "";
      status.classList.remove("is-error", "is-success");

      try {
        const res = await fetch(newsletterForm.action, {
          method: "POST",
          body: formData,
          headers: { "X-Requested-With": "XMLHttpRequest" },
        });
        const data = await res.json();
        if (data.ok) {
          status.textContent = "Merci — vérifie ta boîte mail.";
          status.classList.add("is-success");
          newsletterForm.reset();
        } else {
          status.textContent = data.error || "Une erreur est survenue.";
          status.classList.add("is-error");
        }
      } catch {
        status.textContent = "Erreur réseau — réessaie.";
        status.classList.add("is-error");
      } finally {
        submitBtn.disabled = false;
      }
    });
  }
})();
