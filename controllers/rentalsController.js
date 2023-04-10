const express = require("express");
const router = express.Router();
const rentals = require("../models/rentals-db");
const rentalModel = require("../models/rentalModel");
const path = require("path");
const fs = require('fs');
router.get("/", (req, res) => {
  rentalModel
    .find()
    .lean()
    .then((data) => {
      // console.log(data);
      let rentals = [];
      data.forEach((rental) => {
        let isDone = false;
        rentals.forEach((obj) => {
          if (obj.cityProvince == `${rental.city}, ${rental.province}`) {
            obj?.rentals.push(rental);
            isDone = true;
          }
        });
        if (!isDone) {
          let temp = {
            cityProvince: `${rental.city}, ${rental.province}`,
            rentals: [rental],
          };
          rentals.push(temp);
        }
      });
      // done
      res.render("rentals/rentals", {
        data: rentals,
        title: "Nest Rentals",
        layout: "main",
      });
    })
    .catch((err) => {
      console.log("Error occur while getting data " + err);
    });
});

// data entry clerk module a5
router.get("/list", (req, res) => {
  // will list the rentals with CRUD operation buttons
  if (req.session.user && req.session.isClerk) {
    // res.send("Welcome to Listing of rental (clerk)");

    // .lean() is used to tell mongoose that send data back as js plain object.
    rentalModel
      .find()
      .lean()
      .then((data) => {
        // data is rental get back from mongoDB.
        // data = rentals.getRentals();
        function compare(a, b) {
          if (a.headline < b.headline) {
            return -1;
          }
          if (a.headline > b.headline) {
            return 1;
          }
          return 0;
        }
        // sort data according to headline
        data.sort(compare);
        // console.log(data);
        // console.log(rentals.getFeaturedRentals());
        res.render("rentals/rentalList", {
          data: data,
          title: "Rentals List(clerk)",
          layout: "main",
          isClerk: true,
        });
      });
  } else {
    res.status(401).render("general/unauthorized", { layout: "main" })
    //    res.status(401).send("You are not authorized to view this page");
  }
});
router.get("/add", (req, res) => {
  if (req.session.user && req.session.isClerk) {
    res.render("rentals/addRentals", {
      layout: "main",
    });
  } else {
    res.status(401).render("general/unauthorized", { layout: "main" })
    //res.status(401).send("You are not authorized to view this page");
  }
});
function Validate(data) {
  data.numSleeps = parseInt(data.numSleeps);
  data.numBedrooms = parseInt(data.numBedrooms);
  data.numBathrooms = parseInt(data.numBathrooms);
  data.pricePerNight = parseFloat(data.pricePerNight);
  // console.log(req.body);
  let validationMessages = {};
  let passedValidation = true;
  const priceRegExp = /^\d+(\.\d{1,2})?$/;
  // headline validation
  if (typeof data.headline !== "string") {
    passedValidation = false;
    validationMessages.headline = "headline must be string";
  } else if (data.headline.trim().length === 0) {
    passedValidation = false;
    validationMessages.headline = "You must specify a headline";
  }
  // numSleeps validation
  if (isNaN(data.numSleeps)) {
    passedValidation = false;
    validationMessages.numSleeps = "numSleeps must be Number and entered";
  } else if (data.numSleeps > 100 || data.numSleeps < 0) {
    passedValidation = false;
    validationMessages.numSleeps =
      "You must specify a numSleeps in range [0, 100]";
  }

  // numBedrooms validation
  if (isNaN(data.numBedrooms)) {
    passedValidation = false;
    validationMessages.numBedrooms = "numBedrooms must be Number and entered";
  } else if (data.numBedrooms > 100 || data.numBedrooms < 0) {
    passedValidation = false;
    validationMessages.numBedrooms =
      "You must specify a numSleeps in range [0, 100]";
  }
  // numBathrooms validation
  if (isNaN(data.numBathrooms)) {
    passedValidation = false;
    validationMessages.numBathrooms = "numBathrooms must be Number and entered";
  } else if (data.numBathrooms > 100 || data.numBathrooms < 0) {
    passedValidation = false;
    validationMessages.numBathrooms =
      "You must specify a numBathrooms in range [0, 100]";
  }
  // pricePerNight validation
  if (isNaN(data.pricePerNight)) {
    passedValidation = false;
    validationMessages.pricePerNight =
      "pricePerNight must be Number and entered";
  } else if (data.pricePerNight <= 0.0) {
    passedValidation = false;
    validationMessages.pricePerNight =
      "You must specify a pricePerNight greater than 0.00";
  } else if (!priceRegExp.test(parseFloat(data.pricePerNight))) {
    passedValidation = false;
    validationMessages.pricePerNight =
      "Price should only have 2 maximum decimal places";
  }
  // city validation
  if (typeof data.city !== "string") {
    passedValidation = false;
    validationMessages.city = "city must be string";
  } else if (data.city.trim().length === 0) {
    passedValidation = false;
    validationMessages.city = "You must specify a city";
  }
  // province validation
  if (typeof data.province !== "string") {
    passedValidation = false;
    validationMessages.province = "province must be string";
  } else if (data.province.trim().length === 0) {
    passedValidation = false;
    validationMessages.province = "You must specify a province";
  }
  // featuredRental validation
  if (!data.featuredRental) {
    passedValidation = false;
    validationMessages.featuredRental = "featuredRental must be selected";
  }
  // is not needed as said in the video
  // imageUrl validation
  if (data.type === "insert" || data.imageUrl) {
    if (!data.imageUrl) {
      passedValidation = false;
      validationMessages.imageUrl = "imageUrl must be selected";
    }

    else {
      let ext = path.parse(data.imageUrl.name).ext;
      if (!(ext == ".jpg" || ext == ".jpeg" || ext == ".gif" || ext == ".png")) {
        passedValidation = false;
        validationMessages.imageUrl = "imageUrl must be in '.jpg' or '.jpeg' or '.png' or '.gif' format";
      }
    }
  }
  return { passedValidation, validationMessages };
}
router.post("/add", (req, res) => {
  // TODO check the incoming field
  // console.log(req.body);
  let {
    headline,
    numSleeps,
    numBedrooms,
    numBathrooms,
    pricePerNight,
    city,
    province,
    featuredRental,
    type
  } = req.body;
  let imageUrl = req.files?.imageUrl; // this is used as when img is not selected it would give error saying reading prof of undefined.
  let data = {
    headline,
    numSleeps,
    numBedrooms,
    numBathrooms,
    pricePerNight,
    city,
    province,
    featuredRental,
    imageUrl,
    type
  };
  const { passedValidation, validationMessages } = Validate(data);
  numSleeps = parseInt(numSleeps);
  numBedrooms = parseInt(numBedrooms);
  numBathrooms = parseInt(numBathrooms);
  pricePerNight = parseFloat(pricePerNight);
  if (passedValidation) {
    // all fields are validated
    console.log("validation passed");
    const rentalObj = new rentalModel({
      headline,
      numSleeps,
      numBedrooms,
      numBathrooms,
      pricePerNight,
      city,
      province,
      featuredRental,
    });
    rentalObj
      .save()
      .then((rentalSaved) => {
        console.log(
          `User ${rentalSaved.headline} has been added to the database.`
        );

        // Create a unique name for the image, so that it can be stord in the file system.
        let uniqueName = `Rental-pic-${rentalSaved._id}${path.parse(req.files.imageUrl.name).ext
          }`;

        // Copy the image data to a file in the "/assets/rentalImg" folder.
        imageUrl
          .mv(`assets/rentalImg/${uniqueName}`)
          .then(() => {
            // Update the document so it includes the unique name.
            rentalModel
              .updateOne(
                {
                  _id: rentalSaved._id,
                },
                {
                  imageUrl: `/rentalImg/${uniqueName}`,
                }
              )
              .then(() => {
                // Success
                console.log("Updated the rental pic.");
                res.redirect("/rentals/list");
              })
              .catch((err) => {
                console.log(`Error updating the rental picture ... ${err}`);
                res.redirect("/rentals/list");
              });
          })
          .catch((err) => {
            console.log(`Error saving the rental picture ... ${err}`);
            res.redirect("/rentals/list");
          });
      })
      .catch((err) => {
        console.log(`Error adding rental to the database ... ${err}`);
        res.render("rentals/addRentals", {
          layout: "main",
          validationMessages,
          values: data,
        });
      });
  } else {
    if (req.session.user && req.session.isClerk) {
      res.render("rentals/addRentals", {
        layout: "main",
        validationMessages,
        values: req.body,
      });
    }
  }
});
router.get("/edit/:id", (req, res) => {
  // console.log("edit/:id called");

  if (req.session.user && req.session.isClerk) {
    rentalModel
      .findById(req.params.id)
      .lean()
      .then((data) => {
        console.log(data);
        res.render("rentals/addRentals", {
          layout: "main",
          update: true,
          values: data,
        });
      })
      .catch((err) => {
        console.log("Update rental gives error while fetch data" + err);
      });
  } else {
    res.status(401).render("general/unauthorized", { layout: "main" })
    //res.status(401).send("You are not authorized to view this page");
  }
});
router.post("/edit/:id", (req, res) => {
  let {
    headline,
    numSleeps,
    numBedrooms,
    numBathrooms,
    pricePerNight,
    city,
    province,
    featuredRental,
    type
  } = req.body;
  let imageUrl = req.files?.imageUrl; // this is used as when img is not selected it would give error saying reading prof of undefined.
  console.log(type);
  let data = {
    headline,
    numSleeps,
    numBedrooms,
    numBathrooms,
    pricePerNight,
    city,
    province,
    featuredRental,
    imageUrl
  };
  const { passedValidation, validationMessages } = Validate(data);
  numSleeps = parseInt(numSleeps);
  numBedrooms = parseInt(numBedrooms);
  numBathrooms = parseInt(numBathrooms);
  pricePerNight = parseFloat(pricePerNight);
  if (passedValidation) {
    // console.log("edit/:id data validated");
    rentalModel
      .updateOne(
        {
          _id: req.params.id,
        },
        {
          headline,
          numSleeps,
          numBedrooms,
          numBathrooms,
          pricePerNight,
          city,
          province,
          featuredRental,
        }
      ).lean()
      .then((data) => {

        console.log("data updated");
        if (imageUrl) {
          // Create a unique name for the image, so that it can be stord in the file system.
          let uniqueName = `Rental-pic-${req.params.id}${path.parse(req.files.imageUrl.name).ext
            }`;

          // Copy the image data to a file in the "/assets/rentalImg" folder.
          imageUrl.mv(`assets/rentalImg/${uniqueName}`)
            .then(() => {
              // Update the document so it includes the unique name.
              rentalModel
                .updateOne(
                  {
                    _id: req.params.id,
                  },
                  {
                    imageUrl: `/rentalImg/${uniqueName}`,
                  }
                )
                .then(() => {
                  // Success
                  console.log("Updated the rental pic.");
                  res.redirect("/rentals/list");
                })
                .catch((err) => {
                  console.log(`Error updating the rental picture ... ${err}`);
                  res.redirect("/rentals/list");
                });
            })
            .catch((err) => {
              console.log(`Error saving the rental picture ... ${err}`);
              res.redirect("/rentals/list");
            });
        }
        else {
          res.redirect("/rentals/list");
        }

      })

      .catch((err) => {
        console.log("error while updating data");
      });
  } else {
    if (req.session.user && req.session.isClerk) {
      rentalModel
        .findById(req.params.id)
        .lean()
        .then((rental) => {
          res.render("rentals/addRentals", {
            layout: "main",
            update: true,
            values: rental,
            validationMessages
          });
        })
        .catch((err) => {
          console.log("Update rental gives error while fetch data" + err);
        });
    } else {
      res.status(401).render("general/unauthorized", { layout: "main" })
      //res.status(401).send("You are not authorized to view this page");
    }
  }
});
router.get("/remove/:id", (req, res) => {
  if (req.session.user && req.session.isClerk) {
    rentalModel
      .findById(req.params.id)
      .lean()
      .then((data) => {
        res.render("rentals/deleteConfirm", {
          layout: "main",
          data,
        });
      })
      .catch((err) => {
        console.log("Deleting rental gives error while fetch data" + err);
      });
  } else {
    res.status(401).render("general/unauthorized", { layout: "main" })
    //res.status(401).send("You are not authorized to view this page");
  }
});

router.post("/remove/:id", (req, res) => {
  rentalModel
    .findById(req.params.id)
    .lean()
    .then((data) => {
      rentalModel
        .deleteOne({ _id: req.params.id })
        .then(() => {
          console.log("data has been deleted successfully");
          fs.unlink(path.join(__dirname ,`/../assets/${data.imageUrl}`), (err) => {
            if (err) {
              console.error(err);
              res.redirect("/rentals/list");
            } else {
              console.log(`Image was deleted`);
              res.redirect("/rentals/list");
            }
        })
        .catch((err) => {
          console.log("Deleting rental gives error" + err);
        });
    })
    .catch((err) => {
      console.log("Deleting rental gives error while fetch data" + err);
    });
  });

});
module.exports = router;
