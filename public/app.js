

async function submitForm(formId, endpoint, statusId) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const status = document.getElementById(statusId);
    const button = form.querySelector('button[type="submit"]');
    const originalText = button.textContent;

    button.disabled = true;
    button.textContent = "Please wait...";
    status.textContent = "";

    try {
      const data = Object.fromEntries(new FormData(form));

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      status.textContent = result.message;
      status.style.color = response.ok ? "#328568" : "#c75d70";

      if (response.ok && result.redirect) {
        window.location.href = result.redirect;
      } else if (response.ok) {
        form.reset();
      }

    } catch (error) {
      status.textContent = "Something went wrong. Please try again.";
      status.style.color = "#c75d70";
    } finally {
      button.disabled = false;
      button.textContent = originalText;
    }
  });
}

submitForm("loginForm", "/api/login", "loginStatus");

submitForm("registerForm", "/api/register", "registerStatus");

submitForm("contactForm", "/api/contact", "contactStatus");
