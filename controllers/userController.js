const User = require("../models/userModel");
const Comment = require("../models/commentModel");
const bcrypt = require("bcrypt");
const { OAuth2Client } = require("google-auth-library");

// GOOGLE AUTH CREDENTIALS
const client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

// Create unique ID for each user
const generateUniqueId = () => {
  const characters = "0123456789";
  let uniqueId = "";
  for (let i = 0; i < 5; i++) {
    uniqueId += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }
  return uniqueId;
};

const loadRegister = async (req, res) => {
  try {
    res.render("sign-up");
  } catch (error) {
    console.log(error.message);
  }
};

const insertUser = async (req, res) => {
  try {
    // Google Sign-Up
    if (req.body.credential) {
      return googleSignUp(req, res);
    }

    // Manual user insertion
    if (
      req.body.name &&
      req.body.email &&
      req.body.password &&
      req.body.avatar
    ) {
      const spassword = await securePassword(req.body.password);
      const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: spassword,
        uniqueId: generateUniqueId(),
        avatar: req.body.avatar,
        googleIdToken: "Manual Sign-up",
      });

      const userData = await user.save();

      if (userData) {
        // log the user in
        req.session.user_id = userData._id;
        req.session.username = userData.name;
        req.session.emailId = userData.email;
        req.session.hashedPassword = userData.password;
        req.session.uniqueId = userData.uniqueId;
        req.session.avatarUrl = userData.avatar;
        res.redirect("/home");
      }
    } else if (
      !req.body.name ||
      !req.body.email ||
      !req.body.password ||
      !req.body.avatar
    ) {
      res.render("sign-up", { signupStatus: "MissingField" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// SIGN UP WITH GOOGLE
const googleSignUp = async (req, res) => {
  try {
    const idToken = req.body.credential;
    // Validate Google ID token
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    // Check if the Google user already exists in your database
    const existingUser = await User.findOne({ email: payload.email });

    if (existingUser) {
      // Log in the existing user
      req.session.user_id = existingUser._id;
      req.session.username = existingUser.name;
      req.session.emailId = existingUser.email;
      req.session.uniqueId = existingUser.uniqueId;
      req.session.avatarUrl = existingUser.avatar;
      res.redirect("/home");
    } else {
      // Create a new user in your database
      const newUser = new User({
        name: payload.name,
        email: payload.email,
        password: "", // No need for a password
        uniqueId: generateUniqueId(),
        avatar: payload.picture || "/static/img/website/user-logo.png",
        googleIdToken: idToken,
      });

      const savedUser = await newUser.save();

      // Log in the new user
      req.session.user_id = savedUser._id;
      req.session.username = savedUser.name;
      req.session.emailId = savedUser.email;
      req.session.uniqueId = savedUser.uniqueId;
      req.session.avatarUrl = savedUser.avatar;
      res.redirect("/home");
    }
  } catch (error) {
    console.error("Error during Google Sign-Up:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

//USER LOGIN METHODS
const loginLoad = async (req, res) => {
  try {
    res.render("login");
  } catch (error) {
    console.log(error.message);
  }
};

const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userData = await User.findOne({ email: email });

    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        req.session.user_id = userData._id;
        req.session.username = userData.name;
        req.session.emailId = userData.email;
        req.session.hashedPassword = userData.password;
        req.session.uniqueId = userData.uniqueId;
        req.session.avatarUrl = userData.avatar;
        res.redirect("/home");
      } else {
        res.render("login", { message: "Email and Password are incorrect!" });
      }
    } else {
      res.render("login", { message: "Email and Password are incorrect!" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadHome = async (req, res) => {
  try {
    res.render("home", { userName: req.session.username });
  } catch (error) {
    console.log(error.message);
  }
};

//Insert Comments into each chapter
const postComment = async (req, res) => {
  try {
    const comment = new Comment({
      username: req.session.username,
      comment: req.body.comment,
      subject: req.body.subject,
      chapterUrl: req.body.chapterUrl,
      avatarUrl: req.body.avatarUrl,
      timestamp: req.body.timestamp,
    });

    const commentData = await comment.save();

    if (commentData) {
      res.redirect(req.body.chapterUrl); // redirect to the same page after saving comment
    } else {
      res.render(req.body.chapterUrl, { message: "Comment failed to save" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const getComments = async (chapterUrl) => {
  try {
    const comments = (await Comment.find({ chapterUrl })) || [];
    return comments;
  } catch (error) {
    console.log(error.message);
  }
};

// UPDATE USER
const updateUser = async (req, res) => {
  try {
    const { user_id } = req.session;
    const enteredPassword = req.body.enteredPassword;
    console.log(enteredPassword);
    console.log(req.session.hashedPassword);
    const passwordMatch = await bcrypt.compare(
      enteredPassword,
      req.session.hashedPassword
    );
    console.log(passwordMatch);
    const newName = req.body.newName;
    const newAvatar = req.body.newAvatar;

    // Validate the input
    if (!newName || !newAvatar || !enteredPassword) {
      res.render("profile", {
        updateStatus: "UpdateFailed",
        myProfileUrl: "my-profile/update",
      });
    } else if (passwordMatch) {
      const updatedUser = await User.findByIdAndUpdate(
        user_id,
        { $set: { name: newName, avatar: newAvatar } },
        { new: true }
      );

      // Update the session with the new user details
      req.session.username = updatedUser.name;
      req.session.avatarUrl = updatedUser.avatar;

      res.render("profile", {
        updateStatus: "UpdateSuccess",
        myProfileUrl: "my-profile",
      });
    } else {
      res.render("profile", {
        updateStatus: "WrongPassword",
        myProfileUrl: "my-profile/update",
      });
    }
  } catch (error) {
    console.log(error.message);
    return res.json({ success: false, message: "Failed to update profile" });
  }
};

// DELETE USER FUNCTION
const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.session.user_id);
    console.log(deletedUser);
    if (!deletedUser) {
      return res.json({ success: false, message: "User not found" });
    }

    // Destroy the session and redirect the user to the home page
    req.session.destroy();
    return res
      .status(200)
      .send({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    console.log(error.message);
    return res.json({
      success: false,
      message: "Failed to delete account",
    });
  }
};

// LOGOUT FUNCTION
const logoutUser = async (req, res) => {
  try {
    req.session.destroy();
    res.render("home", { logoutStatus: "logoutDone" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  loadRegister,
  insertUser,
  loginLoad,
  verifyLogin,
  loadHome,
  postComment,
  getComments,
  updateUser,
  deleteUser,
  logoutUser,
};
