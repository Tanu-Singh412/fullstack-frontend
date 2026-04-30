const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({

  name: String,
  phone: String,
  email: String,
  address: String,
  project: String,
  totalAmount: Number,
  advance: Number,
  balance: Number,
  status: {
  type: String,
  default: "Active",
},
clientId: {
  type: String,
  unique: true,
},

},
{
    timestamps: true, // ✅ ADD THIS
  });

module.exports =
  mongoose.model(
    "Client",
    clientSchema
  );