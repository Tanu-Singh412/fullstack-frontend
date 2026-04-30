const router = require("express").Router();
const controller = require("../controllers/InvoiceController");

router.post("/", controller.createInvoice);
router.get("/", controller.getInvoices);
router.get("/:id", controller.getInvoiceById);
router.put("/:id", controller.updateInvoice);
router.delete("/:id", controller.deleteInvoice);

module.exports = router;