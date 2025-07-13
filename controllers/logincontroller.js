const list = require("../new_data/schema");
const Review = require("../new_data/review");
const accesslogin = require("../middelware");
const login = require("../new_data/login");
const moment = require('moment'); // for date comparison (install it if needed)

module.exports.rederformregister = (req, res) => {
    res.render("register.ejs")
};

module.exports.rederformlogin = (req, res) => {
    res.render("login.ejs")
};

module.exports.registeruser = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;

        if (!username || !password) {
            return res.status(400).send("Username and password are required.");
        }

        // ✅ Get today's start and end time
        const startOfDay = moment().startOf('day').toDate();
        const endOfDay = moment().endOf('day').toDate();

        // ✅ Count number of users registered today
        const registrationsToday = await login.countDocuments({
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        });

        if (registrationsToday >= 3) {
            return res.status(429).send("Registration limit reached for today. Please try again tomorrow.");
        }

        // ✅ Register the user
        const user = new login({ username, email });
        const newuser = await login.register(user, password);

        req.login(newuser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "You are directly logged in");
            res.redirect("/showlist");
        });

    } catch (err) {
        res.status(500).send("Error: " + err.message);
    }
};

module.exports.logout = (req, res, err) => {
    req.logOut((err) => {
        if (err) {
            return next(err)
        }
        else {
            req.flash("success", "The successfully logout from account");
            res.redirect("/showlist");
        }
    }
    )
};