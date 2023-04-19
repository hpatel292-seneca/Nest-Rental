const express = require("express");
const router = express.Router();
const rentalModel = require("../models/rentalModel");
router.get('/', (req, res) => {
    console.log(req.session.isCustomer);
    if (req.session.user && req.session.isCustomer) {
    res.render('shopping-cart/cart', getCart(req));
    }else{
        res.status(401).render("general/unauthorized", { layout: "main" })
    }
})
const getCart = function (req, message) {

    if (req.session.user && req.session.isCustomer) {
        // The user is signed in and has a session established.

        let cart = req.session.cart || [];

        // Used to store how much is owed.
        let cartTotal = 0;

        // Check if the cart has any songs.
        const hasRental = cart.length > 0;

        // If there are songs in the cart, then calculate the order total.
        if (hasRental) {
            cart.forEach(rental => {
                rental.subTotal = rental.pricePerNight * rental.numOfNights;
                cartTotal += rental.pricePerNight * rental.numOfNights;
            });
        }

        return {
            message,
            hasRental,
            rental: cart,
            Total: "$" + cartTotal.toFixed(2),
            VAT: "$" + (cartTotal * 0.10).toFixed(2),
            subTotal: "$" + (cartTotal * 1.10).toFixed(2),
        };
    }
    else {
        // The user is not signed in, return the default information.

        return {
            message,
            hasSongs: false,
            songs: [],
            cartTotal: "$0.00"
        };
    }
};

router.get("/add-rental/:id", (req, res) => {

    let message;
    const rentalId = (req.params.id);

    // Check if the user is signed in.
    if (req.session.user && req.session.isCustomer) {
        // The user is signed in as customer

        let cart = req.session.cart = req.session.cart || [];
        rentalModel
            .findById(rentalId)
            .lean()
            .then((data) => {
                if (data) {
                    // Search the shopping cart to see if the song is already added.
                    let found = false;

                    cart.forEach(rental => {
                        if (rental._id == rentalId) {
                            // Song is already in the shopping cart.
                            found = true;
                            rental.numOfNights++;

                        }
                    });

                    if (found) {
                        console.log(getCart(req));
                        res.render('shopping-cart/cart', getCart(req));
                    }
                    else {
                        // Create a new object and add it to the cart.
                        data.numOfNights = parseInt(1);
                        data.subTotal = data.numOfNights * data.pricePerNight;
                        cart.push(data);
                        res.redirect('/cart');
                    }
                }
                else {
                    res.status(401).send("There is no rental with that ID in database");
                }
            })

            .catch((err) => {
                console.log("Adding rental to cart gives error while fetch data" + err);
            });

    }
    else {
        res.status(401).render("general/unauthorized", { layout: "main" })
    }
});

router.get("/remove-rental/:id", (req, res) => {
    let message;
    const rentalId = req.params.id;

    // Check if the user is signed in.
    if (req.session.user && req.session.isCustomer) {
        // The user is signed in as Customer

        let cart = req.session.cart || [];

        // Find the index of the song in the shopping cart.
        const index = cart.findIndex(rental => rental._id == rentalId);

        if (index >= 0) {
            cart.splice(index, 1);
        }
        else {
            message = "Rental was not found in the cart.";
        }
    }
    else {
        // The user is not signed in.
        res.status(401).render("general/unauthorized", { layout: "main" })
    }

    res.render('shopping-cart/cart', getCart(req, message));
});

router.get("/remove-night/:id", (req, res) => {
    const rentalId = req.params.id;
    console.log("removing night");
    // Check if the user is signed in.
    if (req.session.user && req.session.isCustomer) {
        // The user is signed in as Customer

        let cart = req.session.cart || [];

        // Find the index of the song in the shopping cart.
        const index = cart.findIndex(rental => rental._id == rentalId);

        if (index >= 0) {
            // cart.splice(index, 1);
            console.log("removing night from rental with card index " + index);
            if (cart[index].numOfNights <= 1) {
                res.redirect(`/cart/remove-rental/${rentalId}`);
            }
            else {
                cart[index].numOfNights--;
                res.redirect('/cart');
            }
        }
        else {
            res.redirect('/cart');
        }
    }
    else {
        // The user is not signed in.
        res.status(401).render("general/unauthorized", { layout: "main" })
    }

    res.render('shopping-cart/cart', getCart(req));
});


router.get("/check-out", (req, res) => {
    let message;

    // Check if the user is signed in.
    if (req.session.user && req.session.isCustomer) {
        // The user is already signed in.

        let cart = req.session.cart || [];

        if (cart.length > 0) {
            // There are items in the cart, checkout the user.
           const {
                message,
                hasRental,
                rental,
                Total,
                VAT,
                subTotal,
            } = getCart(req);
            let emailMessage = "Booking Contains <br>";
            rental.forEach((item, index)=>{
                emailMessage += `
                ${index+1}) ${item.headline}, ${item.city}, ${item.province}  <br>
                CAD/night: ${item.pricePerNight}  <br>
                Nights: ${item.numOfNights},  <br>
                Total: ${item.subTotal}    <br>  <br>
                `;
            })
            emailMessage += `Total Amount: ${Total}  <br>
            VAT: ${VAT},  <br>
            Final Total: ${subTotal},  <br>  <br>

            Thank you for using Nest, Hope you love our services.
            `
            // Continue and submit contact us form.
            const sgMail = require("@sendgrid/mail");
            sgMail.setApiKey(process.env.SEND_GRID_API_KEY);
            let Email = req.session.user.Email;
            const msg = {
                to: Email,
                from: "harshilpatelpatel70@gmail.com",
                subject: "Rental Booking Confirmation",
                html: emailMessage,
            };

            sgMail.send(msg)
                .then(() => {
                    // res.redirect('/welcome');
                    res.redirect("/cart");
                })
                .catch(err => {
                    console.log(err);
                    res.redirect("/cart");
                });
            req.session.cart = [];
        }
        else {
            // There are no items in the cart.
            message = "You cannot checkout, there are no items in the cart.";
            res.render("/shopping-cart/cart", getCart(req, message));
        }

    }
    else {
        // The user is not signed in.
        res.status(401).render("general/unauthorized", { layout: "main" })
    }
});
module.exports = router;