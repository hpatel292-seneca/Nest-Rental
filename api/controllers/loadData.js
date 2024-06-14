const express = require("express");
const router = express.Router();
const rentalModel = require("../models/rentalModel");
const rentals = require("../models/rentals-db");
router.get("/rentals", (req, res)=>{
    // only data entry clerk can access this page
    if (req.session.user && req.session.isClerk){
    rentalModel.count()
    .then(count=>{
        if(count === 0){
            rentalModel.insertMany(rentals.getRentals())
            .then(()=>{
                res.render("load-data/message", {
                    message: "Success, data was loaded successfully",
                    layout: "main",
                    
                })
                
            })
            .catch(error=>{
                res.send(error.message);
            });
        }
        else{
            res.render("load-data/message", {
                message: "There are already data entries",
                layout: "main",
            })
        }
    })
    .catch(error=>{
        res.send(error.message);
    });
}
else{
    res.status(401).render("general/unauthorized",{layout: "main"})
    //res.status(401).send("You are not authorized to view this page");
}
})


module.exports = router;