const express = require("express");
const router = express.Router();
const rentals = require('../models/rentals-db');
let userModel = require('../models/userModel.js');
const rentalModel = require("../models/rentalModel");
const bcryptjs = require('bcryptjs');
const MongoStore = require('connect-mongo');
router.get("/", (req, res) => {
    // res.sendFile(path.join(__dirname, "/views/home.html"));
    rentalModel.find({ featuredRental: true}).lean()
    .then(data=>{
        res.render('general/home', {
            data,
            id: "front_page",
            isHome: true,
            title: "Nest",
            layout: 'main'
        });
    })
    .catch(err=>{
        console.log("Error while loading data: " + err);
    })
    
})

router.get("/sign-up", (req, res) => {
    res.render('general/sign-up', {
        title: "Nest Sign-Up",
        layout: 'main'
    });
})

router.get("/log-in", (req, res) => {
    res.render('general/log-in', {
        title: "Nest Log-in",
        layout: 'main'
    });
})

router.get("/welcome", (req, res) => {
    res.render('general/welcome', {
        id: "Welcome_page",
        isWelcome: true,
        title: "Nest Welcome",
        layout: 'main'
    })
})
let errorMessage = "";
router.post("/sign-up", (req, res) => {
    let validationMessages = {};
    // TODO add logic to query DB and if same email address found, return sign-up page with an error message.
    const { Name, Email, Password, lastName, type } = req.body;
    // querying DB for finding same email.
    userModel.findOne({ Email }).then((data) => {
        console.log(data);
        if (data) {
            // here redirect or render

            validationMessages.error = "Already have account with same email";
            //  res.redirect("/sign-up");
            res.render('general/sign-up', {
                layout: 'main',
                validationMessages,
                values: req.body
            });

        }
        else{
        userName = `${Name} ${lastName}`;
        let passedValidation = true;

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
        // DOUBT -------------------------------------------------------------------
        const emailRegExp = new RegExp('[a-zA-Z0-9._+-]+[@][a-zA-Z0-9.-]+[.][a-zA-Z0-9.-]+');
        if (typeof Email !== "string") {
            passedValidation = false;
            validationMessages.Email = "Email must be string";
        }
        else if (Email.trim().length === 0) {
            passedValidation = false;
            validationMessages.Email = "You must specify a Email";
        }
        else if (!emailRegExp.test(Email)) {
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
        else if (!passRegExp.test(Password)) {
            passedValidation = false;
            validationMessages.Password = "A 8-12 characters password at least contains one of each uppercase and lowercase letter, symbol and number.";
        }
        if (passedValidation) {
            // update in database
            const user = new userModel({
                Name,
                Email,
                Password,
                lastName
            });

            req.session.user = user;
                                
                                if(type === 'clerk'){
                                    req.session.isClerk = true;
                                    
                                    //res.redirect("/rentals/list");
                                }
                                else{
                                    req.session.isCustomer = true;
                                //res.redirect("/cart");
                                }
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
                    // res.redirect('/welcome');
                    user.save()
                        .then(() => {

                            res.redirect("/welcome");
                        })
                        .catch(err => {
                            console.log("Couldn't create the user " + err);
                            res.redirect("/sign-up");
                        });
                })
                .catch(err => {
                    console.log(err);

                    res.render('general/sign-up', {
                        layout: 'main',
                        validationMessages,
                        values: req.body
                    });
                });
        }
        else {
            res.render('general/sign-up', {
                layout: 'main',
                validationMessages,
                values: req.body
            });
        }
    }
    })

})
// Log-in form handler
router.post('/log-in', (req, res) => {

    const { Email, Password, type } = req.body;
    let userMessage = [];
    let passedValidation = true;
    let validationMessages = {};
    // console.log(req.body);
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
        userModel.findOne({
            Email: req.body.Email
        })
            .then((user) => {
                if (user) {
                    // user exist with that email
                    bcryptjs.compare(req.body.Password, user.Password)
                        .then(matched => {
                            if (matched) {
                                // password matched
                                req.session.user = user;
                                
                                if(type === 'clerk'){
                                    req.session.isClerk = true;
                                    
                                    res.redirect("/rentals/list");
                                }
                                else{
                                    req.session.isCustomer = true;
                                res.redirect("/cart");
                                }
                            }
                            else {
                                console.log("Password didnt match");
                                userMessage.push("Sorry, your password didnt match our Database");
                                res.render('general/log-in', {
                                    layout: 'main',
                                    validationMessages,
                                    values: req.body,
                                    userError: userMessage
                                });
                            }
                        })
                }
                else {
                    console.log("No user found");
                    userMessage.push("Email was not found in database");
                    res.render('general/log-in', {
                        layout: 'main',
                        validationMessages,
                        values: req.body,
                        userError: userMessage
                    });
                }
            })
    }
    else {
        res.render('general/log-in', {
            layout: 'main',
            validationMessages,
            values: req.body
        });
    }
})

router.get("/log-out", (req, res)=>{
    req.session.destroy();
    // MongoStore.destroy(),
    res.redirect("log-in");
})
module.exports = router;