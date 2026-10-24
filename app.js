/**
 * GridPulse — Unified Application Logic
 * Integrates all section interactions, smooth navigation, scrollspy, and form handlers.
 */

document.addEventListener("DOMContentLoaded", () => {
  // --------------------------------------------------------------------------
  // Global Toast System
  // --------------------------------------------------------------------------
  const toast = document.getElementById("toast");
  let toastTimer;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
  }

  // --------------------------------------------------------------------------
  // Global Navbar: Mobile Menu, Scrollspy, and Scroll Effects
  // --------------------------------------------------------------------------
  const navbar = document.getElementById("mainNavbar");
  const menuButton = document.getElementById("menuButton");
  const navLinks = document.getElementById("navLinks");
  const navItems = document.querySelectorAll(".nav-links a");

  // Toggle mobile navigation menu
  if (menuButton && navLinks) {
    menuButton.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
    });
  }

  // Smooth scroll and active state on click
  navItems.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      if (targetId && targetId.startsWith("#")) {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          event.preventDefault();
          targetElement.scrollIntoView({ behavior: "smooth" });
        }
      }
      navItems.forEach((item) => item.classList.remove("active"));
      link.classList.add("active");
      if (window.innerWidth <= 850 && navLinks) {
        navLinks.classList.remove("open");
        if (menuButton) menuButton.setAttribute("aria-expanded", "false");
      }
    });
  });

  // Dynamic Scrollspy & Navbar elevation on scroll
  const sections = [
    { id: "home", link: document.querySelector('.nav-links a[href="#home"]') },
    { id: "about", link: document.querySelector('.nav-links a[href="#about"]') },
    { id: "how", link: document.querySelector('.nav-links a[href="#how"]') },
    { id: "capabilities", link: document.querySelector('.nav-links a[href="#capabilities"]') },
    { id: "impact", link: document.querySelector('.nav-links a[href="#impact"]') },
    { id: "contact", link: document.querySelector('.nav-links a[href="#contact"]') },
  ];

  window.addEventListener(
    "scroll",
    () => {
      const scrollPos = window.scrollY + 120;

      // Add elevated background styling when scrolled
      if (navbar) {
        if (window.scrollY > 40) {
          navbar.classList.add("scrolled");
        } else {
          navbar.classList.remove("scrolled");
        }
      }

      // Determine currently visible section
      for (let i = sections.length - 1; i >= 0; i--) {
        const sectionEl = document.getElementById(sections[i].id);
        if (sectionEl) {
          const top = sectionEl.offsetTop;
          if (scrollPos >= top) {
            navItems.forEach((item) => item.classList.remove("active"));
            if (sections[i].link) {
              sections[i].link.classList.add("active");
            }
            break;
          }
        }
      }
    },
    { passive: true }
  );

  // --------------------------------------------------------------------------
  // Section 01: Hero Interactions (G1)
  // --------------------------------------------------------------------------
  const primaryCta = document.querySelector(".primary-cta");
  if (primaryCta) {
    primaryCta.addEventListener("click", (event) => {
      event.preventDefault();
      const aboutSection = document.getElementById("about");
      if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: "smooth" });
      }
      showToast("Welcome to GridPulse. Explore the signals protecting the grid.");
    });
  }

  // --------------------------------------------------------------------------
  // Section 02: About & Problem Interactions (G2)
  // --------------------------------------------------------------------------
  const problemCards = document.querySelectorAll(".problem-card");
  problemCards.forEach((card) => {
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    const titleEl = card.querySelector("h2");
    const title = titleEl ? titleEl.textContent.trim() : "Problem";
    card.setAttribute("aria-label", `${title}: show details`);

    const showDetails = () => {
      showToast(`${title} — GridPulse brings telemetry and risk signals into a coordinated response.`);
    };

    card.addEventListener("click", showDetails);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        showDetails();
      }
    });
  });

  // --------------------------------------------------------------------------
  // Section 03: How It Works Interactions (G3)
  // --------------------------------------------------------------------------
  const actionButton = document.querySelector(".action-button");
  if (actionButton) {
    actionButton.addEventListener("click", (event) => {
      event.preventDefault();
      const stepsSection = document.getElementById("steps");
      if (stepsSection) {
        stepsSection.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      showToast("Explore the four steps of the GridPulse workflow.");
    });
  }

  const stepCards = document.querySelectorAll(".step-card");
  stepCards.forEach((card) => {
    const detail = card.dataset.detail || "Step details.";
    const button = card.querySelector("button");

    const openDetail = () => showToast(detail);

    if (button) {
      button.addEventListener("click", (e) => {
        e.stopPropagation();
        openDetail();
      });
    }

    card.addEventListener("click", openDetail);
    card.addEventListener("keydown", (event) => {
      if ((event.key === "Enter" || event.key === " ") && (event.target === card || event.target === button)) {
        event.preventDefault();
        openDetail();
      }
    });
  });

  // --------------------------------------------------------------------------
  // Section 04: Capabilities & Applications Carousel (G4)
  // --------------------------------------------------------------------------
  const openAppButtons = document.querySelectorAll(".open-application");
  openAppButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const title = button.dataset.title || "Application";
      const detail = button.dataset.detail || "";
      showToast(`${title}: ${detail}`);
    });
  });

  const appTrack = document.getElementById("applicationTrack");
  const nextAppBtn = document.getElementById("nextApplications");
  const prevAppBtn = document.getElementById("prevApplications");

  if (appTrack && nextAppBtn && prevAppBtn) {
    nextAppBtn.addEventListener("click", () => {
      appTrack.scrollBy({ left: Math.max(260, appTrack.clientWidth * 0.55), behavior: "smooth" });
    });
    prevAppBtn.addEventListener("click", () => {
      appTrack.scrollBy({ left: -Math.max(260, appTrack.clientWidth * 0.55), behavior: "smooth" });
    });

    if (window.matchMedia("(max-width: 850px)").matches) {
      appTrack.style.overflowX = "auto";
      appTrack.style.scrollSnapType = "x mandatory";
      appTrack.querySelectorAll(".application-card").forEach((card) => {
        card.style.scrollSnapAlign = "start";
      });
    }
  }

  // --------------------------------------------------------------------------
  // Section 05 & Footer: Impact & Settings Interactions (G5)
  // --------------------------------------------------------------------------
  const cookieSettingsBtn = document.getElementById("cookieSettings");
  if (cookieSettingsBtn) {
    cookieSettingsBtn.addEventListener("click", () => {
      showToast("Cookie preferences can be configured when your privacy settings are connected.");
    });
  }

  document.querySelectorAll(".footer a[href^='#']").forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = link.getAttribute("href");
      if (target && !document.querySelector(target)) {
        event.preventDefault();
        showToast(`${link.textContent.trim()} page link — connect this destination to your site.`);
      }
    });
  });

  // --------------------------------------------------------------------------
  // Section 06: Login Portal Interactions (G6)
  // --------------------------------------------------------------------------
  const loginNavBtn = document.getElementById("loginButton");
  const loginSection = document.getElementById("login");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const formMessage = document.getElementById("formMessage");
  const togglePasswordBtn = document.getElementById("togglePassword");
  const loginForm = document.getElementById("loginForm");
  const backLink = document.getElementById("backLink");

  // Scroll to login section & focus email input
  if (loginNavBtn && loginSection) {
    loginNavBtn.addEventListener("click", (event) => {
      event.preventDefault();
      loginSection.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => {
        if (emailInput) emailInput.focus();
      }, 600);
      showToast("Welcome to the GridPulse login portal.");
    });
  }

  // Smooth scroll back to top from login
  if (backLink) {
    backLink.addEventListener("click", (event) => {
      event.preventDefault();
      const homeSection = document.getElementById("home");
      if (homeSection) {
        homeSection.scrollIntoView({ behavior: "smooth" });
      }
      showToast("Returned to GridPulse overview.");
    });
  }

  function showFormMessage(text, isError = false) {
    if (!formMessage) return;
    formMessage.textContent = text;
    formMessage.classList.toggle("error", isError);
  }

  // Password visibility toggle
  if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener("click", () => {
      const showing = passwordInput.type === "text";
      passwordInput.type = showing ? "password" : "text";
      togglePasswordBtn.setAttribute("aria-label", showing ? "Show password" : "Hide password");
    });
  }

  // Login form submit validation
  if (loginForm && emailInput && passwordInput) {
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const email = emailInput.value.trim();
      const password = passwordInput.value;

      if (!email || !emailInput.checkValidity()) {
        showFormMessage("Please enter a valid email address.", true);
        emailInput.focus();
        return;
      }
      if (password.length < 6) {
        showFormMessage("Password must contain at least 6 characters.", true);
        passwordInput.focus();
        return;
      }

      showFormMessage("Form validated. Connect your backend authentication API to sign in.");
      showToast("Login validated. Backend authentication hook ready.");
    });
  }

  // Forgot password handler
  const forgotPasswordBtn = document.getElementById("forgotPassword");
  if (forgotPasswordBtn && emailInput) {
    forgotPasswordBtn.addEventListener("click", (event) => {
      event.preventDefault();
      const email = emailInput.value.trim();
      if (email && emailInput.checkValidity()) {
        showFormMessage(`Password reset can be requested for ${email} once a reset service is connected.`);
      } else {
        showFormMessage("Enter your email address first, then choose Forgot password.", true);
        emailInput.focus();
      }
    });
  }

  // OAuth buttons
  const googleLoginBtn = document.getElementById("googleLogin");
  if (googleLoginBtn) {
    googleLoginBtn.addEventListener("click", () => {
      showFormMessage("Google sign-in requires Google OAuth configuration.");
    });
  }

  const microsoftLoginBtn = document.getElementById("microsoftLogin");
  if (microsoftLoginBtn) {
    microsoftLoginBtn.addEventListener("click", () => {
      showFormMessage("Microsoft sign-in requires Microsoft identity configuration.");
    });
  }

  const signupLink = document.getElementById("signupLink");
  if (signupLink) {
    signupLink.addEventListener("click", (event) => {
      event.preventDefault();
      showFormMessage("Connect this link to your account registration page.");
    });
  }
});
