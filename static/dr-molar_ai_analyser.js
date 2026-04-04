const molarAiContainer = document.getElementById("molar-ai-container");
const personalDetailsConsent = document.getElementById(
  "personal-details-consent"
);
const progressChiefComplaint = document.getElementById(
  "progress-chief-complaint"
);
const progressMedicalHistory = document.getElementById(
  "progress-medical-history"
);
const progressAllergyHistory = document.getElementById(
  "progress-allergy-history"
);
const progressDentalHistory = document.getElementById(
  "progress-dental-history"
);
const progressPersonalHistory = document.getElementById(
  "progress-personal-history"
);
const progressHopi = document.getElementById("progress-hopi");
const progressClinicalFeatures = document.getElementById(
  "progress-clinical-features"
);

const questionSection = document.getElementById("question-section");
const aiSkeletonLoading = document.getElementById("ai-skeleton-loading");
const questionContainer = document.querySelector(".question");
const questionTitle = document.getElementById("question-title");
const questionSubTitle = document.getElementById("question-subtitle");
const questionImage = document.getElementById("question-image");
const optionsContainer = document.querySelector(".options-container");
const nextButton = document.getElementById("next-btn");
const opdReceiptContainer = document.getElementById("opd-receipt-container");
const loadingOverlay = document.getElementById("loading-overlay");
const downloadPdfBtn = document.getElementById("download-pdf-btn");
const pdfContainer = document.getElementById("pdf-container");
const pdfFileName = document.querySelector(".pdf-file-name");
const diagnosisLoadingImg = document.getElementById("diagnosis-loading-img");
const diagnosisLoadingPd = document.getElementById("diagnosis-loading-pd");
const relatedVideoFrame = document.querySelector(".related-video-section iframe");

let currentQuestion = 0;
let userContext = {}; // Store user's context (answered options)
let data;
progressHopi.innerHTML = "";
progressClinicalFeatures.innerHTML = "";
const urlParams = new URLSearchParams(window.location.search);
let username = urlParams.get("name");
const userage = urlParams.get("age");
const usergender = urlParams.get("gender");
if (usergender === "Female") {
  username = "Ms. " + username;
} else if (usergender === "Male") username = "Mr. " + username;

const desktopSideBar = document.querySelector("#sidebar");
const mobileProgressMenu = document.querySelector(".mobile-progress-menu");
// FOR PROGRESS SIDE BAR IN MOBILE
function toggleProgressPanel() {
  const progressToggleBtn = document.querySelector("#progress-toggle-btn");
  if (mobileProgressMenu.style.visibility === "hidden") {
    // Mobile sidebar is currently hidden, so show it and hide desktop sidebar
    mobileProgressMenu.style.visibility = "visible";
    desktopSideBar.style.transform = "translateX(-100%)";
    progressToggleBtn.classList.remove("progress-toggle-btn-flipped");
  } else {
    // Mobile sidebar is currently shown, so hide it and show desktop sidebar
    mobileProgressMenu.style.visibility = "hidden";
    desktopSideBar.style.transform = "translateX(0%)";
    progressToggleBtn.classList.add("progress-toggle-btn-flipped");
  }
}

const CATEGORIES = {
  QUESTIONS: "questions",
  CHIEF_COMPLAINTS: "chief_complaints",
  LOCATIONS: "locations",
  DURATIONS: "durations",
  SEVERITIES: "severities",
};
personalDetailsConsent.innerHTML = `- ${username}, ${userage}yr old ${usergender} | Consent Checked`;
updateProgress("personal-details-consent");

// Event listener for the language toggle button
let currentLanguage = "english";
const languageToggle = document.getElementById("languageToggle");
const languageToggleSlider = document.querySelector(".lang-toggle-slider");
languageToggle.addEventListener("click", toggleLanguage);
function toggleLanguage() {
  if (currentLanguage === "english") {
    languageToggleSlider.innerHTML = "English";
    languageToggleSlider.style.textAlign = "left";
    languageToggleSlider.style.color = "#fff";
    currentLanguage = "hindi";
  } else {
    languageToggleSlider.innerHTML = "हिन्दी";
    languageToggleSlider.style.textAlign = "right";
    languageToggleSlider.style.color = "#5C5C5C";
    currentLanguage = "english";
  }
  questionContainer.style.display = "none";
  loadQuestion(currentQuestion); // Reload the current question with the new language
}

