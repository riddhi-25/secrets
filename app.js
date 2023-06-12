//jshint esversion:6
require("dotenv").config() ;
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose=require("mongoose");
const bcrypt = require('bcryptjs');
const saltRounds=10;

const app = express();
 
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://127.0.0.1:27017/userDB",{useNewUrlParser:true});

const userSchema=new mongoose.Schema({
    email:String,
    password:String
});

const User=new mongoose.model("User",userSchema);

app.get("/",function(req,res){
    res.render("home");
});

app.get("/login", (req, res) => {
    res.render("login", {errMsg: "", username: "", password: ""});
  });

app.get("/register",function(req,res){
    res.render("register");
});

app.post("/register", function(req, res) {
    const hash = bcrypt.hashSync(req.body.password, saltRounds);
 
    const newUser = new User({
        email: req.body.username,
        password: hash
    });
  
  
    newUser.save().then(function() {
      res.render("secrets");
    }).catch(function(err) {
      console.log(err);
    });
  });

  app.post("/login", function (req, res) {
    const username = req.body.username;
    const password = req.body.password;
   
    User.findOne({ email: username })
      .then(function (foundUser) {
        /*if (foundUser.password === password) {
          res.render("secrets");
        } */
   
        // Load hash from your password DB.
        bcrypt.compare(req.body.password, foundUser.password).then(function(result) {
          if(result == true){
            res.render("secrets");
          }
          // result == true
        });
   
      })
   
      .catch(function (e) {
        console.log(e);
      });
  });

app.listen(3000, function() {
    console.log("Server started on port 3000.");
});