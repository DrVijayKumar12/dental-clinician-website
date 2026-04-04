const startButton = document.getElementById("start-btn");
const nameInput = document.getElementById("name");
const ageInput = document.getElementById("age");
const genderInputs = document.querySelectorAll("input[name='gender']");
const consentCheckbox = document.getElementById("consent");
const consentContainer = document.getElementById("consent-container");

startButton.addEventListener("click", (event) => {
  event.preventDefault();
  let selectedGenderValue = "";
  for (const genderInput of genderInputs) {
    if (genderInput.checked) {
      selectedGenderValue = genderInput.value;
      break;
    }
  }
  if (
    nameInput.value === "" ||
    ageInput.value === "" ||
    selectedGenderValue === ""
  ) {
    alert("Please fill in all personal details.");
    return;
  }

  if (!consentCheckbox.checked) {
    alert("Please provide consent to continue.");
    return;
  }

  // Add user details as query parameters to the URL
  const url = new URL("/dr-molar_ai/analyser", window.location.origin);
  url.searchParams.append("name", nameInput.value);
  url.searchParams.append("age", ageInput.value);
  url.searchParams.append("gender", selectedGenderValue);

  // Navigate to the next page with query parameters
  window.location.href = url.toString();
});

function toggleProgressPanel() {
  const desktopSideBar = document.querySelector("#sidebar");
  const mobileProgressMenu = document.querySelector(".mobile-progress-menu");
  const progressToggleBtn = document.querySelector("#progress-toggle-btn");

  if (mobileProgressMenu.style.visibility === "hidden") {
    // Mobile sidebar is currently hidden, so show it and hide desktop sidebar
    mobileProgressMenu.style.visibility= 'visible';
    desktopSideBar.style.transform = 'translateX(-100%)';
    progressToggleBtn.classList.remove("progress-toggle-btn-flipped");
  } else {
    // Mobile sidebar is currently shown, so hide it and show desktop sidebar
    mobileProgressMenu.style.visibility = 'hidden';
    desktopSideBar.style.transform = 'translateX(0%)';
    progressToggleBtn.classList.add("progress-toggle-btn-flipped");
  }
}
