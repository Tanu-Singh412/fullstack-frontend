const Vendor = require("../models/vendor");

// ================= ADD VENDOR =================
exports.addVendor = async (req, res) => {
  try {
    const data = { ...req.body };

    if (req.file) {
      data.image = "https://fullstack-project-1-n510.onrender.com/uploads/" + req.file.filename;
    }

    if (data.category) {
      data.category = data.category.trim();
    }

    // Parse materials if sent as string (from FormData)
    if (typeof data.materials === "string") {
      data.materials = JSON.parse(data.materials);
    }

    const vendor = new Vendor(data);
    await vendor.save();

    res.json({ data: vendor });
  } catch (err) {
    console.error("ADD VENDOR ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

// ================= GET VENDORS =================
exports.getVendors = async (req, res) => {
  try {
    const { category } = req.query;

    const filter = category
      ? { category: { $regex: new RegExp(`^${category}$`, "i") } }
      : {};

    const data = await Vendor.find(filter);

    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= GET SINGLE VENDOR =================
exports.getVendorById = async (req, res) => {
  try {
    const data = await Vendor.findById(req.params.id);

    if (!data) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= UPDATE VENDOR =================
exports.updateVendor = async (req, res) => {
  try {
    const updatedData = { ...req.body };

    if (req.file) {
      updatedData.image = "https://fullstack-project-1-n510.onrender.com/uploads/" + req.file.filename;
    }

    if (updatedData.category) {
      updatedData.category = updatedData.category.trim();
    }

    if (typeof updatedData.materials === "string") {
      updatedData.materials = JSON.parse(updatedData.materials);
    }

    const updated = await Vendor.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );

    res.json({ data: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= DELETE VENDOR =================
exports.deleteVendor = async (req, res) => {
  try {
    await Vendor.findByIdAndDelete(req.params.id);

    res.json({ message: "Vendor deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};