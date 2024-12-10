const User = require("../models/User-Model.js");
const Enroll = require("../models/Enrollment-Model.js");
const bcryptjs = require("bcryptjs");
const auth = require("../auth.js");

// Register User
module.exports.registerUser = (req, res) => {
    let newUser = new User({
        firstName: req.body.firstName,
        middleName: req.body.middleName,
        lastName: req.body.lastName,
        email: req.body.email,
        contactNumber: req.body.contactNumber,
        password: bcryptjs.hashSync(req.body.password, 10)
    });

    return newUser.save()
        .then(result => {
            res.send({
                code: "REGISTRATION-SUCCESS",
                message: "You are now registered!",
                result: result
            });
        })
        .catch(error => {
            res.send({
                code: "REGISTRATION-FAILED",
                message: "We've encountered an error during the registration. Please try again!",
                result: error
            });
        });
};

// User Login
module.exports.loginUser = (req, res) => {
    let { email, password } = req.body;
    return User.findOne({ email: email }).then(result => {
        if (result == null) {
            return res.send({
                code: "USER-NOT-REGISTERED",
                message: "Please register to login."
            });
        } else {
            const isPasswordCorrect = bcryptjs.compareSync(password, result.password);

            if (isPasswordCorrect) {
                return res.send({
                    code: "USER-LOGIN-SUCCESS",
                    token: auth.createAccessToken(result)
                });
            } else {
                return res.send({
                    code: "PASSWORD-INCORRECT",
                    message: "Password is not correct. Please try again."
                });
            }
        }
    });
};

// Check if email exists
module.exports.checkEmail = (req, res) => {
    let { email } = req.body;
    return User.find({ email: email }).then(result => {
        if (result.length > 0) {
            return res.send({
                code: "EMAIL-EXISTS",
                message: "The user is registered."
            });
        } else {
            return res.send({
                code: "EMAIL-NOT-EXISTING",
                message: "The user is not registered."
            });
        }
    });
};

// Get User Profile
module.exports.getProfile = (req, res) => {
    const { id } = req.user;
    return User.findById(id).then(result => {
        if (result == null || result.length === 0) {
            return res.send({
                code: "USER-NOT-FOUND",
                message: "Cannot find user with the provided ID."
            });
        } else {
            result.password = "*****"; // Do not send password in response
            return res.send({
                code: "USER-FOUND",
                message: "A user was found.",
                result: result
            });
        }
    });
};


// Enroll a User
module.exports.enroll = (req, res) => {
    const { id } = req.user;

    let newEnrollment = new Enroll({
        userId: id,
        enrolledCourse: req.body.enrolledCourse,
        totalPrice: req.body.totalPrice
    });

    return newEnrollment.save().then((result, err) => {
        if (err) {
            res.send({
                code: "ENROLLMENT-FAILED",
                message: "There is a problem during your enrollment, please try again!",
                error: err
            });
        } else {
            res.send({
                code: "ENROLLMENT-SUCCESSFUL",
                message: "Congratulations, you are now enrolled!",
                result: result
            });
        }
    });
};

// Update User Password
module.exports.updatePassword = (req, res) => {
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    if (newPassword !== confirmNewPassword) {
        return res.send({
            code: "PASSWORD-MISMATCH",
            message: "New password and confirm password do not match."
        });
    }

    // Find the user by ID
    User.findById(req.user.id)
        .then(user => {
            if (!user) {
                return res.send({
                    code: "USER-NOT-FOUND",
                    message: "User not found."
                });
            }

            // Check if the old password matches
            const isOldPasswordCorrect = bcryptjs.compareSync(oldPassword, user.password);
            if (!isOldPasswordCorrect) {
                return res.send({
                    code: "OLD-PASSWORD-INCORRECT",
                    message: "Old password is incorrect."
                });
            }

            // Hash the new password
            const hashedPassword = bcryptjs.hashSync(newPassword, 10);
            user.password = hashedPassword;

            return user.save().then(() => {
                res.send({
                    code: "PASSWORD-UPDATED",
                    message: "Password updated successfully."
                });
            });
        })
        .catch(error => {
            res.send({
                code: "SERVER-ERROR",
                message: "Error updating password.",
                error: error
            });
        });
};



