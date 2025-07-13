
const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const path = require("path");
const showlist = require("./route/showlist");
const app = express();
const port = 1000;
const dotenv = require("dotenv");
dotenv.config();

const session = require("express-session");
const flash = require("connect-flash");
const accesslogin = require("./middelware");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const passportLocalMongoose = require("passport-local-mongoose");
const list = require("./new_data/schema");
const Review = require("./new_data/review");
const login = require("./new_data/login");
const reviews = require("./route/reviews");
const Logincontroller = require("./controllers/logincontroller.js");
const Listingcontroller = require("./controllers/showlistcontroller.js");
const { name } = require("ejs");
const { fail } = require("assert");
const { storage } = require("./cloudconfig.js"); // Import storage correctly
const multer = require("multer"); // Import multer

const upload = multer({ storage }); // Use multer with Cloudinary storage

require('dotenv').config({ path: './.env' });
console.log("Loaded ENV Variables:", process.env.KEY);

const cookieParser = require("cookie-parser");
const { log } = require("console");
// const session = require("express-session");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(cookieParser("pruthviraj")); // Use a strong secret key
app.use(session({
    secret: "somethingsecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Change to `true` if using HTTPS
        httpOnly: true, // Prevents client-side JS from accessing the cookie
        maxAge: 1000 * 60 * 60 * 24, // 1 day
    }
}));
app.use(passport.initialize());
app.use(passport.session());


passport.use(login.createStrategy());
passport.serializeUser(login.serializeUser());
passport.deserializeUser(login.deserializeUser());

app.use(flash());
app.use((req, res, next) => {
    res.locals.message = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.notlogin = req.flash("fail")
   if (req.isAuthenticated()) {
        // console.log("Authenticated User:", req.user);
        res.locals.username = req.user.username;
        res.locals.userid = req.user._id;
        var user_id = req.user._id;
        // console.log("hii "+req.user._id);
        
    } else {
        res.locals.username = null;
    }
    next();   
});
app.use("/showlist/:id", showlist);
app.use("/showlist/:id", reviews);

// console.log("hall",process.env.KEY);

// connection of monogodb;
main().then(() => { console.log("connected successful to DB") }).catch(err => { console.log(err); })
async function main() {
    console.log("Connecting to MongoDB Atlas");
    // await mongoose.connect(process.env.Database_url_atlas)
    await mongoose.connect(process.env.Database_url_atlas) 
    console.log("Connected to MongoDB Atlas");
}

// creating function for error handling
function asyncwrap(fn) {
    return function (req, res, next) {
        fn(req, res, next).catch(err => {
            console.log(err);
        })
    }
}


// creating the requst 
// finding and showing the post
app.get("/showlist", asyncwrap(Listingcontroller.showalllisting));
app.post("/showlist",accesslogin,upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'images', maxCount: 5 }
])
, Listingcontroller.creatinglist);

// creating post
// app.get("/createlist", upload.single("image"),Listingcontroller.renderformcreatinglist);
app.get("/createlist", Listingcontroller.renderformcreatinglist);
app.post("/createlist",  Listingcontroller.creatinglist);

app.get("/login", Logincontroller.rederformlogin);
app.get("/register", Logincontroller.rederformregister);
app.post("/register", asyncwrap(Logincontroller.registeruser));
app.get("/logout", Logincontroller.logout);


app.post("/login",
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: "Please enter the correct username and password!",
        failureFlash: true,
    }),
    async (req, res) => {
        res.redirect("/showlist")
    }
)


app.listen(port, () => {
    console.log(`file run in this ${port}`);
}) 




// comment works 

app.get("/setcookies", (req, res) => {
    let { name = "patil" } = req.query;
    console.log(`this is cookies${name}`);
    
    // Set a signed cookie
    res.cookie("name", name, { signed: true });

    // Initialize or update session count
    if (req.session.count) {
        req.session.count++;
    } else {
        req.session.count = 1;
    }

    // Send a proper response
    res.json({ signedCookies: req.signedCookies });
    // res.send(`Session count: ${req.signedCookies}`);

});

// app.get("/getcookies",(req,res)=>{
//     let {name = "ananymous"} = req.cookies;
//     // console.dir(req.Cookies);

//     // res.send(req.Cookies);
//     req.flash("name","this the name is pruthviraj");
//     console.log(req.locals.message);
//     res.send("done");

// })