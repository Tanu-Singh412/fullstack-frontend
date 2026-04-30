const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

const vendorController = require("../controllers/vendorController");

router.post("/", upload.single("image"), vendorController.addVendor);
router.get("/", vendorController.getVendors);
router.get("/:id", vendorController.getVendorById);
router.put("/:id", upload.single("image"), vendorController.updateVendor);
router.delete("/:id", vendorController.deleteVendor);

module.exports = router;