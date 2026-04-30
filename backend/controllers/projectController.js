const Project =
  require("../models/Project");


// ADD
exports.addProject = async (req, res) => {
  try {
  let images = [];

if (req.files?.images) {
  images = req.files.images.map(
    (f) => "https://fullstack-project-1-n510.onrender.com/uploads/" + f.filename
  );
}
let dwgFile = null;

if (req.files && req.files.dwgFile) {
  const file = req.files.dwgFile[0];

  dwgFile = {
    name: file.originalname,
    url: "https://fullstack-project-1-n510.onrender.com/uploads/" + file.filename,
  };
}
    // =========================
    // GENERATE UNIQUE PROJECT ID
    // =========================
    const lastProject = await Project.findOne().sort({
      createdAt: -1,
    });

    let nextNumber = 2001;

    if (lastProject && lastProject.projectId) {
      const lastNumber = parseInt(
        lastProject.projectId.split("-")[1]
      );
      nextNumber = lastNumber + 1;
    }

    const projectId = "PR-" + nextNumber;

    // =========================
    // CREATE PROJECT
    // =========================
  const project = new Project({
  ...req.body,
  totalAmount: Number(req.body.totalAmount || 0),
  images,
  dwgFile,
  projectId,
  clientId: req.body.clientId,
  phone: req.body.phone,
  payments: req.body.advanceAmount
    ? [{ amount: Number(req.body.advanceAmount) }]
    : [],
});

    const saved = await project.save();

    res.json(saved);

  } catch (err) {
    console.error("ADD PROJECT ERROR:", err);
    res.status(500).json(err);
  }
};


// GET
exports.getProjects = async (req, res) => {
  try {
    const data = await Project.find().sort({ createdAt: -1 });

    const updated = data.map((p) => {
      const totalPaid = (p.payments || []).reduce(
        (sum, pay) => sum + Number(pay.amount),
        0
      );

      const balance = Number(p.totalAmount || 0) - totalPaid;

      return {
        ...p._doc,
        totalPaid,
        balance,
      };
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json(err);
  }
};
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    const Client = require("../models/Client");
    let clientData = null;
    if (project.clientId) {
      clientData = await Client.findOne({ clientId: project.clientId });
    }

    // ================= CALCULATE =================
    const totalPaid = (project.payments || []).reduce(
      (sum, pay) => sum + Number(pay.amount || 0),
      0
    );

    const balance =
      Number(project.totalAmount || 0) - totalPaid;

    // ================= RESPONSE =================
const response = {
  ...project._doc,

  totalPaid,
  balance,

  clientPhone:
    project.phone || 
    clientData?.phone || 
    "",

  clientName: project.clientName || "",
};
    res.json(response);

  } catch (err) {
    console.log("GET PROJECT ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// DELETE
exports.deleteProject =
  async (req, res) => {

    try {

      await Project.findByIdAndDelete(
        req.params.id
      );

      res.json({
        msg: "Deleted",
      });

    } catch (err) {

      res.status(500).json(err);

    }

  };



// UPDATE
exports.updateProject = async (req, res) => {
  try {
    const existingProject = await Project.findById(req.params.id)

    // ✅ images user kept
    let existingImages = [];
    if (req.body.existingImages) {
      existingImages = JSON.parse(req.body.existingImages);
    }

    // ✅ new uploaded images
    let newImages = [];
    if (req.files?.images) {
      newImages = req.files.images.map(
        (f) => "https://fullstack-project-1-n510.onrender.com/uploads/" + f.filename
      );
    }

    // ✅ FINAL images = kept + new
    const images = [...existingImages, ...newImages];

    // ================= DWG =================
    let dwgFile = existingProject?.dwgFile || null;

    if (req.files?.dwgFile) {
      const file = req.files.dwgFile[0];
      dwgFile = {
        name: file.originalname,
        url: "https://fullstack-project-1-n510.onrender.com/uploads/" + file.filename,
      };
    }

    const body = {
      ...req.body,
      images,
      dwgFile,
      clientId: req.body.clientId || "",
      phone: req.body.phone,
      totalAmount: Number(req.body.totalAmount || 0),
    };

    const data = await Project.findByIdAndUpdate(req.params.id, body, {
      new: true,
    });

    res.json(data);
  } catch (err) {
    console.log("UPDATE ERROR:", err);
    res.status(500).json(err);
  }
};
exports.addPayment = async (req, res) => {
  try {
    const { amount, date, note } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    project.payments.push({
      amount: Number(amount),
      date: date || new Date().toISOString().split("T")[0],
      note: note || "",
    });

    await project.save();

    res.json(project);
  } catch (err) {
    res.status(500).json(err);
  }
};

// ADD SCOPE
exports.addScope = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId); // ✅ FIX

    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    const scopeItem = {
      ...req.body,
      area: Number(req.body.area || 0),
      floors: Number(req.body.floors || 0),
      revisions: Number(req.body.revisions || 0),
      timeline: Number(req.body.timeline || 0),
      costPerSqft: Number(req.body.costPerSqft || 0),
      lumpSum: Number(req.body.lumpSum || 0),
    };

    project.scope.push(scopeItem);

    await project.save();

    res.json(project.scope);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET SCOPE
// GET /projects/:projectId/scope
exports.getScope = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) return res.status(404).json({ msg: "Not found" });

    res.json(project.scope || []);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching scope" });
  }
};




