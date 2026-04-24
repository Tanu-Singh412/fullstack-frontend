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
import DataTable from "examples/Tables/DataTable";
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
                Rs. {item.price}
              </td>
              <td style={{ ...styles.td, textAlign: "right" }}>
                Rs. {item.qty * item.price}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={styles.totalBox}>
        <div style={styles.totalRow}>
          <span>Subtotal:</span>
          <span>Rs. {totals.subtotal}</span>
        </div>
        {data.sgst > 0 && (
          <div style={styles.totalRow}>
            <span>SGST ({data.sgst}%):</span>
            <span>Rs. {totals.sgst}</span>
          </div>
        )}
        {data.cgst > 0 && (
          <div style={styles.totalRow}>
            <span>CGST ({data.cgst}%):</span>
            <span>Rs. {totals.cgst}</span>
          </div>
        )}
        <div style={styles.finalTotal}>
          <span>Total:</span>
          <span>Rs. {totals.total}</span>
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

      const matchedClient = clients.find(
        (c) =>
          c.clientName?.toLowerCase() === (inv.invoiceName || inv.clientName)?.toLowerCase(),
      );

      if (matchedClient?.phone) {
        const message = `Hello ${matchedClient.clientName}, your invoice ${inv.invoiceNo} for Rs. ${inv.total} is ready. View it here: [Invoice Link]`;
        const whatsappUrl = `https://wa.me/${matchedClient.phone}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, "_blank");
      } else {
        alert("Client phone number not found in database.");
      }
    } catch (err) {
      console.error("WhatsApp error:", err);
      alert("Error fetching client details.");
    }
  };

  const handleSaveAndDownload = async () => {
    try {
      setLoading(true);
      const invoiceData = {
        ...data,
        invoiceName: data.billingName,
        clientGstin: data.billingGstin,
        total: totals.total,
      };

      const res = data._id
        ? await updateInvoice(data._id, invoiceData)
        : await createInvoice(invoiceData);

      if (res.success) {
        alert(data._id ? "Invoice Updated" : "Invoice Created");
        downloadPDF(pdfRef.current);
        loadInvoices();
      }
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await apiDeleteInvoice(deleteId);
      if (res.success) {
        setInvoices(invoices.filter((inv) => inv._id !== deleteId));
        setDeleteId(null);
      }
    } catch (err) {
      console.error("Delete failed", err);
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
                </MDBox>
              </Grid>

              {/* Client Info */}
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Billing Name"
                  variant="outlined"
                  value={data.billingName}
                  onChange={(e) => handleInputChange("billingName", e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Billing Email (Optional)"
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
                  onChange={(e) => handleInputChange("billingGstin", e.target.value)}
                />
              </Grid>

              {/* Invoice Details */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Invoice Number"
                  variant="outlined"
                  value={data.invoiceNo}
                  onChange={(e) => handleInputChange("invoiceNo", e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date"
                  type="date"
                  variant="outlined"
                  value={data.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* Items Section */}
              <Grid item xs={12}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <MDTypography variant="h6" fontWeight="bold">Invoice Items</MDTypography>
                  <Button variant="gradient" color="info" startIcon={<AddIcon />} onClick={addItem}>Add Item</Button>
                </Box>
                <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e2e8f0" }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#f1f5f9" }}>
                        <TableCell sx={{ fontWeight: "bold" }}>Description</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>HSN/SAC</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Qty</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Rate</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Amount</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.items.map((item, i) => (
                        <TableRow key={i}>
                          <TableCell sx={{ width: "40%" }}>
                            <TextField fullWidth size="small" value={item.name} onChange={(e) => updateItem(i, "name", e.target.value)} />
                          </TableCell>
                          <TableCell>
                            <TextField fullWidth size="small" value={item.hsn} onChange={(e) => updateItem(i, "hsn", e.target.value)} />
                          </TableCell>
                          <TableCell>
                            <TextField fullWidth size="small" type="number" value={item.qty} onChange={(e) => updateItem(i, "qty", e.target.value)} />
                          </TableCell>
                          <TableCell>
                            <TextField fullWidth size="small" type="number" value={item.price} onChange={(e) => updateItem(i, "price", e.target.value)} />
                          </TableCell>
                          <TableCell>Rs. {item.qty * item.price}</TableCell>
                          <TableCell>
                            <IconButton color="error" size="small" onClick={() => removeItem(i)}><DeleteIcon /></IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

              {/* Totals Section */}
              <Grid item xs={12} md={6}></Grid>
              <Grid item xs={12} md={6}>
                <Box bgcolor="#f8fafc" p={3} borderRadius={2} border="1px solid #e2e8f0">
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="textSecondary">Subtotal:</Typography>
                    <Typography variant="body2" fontWeight="bold">Rs. {totals.subtotal}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1} gap={2}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" color="textSecondary">SGST:</Typography>
                      <TextField size="small" sx={{ width: 60 }} type="number" value={data.sgst} onChange={(e) => handleInputChange("sgst", e.target.value)} />
                      <Typography variant="caption">%</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="bold">Rs. {totals.sgst}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={2} gap={2}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" color="textSecondary">CGST:</Typography>
                      <TextField size="small" sx={{ width: 60 }} type="number" value={data.cgst} onChange={(e) => handleInputChange("cgst", e.target.value)} />
                      <Typography variant="caption">%</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="bold">Rs. {totals.cgst}</Typography>
                  </Box>
                  <Divider />
                  <Box display="flex" justifyContent="space-between" mt={2}>
                    <Typography variant="h5" fontWeight="bold" color="dark">Grand Total:</Typography>
                    <Typography variant="h5" fontWeight="bold" color="success">Rs. {totals.total}</Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Action Buttons */}
              <Grid item xs={12}>
                <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
                  <Button variant="outlined" color="info" onClick={() => setPreviewOpen(true)}>Preview</Button>
                  <Button variant="contained" color="success" onClick={handleSaveAndDownload} startIcon={<DownloadIcon />} sx={{ color: "white" }}>Save & Download PDF</Button>
                </Box>
              </Grid>
            </Grid>
          </Card>

          {/* ================= SAVED INVOICES ================= */}
          <Card
            sx={{
              mt: 4,
              p: 4,
              borderRadius: 3,
              boxShadow: "0px 4px 20px rgba(0,0,0,0.05)",
            }}
          >
            <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <MDTypography variant="h5" fontWeight="bold">Saved Invoices Records</MDTypography>
            </MDBox>
            <Box p={0}>
              {/* Search and Filters */}
              <Box display="flex" gap={2} flexWrap="wrap" alignItems="center" mb={4}>
                <TextField
                  variant="outlined"
                  size="small"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />

                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <Select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Records</MenuItem>
                    <MenuItem value="day">Today</MenuItem>
                    <MenuItem value="month">This Month</MenuItem>
                    <MenuItem value="year">This Year</MenuItem>
                    <MenuItem value="custom">Custom Range</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {loading ? (
                <Box display="flex" justifyContent="center" py={10}>
                  <CircularProgress size={30} thickness={5} />
                </Box>
              ) : (
                <Box>
                  {invoices.length === 0 ? (
                    <Box textAlign="center" py={10}>
                      <MDTypography variant="body2" color="textSecondary" fontWeight="medium">
                        No matching invoices found.
                      </MDTypography>
                    </Box>
                  ) : (
                    <DataTable
                      table={{
                        columns: [
                          { Header: "Invoice No", accessor: "invoiceNo", width: "15%" },
                          { 
                            Header: "Recipient", 
                            accessor: "invoiceName", 
                            width: "30%",
                          },
                          { 
                            Header: "Date", 
                            accessor: "date", 
                            width: "15%",
                            Cell: ({ value, row }) => (
                              <Typography fontSize={13}>
                                {new Date(value || row.original.createdAt).toLocaleDateString()}
                              </Typography>
                            )
                          },
                          { 
                            Header: "Amount", 
                            accessor: "total", 
                            width: "15%",
                            Cell: ({ value }) => (
                              <Typography fontWeight="bold" fontSize={14}>
                                Rs. {value?.toLocaleString("en-IN")}
                              </Typography>
                            )
                          },
                          {
                            Header: "Actions",
                            accessor: "actions",
                            width: "25%",
                            Cell: ({ row }) => (
                              <Box display="flex" gap={1}>
                                <IconButton
                                  size="small"
                                  color="info"
                                  onClick={() => {
                                    const inv = row.original;
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
                                  color="success"
                                  onClick={() => handleDownloadExisting(row.original)}
                                >
                                  <DownloadIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => setDeleteId(row.original._id)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            ),
                          },
                        ],
                        rows: invoices,
                      }}
                      isSorted={true}
                      entriesPerPage={{ defaultValue: 5, entries: [5, 10, 15, 20, 25] }}
                      showTotalEntries={true}
                      noEndBorder
                    />
                  )}
                </Box>
              )}
            </Box>
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
        <DialogTitle sx={{ textAlign: "center", fontWeight: "bold", fontSize: "18px", display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
          <WarningAmberIcon sx={{ color: "#f44336", fontSize: 40 }} />
          Confirm Delete
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center", fontSize: "14px", color: "#555" }}>
          Are you sure you want to delete this invoice?<br /><b style={{ color: "#f44336" }}>This action cannot be undone.</b>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2, gap: 1 }}>
          <Button onClick={() => setDeleteId(null)} sx={{ borderRadius: "8px", textTransform: "none", px: 3, border: "1px solid black", color: "#000" }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete} sx={{ borderRadius: "8px", textTransform: "none", px: 3, background: "#f44336", color: "#fff", "&:hover": { background: "#d32f2f" } }}>Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Invoice Preview</DialogTitle>
        <DialogContent dividers sx={{ backgroundColor: "#f5f5f5", display: "flex", justifyContent: "center", p: 4 }}>
          <Paper elevation={3}><Invoice data={data} totals={totals} /></Paper>
        </DialogContent>
        <DialogActions sx={{ padding: "20px 24px", justifyContent: "flex-end" }}>
          <Button onClick={() => setPreviewOpen(false)} color="inherit">Close</Button>
          <Button onClick={() => { handleSaveAndDownload(); setPreviewOpen(false); }} variant="contained" color="success" sx={{ color: "white" }} startIcon={<DownloadIcon />}>Save & Download PDF</Button>
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
