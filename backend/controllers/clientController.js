const Client =
  require("../models/Client");


// ADD
exports.addClient = async (req, res) => {
  try {
    console.log("BODY:", req.body);

    // =========================
    // GENERATE UNIQUE CLIENT ID
    // =========================
    const lastClient = await Client.findOne().sort({
      createdAt: -1,
    });

    let nextNumber = 1001;

    if (lastClient && lastClient.clientId) {
      const lastNumber = parseInt(
        lastClient.clientId.split("-")[1]
      );
      nextNumber = lastNumber + 1;
    }

    const clientId = "CL-" + nextNumber;

    // =========================
    // PREPARE BODY
    // =========================
    const body = {
      name: req.body.name || "",
      phone: req.body.phone || "",
      email: req.body.email || "",
      address: req.body.address || "",
      project: req.body.project || "",

      totalAmount: Number(req.body.totalAmount) || 0,
      advance: Number(req.body.advance) || 0,
      balance: Number(req.body.balance) || 0,

      clientId, // ✅ added
    };

    // =========================
    // SAVE CLIENT
    // =========================
    const client = new Client(body);

    await client.save();

    res.json(client);

  } catch (err) {
    console.log("ADD ERROR:", err);
    res.status(500).json(err);
  }
};


// GET
exports.getClients =
  async (req, res) => {

    try {

      const data =
        await Client.find().sort({ _id: -1 });

      res.json(data);

    } catch (err) {

      console.log("GET ERROR:", err);

      res.status(500).json(err);

    }

  };


// DELETE
exports.deleteClient =
  async (req, res) => {

    try {

      await Client.findByIdAndDelete(
        req.params.id
      );

      res.json({
        msg: "Deleted",
      });

    } catch (err) {

      console.log("DELETE ERROR:", err);

      res.status(500).json(err);

    }

  };


// UPDATE
exports.updateClient =
  async (req, res) => {

    try {

      const body = {
        ...req.body,
        totalAmount: Number(req.body.totalAmount || 0),
        advance: Number(req.body.advance || 0),
        balance: Number(req.body.balance || 0),
      };

      const data =
        await Client.findOneAndUpdate(
          { _id: req.params.id },
          body,
          {
            returnDocument: "after",
          }
        );

      res.json(data);

    } catch (err) {

      console.log("UPDATE ERROR:", err);

      res.status(500).json(err);

    }

  };


  