/*************************************************************************************
* WEB322 - 2231 Project
* I declare that this assignment is my own work in accordance with the Seneca Academic
* Policy. No part of this assignment has been copied manually or electronically from
* any other source (including web sites) or distributed to other students.
*
* Student Name  : Harshil Patel
* Student ID    : 148847213
* Course/Section: WEB322 NCC
*
**************************************************************************************/

const path = require("path");
const express = require("express");
const app = express();
const rentals = require('./models/rentals-db');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const fileUpload = require("express-fileupload");
// mongo session
const MongoStore = require('connect-mongo');
// set up session
const session = require("express-session");
// Set up dotenv
const dotenv = require("dotenv");
dotenv.config({ path: "./config/keys.env" });

// Set up HandleBars
app.engine(".hbs", exphbs.engine({
    extname: ".hbs",
    defaultLayout: "main"
}));
app.set("view engine", ".hbs");

// Set up body-parser
app.use(express.urlencoded({ extended: false }));

// Set up file Upload
app.use(fileUpload());

// Set up express-session
app.use(session({
    secret: process.env.SESSION_SECRET,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_CONNECTION_URL,  }),
    resave: false,
    saveUninitialized: true
}));

app.use((req, res, next) => {
    // res.locals.user is a global handlebars variable.
    // This means that every single handlebars file can access this variable.
    res.locals.user = req.session.user;
    res.locals.isClerk = req.session.isClerk;
    res.locals.isCustomer = req.session.isCustomer;
    // console.log(res.locals.isClerk);
    next();
});

// import controllers
const generalController = require("./controllers/generalController.js")
const rentalsController = require("./controllers/rentalsController.js")
const loadDataController = require("./controllers/loadData.js");
const shoppingCartController = require("./controllers/shoppingCartController");
// Set up Controller
app.use("/", generalController);
app.use("/rentals", rentalsController)
app.use("/load-data", loadDataController);
app.use("/cart", shoppingCartController);
// Add your routes here
// e.g. app.get() { ... }

app.use(express.static(path.join(__dirname, "/assets")));




let userName;
// form submittion handler
// sign-up form handler

// *** DO NOT MODIFY THE LINES BELOW ***

// This use() will not allow requests to go beyond it
// so we place it at the end of the file, after the other routes.
// This function will catch all other requests that don't match
// any other route handlers declared before it.
// This means we can use it as a sort of 'catch all' when no route match is found.
// We use this function to handle 404 requests to pages that are not found.
app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

// This use() will add an error handler function to
// catch all errors.
app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send("Something broke!")
});

// Define a port to listen to requests on.
const HTTP_PORT = process.env.PORT || 8080;

// Call this function after the http server starts listening for requests.
function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}
  
// Listen on port 8080. The default port for http is 80, https is 443. We use 8080 here
// because sometimes port 80 is in use by other applications on the machine
mongoose.connect(process.env.MONGODB_CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(()=>{
    app.listen(HTTP_PORT, onHttpStart);
})
.catch(()=>{
    console.log("Error while connection to mongoDB");
})

