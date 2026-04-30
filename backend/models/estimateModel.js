const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  sno: String,
  desc: String,
  qty: Number,
  unit: String,
  rate: Number,
  amount: Number,
});

const estimateSchema = new mongoose.Schema({
  projectTitle: String,
  ownerName: String,
  location: String,
  plotArea: Number,
  totalEstimate: Number,
  notes: String,
  description: String,
  items: [itemSchema],
}, { timestamps: true });

module.exports = mongoose.model("Estimate", estimateSchema);