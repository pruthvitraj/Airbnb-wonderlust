const moment = require('moment'); // for date comparison (install it if needed)
const list = require("../new_data/schema");
const Review = require("../new_data/review");
const accesslogin = require("../middelware");
const login = require("../new_data/login");
const Image = require("../new_data/images");

require('dotenv').config({ path: './.env' });
// console.log("Loaded ENV Variables:", process.env.KEY);

const cookieParser = require("cookie-parser");
const { log } = require("console");
// require('dotenv').config();


module.exports.showone = async (req, res) => {
    let { id } = req.params;
    const listing = await list.findById(id);
    const listingr = await list.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "owner",
                select: "username email",  // Only select necessary fields
            }
        })
        .populate({
            path: "logins",  // Populate logins
            select: "username email", // Fetch only username field
        })
         .populate({
            path: "images",  // Populate images
            select: "filename url", // Fetch only username field
        });
        // console.log("the username of owner"+listingr.logins);
        
    let owenrli = listingr.logins[0].username;
    let reviewss = listingr.reviews || []; // Ensure it's an array
    let owenrre = (reviewss.length > 0 && reviewss[0].owner.length > 0) ? reviewss[0].owner[0] : null;
    let images  = listingr.images;
    console.log(images);
    res.render("showone.ejs", { images:images ,listing: listing, reviewss: listingr.reviews, owenrre: owenrre, owenrli: owenrli });
}

module.exports.updatepost = async (req, res) => {
    let { id } = req.params;
    await list.findByIdAndUpdate(id, { ...req.body });
    req.flash("success", "updated successfully");
    res.redirect(`/showlist/${id}`);
}
module.exports.editroute= async (req, res) => {
    let { id } = req.params;
    const listing = await list.findById(id);

    res.render("update.ejs", { listing: listing });
}

module.exports.creatinglist = async (req, res) => {
    try {
        // ✅ Step 1: Check if user is logged in
        if (!req.user || !req.user._id) {
            return res.status(401).send("Unauthorized: User not logged in.");
        }

        // ✅ Step 2: Count how many listings the user has created today
        const startOfDay = moment().startOf('day').toDate();
        const endOfDay = moment().endOf('day').toDate();

        const listingsToday = await list.countDocuments({
            logins: req.user._id,
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        });

        if (listingsToday >= 3) {
            req.flash("error", "You can only create 3 listings per day.");
            return res.redirect("/showlist");
        }

        // ✅ Step 3: Handle image upload
        const image = req.files['image']?.[0];     // main image
        const images = req.files['images'] || [];  // extra images

        if (!image) {
            console.error("❌ No main image received!");
            return res.status(400).send("Main image is required.");
        }

        // ✅ Step 4: Create new list
        const data = req.body;
        const newlist = new list(data);

        // main image
        newlist.image = {
            url: image.path,
            filename: image.filename
        };

        // extra images
        for (let file of images) {
            const newImage = new Image({
                filename: file.filename,
                url: file.path
            });
            await newImage.save();
            newlist.images.push(newImage); // Push image document
        }

        // add owner reference
        newlist.logins.push(req.user._id);

        await newlist.save();

        req.flash("success", "List created successfully");
        res.redirect("/showlist");

    } catch (err) {
        console.error("❌ Error creating list:", err);
        res.status(500).send("Server Error: " + err.message);
    }
};

module.exports.showalllisting = async (req, res) => {
    let alllist = await list.find({});
    console.log(res.locals.username);
    console.log(process.env.key);
    
    res.render("show.ejs", { alllist })
}
module.exports.renderformcreatinglist = (req, res) => {
    res.render("create.ejs")
};