import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Avatar from "@mui/material/Avatar";
import {
  Card,
  Grid,
  TextField,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import brandWhite from "assets/images/logo-ct.png";
import brandDark from "assets/images/logo-ct-dark.png";
import go2webLogo from "assets/images/logo.png";

import {
  fetchInvoices,
  createInvoice,
  updateInvoice,
  deleteInvoice as apiDeleteInvoice,
} from "./api/invoiceApi";

/* ================= CONSTANTS ================= */
const FIXED_COMPANY_DETAILS = {
  company: "Go2Web Solution",
  address: "Sanjay Place",
  gstin: "27AAACS1234A1Z1",
  phone: "9876543210",
  logo: go2webLogo,
};

/* ================= PDF ================= */
const downloadPDF = async (el) => {
  if (!el) return alert("Invoice not ready");

  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#fff",
  });

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");
  const width = pdf.internal.pageSize.getWidth();
  const height = (canvas.height * width) / canvas.width;

  pdf.addImage(imgData, "PNG", 0, 0, width, height);
  pdf.save("invoice.pdf");
};

/* ================= NUMBER TO WORD ================= */
const numberToWords = (num) => {
  const a = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const b = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const inWords = (n) => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + " " + a[n % 10];
    if (n < 1000)
      return a[Math.floor(n / 100)] + " Hundred " + inWords(n % 100);
    if (n < 100000)
      return inWords(Math.floor(n / 1000)) + " Thousand " + inWords(n % 1000);
    if (n < 10000000)
      return inWords(Math.floor(n / 100000)) + " Lakh " + inWords(n % 100000);
    return (
      inWords(Math.floor(n / 10000000)) + " Crore " + inWords(n % 10000000)
    );
  };

  return inWords(Math.floor(num)) + " Rupees Only";
};

