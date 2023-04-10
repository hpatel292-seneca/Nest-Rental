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

// Add your routes here
// e.g. app.get() { ... }

app.use(express.static(path.join(__dirname, "/assets")));

app.get("/", (req, res)=>{
    // res.sendFile(path.join(__dirname, "/views/home.html"));
    res.render('home', {
        data: rentals.getFeaturedRentals(),
        id: "front_page",
        isHome: true,
        title: "Nest",
        layout: 'main'
    });
})

app.get("/rentals", (req, res)=>{
    res.render('rentals', {
        data: rentals.getRentalsByCityAndProvince(),
        title: "Nest Rentals",
        layout: 'main'
    });
})

app.get("/sign-up", (req, res)=>{
    res.render('sign-up', {
        title: "Nest Sign-Up",
        layout: 'main'
    });
})

app.get("/log-in", (req, res)=>{
    res.render('log-in', {
        title: "Nest Log-in",
        layout: 'main'
    });
})
let userName;
app.get("/welcome", (req, res)=>{
    res.render('welcome', {
        id: "Welcome_page",
        isWelcome: true,
        title: "Nest Welcome",
        userName: userName,
        layout: 'main'
    })
})
// form submittion handler
// sign-up form handler
app.post("/sign-up", (req, res)=>{
    
    const { Name, Email, Password, lastName } = req.body;
    userName = `${Name} ${lastName}`;
    let passedValidation = true;
    let validationMessages = {};
    // validation for Name
    if (typeof Name !== "string") {
        passedValidation = false;
        validationMessages.Name = "first name must be string";
    }
    else if (Name.trim().length === 0) {
        passedValidation = false;
        validationMessages.Name = "You must specify a first name";
    }
    if (typeof lastName !== "string") {
        passedValidation = false;
        validationMessages.lastName = "Last name must be string";
    }
    else if (lastName.trim().length === 0) {
        passedValidation = false;
        validationMessages.lastName = "You must specify a Last name";
    }

    // validation for Email
    const emailRegExp = new RegExp('[a-zA-Z0-9._+-]+[@][a-zA-Z0-9.-]+[.][a-zA-Z0-9.-]+');
    if (typeof Email !== "string") {
        passedValidation = false;
        validationMessages.Email = "Email must be string";
    }
    else if (Email.trim().length === 0) {
        passedValidation = false;
        validationMessages.Email = "You must specify a Email";
    }
    else if(!emailRegExp.test(Email)){
        passedValidation = false;
        validationMessages.Email = "You must specify a Email in '******@***.***' format";
    }

    // validate password ^\da-zA-Z
    const passRegExp = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[,./<>?{}~!@#$%^&*()=+-_]).{8,12}$');
    // this regular expression is taken form ChatGPT
    if (typeof Password !== "string") {
        passedValidation = false;
        validationMessages.Password = "Password must be string";
    }
    else if (Password.trim().length === 0) {
        passedValidation = false;
        validationMessages.Password = "You must specify a Password";
        validationMessages.RePassword = "You must specify a Re-Password";
    }
    else if(!passRegExp.test(Password)){
        passedValidation = false;
        validationMessages.Password = "A 8-12 characters password at least contains one of each uppercase and lowercase letter, symbol and number.";
    }
    if (passedValidation) {
        
        // Continue and submit contact us form.
        const sgMail = require("@sendgrid/mail");
        sgMail.setApiKey(process.env.SEND_GRID_API_KEY);

        const msg = {
            to: Email,
            from: "harshilpatelpatel70@gmail.com",
            subject: "Registration Confirmation at Nest Rentals",
            html:
                `Hello ${Name} ${lastName}, Thank you for Registration at Nest rentals. I am Harshil Patel, here to welcome you and provide further Assistance.`
        };

        sgMail.send(msg)
            .then(() => {
                res.redirect('/welcome');
            })
            .catch(err => {
                console.log(err);

                res.render('sign-up', {
                    layout: 'main',
                    validationMessages,
                    values: req.body
                }); 
            });
    }
    else {
        res.render('sign-up', {
            layout: 'main',
            validationMessages,
            values: req.body
        });
    }
})


// Log-in form handler
app.post('/log-in', (req, res)=>{
    
    const { Email, Password} = req.body;

    let passedValidation = true;
    let validationMessages = {};

    if (typeof Email !== "string") {
        passedValidation = false;
        validationMessages.Email = "Email must be string";
    }
    else if (Email.trim().length === 0) {
        passedValidation = false;
        validationMessages.Email = "You must specify a Email";
    }

    // validate password
    if (typeof Password !== "string") {
        passedValidation = false;
        validationMessages.Password = "Password must be string";
    }
    else if (Password.trim().length === 0) {
        passedValidation = false;
        validationMessages.Password = "You must specify a Password";
    }
   
    if (passedValidation) {
        res.redirect('/welcome');
    }
    else {
        res.render('log-in', {
            layout: 'main',
            validationMessages,
            values: req.body
        });
    }
})
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
app.listen(HTTP_PORT, onHttpStart);