// Load JSON data dynamically
fetch("../static/dr-molar_ai.json")
  .then((response) => response.json())
  .then((jsonData) => {
    data = jsonData; // Assign the fetched JSON data to the global data variable
    loadQuestion(currentQuestion);
  })
  .catch((error) => {
    console.error("Error loading JSON data:", error);
  });

function loadQuestion(index) {
  // Check if data is loaded
  if (!data) {
    console.error("Data is not loaded yet");
    return;
  }

  // Show skeleton loading and set a timer to hide it after 1.2 seconds
  aiSkeletonLoading.style.display = "block";
  setTimeout(() => {
    aiSkeletonLoading.style.display = "none";
  }, 1200);
  setTimeout(() => {
    questionContainer.style.display = "flex";
  }, 1200);

  const currentQuestion = data.questions[index];
  if (currentLanguage === "hindi") {
    questionTitle.textContent = currentQuestion.question_hi;
    questionSubTitle.textContent = currentQuestion.subtitle_hi;
  } else {
    questionTitle.textContent = currentQuestion.question;
    questionSubTitle.textContent = currentQuestion.subtitle;
  }
  questionImage.innerHTML = "";
  if (currentQuestion.img_src)
    questionImage.innerHTML = `<img src= '${currentQuestion.img_src}' alt= 'Image representing question'>`;

  // Display options based on the user context or the current question's options
  const optionsToDisplay = currentQuestion.options;

  // Display fixed options for the current question
  optionsContainer.innerHTML = "";
  optionsToDisplay.forEach((option) => {
    const optionId = option.id;
    const optionData =
      currentLanguage === "hindi" ? option.option_hi : option.option;
    console.log(optionData);
    if (optionData) {
      const optionLabel = document.createElement("div");
      optionLabel.innerHTML = `
      <input type="radio" name="${currentQuestion.id}" value="${optionId}" id="${optionId}">
      <label for="${optionId}">
        <div class="inner"></div>${optionData}
      </label>
    `;

      optionsContainer.appendChild(optionLabel);
    }
  });
}

// When an option is selected
optionsContainer.addEventListener("click", (event) => {
  if (event.target.tagName === "INPUT") {
    nextButton.style.display = "flex";
  }
});
//AI QnA PROGRESS BAR SETUP
function updateProgress(sectionId) {
  const sectionElement = document.querySelector(`#${sectionId}`);

  const elementWithIdInMobileProgress = document.querySelector(
    ".mobile-progress-labels #" + sectionId
  );
  elementWithIdInMobileProgress.innerHTML = "&nbsp";

  const sectionFilled = sectionElement.innerHTML.trim() !== "";
  if (sectionFilled) {
    sectionElement.classList.add("progress-section-filled"); //Bounce animation

    const allSections = document.querySelectorAll(".progress-div-labels");
    const progressBar = sectionElement.nextElementSibling; // Assuming the progress bar's class is "progress-line"

    let totalHeight = 0;
    let filledSectionsHeight = 0;
    // Calculate the total height and height of filled sections
    allSections.forEach((section) => {
      totalHeight += section.clientHeight;
      const contentElement = section.querySelector("[id]");
      if (contentElement.innerHTML !== "") {
        filledSectionsHeight += section.clientHeight;
      }
    });
    // Calculate and set the progress
    const progressPercentage = (filledSectionsHeight / totalHeight) * 100 - 2;
    progressBar.style.height = progressPercentage + "%";
  }
}

