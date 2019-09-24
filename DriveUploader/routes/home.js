const { Router } = require("express");
const passport = require("passport");
const { google } = require("googleapis");
const KEYS = require("../configs/keys");

const router = Router();

router.get("/", function(req, res) {
  res.render("home.html", { title: "Application Home" });
});

router.get("/dashboard", function(req, res) {
  // if not a user
  if (typeof req.user == "undefined") res.redirect("/auth/login/google");
  else {
    let parseData = {
      title: "DASHBOARD",
      googleid: req.user._id,
      name: req.user.name,
      avatar: req.user.pic_url,
      email: req.user.email
    };

    //redirect with google drive response
    if (req.query.file !== undefined) {
      // successfully upload case
      if (req.query.file == "upload") parseData.file = "uploaded";
      // fail to upload case
      else if (req.query.file == "notupload") parseData.file = "notuploaded";
    }

    res.render("dashboard.html", parseData);
  }
});

router.post("/upload", function(req, res) {
  // user not authenticated
  if (!req.user) res.redirect("/auth/login/google");
  else {
    //  with the client token config the google drive
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: req.user.accessToken
    });

    const drive = google.drive({
      version: "v3",
      auth: oauth2Client
    });

    //upload any type of file to the google drive
    let { name: filename, mimetype, data } = req.files.file_upload;

    const driveResponse = drive.files.create({
      requestBody: {
        name: filename,
        mimeType: mimetype
      },
      media: {
        mimeType: mimetype,
        body: Buffer.from(data).toString()
      }
    });

    driveResponse
      .then(data => {
        if (data.status == 200) res.redirect("/dashboard?file=upload");
        // success 
        else res.redirect("/dashboard?file=notupload"); // fail
      })
      .catch(err => {
        throw new Error(err);
      });
  }
});

module.exports = router;
