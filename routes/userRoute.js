const express = require("express");
const user_route = express();
const bodyparser = require("body-parser");
const path = require("path");
const session = require("express-session");
const config = require("../config/config");
const auth = require("../middleware/auth");

user_route.use(
  bodyparser.urlencoded({
    extended: true,
  })
);
user_route.use(bodyparser.json());

user_route.set("view engine", "pug"); // Set the view engine to Pug


const userController = require("../controllers/userController");
const { sessionSecret } = require("../config/config");


user_route.get("/sign-up", auth.isLogout, userController.loadRegister);
user_route.post("/sign-up", userController.insertUser);

user_route.get("/login", auth.isLogout, userController.loginLoad);
user_route.post("/login", userController.verifyLogin);

user_route.get("/home", auth.isLogin, userController.loadHome);

//PROFILE PAGE GET ROUTES
user_route.get("/my-profile", auth.isLogin, (req, res) => {
  res.status(200).render("profile", { myProfileUrl: "my-profile" });
});
user_route.get("/my-profile/tracker", auth.isLogin, (req, res) => {
  res.status(200).render("profile", { myProfileUrl: "my-profile/tracker" });
});
user_route.get("/my-profile/update", auth.isLogin, (req, res) => {
  res.status(200).render("profile", { myProfileUrl: "my-profile/update" });
});
user_route.get("/my-profile/logout", auth.isLogin, (req, res) => {
  res.status(200).render("profile", { myProfileUrl: "my-profile/logout" });
});
user_route.get("/my-profile/delete", auth.isLogin, (req, res) => {
  res.status(200).render("profile", { myProfileUrl: "my-profile/delete" });
});
//PROFILE PAGE POST ROUTES

user_route.post("/my-profile/update", userController.updateUser);
user_route.post("/my-profile/logout", userController.logoutUser);
user_route.post("/my-profile/delete", userController.deleteUser);

//Post Comments Route
user_route.post("/:subject/:chapterUrl", userController.postComment);


module.exports = user_route;
