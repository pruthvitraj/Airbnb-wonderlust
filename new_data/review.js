const mongoose = require("mongoose");
const data = require("./creation_of_data");
const login = require("./login");
const images = require("./images");
const reviewschema = new mongoose.Schema({

    comment: String,
    rating: {
        type : Number,
        min: 1,
        max: 5
    },
    createdAt:{
        type: Date,
        default: Date.now,
    },
    owner:[
              {
                type: mongoose.Schema.ObjectId,
                ref: "login",
              }
            ]
  
 
});

const Review = mongoose.model("Review", reviewschema);
module.exports = Review;