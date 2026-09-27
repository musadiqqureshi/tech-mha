/* ==========================================================================
   TechMHA — Site interactions
   Vanilla JS only. Progressive enhancement: all content/links work with
   JS disabled; this file adds motion, mobile nav, and form UX.
   ========================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Mobile nav ---- */
  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var menu = document.querySelector(".mobile-menu");
    if (!toggle || !menu) return;

    toggle.addEventListener("click", function () {
      var expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      menu.classList.toggle("open", !expanded);
      document.body.style.overflow = !expanded ? "hidden" : "";
    });

    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        toggle.setAttribute("aria-expanded", "false");
        menu.classList.remove("open");
        document.body.style.overflow = "";
      });
    });

    // Close on escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("open")) {
        toggle.setAttribute("aria-expanded", "false");
        menu.classList.remove("open");
        document.body.style.overflow = "";
        toggle.focus();
      }
    });
  }

  /* ---- Sticky navbar background on scroll ---- */
  function initNavbarScroll() {
    var navbar = document.querySelector(".navbar");
    if (!navbar) return;
    var onScroll = function () {
      navbar.classList.toggle("scrolled", window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- Mark active nav link ---- */
  function markActiveLink() {
    var path = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-links a, .mobile-menu a").forEach(function (a) {
      var href = a.getAttribute("href");
      if (href === path || (path === "" && href === "index.html")) {
        a.classList.add("active");
      }
    });
  }

  /* ---- Scroll reveal via IntersectionObserver ---- */
  function initReveal() {
    var targets = document.querySelectorAll(".reveal, .reveal-stagger");
    if (!targets.length) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      targets.forEach(function (t) { t.classList.add("in-view"); });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    targets.forEach(function (t) { observer.observe(t); });
  }

  /* ---- Animated counters ---- */
  function initCounters() {
    var counters = document.querySelectorAll("[data-counter]");
    if (!counters.length) return;

    function animate(el) {
      var target = parseFloat(el.getAttribute("data-counter"));
      var suffix = el.getAttribute("data-suffix") || "";
      if (reduceMotion || isNaN(target)) {
        el.textContent = target + suffix;
        return;
      }
      var duration = 1200;
      var start = null;

      function step(ts) {
        if (start === null) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var value = Math.round(eased * target);
        el.textContent = value + suffix;
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    if (!("IntersectionObserver" in window)) {
      counters.forEach(animate);
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animate(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach(function (c) { observer.observe(c); });
  }

  /* ---- Contact form ---- */
  function initContactForm() {
    var form = document.getElementById("contact-form");
    if (!form) return;

    var status = form.querySelector(".form-status");

    function showError(fieldWrap, message) {
      fieldWrap.classList.add("invalid");
      var err = fieldWrap.querySelector(".field-error");
      if (err) err.textContent = message;
    }
    function clearError(fieldWrap) {
      fieldWrap.classList.remove("invalid");
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;

      var name = form.querySelector("#name");
      var email = form.querySelector("#email");
      var message = form.querySelector("#message");

      [name, email, message].forEach(function (input) {
        if (input) clearError(input.closest(".field"));
      });

      if (!name.value.trim()) {
        showError(name.closest(".field"), "Please enter your name.");
        valid = false;
      }
      var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.value.trim() || !emailPattern.test(email.value.trim())) {
        showError(email.closest(".field"), "Please enter a valid email address.");
        valid = false;
      }
      if (!message.value.trim() || message.value.trim().length < 10) {
        showError(message.closest(".field"), "Please add a short message (10+ characters).");
        valid = false;
      }

      if (!valid) {
        if (status) {
          status.textContent = "Please fix the highlighted fields.";
          status.className = "form-status show error";
        }
        return;
      }

      // No backend is wired up yet: open a pre-filled email as a reliable
      // fallback so messages are never silently lost. See README for how
      // to swap this for a hosted form service or a Vercel serverless
      // function that sends email.
      var subject = encodeURIComponent("New inquiry from " + name.value.trim());
      var bodyLines = [
        "Name: " + name.value.trim(),
        "Email: " + email.value.trim(),
        form.querySelector("#company") && form.querySelector("#company").value.trim()
          ? "Company: " + form.querySelector("#company").value.trim()
          : null,
        "",
        message.value.trim()
      ].filter(Boolean);
      var body = encodeURIComponent(bodyLines.join("\n"));
      var mailto = "mailto:hassan.ajmal123@gmail.com?subject=" + subject + "&body=" + body;

      window.location.href = mailto;

      if (status) {
        status.textContent = "Opening your email client to send this message to hassan.ajmal123@gmail.com…";
        status.className = "form-status show success";
      }
      form.reset();
    });
  }

  /* ---- Footer year ---- */
  function setYear() {
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initNavbarScroll();
    markActiveLink();
    initReveal();
    initCounters();
    initContactForm();
    setYear();
  });
})();