// PUT /projects/:projectId/scope/:scopeId
exports.updateScope = async (req, res) => {
  try {
    const { projectId, scopeId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ msg: "Project not found" });

    const scope = project.scope.id(scopeId);
    if (!scope) return res.status(404).json({ msg: "Scope not found" });

    const updatedData = {
      ...req.body,
      area: Number(req.body.area || 0),
      floors: Number(req.body.floors || 0),
      revisions: Number(req.body.revisions || 0),
      timeline: Number(req.body.timeline || 0),
      costPerSqft: Number(req.body.costPerSqft || 0),
      lumpSum: Number(req.body.lumpSum || 0),
    };

    Object.keys(updatedData).forEach((key) => {
      scope[key] = updatedData[key];
    });

    await project.save();

    res.json({ msg: "Scope updated", scope });
  } catch (err) {
    res.status(500).json({ msg: "Error updating scope" });
  }
};
exports.deleteScope = async (req, res) => {
  try {
    const { projectId, scopeId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ msg: "Project not found" });

    const scope = project.scope.id(scopeId);
    if (!scope) return res.status(404).json({ msg: "Scope not found" });

    scope.deleteOne(); // 🔥 remove subdocument

    await project.save();

    res.json({ msg: "Scope deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Error deleting scope" });
  }
};


// ================= ADD DRAWING =================
exports.addDrawing = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { type } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ msg: "Project not found" });

    const images = (req.files || []).map(
      (f) =>
        `${process.env.BASE_URL || "https://fullstack-project-1-n510.onrender.com"}/uploads/${f.filename}`
    );

    if (type === "civil") {
      project.civilImages = [...(project.civilImages || []), ...images];
    }

    if (type === "interior") {
      project.interiorImages = [...(project.interiorImages || []), ...images];
    }

    await project.save();

    res.json({ msg: "Uploaded", images });
  } catch (err) {
    console.log("ADD DRAWING ERROR:", err);
    res.status(500).json(err);
  }
};

// ================= ADD DRAWING BASE64 =================
exports.addDrawingBase64 = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { type, images } = req.body; // images is an array of base64 strings

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ msg: "Project not found" });

    if (type === "civil") {
      project.civilImages = [...(project.civilImages || []), ...images];
    }

    if (type === "interior") {
      project.interiorImages = [...(project.interiorImages || []), ...images];
    }

    await project.save();

    res.json({ msg: "Uploaded", images });
  } catch (err) {
    console.log("ADD DRAWING BASE64 ERROR:", err);
    res.status(500).json(err);
  }
};

// ================= GET DRAWINGS =================
exports.getDrawings = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) return res.status(404).json({ msg: "Not found" });

    res.json([
      {
        type: "civil",
        images: project.civilImages || [],
      },
      {
        type: "interior",
        images: project.interiorImages || [],
      },
    ]);
  } catch (err) {
    res.status(500).json(err);
  }
};

// ================= UPDATE DRAWINGS =================
exports.updateDrawing = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { type } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ msg: "Not found" });

    const newImages = (req.files || []).map(
      (f) =>
        `${process.env.BASE_URL || "https://fullstack-project-1-n510.onrender.com"}/uploads/${f.filename}`
    );

    if (type === "civil") {
      project.civilImages.push(...newImages);
    }

    if (type === "interior") {
      project.interiorImages.push(...newImages);
    }

    await project.save();

    res.json({ msg: "Updated", newImages });
  } catch (err) {
    res.status(500).json(err);
  }
};

// ================= DELETE ALL DRAWINGS =================
exports.deleteDrawing = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { type } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ msg: "Project not found" });

    if (type === "civil") project.civilImages = [];
    if (type === "interior") project.interiorImages = [];

    await project.save();

    res.json({ msg: "Deleted" });
  } catch (err) {
    res.status(500).json(err);
  }
};

// ================= DELETE SINGLE IMAGE =================
exports.deleteDrawingImage = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { imageUrl, type } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ msg: "Project not found" });

    if (type === "civil") {
      project.civilImages = project.civilImages.filter(img => img !== imageUrl);
    }

    if (type === "interior") {
      project.interiorImages = project.interiorImages.filter(img => img !== imageUrl);
    }

    await project.save();

    res.json({ msg: "Deleted" });
  } catch (err) {
    res.status(500).json(err);
  }
};

// ================= ADD VISIT =================
exports.addVisit = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { note } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ msg: "Project not found" });

    // Decrease counter if > 0
    if (project.visitCounter > 0) {
      project.visitCounter -= 1;
    }

    project.visitNotes.push({
      note,
      date: new Date(),
    });

    await project.save();

    res.json({
      msg: "Visit recorded",
      visitCounter: project.visitCounter,
      visitNotes: project.visitNotes,
    });
  } catch (err) {
    console.error("ADD VISIT ERROR:", err);
    res.status(500).json(err);
  }
};