//jshint esversion:6
require("dotenv").config() ;
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose=require("mongoose");
const session=require("express-session");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");

const app = express();
 
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret:"our little secret",
    resave:false,
    saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://127.0.0.1:27017/userDB",{useNewUrlParser:true});

const userSchema=new mongoose.Schema({
    email:String,
    password:String
});

userSchema.plugin(passportLocalMongoose);

const User=new mongoose.model("User",userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/",function(req,res){
    res.render("home");
});

app.get("/login", (req, res) => {
    res.render("login", {errMsg: "", username: "", password: ""});
  });

app.get("/register",function(req,res){
    res.render("register");
});

app.get('/secrets', (req, res) => {
    if (req.isAuthenticated()) {
      res.render("secrets");
    } else {
      res.redirect('/login');
    }
  });

app.post("/register", function(req, res) {
    const username = req.body.username;
  const password = req.body.password;
  User.register({ username: username }, password).then(() => {
    const authenticate = passport.authenticate("local");
    authenticate(req, res, () => {
      res.redirect('/secrets');
    });
  }).catch(err => {
    console.log(err);
    res.redirect("/register");
  });
  });

  app.post("/login", (req, res) => {
    const newUser = new User({
      username: req.body.username,
      password: req.body.password
    })
    //login function is given by passport (same as register function is also provided by passport)
    req.login(newUser, (err) => {
      if (err) {
        console.log(err);
      } else {
        passport.authenticate("local")(req, res, function () {
          res.redirect('/secrets');
        })
      }
    })
  });
   
  app.get('/submit', (req, res) => {
    res.render("submit");
  });
   
  app.get('/logout', (req, res) => {
    req.logout(function (err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  });

app.listen(3000, function() {
    console.log("Server started on port 3000.");
});