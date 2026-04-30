const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const path = require("path");
const clientRoutes = require("./routes/clientRoutes");
const projectRoutes = require("./routes/projectRoutes");
const vendorRoutes = require("./routes/vendorRoutes");
const categoryRoutes = require("./routes/categoryRoutes")
const invoiceRoutes = require("./routes/InvoiceRoutes");

const app = express();

// Connect DB
connectDB();

// Middleware
app.use(cors({
  origin: "https://fullstack-frontend-4-ym5y.onrender.com",
  credentials: true,
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Static
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/clients", clientRoutes);
app.use("/api/projects", projectRoutes); 
app.use("/api/vendors", vendorRoutes);
app.use("/api/vendor-categories", categoryRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/estimate", require("./routes/estimateRoutes"));


// Test route
app.get("/", (req, res) => {
  res.send("API running...");
});

// Server
app.listen(5000, () => {
  console.log("Server running on Port 5000");
});