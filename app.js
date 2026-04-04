const express = require("express");
const http = require("http");
const txt = require("txt");
const path = require("path");
const fs = require("fs");
const app = express();
require('dotenv').config();
const PORT = process.env.PORT;
var pug = require("pug");
const userController = require("./controllers/userController");
const session = require("express-session");
const config = require("./config/config");
const auth = require("./middleware/auth");
const multer = require('multer');
const stream = require('stream');
const { google } = require('googleapis');

// EXPRESS SPECIFIC STUFF
app.use("/static", express.static("static")); // For serving static files
app.use(express.urlencoded());

// SESSION
app.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.use(function (req, res, next) {
  res.locals.session = req.session;
  console.log("Session middleware called");
  res.locals.username = req.session.username;
  res.locals.avatarUrl = req.session.avatarUrl;
  next();
});

//PUG SPECIFIC STUFF
app.set("view engine", "pug"); // Set the view engine to Pug
app.set("views", path.join(__dirname, "views")); // Set the views directory

// ENDPOINTS

app.get("/", (req, res) => {
  res.status(200).render("home");
});
app.get("/dr-molar_ai", (req, res) => {
  res.status(200).render("dr_molar_ai");
});


app.get("/dr-molar_ai/analyser", (req, res) => {
  // Retrieve the user details from query parameters
  const name = req.query.name;
  const age = req.query.age;
  const gender = req.query.gender;

  // Check if user details are missing
  if (!name || !age || !gender) {
    res.redirect("/dr-molar_ai"); // Redirect to the consent page if user details are missing
    return;
  }

  // Render the view with the user details
  res.status(200).render("dr_molar_ai.pug", {
    drMolarAiAnalyser: "dr-molar_ai/analyser",
    userDetails: { name, age, gender }, // Pass the user details to the Dr Molar AI Analyser
  });
});

// ENDPOINTS
app.get("/syllabus", (req, res) => {
  res.status(200).render("syllabus");
});
app.get("/community", (req, res) => {
  res.status(200).render("community");
});
app.get("/about", (req, res) => {
  res.status(200).render("about");
});
app.get("/privacy-policy", (req, res) => {
  res.status(200).render("privacy_policy");
});
app.get("/terms-of-service", (req, res) => {
  res.status(200).render("terms_of_service");
});
app.get("/community-guidelines", (req, res) => {
  res.status(200).render("community_guidelines");
});

// Connect to MongoDB
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
});

//SUBJECTS ENDPOINTS

const sub = fs.readdirSync("views/subjects");
const chaptersDataArray = []; // For storing in chapters_database.json
for (let i = 0; i < sub.length; i++) {
  let title2 = sub[i].split("."); //REQUIRED ONLY IN CHAPTER.TXT FILES
  let title3 = title2[0].replace(/-/g, " ");
  const title = title3.toUpperCase();
  //CHAPTER LIST
  let chapName;
  let unitNameList = [];
  let totalChapters = [];
  let totalChapUrlList = [];
  const unitList = fs.readdirSync(`views/subjects/${sub[i]}`);
  for (let u = 0; u < unitList.length; u++) {
    let chapNameList = [];
    let chapUrlList = [];
    //UNIT NAMES
    let unitName2 = unitList[u].replace(/_/g, " ");
    let unitName = unitName2.charAt(0).toUpperCase() + unitName2.slice(1);
    console.log(unitName);

    //CHAPTER NAMES
    const chapList = fs.readdirSync(`views/subjects/${sub[i]}/${unitList[u]}`);
    for (let j = 0; j < chapList.length; j++) {
      let chapName1 = chapList[j].split(".");
      chapUrlList.push("/" + sub[i] + "/" + chapName1[0]);

      let chapName2 = chapName1[0].replace(/_/g, " ");
      chapName = chapName2.charAt(0).toUpperCase() + chapName2.slice(1);
      console.log(chapNameList);
      console.log(chapName);
      chapNameList.push(chapName);

      //CHAPTER CONTENT
      let chapUrl = "/" + sub[i] + "/" + chapName1[0];
      app.get(chapUrl, async (req, res) => {
        let comments = await userController.getComments(chapUrl);
        console.log(req.session);
        const params = {
          title: chapName,
          content: chapName1[0],
          subjectID: sub[i],
          comments: comments,
          session: req.session,
        };
        res.status(200).render("chapter.pug", params);
      });
      // COLLECT ALL CHAPTERS ID & URL FOR STORING IN chapters_database.json
      const chapterData = {
        chapter_id: chapName1[0],
        chapter_url: chapUrl,
      }
      chaptersDataArray.push(chapterData);
    }
    unitNameList.push(unitName);
    totalChapters.push(chapNameList);
    totalChapUrlList.push(chapUrlList);
  }
  const params = {
    title: title,
    unit: unitNameList,
    content: totalChapters,
    chapUrls: totalChapUrlList,
  };
  let subj = "/" + sub[i];
  app.get(subj, (req, res) => {
    res.status(200).render("subject.pug", params);
  });
}
// WRITE CHAPTERS DATABASE IN chapters_database.json
const chaptersJsonData = JSON.stringify(chaptersDataArray, null, 2);
const staticFolderPath = path.join(__dirname, 'static');
fs.writeFileSync(path.join(staticFolderPath, 'chapters_database.json'), chaptersJsonData, 'utf-8');

// UPLOADING E-OPDs TO GOOGLE DRIVE
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
// Google Drive API setup
const credentials = require('./dr-molar-ai-opds_apikey.json');
const drive = google.drive({
  version: 'v3',
  auth: new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key,
    ['https://www.googleapis.com/auth/drive']
  ),
});

// Handle POST requests to the '/dr-molar_ai/analyser' endpoint
app.post('/dr-molar_ai/analyser', upload.single('pdfFile'), (req, res) => {
  const pdfBuffer = req.file.buffer; // Access the uploaded Blob from req.file.buffer
  const pdfFilename = req.file.originalname;
  const readableStream = new stream.PassThrough();
  readableStream.end(pdfBuffer);
  // Upload the PDF file to Google Drive
  drive.files.create({
    requestBody: {
      name: pdfFilename,
      parents: ['1N1LSIbjy9vRe5Eil29Nrir1E5Er9ooWu'],
    },
    media: {
      mimeType: 'application/pdf',
      body: readableStream,
    },
  })
  .then(response => {
    console.log('File uploaded to Google Drive. File ID:', response.data.id);
  })
  .catch(error => {
    console.error('Error uploading to Google Drive:', error);
  });
});


//FOR USER_ROUTE
const userRoute = require("./routes/userRoute");
const { env } = require("process");
app.use("/", userRoute);

// Catch-all route for Page Not Found
app.use((req, res, next) => {
  res.status(404).render('404_error');
});

// START THE SERVER
app.listen(PORT, () => {
  console.log(`The application started successfully on port ${PORT}`);
});
