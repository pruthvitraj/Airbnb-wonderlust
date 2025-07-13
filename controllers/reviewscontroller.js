
const list = require("../new_data/schema");
const Review = require("../new_data/review");
const accesslogin = require("../middelware");
const login = require("../new_data/login");
const moment = require('moment'); // for date comparison (install it if needed)
module.exports.deletereview= async (req, res) => {
    let { id, rid } = req.params;
    let listing = await list.findById(id);
    await Review.findByIdAndDelete(rid);
    listing.reviews.push(_id = rid);
    req.flash("success","reviews deleted suceessfully");
    res.redirect(`/showlist/${id}`)
};

module.exports.deletelisting = async (req, res) => {
    let { id } = req.params;
    const listing = await list.findById(id);
    await list.deleteOne({ _id: listing._id }).then((res) => {
        console.log(res);
    })
    req.flash("success","listing deleted successfully");
    res.redirect(`/showlist`);
}

module.exports.newreviews = async (req, res) => {
    try {
        const { id } = req.params;
        const reviewData = req.body.review;

        // Step 1: Check if user is logged in
        if (!req.user || !req.user._id) {
            return res.status(401).send("Unauthorized: User not logged in.");
        }

        // Step 2: Set owner of review
        reviewData.owner = [req.user._id];

        // Step 3: Get today's start and end time
        const startOfDay = moment().startOf("day").toDate();
        const endOfDay = moment().endOf("day").toDate();

        // Step 4: Count how many reviews user has made today
        const reviewsToday = await Review.countDocuments({
            owner: req.user._id,
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        });

        if (reviewsToday >= 3) {
            req.flash("error", "You can only post 3 reviews per day.");
            return res.redirect(`/showlist/${id}`);
        }

        // Step 5: Create and save new review
        const newReview = new Review(reviewData);
        const listing = await list.findById(id);

        if (!listing.reviews) {
            listing.reviews = [];
        }

        listing.reviews.push(newReview);
        await newReview.save();
        await listing.save();

        req.flash("success", "Review created successfully.");
        res.redirect(`/showlist/${id}`);
    } catch (err) {
        console.error("Error creating review:", err);
        res.status(500).send("Internal Server Error");
    }
};