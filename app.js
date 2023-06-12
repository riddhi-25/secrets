//jshint esversion:6
require("dotenv").config() ;
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose=require("mongoose");
mongoose.connection.socketTimeoutMS = 20000;
const encrypt=require("mongoose-encryption");

const app = express();
 
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://127.0.0.1:27017/userDB",{useNewUrlParser:true});

const userSchema=new mongoose.Schema({
    email:String,
    password:String
});


userSchema.plugin(encrypt,{secret:process.env.SECRET,encryptedFields:["password"]});

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
    const newUser = new User({
      email: req.body.username,
      password: req.body.password
    });
  
    newUser.save().then(function() {
      res.render("secrets");
    }).catch(function(err) {
      console.log(err);
    });
  });

  app.post("/login", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    try {
      const foundUser = await User.findOne({email: username});
  
      if (foundUser) {
        if (foundUser.password === password) {
          res.render("secrets");
          console.log("New login (" + username + ")");
        } else {
          res.render("login", {errMsg: "Email or password incorrect", username: username, password: password});
        }
      } else {
        res.render("login", {errMsg: "Email or password incorrect", username: username, password: password});
      }
    } catch (err) {
      console.log(err);
    }
  });

app.listen(3000, function() {
    console.log("Server started on port 3000.");
});