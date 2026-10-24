/**
 * GridPulse — Standalone Login Page Logic
 * Handles credential validation, password show/hide toggle,
 * OAuth placeholders, and direct redirection to the Live Operational Dashboard.
 */

document.addEventListener("DOMContentLoaded", () => {
  const toast = document.getElementById("toast");
  let toastTimer;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
  }

  const loginForm = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const togglePasswordBtn = document.getElementById("togglePassword");
  const formMessage = document.getElementById("formMessage");
  const submitBtn = document.getElementById("submitBtn");

  function showFormMessage(text, isError = false) {
    if (!formMessage) return;
    formMessage.textContent = text;
    formMessage.classList.toggle("error", isError);
  }

  // Toggle password visibility
  if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener("click", () => {
      const isPassword = passwordInput.type === "password";
      passwordInput.type = isPassword ? "text" : "password";
      togglePasswordBtn.setAttribute("aria-label", isPassword ? "Hide password" : "Show password");
      togglePasswordBtn.style.color = isPassword ? "#087f80" : "#687a85";
    });
  }

  // Handle Login submission
  if (loginForm && emailInput && passwordInput) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();
      const password = passwordInput.value;

      if (!email || !emailInput.checkValidity()) {
        showFormMessage("Please enter a valid email address.", true);
        showToast("Please enter a valid email address.");
        emailInput.focus();
        return;
      }

      if (password.length < 6) {
        showFormMessage("Password must contain at least 6 characters.", true);
        showToast("Password must be at least 6 characters.");
        passwordInput.focus();
        return;
      }

      // Successful demo authentication
      showFormMessage("Authentication successful! Redirecting to dashboard...", false);
      showToast("Verified! Opening GridPulse Live Operations Dashboard...");
      
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Entering Dashboard...</span> <span class="arrow">⌛</span>';
        submitBtn.style.opacity = "0.85";
      }

      setTimeout(() => {
        window.location.href = "Dashboard/dashboard.html";
      }, 750);
    });
  }

  // Forgot password
  const forgotPasswordBtn = document.getElementById("forgotPassword");
  if (forgotPasswordBtn && emailInput) {
    forgotPasswordBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();
      if (email && emailInput.checkValidity()) {
        showFormMessage(`Password reset link dispatched to ${email}.`, false);
        showToast(`Reset email sent to ${email}`);
      } else {
        showFormMessage("Enter your email address above to receive a reset link.", true);
        emailInput.focus();
      }
    });
  }

  // Social login buttons
  const googleLoginBtn = document.getElementById("googleLogin");
  if (googleLoginBtn) {
    googleLoginBtn.addEventListener("click", () => {
      showToast("Signing in with Google Workspace credentials...");
      showFormMessage("Connecting to Google identity provider...", false);
      setTimeout(() => {
        window.location.href = "Dashboard/dashboard.html";
      }, 900);
    });
  }

  const microsoftLoginBtn = document.getElementById("microsoftLogin");
  if (microsoftLoginBtn) {
    microsoftLoginBtn.addEventListener("click", () => {
      showToast("Signing in with Microsoft Entra ID...");
      showFormMessage("Connecting to Microsoft Entra ID...", false);
      setTimeout(() => {
        window.location.href = "Dashboard/dashboard.html";
      }, 900);
    });
  }

  // Request Access
  const signupLink = document.getElementById("signupLink");
  if (signupLink) {
    signupLink.addEventListener("click", (e) => {
      e.preventDefault();
      showToast("Access request submitted. An operations admin will review your profile.");
      showFormMessage("Contacting GridPulse administrator for provisioning...", false);
    });
  }
});
