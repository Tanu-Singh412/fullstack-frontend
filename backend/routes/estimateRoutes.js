const express = require("express");
const router = express.Router();

const {
  createEstimate,
  getEstimates,
  getEstimateById,
  updateEstimate,
  deleteEstimate
} = require("../controllers/estimateController");

/* ROUTES */
router.post("/", createEstimate);
router.get("/", getEstimates);
router.get("/:id", getEstimateById);
router.put("/:id", updateEstimate);
router.delete("/:id", deleteEstimate);

module.exports = router;