// Next button click event
nextButton.addEventListener("click", () => {
  questionContainer.style.display = "none";
  const currentQuestionId = data.questions[currentQuestion].id;
  const currentOptions = data.questions[currentQuestion].options;
  const currentCategoryId = data.questions[currentQuestion].category;
  const selectedOptionId = document.querySelector(
    `input[name="${currentQuestionId}"]:checked`
  ).value;

  const selectedOptionData = currentOptions.find(
    (option) => option.id === selectedOptionId
  ).option;
  const selectedOpdAnswer = currentOptions.find(
    (option) => option.id === selectedOptionId
  ).opd_answer;

  // Store the user's selected option as context

  userContext[currentQuestionId] = {
    selectedOptionId: selectedOptionId,
    selectedOptionData: selectedOptionData,
    selectedOpdAnswer: selectedOpdAnswer,
    currentCategory: currentCategoryId,
  };
  console.log(userContext);
  // PUT THAT SELECTED ANSWER IN PROGRESS BAR
  if (currentCategoryId === "chief_complaint") {
    progressChiefComplaint.innerHTML = `- ${selectedOptionData}`;
    updateProgress("progress-chief-complaint");
  } else if (currentCategoryId === "location") {
    progressChiefComplaint.innerHTML += ` , ${selectedOptionData}`;
  } else if (currentCategoryId === "duration") {
    progressChiefComplaint.innerHTML += ` , ${selectedOptionData}`;
  } else if (currentCategoryId === "hopi") {
    progressHopi.innerHTML += ` - ${selectedOptionData}`;
    updateProgress("progress-hopi");
  } else if (currentCategoryId === "medical_history") {
    progressMedicalHistory.innerHTML = `- ${selectedOptionData}`;
    updateProgress("progress-medical-history");
  } else if (currentCategoryId === "medicine_history") {
    progressMedicalHistory.innerHTML += ` ; ${selectedOptionData}`;
  } else if (currentCategoryId === "allergy_history") {
    progressAllergyHistory.innerHTML = `- ${selectedOptionData}`;
    updateProgress("progress-allergy-history");
  } else if (currentCategoryId === "dental_history") {
    progressDentalHistory.innerHTML = `- ${selectedOptionData}`;
    updateProgress("progress-dental-history");
  } else if (currentCategoryId === "personal_history") {
    progressPersonalHistory.innerHTML = `- ${selectedOptionData}`;
    updateProgress("progress-personal-history");
  } else if (currentCategoryId === "cf_examination") {
    progressClinicalFeatures.innerHTML += `- ${selectedOptionData}`;
    updateProgress("progress-clinical-features");
  }

  nextButton.style.display = "none";
  loadNextQuestion(currentQuestionId, selectedOptionId);
});

// Function to load the next question and options
function loadNextQuestion(currentQuestionId, selectedOptionId) {
  const currentQuestionData = data.questions.find(
    (question) => question.id === currentQuestionId
  );
  console.log(currentQuestionData);

  const selectedOption = currentQuestionData.options.find(
    (option) => option.id === selectedOptionId
  );

  const nextQuestionId = selectedOption.next_question;

  if (nextQuestionId === "diagnosis") {
    questionSection.style.display = "none";
    loadingOverlay.style.display = "block";
    setTimeout(() => {
      loadingOverlay.style.display = "none";
      opdReceiptContainer.style.display = "flex";
    }, 5700);

    // Load diagnosis and treatment
    loadDiagnosis(userContext);
  } else if (nextQuestionId) {
    const nextQuestion = data.questions.find(
      (question) => question.id === nextQuestionId
    );

    if (nextQuestion) {
      currentQuestion = data.questions.indexOf(nextQuestion);
      loadQuestion(currentQuestion);
    }
  }
}

