const router =
  require("express").Router();

const {
  addClient,
  getClients,
  deleteClient,
  updateClient,
} = require(
  "../controllers/clientController"
);


// base = /api/clients

router.post("/", addClient);

router.get("/", getClients);

router.delete("/:id", deleteClient);

router.put("/:id", updateClient);


module.exports = router;