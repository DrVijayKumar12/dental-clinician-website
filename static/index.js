// Get the modal
var modal = document.getElementById("registration-modal");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on <span> (x), close the modal
if (span) {
  span.onclick = function () {
    modal.style.display = "none";
  };
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

//LOGIN CHECK POP UP
var loginModal = document.getElementById("login-modal");
var loginSpan = document.getElementsByClassName("login-close")[0];

if (loginSpan) {
  loginSpan.onclick = function () {
    loginModal.style.display = "none";
  };
}
window.addEventListener("click", function (event) {
  if (event.target == loginModal) {
    loginModal.style.display = "none";
  }
});

// Avatar Selection

const avatarOptions = document.querySelectorAll(".avatar-option");
const avatarInput = document.getElementById("avatar-input");

avatarOptions.forEach((option) => {
  option.addEventListener("click", () => {
    // remove the "selected" class from all options
    avatarOptions.forEach((option) => option.classList.remove("selected"));
    // add the "selected" class to the clicked option
    option.classList.add("selected");
    // set the value of the hidden input field to the URL of the selected option
    avatarInput.value = option.src;
  });
});

function toggleSidePanel() {
  var navbarMobile = document.querySelector(".navbar-mobile");
  navbarMobile.classList.toggle("active");
}


// Search Box Function
fetch("../static/chapters_database.json")
  .then((response) => response.json())
  .then((jsonData) => {
    chaptersData = jsonData; // Assign the fetched JSON data to the global data variable
  })
  .catch((error) => {
    console.error("Error loading JSON data:", error);
  });

window.onclick = function (event) {
  inputBox.value = ""; // Clear the input box when clicked anywhere on screen
  resultBox.innerHTML = "";
};
const inputBox = document.querySelector("#search-input-box");
const resultBox = document.querySelector(".search-result-box");
inputBox.onkeyup = function () {
  let result = [];
  let input = inputBox.value;
  if (input.length) {
    result = chaptersData.filter((chapter) => {
      return chapter.chapter_id.toLowerCase().includes(input.toLowerCase());
    });
  }
  display(result);
};
function display(result) {
  resultBox.innerHTML = "";
  result.forEach((chapter) => {
    const div = document.createElement("div");
    const chapterName = chapter.chapter_id.replace(/_/g, " ");
    div.innerHTML = `<a href="${chapter.chapter_url}">${chapterName}</a>`;
    resultBox.appendChild(div);
  });
}


// Logout Button Function
const logoutBtn = document.querySelector("#logout-btn");
logoutBtn.addEventListener("click", () => {
  fetch("/my-profile/logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (response.ok) {
        window.location.href = "/"; // Redirect to the home page after logging out
      } else {
        console.log("Logout failed");
      }
    })
    .catch((error) => {
      console.log(error.message);
    });
});