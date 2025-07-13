const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Models
const List = require("./schema");      // Main list schema
const Login = require("./login");      // User schema
const Review = require("./review");    // Review schema
const Images = require("./images");    // Image schema
const data = require("./creation_of_data"); // Seed data (array of list objects)

async function main() {
  try {
    await mongoose.connect(process.env.Database_url_atlas);
    console.log("✅ Connected to MongoDB Atlas");

    await seedData();
    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Startup failed:", err.message);
  }
}

async function seedData() {
  try {
    // Clean existing data
    await List.deleteMany();
    await Review.deleteMany();
    console.log("✅ Old data cleared from List and Review collections");

    const validUserId = "6871e9ad031df75313345421"; // Replace with a real login _id from your DB

    // Transform and insert data
    const transformedData = await Promise.all(
      data.data.map(async (item) => {
        // Create dummy review with owner
        const dummyReview = new Review({
          comment: "Beautiful place! Loved it.",
          rating: 5,
          owner: validUserId
        });
        await dummyReview.save();

        // Assign listing fields
        return {
          ...item,
          logins: [validUserId],
          reviews: [dummyReview._id],
        };
      })
    );

    const result = await List.insertMany(transformedData);
    console.log("✅ Data inserted:");
    console.log(result.map((doc) => doc.title));

  } catch (err) {
    console.error("❌ Data seeding error:", err.message);
  }
}

// Run script
main();
