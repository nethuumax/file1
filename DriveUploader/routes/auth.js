const { Router } = require("express");
const passport = require("passport");

let router = Router();

router.get("/login", function(req, res) {
  // if the user authenticated
  if (req.user) res.redirect("/dashboard");
  // if not authenticated
  else res.redirect("/auth/login/google");
});

// login redirect
router.get(
  "/login/google",
  passport.authenticate("google", {
    scope: ["profile", "https://www.googleapis.com/auth/drive.file", "email"]
  })
);

// callback from google oauth with token
router.get("/google/redirect", passport.authenticate("google"), function(
  req,
  res
) {
  res.redirect("/dashboard");
});

// logout function
router.get("/logout", function(req, res) {
  req.logOut();
  res.redirect("/");
});

module.exports = router;
