const Estimate = require("../models/estimateModel");

/* ================= CREATE ================= */
exports.createEstimate = async (req, res) => {
  try {
    const { items } = req.body;

    // ✅ auto calculate total
    const totalEstimate = items.reduce(
      (sum, i) => sum + (i.qty * i.rate),
      0
    );

    const estimate = await Estimate.create({
      ...req.body,
      totalEstimate,
    });

    res.status(201).json(estimate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= GET ALL ================= */
exports.getEstimates = async (req, res) => {
  try {
    const data = await Estimate.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= GET ONE ================= */
exports.getEstimateById = async (req, res) => {
  try {
    const data = await Estimate.findById(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= UPDATE ================= */
exports.updateEstimate = async (req, res) => {
  try {
    const updated = await Estimate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= DELETE ================= */
exports.deleteEstimate = async (req, res) => {
  try {
    await Estimate.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};