/* ================= INVOICE COMPONENT ================= */
const Invoice = React.forwardRef(({ data, totals }, ref) => {
  return (
    <div ref={ref} style={styles.page}>
      <div style={styles.headerRow}>
        <div style={styles.headerLeft}>
          {data.logo && (
            <img
              src={data.logo}
              alt="logo"
              style={styles.logo}
              crossOrigin="anonymous"
            />
          )}
        </div>

        <div style={styles.headerCenter}>
          <div style={styles.invoiceTitle}>TAX INVOICE</div>
        </div>

        <div style={styles.headerRight}>
          <div style={styles.metaText}>
            <b>Invoice No:</b> {data.invoiceNo}
          </div>
          <div style={styles.metaText}>
            <b>Date:</b>{" "}
            {data.date ? new Date(data.date).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' }) : ""}
          </div>
        </div>
      </div>

      <div style={styles.flexRow}>
        <div style={styles.senderBox}>
          <div style={styles.sectionTitle}>From</div>
          <div style={styles.infoText}>
            <b>{data.company}</b>
            <br />
            {data.address && (
              <>
                {data.address}
                <br />
              </>
            )}
            {data.phone && (
              <>
                Phone: {data.phone}
                <br />
              </>
            )}
            {data.gstin && <>GSTIN: {data.gstin}</>}
          </div>
        </div>

        <div style={styles.receiverBox}>
          <div style={styles.sectionTitle}>Bill To</div>
          <div style={styles.infoText}>
            <b>{data.billingName}</b>
            <br />
            {data.email && (
              <>
                {data.email}
                <br />
              </>
            )}
            {data.billingGstin && <>GSTIN: {data.billingGstin}</>}
          </div>
        </div>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={{ ...styles.th, width: "40%" }}>Description</th>
            {data.items.some((i) => i.hsn) && (
              <th style={styles.th}>HSN/SAC</th>
            )}
            <th style={{ ...styles.th, textAlign: "center" }}>Qty</th>
            <th style={{ ...styles.th, textAlign: "right" }}>Rate</th>
            <th style={{ ...styles.th, textAlign: "right" }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, i) => (
            <tr key={i}>
              <td style={styles.td}>{item.name}</td>
              {data.items.some((i) => i.hsn) && (
                <td style={styles.td}>{item.hsn || "-"}</td>
              )}
              <td style={{ ...styles.td, textAlign: "center" }}>{item.qty}</td>
              <td style={{ ...styles.td, textAlign: "right" }}>
                ₹{item.price}
              </td>
              <td style={{ ...styles.td, textAlign: "right" }}>
                ₹{item.qty * item.price}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={styles.totalBox}>
        <div style={styles.totalRow}>
          <span>Subtotal:</span>
          <span>₹{totals.subtotal}</span>
        </div>
        {data.sgst > 0 && (
          <div style={styles.totalRow}>
            <span>SGST ({data.sgst}%):</span>
            <span>₹{totals.sgst}</span>
          </div>
        )}
        {data.cgst > 0 && (
          <div style={styles.totalRow}>
            <span>CGST ({data.cgst}%):</span>
            <span>₹{totals.cgst}</span>
          </div>
        )}
        <div style={styles.finalTotal}>
          <span>Total:</span>
          <span>₹{totals.total}</span>
        </div>
      </div>

      <div style={styles.words}>
        <b>Amount in Words:</b> {numberToWords(totals.total)}
      </div>
    </div>
  );
});

Invoice.propTypes = {
  data: PropTypes.object.isRequired,
  totals: PropTypes.object.isRequired,
};

/* ================= MAIN COMPONENT ================= */
export default function InvoicePage() {
  const pdfRef = useRef();
  const navigate = useNavigate();
  // Data States
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Filter States
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all, day, month, year, custom
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Form State
  const [data, setData] = useState({
    _id: null,
    logo: FIXED_COMPANY_DETAILS.logo,
    billingName: "",
    email: "",
    company: FIXED_COMPANY_DETAILS.company,
    address: FIXED_COMPANY_DETAILS.address,
    gstin: FIXED_COMPANY_DETAILS.gstin,
    phone: FIXED_COMPANY_DETAILS.phone,
    invoiceNo: "",
    date: new Date().toISOString().split("T")[0],
    billingGstin: "",
    sgst: 9,
    cgst: 9,
    items: [{ name: "", hsn: "", qty: 1, price: 0 }],
    photo: null,
    photoName: "",
  });

  // Calculate Totals
  const subtotal = data.items.reduce((s, i) => s + i.qty * i.price, 0);
  const sgstAmount = (subtotal * data.sgst) / 100;
  const cgstAmount = (subtotal * data.cgst) / 100;
  const total = subtotal + sgstAmount + cgstAmount;
  const totals = {
    subtotal: subtotal.toFixed(2),
    sgst: sgstAmount.toFixed(2),
    cgst: cgstAmount.toFixed(2),
    total: total.toFixed(2),
  };

  // Fetch from API
  const loadInvoices = async () => {
    setLoading(true);
    try {
      const response = await fetchInvoices(
        search,
        filter,
        filter === "custom" ? startDate : "",
        filter === "custom" ? endDate : "",
      );
      if (response.success) {
        setInvoices(response.data);

        // AUTO-SERIES Logic: Generate next Invoice No
        if (response.data.length > 0 && !data._id && !data.invoiceNo) {
          const numbers = response.data
            .map(inv => parseInt(inv.invoiceNo?.replace(/[^0-9]/g, '')))
            .filter(n => !isNaN(n));

          if (numbers.length > 0) {
            const nextNo = Math.max(...numbers) + 1;
            setData(prev => ({
              ...prev,
              invoiceNo: prev.invoiceNo || `INV-${String(nextNo).padStart(4, '0')}`
            }));
          } else {
            setData(prev => ({ ...prev, invoiceNo: prev.invoiceNo || `INV-1001` }));
          }
        } else if (!data._id && !data.invoiceNo) {
          setData(prev => ({ ...prev, invoiceNo: `INV-1001` }));
        }
      }
    } catch (err) {
      console.error("Failed to load invoices", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1); // Reset pagination on search/filter change
    loadInvoices();
  }, [search, filter, startDate, endDate]);

  // Form Handlers
  const handleInputChange = (field, value) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const updateItem = (i, field, value) => {
    const items = [...data.items];
    items[i][field] = value;
    setData({ ...data, items });
  };

  const addItem = () => {
    setData({
      ...data,
      items: [...data.items, { name: "", hsn: "", qty: 1, price: 0 }],
    });
  };

  const removeItem = (index) => {
    const items = data.items.filter((_, i) => i !== index);
    setData({ ...data, items });
  };

  const handleWhatsAppInvoice = async (inv) => {
    try {
      const response = await fetch(
        "https://fullstack-project-1-n510.onrender.com/api/clients",
      );
      const clients = await response.json();

      const clientName = inv.invoiceName || inv.clientName;
      if (!clientName) {
        alert("Invoice does not have a valid Billing Name.");
        return;
      }

      const client = clients.find(
        (c) => c.name && c.name.toLowerCase() === clientName.toLowerCase(),
      );
      const phone = client?.phone;

      if (!phone) {
        alert(
          `Could not find a phone number for client "${clientName}" in the Client Database. Please update the client record.`,
        );
        return;
      }

      let cleanPhone = phone.toString().replace(/\D/g, "");
      if (cleanPhone.length === 10) cleanPhone = "91" + cleanPhone;

      const formattedDate = inv.date
        ? new Date(inv.date).toLocaleDateString("en-IN")
        : new Date(inv.createdAt).toLocaleDateString("en-IN");
      const text = `Dear ${clientName},

Please find the details for Invoice No: ${inv.invoiceNo} dated ${formattedDate} for a total amount of ₹${inv.total.toLocaleString("en-IN")}.

Kindly review the same and let us know if any clarification is required.

Thank you.`;
      const encodedText = encodeURIComponent(text);
      window.open(`https://wa.me/${cleanPhone}?text=${encodedText}`, "_blank");
    } catch (error) {
      console.error("Error sending WhatsApp", error);
      alert("Failed to send WhatsApp message. Please check your connection.");
    }
  };

  const handleSaveAndDownload = async () => {
    try {
      const payload = {
        ...data,
        clientName: data.billingName, // Backwards compatibility with old schema
        invoiceName: data.billingName, // New schema
        clientGstin: data.billingGstin, // backend uses clientGstin or we should keep it billingGstin
        subtotal: Number(totals.subtotal),
        total: Number(totals.total),
      };

      // Ensure we don't send immutable MongoDB fields when creating/updating
      delete payload._id;
      delete payload.createdAt;
      delete payload.updatedAt;
      delete payload.__v;

      let res;
      if (data._id) {
        res = await updateInvoice(data._id, payload);
      } else {
        res = await createInvoice(payload);
      }

      if (res.success) {
        loadInvoices(); // Refresh list
        downloadPDF(pdfRef.current);
        // Reset form
        setData((prev) => ({
          ...prev,
          _id: null,
          billingName: "",
          email: "",
          invoiceNo: `INV-${Date.now().toString().slice(-6)}`,
          date: new Date().toISOString().split("T")[0],
          billingGstin: "",
          items: [{ name: "", hsn: "", qty: 1, price: 0 }],
        }));
      } else {
        alert(
          "Failed to save invoice: " +
          (res.message || "Please check required fields."),
        );
      }
    } catch (err) {
      console.error("Failed to save invoice", err);
      alert("Network error or failed to save. Is the backend running?");
    }
  };

  const handleDelete = async () => {
    try {
      await apiDeleteInvoice(deleteId);
      setDeleteId(null);
      loadInvoices();
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  const handleDownloadExisting = async (inv) => {
    // Populate form temporarily for PDF generation
    setData({
      ...data,
      ...inv,
      billingName: inv.invoiceName,
      billingGstin: inv.clientGstin || inv.billingGstin,
      date: inv.date
        ? new Date(inv.date).toISOString().split("T")[0]
        : data.date,
    });
    // Wait for state to update, then download
    setTimeout(() => {
      downloadPDF(pdfRef.current);
    }, 500);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Box p={3}>
        <MDBox pt={6} pb={3} px={3}>
          <MDBox display="flex" alignItems="center" mb={3} gap={2}>
            <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(-1)}
              sx={{ bgcolor: "#b6276aff", color: "#fff", '&:hover': { bgcolor: "#000" } }}
            >
              Back
            </Button>
            <MDTypography variant="h4" fontWeight="bold">Invoice Management</MDTypography>
          </MDBox>

          {/* ================= INVOICE FORM ================= */}
          <Card
            sx={{
              p: 4,
              mb: 4,
              borderRadius: 3,
              boxShadow: "0px 4px 20px rgba(0,0,0,0.05)",
            }}
          >
            <Typography
              variant="h5"
              fontWeight="900"
              mb={4}
              sx={{ color: "#2c3e50" }}
            >
              Create / Edit Invoice
            </Typography>
            <Grid container spacing={3}>
              {/* Branding Header */}
              <Grid item xs={12}>
                <MDBox
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  bgcolor="#f8fafc"
                  p={2}
                  borderRadius={2}
                  border="1px solid #e2e8f0"
                >
                  <MDBox display="flex" alignItems="center" gap={2}>
                    {data.logo && <Avatar src={data.logo} variant="rounded" />}
                    <Box>
                      <MDTypography variant="h6" fontWeight="bold" color="dark">
                        {FIXED_COMPANY_DETAILS.company}
                      </MDTypography>
                      <MDTypography variant="caption" color="text" fontWeight="bold">
                        {FIXED_COMPANY_DETAILS.address} | Phone: {FIXED_COMPANY_DETAILS.phone}
                      </MDTypography>
                    </Box>
                  </MDBox>
                  <MDTypography variant="caption" sx={{ color: "#3498db", fontWeight: "900", textTransform: "uppercase" }}>
                    Fixed Branding Enabled
                  </MDTypography>
                </MDBox>
              </Grid>

              {/* Client Info */}
              <Grid item xs={12}>
                <Divider>
                  <Typography variant="body2" color="#000">
                    Billing Information
                  </Typography>
                </Divider>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Billing Name *"
                  variant="outlined"
                  value={data.billingName}
                  onChange={(e) =>
                    handleInputChange("billingName", e.target.value)
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Billing Email"
                  variant="outlined"
                  value={data.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Billing GSTIN"
                  variant="outlined"
                  value={data.billingGstin}
                  onChange={(e) =>
                    handleInputChange("billingGstin", e.target.value)
                  }
                />
              </Grid>

              {/* Invoice Details */}
              <Grid item xs={12}>
                <Divider>
                  <Typography variant="body2" color="#000">
                    Invoice Details
                  </Typography>
                </Divider>
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Invoice Number *"
                  variant="outlined"
                  value={data.invoiceNo}
                  onChange={(e) => handleInputChange("invoiceNo", e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Date *"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={data.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="SGST %"
                  type="number"
                  variant="outlined"
                  value={data.sgst}
                  onChange={(e) =>
                    handleInputChange("sgst", Number(e.target.value))
                  }
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="CGST %"
                  type="number"
                  variant="outlined"
                  value={data.cgst}
                  onChange={(e) =>
                    handleInputChange("cgst", Number(e.target.value))
                  }
                />
              </Grid>

              {/* Items */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold" mt={2} mb={1}>
                  Items
                </Typography>
                {data.items.map((item, i) => (
                  <Grid
                    container
                    spacing={2}
                    key={i}
                    sx={{ mb: 2, alignItems: "center" }}
                  >
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Item Name"
                        variant="outlined"
                        size="small"
                        value={item.name}
                        onChange={(e) => updateItem(i, "name", e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <TextField
                        fullWidth
                        label="HSN"
                        variant="outlined"
                        size="small"
                        value={item.hsn}
                        onChange={(e) => updateItem(i, "hsn", e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <TextField
                        fullWidth
                        label="Qty"
                        type="number"
                        variant="outlined"
                        size="small"
                        value={item.qty}
                        onChange={(e) =>
                          updateItem(i, "qty", Number(e.target.value))
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <TextField
                        fullWidth
                        label="Price"
                        type="number"
                        variant="outlined"
                        size="small"
                        value={item.price}
                        onChange={(e) =>
                          updateItem(i, "price", Number(e.target.value))
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <IconButton
                        color="error"
                        onClick={() => removeItem(i)}
                        disabled={data.items.length === 1}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                ))}
                <Button
                  startIcon={<AddIcon />}
                  onClick={addItem}
                  variant="text"
                  color="primary"
                >
                  Add Another Item
                </Button>
              </Grid>
            </Grid>

            <Box
              mt={4}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h6" fontWeight="bold">
                Total Amount: ₹{totals.total}
              </Typography>
              <Box display="flex" gap={2}>
                <Button
                  variant="outlined"
                  onClick={() => setPreviewOpen(true)}
                  startIcon={<VisibilityIcon />}
                  sx={{
                    color: "#000",
                    borderColor: "#000",
                    textTransform: "none",
                    "&:hover": {
                      borderColor: "#000",
                      backgroundColor: "#f5f5f5",
                    },
                  }}
                >
                  Preview
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleSaveAndDownload}
                  startIcon={<DownloadIcon />}
                  sx={{ color: "white" }}
                >
                  Save & Download PDF
                </Button>
              </Box>
            </Box>
          </Card>

          {/* ================= SAVED INVOICES ================= */}
          <Card
            sx={{
              p: 4,
              borderRadius: 4,
              boxShadow: "0px 10px 40px rgba(0,0,0,0.08)",
              border: "1px solid #f1f5f9",
              overflow: "hidden"
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={4}
              flexWrap="wrap"
              gap={2}
            >
              <Box>
                <Typography variant="h5" fontWeight="900" sx={{ color: "#c2268eff", letterSpacing: -0.5 }}>
                  All Invoices
                </Typography>
                <Typography variant="caption" color="text" fontWeight="600">Manage and track your issued invoices</Typography>
              </Box>

              {/* Search and Filters */}
              <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
                <TextField
                  variant="outlined"
                  size="small"
                  placeholder="Quick search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  sx={{
                    bgcolor: "#fff",
                    borderRadius: 2,
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "#3b82f6", borderWidth: "2px" },
                      "&:hover fieldset": { borderColor: "#2563eb" },
                      "&.Mui-focused fieldset": { borderColor: "#2563eb" },
                    },
                    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.1)"
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" sx={{ color: "#3b82f6" }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <Select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    sx={{
                      borderRadius: 2,
                      bgcolor: "#f8fafc",
                      fontWeight: "bold",
                      fontSize: 13,
                      color: "#1e293b",
                      px: 1.5,
                      py: 0.8,
                      "& fieldset": { border: "2px solid #e2e8f0" },
                      "&:hover fieldset": { borderColor: "#3b82f6" },
                      "& .MuiSelect-icon": { color: "#3b82f6" }
                    }}
                  >
                    <MenuItem value="all">📁 All Records</MenuItem>
                    <MenuItem value="day">📅 Today</MenuItem>
                    <MenuItem value="month">🗓️ This Month</MenuItem>
                    <MenuItem value="year">📊 This Year</MenuItem>
                    <MenuItem value="custom">🔍 Custom Range</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {loading ? (
              <Box display="flex" justifyContent="center" py={10}>
                <CircularProgress size={30} thickness={5} />
              </Box>
            ) : (
              <Box>
                {/* TABLE HEADER */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1.5fr 2fr 1fr 1fr 1fr",
                    background: "linear-gradient(90deg, #1e293b, #334155)",
                    color: "#fff",
                    px: 3,
                    py: 2,
                    borderRadius: 3,
                    fontWeight: "bold",
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    mb: 2
                  }}
                >
                  <span>Reference</span>
                  <span>Recipient</span>
                  <span>Issue Date</span>
                  <span>Amount</span>
                  <span style={{ textAlign: "right" }}>Actions</span>
                </Box>

                {invoices.length === 0 ? (
                  <Box textAlign="center" py={10} sx={{ bgcolor: "#f8fafc", borderRadius: 3, border: "1px dashed #e2e8f0" }}>
                    <Typography variant="body2" color="textSecondary" fontWeight="medium">
                      No matching invoices found in your records.
                    </Typography>
                  </Box>
                ) : (
                  invoices
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((inv) => (
                      <Box
                        key={inv._id}
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "1.5fr 2fr 1fr 1fr 1fr",
                          alignItems: "center",
                          px: 3,
                          py: 2.2,
                          mb: 1.5,
                          borderRadius: 3,
                          background: "#fff",
                          border: "1px solid #f1f5f9",
                          transition: "0.3s",
                          "&:hover": {
                            borderColor: "#3b82f6",
                            transform: "scale(1.01)",
                            boxShadow: "0 10px 20px rgba(0,0,0,0.04)"
                          },
                        }}
                      >
                        {/* Invoice No */}
                        <Typography fontWeight="bold" color="dark" fontSize={14}>
                          {inv.invoiceNo}
                        </Typography>

                        {/* Recipient */}
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ bgcolor: "#eff6ff", color: "#3b82f6", width: 30, height: 30, fontSize: 13, mr: 1.5, fontWeight: "bold" }}>
                            {(inv.invoiceName || inv.clientName || "?").charAt(0)}
                          </Avatar>
                          <Typography color="#334155" fontWeight="medium" fontSize={14}>
                            {inv.invoiceName || inv.clientName}
                          </Typography>
                        </Box>

                        {/* Date */}
                        <Typography color="#64748b" fontSize={12} fontWeight="bold">
                          {new Date(inv.date || inv.createdAt).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
                          <span style={{ color: "#94a3b8", marginLeft: 6, fontWeight: "normal" }}>
                            {new Date(inv.date || inv.createdAt).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </Typography>

                        {/* Amount */}
                        <Typography fontWeight="bold" color="#16a34a" fontSize={15}>
                          ₹{inv.total.toLocaleString("en-IN")}
                        </Typography>

                        {/* Actions */}
                        <Box display="flex" justifyContent="flex-end" gap={1.5}>
                          <IconButton
                            size="small"
                            sx={{
                              bgcolor: "#f0f9ff",
                              color: "#0284c7",
                              borderRadius: 2,
                              "&:hover": { bgcolor: "#0284c7", color: "#fff" },
                            }}
                            onClick={() => {
                              setData({
                                ...data,
                                ...inv,
                                billingName: inv.invoiceName || inv.clientName,
                                billingGstin: inv.clientGstin || inv.billingGstin,
                                date: new Date(inv.date || inv.createdAt)
                                  .toISOString()
                                  .split("T")[0],
                              });
                              setPreviewOpen(true);
                            }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>

                          <IconButton
                            size="small"
                            sx={{
                              bgcolor: "#f0fdf4",
                              color: "#16a34a",
                              borderRadius: 2,
                              "&:hover": { bgcolor: "#16a34a", color: "#fff" },
                            }}
                            onClick={() => handleDownloadExisting(inv)}
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>

                          <IconButton
                            size="small"
                            sx={{
                              bgcolor: "#fef2f2",
                              color: "#dc2626",
                              borderRadius: 2,
                              "&:hover": { bgcolor: "#dc2626", color: "#fff" },
                            }}
                            onClick={() => setDeleteId(inv._id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    ))
                )}

                {/* PAGINATION CONTROLS */}
                {invoices.length > itemsPerPage && (
                  <Box display="flex" justifyContent="center" alignItems="center" mt={4} gap={2}>
                    <Button
                      variant="outlined"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => prev - 1)}
                      sx={{ borderRadius: 2, textTransform: "none" }}
                    >
                      Previous
                    </Button>
                    <Typography variant="button" fontWeight="bold">
                      Page {currentPage} of {Math.ceil(invoices.length / itemsPerPage)}
                    </Typography>
                    <Button
                      variant="outlined"
                      disabled={currentPage === Math.ceil(invoices.length / itemsPerPage)}
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      sx={{ borderRadius: 2, textTransform: "none" }}
                    >
                      Next
                    </Button>
                  </Box>
                )}
              </Box>
            )}
          </Card>
          {/* Hidden PDF Component */}
          <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
            <Invoice ref={pdfRef} data={data} totals={totals} />
          </div>
        </MDBox>
      </Box>
      <Footer />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: "16px", p: 1 } }}
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "18px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
          }}
        >
          <WarningAmberIcon sx={{ color: "#f44336", fontSize: 40 }} />
          Confirm Delete
        </DialogTitle>
        <DialogContent
          sx={{ textAlign: "center", fontSize: "14px", color: "#555" }}
        >
          Are you sure you want to delete this invoice?
          <br />
          <b style={{ color: "#f44336" }}>This action cannot be undone.</b>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2, gap: 1 }}>
          <Button
            onClick={() => setDeleteId(null)}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              px: 3,
              border: "1px solid black",
              color: "#000",
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              px: 3,
              background: "#f44336",
              color: "#fff",
              "&:hover": { background: "#d32f2f" },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Invoice Preview</DialogTitle>
        <DialogContent
          dividers
          sx={{
            backgroundColor: "#f5f5f5",
            display: "flex",
            justifyContent: "center",
            p: 4,
          }}
        >
          <Paper elevation={3}>
            <Invoice data={data} totals={totals} />
          </Paper>
        </DialogContent>
        <DialogActions
          sx={{ padding: "20px 24px", justifyContent: "flex-end" }}
        >
          <Button onClick={() => setPreviewOpen(false)} color="inherit">
            Close
          </Button>
          <Button
            onClick={() => {
              handleSaveAndDownload();
              setPreviewOpen(false);
            }}
            variant="contained"
            color="success"
            sx={{ color: "white" }}
            startIcon={<DownloadIcon />}
          >
            Save & Download PDF
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

/* ================= STYLES ================= */
const styles = {
  page: {
    width: "210mm",
    minHeight: "297mm",
    padding: "50px",
    background: "#fff",
    fontFamily: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    color: "#111",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "40px",
    borderBottom: "3px solid #e0e0e0",
    paddingBottom: "25px",
  },
  headerLeft: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  logo: { height: "100px", marginBottom: "15px", objectFit: "contain" },
  companyTitle: {
    margin: 0,
    fontSize: "26px",
    fontWeight: "900",
    color: "#000",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  headerCenter: { flex: 1, textAlign: "center" },
  headerRight: { flex: 1, textAlign: "right" },
  invoiceTitle: {
    fontSize: "25px",
    fontWeight: "900",
    color: "#2c3e50",
    margin: "0",
    textTransform: "uppercase",
    letterSpacing: "2px",
  },
  metaText: {
    fontSize: "16px",
    marginBottom: "6px",
    color: "#333",
    fontWeight: "600",
  },
  flexRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "45px",
  },
  senderBox: { width: "48%" },
  receiverBox: { width: "48%", textAlign: "right" },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#2c3e50",
    textTransform: "uppercase",
    marginBottom: "12px",
    borderBottom: "3px solid #3498db",
    display: "inline-block",
    paddingBottom: "4px",
  },
  infoText: {
    fontSize: "16px",
    lineHeight: "1.8",
    color: "#222",
    fontWeight: "500",
  },
  table: { width: "100%", borderCollapse: "collapse", marginBottom: "45px" },
  th: {
    borderBottom: "3px solid #bdc3c7",
    padding: "16px 12px",
    background: "#f8f9fa",
    color: "#2c3e50",
    fontWeight: "900",
    textAlign: "left",
    fontSize: "16px",
    textTransform: "uppercase",
  },
  td: {
    borderBottom: "1px solid #ecf0f1",
    padding: "16px 12px",
    color: "#111",
    fontSize: "16px",
    fontWeight: "600",
  },
  totalBox: {
    width: "55%",
    marginLeft: "auto",
    background: "#f4f6f8",
    padding: "25px",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "12px",
    fontSize: "16px",
    fontWeight: "700",
    color: "#333",
  },
  finalTotal: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "15px",
    paddingTop: "15px",
    borderTop: "3px solid #bdc3c7",
    fontSize: "24px",
    fontWeight: "900",
    color: "#000",
  },
  words: {
    marginTop: "30px",
    fontSize: "16px",
    color: "#444",
    fontStyle: "italic",
    fontWeight: "700",
    borderTop: "2px dashed #ccc",
    paddingTop: "20px",
  },
};