// Function to load Diagnosis and Treatment
async function loadDiagnosis(userContext) {
  const diagnosisInfo = data.diagnosisInfo;
  let matchingDiagnosis = null;
  for (const diagnosis of diagnosisInfo) {
    let isMatch = true;

    for (const key in diagnosis) {
      if (key !== "diagnosis_tt") {
        const userContextValue = userContext[key];
        const diagnosisValue = diagnosis[key];

        if (
          !userContextValue ||
          !userContextValue.selectedOptionId ||
          userContextValue.selectedOptionId !== diagnosisValue
        ) {
          isMatch = false;
          break;
        }
      }
    }
    if (isMatch) {
      matchingDiagnosis = diagnosis.diagnosis_tt;
      break;
    }
  }
  if (matchingDiagnosis) {
    function formatText(text) {
      const formattedText = text.replace(/\.  /g, ".\n");
      return formattedText;
    }

    const diagnosis = formatText(matchingDiagnosis.diagnosis);
    const investigations = formatText(matchingDiagnosis.investigations);
    const treatment = formatText(matchingDiagnosis.treatment);
    diagnosisLoadingImg.classList.add("out-anim"); //Show Provisional Diagnosis instead of loading image
    setTimeout(() => {
      diagnosisLoadingImg.style.display = "none";
      diagnosisLoadingPd.innerHTML = diagnosis
        .split("• ")[1]
        .trim()
        .split(":")[0]
        .trim();
    }, 1000);

    // Editing PDF
    const url = "../static/img/website/dr-molar_ai_opd.pdf";
    const existingPdfBytes = await fetch(url).then((res) => res.arrayBuffer());
    const { PDFDocument, rgb, StandardFonts } = PDFLib;

    // Load a PDFDocument from the existing PDF bytes
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // Embed the Helvetica font
    const Helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const Courier = await pdfDoc.embedFont(StandardFonts.CourierBold);

    // Get the first page of the document
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width } = firstPage.getSize();

    // Add user details to the PDF
    const currentDate = new Date();
    const hours = currentDate.getHours();
    const minutes = currentDate.getMinutes();
    const formattedDate = currentDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    firstPage.drawText(`${formattedDate} ${hours}:${minutes}`, {
      x: 261,
      y: 713,
      size: 10,
      font: Helvetica,
    });
    firstPage.drawText(username, { x: 140, y: 672, size: 11, font: Courier });
    firstPage.drawText(userage, { x: 100, y: 656, size: 11, font: Courier });
    firstPage.drawText(usergender, { x: 110, y: 642, size: 11, font: Courier });
    firstPage.drawText(`${diagnosis}`, {
      x: 155,
      y: 327,
      size: 10,
      maxWidth: 400,
      lineHeight: 12,
      color: rgb(72 / 255, 72 / 255, 72 / 255),
      font: Helvetica,
    });
    firstPage.drawText(`${investigations}`, {
      x: 155,
      y: 257,
      size: 10,
      maxWidth: 400,
      lineHeight: 12,
      color: rgb(72 / 255, 72 / 255, 72 / 255),
      font: Helvetica,
    });
    firstPage.drawText(`${treatment}`, {
      x: 155,
      y: 217,
      size: 10,
      maxWidth: 400,
      lineHeight: 12,
      color: rgb(72 / 255, 72 / 255, 72 / 255),
      font: Helvetica,
    });

    // Rest OPD Details
    let chiefComplaint = "";
    let hopi = "";
    let medicalHistory = "";
    let medicineHistory = "";
    let allergyHistory = " ";
    let dentalHistory = "";
    let personalHistory = "";
    let cfExamination = "";

    // Loop through the userContext and extract information based on currentCategory
    for (const key in userContext) {
      const { currentCategory, selectedOpdAnswer, selectedOptionData } =
        userContext[key];

      if (currentCategory === "chief_complaint") {
        chiefComplaint = selectedOpdAnswer;
      }
      if (currentCategory === "location") {
        chiefComplaint += selectedOpdAnswer;
      }
      if (currentCategory === "duration") {
        chiefComplaint += selectedOpdAnswer;
      }
      if (currentCategory === "hopi") {
        hopi += selectedOpdAnswer;
      }
      if (currentCategory === "medical_history") {
        medicalHistory = selectedOpdAnswer;
      }
      if (currentCategory === "medicine_history") {
        medicineHistory = selectedOpdAnswer;
      }
      if (currentCategory === "allergy_history") {
        allergyHistory = selectedOpdAnswer;
      }
      if (currentCategory === "dental_history") {
        dentalHistory = selectedOpdAnswer;
      }
      if (currentCategory === "personal_history") {
        personalHistory += selectedOpdAnswer;
      }
      if (currentCategory === "cf_examination") {
        cfExamination += `${selectedOpdAnswer}\n`;
      }

      // Add similar conditions for other categories if needed
    }
    firstPage.drawText(chiefComplaint, {
      x: 155,
      y: 586,
      size: 10,
      maxWidth: 400,
      lineHeight: 12,
      color: rgb(72 / 255, 72 / 255, 72 / 255),
      font: Helvetica,
    });
    firstPage.drawText(hopi, {
      x: 155,
      y: 555,
      size: 10,
      maxWidth: 400,
      lineHeight: 12,
      font: Helvetica,
      color: rgb(72 / 255, 72 / 255, 72 / 255),
    });
    firstPage.drawText(medicalHistory, {
      color: rgb(72 / 255, 72 / 255, 72 / 255),
      font: Helvetica,
      size: 10,
      x: 155,
      y: 525,
      lineHeight: 12,
      maxWidth: 400,
    });
    firstPage.drawText(medicineHistory, {
      x: 155,
      y: 500,
      size: 10,
      maxWidth: 400,
      lineHeight: 12,
      font: Helvetica,
      color: rgb(72 / 255, 72 / 255, 72 / 255),
    });
    firstPage.drawText(allergyHistory, {
      x: 155,
      y: 475,
      size: 10,
      maxWidth: 400,
      lineHeight: 12,
      font: Helvetica,
      color: rgb(72 / 255, 72 / 255, 72 / 255),
    });
    firstPage.drawText(dentalHistory, {
      x: 155,
      y: 450,
      size: 10,
      font: Helvetica,
      color: rgb(72 / 255, 72 / 255, 72 / 255),
    });
    firstPage.drawText(personalHistory, {
      x: 155,
      y: 425,
      size: 10,
      maxWidth: 400,
      lineHeight: 12,
      font: Helvetica,
      color: rgb(72 / 255, 72 / 255, 72 / 255),
    });
    firstPage.drawText(cfExamination, {
      x: 155,
      y: 400,
      size: 10,
      font: Helvetica,
      color: rgb(72 / 255, 72 / 255, 72 / 255),
    });

    // Serialize the PDFDocument to bytes (a Uint8Array)
    const pdfBytes = await pdfDoc.save();
    const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });
    const pdfURL = URL.createObjectURL(pdfBlob);
    const pdfjsLib = window["pdfjs-dist/build/pdf"];
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

    function showGeneratedPdf(url) {
      pdfjsLib.getDocument(url).promise.then(function (pdfDoc) {
        var pdfViewer = document.getElementById("pdf-viewer");

        for (var pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
          pdfDoc.getPage(pageNum).then(function (page) {
            var canvas = document.createElement("canvas");
            var context = canvas.getContext("2d");
            var viewport = page.getViewport({ scale: 3.7 });

            canvas.height = 3840;
            canvas.width = 2160;

            var renderContext = {
              canvasContext: context,
              viewport: viewport,
              antialias: false,
            };

            page.render(renderContext).promise.then(function () {
              pdfViewer.appendChild(canvas);
            });
          });
        }
      });
    }
    const dateForPdfName = currentDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });

    // RELATED VIDEO SECTION
    const videoLinkId = matchingDiagnosis.videolink_id;
    relatedVideoFrame.src = `https://www.youtube.com/embed/${videoLinkId}`;

    // SAVING PDF TO GOOGLE DRIVE
    const formData = new FormData();
    formData.append("pdfFile", pdfBlob, `e-OPD-${username}-${userage}-${dateForPdfName.replace(/[/\\?%*:|"<>]/g, '_')}`);

    // Make a POST request to the server
    fetch("/dr-molar_ai/analyser", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("OPD Sent On Server Successfully");
      })
      .catch((error) => {
        console.error("Error: Unable to send PDF on Server");
      });

    pdfFileName.innerHTML = `e-OPD-${username}-${userage}-${dateForPdfName} Dental Clinician Report.pdf`;
    downloadPdfBtn.addEventListener("click", function () {
      const downloadBtnLink = document.createElement("a");
      downloadBtnLink.href = pdfURL;
      downloadBtnLink.download = `e-OPD-${username}-${userage}-${dateForPdfName} Dental Clinician Report.pdf`;
      downloadBtnLink.style.display = "none";
      document.body.appendChild(downloadBtnLink);
      downloadBtnLink.click();
      document.body.removeChild(downloadBtnLink);
    });
    if (window.innerWidth <= 1164) {
      showGeneratedPdf(pdfURL);
    } else {
      const pdfEmbed = document.getElementById("pdf-embed");
      pdfEmbed.style.display = "block";
      pdfEmbed.setAttribute("src", pdfURL);
    }
  } else {
    console.log("No matching diagnosis found");
    // Handle the case where there's no matching diagnosis
  }
}

