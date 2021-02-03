const { Router } = require("express");

const router = new Router();

const bcryptjs = require("bcryptjs");
const mongoose = require("mongoose");
const saltRounds = 10;
const User = require("../models/User.model");

// .post() route ==> to process form data
router.post("/signup", (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(401).json({
      message:
        "All fields are mandatory. Please provide your email and password.",
    });
    return;
  }

  const regex = /^\S+@\S+\.\S+$/;
  if (!regex.test(email)) {
    res.status(500).json({
      message:
      "Please use a valid email address.",
    });
    return;
  }

  bcryptjs
    .genSalt(saltRounds)
    .then((salt) => bcryptjs.hash(password, salt))
    .then((hashedPassword) => {
      return User.create({
        email,
        passwordHash: hashedPassword,
      })
        .then((user) => {
          req.login(user, (err) => {
            if (err)
              return res
                .status(500)
                .json({ message: "Something went wrong with login!" });
            user.passwordHash = undefined;
            res.status(200).json({ message: "Login successful!", user });
          });
        })
        .catch((err) => {
          if (err instanceof mongoose.Error.ValidationError) {
            res.status(500).json({ message: err.message });
          } else if (err.code === 11000) {
            res.status(500).json({
              message:
                "Username and email need to be unique. Either username or email is already used.",
            });
          } else {
            next(err);
          }
        });
    })
    .catch((err) => next(err));
});


router.post("/login", (req, res, next) => {
  if (email === "" || password === "") {
    res.render("auth/login", {
      errorMessage: "Please enter both, username and password to sign up."
    });
    return;
  }

  User.findOne({ email })
  .then(user => {
      if (!user) {
        res.render("auth/login", {
          errorMessage: "The email doesn't exist."
        });
        return;
      }
      if (bcrypt.compareSync(passwordHash, user.password)) {
        // Save the login in the session!
        // req.session.currentUser = user;
        res.redirect("/");
      } else {
        res.render("auth/login", {
          errorMessage: "Incorrect password"
        });
      }
  })
  .catch(error => {
    next(error);
  })
});

// router.get("/logout", (req, res, next) => {
//   req.session.destroy((err) => {
//     // cannot access session here
//     res.redirect("/login");
//   });
// });


// router.post("/logout", routeGuard, (req, res, next) => {
//   req.logout();
//   res.status(200).json({ message: "Logout successful!" });
// });

router.get("/isLoggedIn", (req, res) => {
  if (req.user) {
    req.user.passwordHash = undefined;
    res.status(200).json({ user: req.user });
    return;
  }
  res.status(401).json({ message: "You are not logged in!" });
});

module.exports = router;
