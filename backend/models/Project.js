const mongoose = require("mongoose");

const scopeSchema = new mongoose.Schema({
  projectType: String,
  workType: String,
  area: Number,
  floors: Number,

  conceptDesign: Boolean,
  drawings2D: Boolean,
  elevation3D: Boolean,
  workingDrawings: Boolean,

  interiorLayout: Boolean,
  civil: Boolean,
  electrical: Boolean,
  plumbing: Boolean,
  interiorExecution: Boolean,
  supervision: Boolean,

  revisions: Number,
  timeline: Number,

  costPerSqft: Number,
  lumpSum: Number,

  materialIncluded: Boolean,
  notes: String,
}, { timestamps: true });


const projectSchema = new mongoose.Schema(
  {
    projectName: String,
    clientName: String,
    description: String,
    totalAmount: Number,
payments: [
  {
    amount: Number,
    date: {
      type: Date,
      default: Date.now,
    },
    note: String, // ✅ ADD THIS
  },
],

    images: [String],
dwgFile: {
  name: String,
  url: String,
},
    status: {
      type: String,
      default: "Pending",
    },
    projectId: {
  type: String,
  unique: true,
},
clientId: {
  type: String,
},
civilImages: [String],
interiorImages: [String],
client: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Client"
},
    scope: [scopeSchema], 
    visitCounter: {
      type: Number,
      default: 5,
    },
    visitNotes: [
      {
        note: String,
        date: { type: Date, default: Date.now },
      },
    ],
  },
  
  {
    timestamps: true,
  },
  
);

module.exports = mongoose.model("Project", projectSchema);