// OUR PARTNERED DOCTORS SECTION
const partneredDoctorsList = document.querySelector(".partnered-doctors-list");
fetch("../static/partnered_doctors_info.json")
  .then((response) => response.json())
  .then((jsonData) => {
    doctorsData = jsonData;
    for (const city in doctorsData) {
      for (const doctor of doctorsData[city]) {
        addDoctorCard(doctor);
      }
    }
  })
  .catch((error) => {
    console.error("Error loading Doctors Data JSON:", error);
  });
function updateDoctorList(location) {
  const selectedLocations = document.querySelectorAll(
    ".partnered-doctors-location"
  );
  for (const selectedLocation of selectedLocations) {
    selectedLocation.classList.remove("location-filter-selected");
    if (selectedLocation.innerHTML === location) {
      console.log(`${selectedLocation}   ${location}`);
      selectedLocation.classList.add("location-filter-selected");
    }
  }
  if (location !== "All") {
    partneredDoctorsList.innerHTML = "";
    for (const doctor of doctorsData[location]) {
      addDoctorCard(doctor);
    }
  } else {
    for (const city in doctorsData) {
      for (const doctor of doctorsData[city]) {
        addDoctorCard(doctor);
      }
    }
  }
}
function addDoctorCard(doctor) {
  const doctorCard = document.createElement("div");
  doctorCard.classList.add("partnered-doctor-card");

  const clinicInfo = document.createElement("div");
  clinicInfo.classList.add("partnered-clinic-info");

  const clinicName = document.createElement("div");
  clinicName.classList.add("clinic-name");
  clinicName.textContent = doctor.clinicName;

  const doctorName = document.createElement("div");
  doctorName.classList.add("doctor-name");
  doctorName.textContent = doctor.doctorName;

  const doctorDegree = document.createElement("div");
  doctorDegree.classList.add("doctor-degree");
  doctorDegree.textContent = doctor.doctorDegree;

  const doctorExperience = document.createElement("div");
  doctorExperience.classList.add("doctor-experience");
  doctorExperience.textContent = `Experience: ${doctor.doctorExperience}`;

  clinicInfo.appendChild(clinicName);
  clinicInfo.appendChild(doctorName);
  clinicInfo.appendChild(doctorDegree);
  clinicInfo.appendChild(doctorExperience);

  const clinicMapUrl = document.createElement("iframe");
  clinicMapUrl.classList.add("clinic-map-url");
  clinicMapUrl.src = doctor.clinicGoogleMapUrl;
  clinicMapUrl.target = "_blank";

  doctorCard.appendChild(clinicInfo);
  doctorCard.appendChild(clinicMapUrl);

  partneredDoctorsList.appendChild(doctorCard);
}