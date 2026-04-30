const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect("mongodb+srv://stanu4singh:tanu123456@cluster0.fx8em.mongodb.net/ArchitectPlatform?appName=Cluster0");

  console.log("MongoDB Connected");
};

module.exports = connectDB;