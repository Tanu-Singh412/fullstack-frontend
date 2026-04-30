const router = require("express").Router();
const Project = require("../models/Project");

const {
  addProject,
  getProjects,
  deleteProject,
  updateProject,
  addPayment,
  addScope,
  getScope,
  updateScope,
  deleteScope,
  addDrawing,
  getDrawings,
  updateDrawing,
  deleteDrawing,
  deleteDrawingImage,
    getProjectById, 
  addDrawingBase64,
  addVisit,
} = require("../controllers/projectController");

const upload = require("../middleware/upload");

// CREATE PROJECT
router.post(
  "/",
  upload.fields([
    { name: "images", maxCount: 100 },
    { name: "dwgFile", maxCount: 1 },
  ]),
  addProject
);

// GET ALL
router.get("/", getProjects);
router.get("/:id", getProjectById);
// DELETE
router.delete("/:id", deleteProject);

// UPDATE
router.put(
  "/:id",
  upload.fields([
    { name: "images", maxCount: 100 },
    { name: "dwgFile", maxCount: 1 },
  ]),
  updateProject
);

// ✅ ADD PAYMENT
router.post("/:id/payment", addPayment);

// ================= DRAWINGS =================
router.post("/:projectId/drawing", upload.array("images", 10), addDrawing);
router.post("/:projectId/drawing/base64", addDrawingBase64);

router.get("/:projectId/drawing", getDrawings);

router.put("/:projectId/drawing", upload.array("images", 10), updateDrawing);

router.delete("/:projectId/drawing", deleteDrawing);

router.put("/:projectId/drawing/image", deleteDrawingImage);

// ✅ VISIT COUNTER
router.post("/:projectId/visit", addVisit);

// ✅ CORRECT
router.post("/:projectId/scope", addScope);
router.get("/:projectId/scope", getScope);
router.put("/:projectId/scope/:scopeId", updateScope);
router.delete("/:projectId/scope/:scopeId", deleteScope);
module.exports = router;