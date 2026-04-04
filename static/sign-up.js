function validateName() {
  const nameInput = document.querySelector('input[name="name"]');
  const invalidName = document.querySelector("#invalidName");
  const nameRegex = /^[a-zA-Z ]{3,20}$/;

  if (nameRegex.test(nameInput.value)) {
    invalidName.textContent = "";
    nameInput.classList.remove("invalid");
  } else {
    invalidName.textContent =
      "\u2757 Name must be between 3 - 20 alphabetic characters";
    nameInput.classList.add("invalid");
  }
}

function validateEmail() {
  const emailInput = document.querySelector('input[name="email"]');
  const invalidEmail = document.querySelector("#invalidEmail");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (emailRegex.test(emailInput.value)) {
    invalidEmail.textContent = "";
    emailInput.classList.remove("invalid");
  } else {
    invalidEmail.textContent = "\u2757 Please provide a valid Email";
    emailInput.classList.add("invalid");
  }
}

function validatePassword() {
  const passwordInput = document.querySelector('input[name="password"]');
  const invalidPassword = document.querySelector("#invalidPassword");
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;

  if (passwordRegex.test(passwordInput.value)) {
    invalidPassword.textContent = "";
    passwordInput.classList.remove("invalid");
  } else {
    invalidPassword.textContent =
      "\u2757 Password must include at least one uppercase letter, one lowercase letter, and one special character.";
    passwordInput.classList.add("invalid");
  }
}

function validateConfirmPassword() {
  const passwordInput = document.querySelector('input[name="password"]');
  const confirmPasswordInput = document.querySelector(
    'input[name="confirmPassword"]'
  );
  const confirmPasswordError = document.querySelector("#confirmPasswordError");

  if (passwordInput.value === confirmPasswordInput.value) {
    confirmPasswordError.textContent = "";
    confirmPasswordInput.classList.remove("invalid");
  } else {
    confirmPasswordError.textContent = "\u2757 Passwords do not match.";
    confirmPasswordInput.classList.add("invalid");
  }
}

function validateForm() {
  const nameInput = document.querySelector('input[name="name"]');
  const emailInput = document.querySelector('input[name="email"]');
  const passwordInput = document.querySelector('input[name="password"]');
  const confirmPasswordInput = document.querySelector(
    'input[name="confirmPassword"]'
  );
  const createAccountBtn = document.querySelector('input[type="submit"]');
  createAccountBtn.disabled = true;

  if (
    nameInput.classList.contains("invalid") ||
    emailInput.classList.contains("invalid") ||
    passwordInput.classList.contains("invalid") ||
    confirmPasswordInput.classList.contains("invalid")
  ) {
    createAccountBtn.disabled = true;
    createAccountBtn.style.backgroundColor = "grey";
  } else {
    createAccountBtn.disabled = false;
    createAccountBtn.style.backgroundColor = "rgb(0, 255, 106)";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");

  form.addEventListener("input", (event) => {
    const target = event.target;
    if (target.name === "name") {
      validateName();
    } else if (target.name === "email") {
      validateEmail();
    } else if (target.name === "password") {
      validatePassword();
    } else if (target.name === "confirmPassword") {
      validateConfirmPassword();
    }
    validateForm();
  });
});