const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const userSchema = new mongoose.Schema({
    "Name": String,
    "Email":{
        "type" : String,
        "unique": true
    },
    "Password": String,
    "lastName": String,
});


// thi .pre function should always goes above model logic.
userSchema.pre("save", function (next) {
    let user = this;

    // Generate a unique SALT.
    bcryptjs.genSalt()
        .then(salt => {
            // Hash the password using the generated SALT.
            bcryptjs.hash(user.Password, salt)
                .then(hashedPwd => {
                    // The password was hashed.
                    user.Password = hashedPwd;
                    next();
                })
                .catch(err => {
                    console.log(`Error occurred when hasing ... ${err}`);
                });
        })
        .catch(err => {
            console.log(`Error occurred when salting ... ${err}`);
        });
});
const userModel = mongoose.model("users", userSchema);

module.exports = userModel;