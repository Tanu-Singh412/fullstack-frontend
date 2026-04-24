import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  TextField,
  Button,
  IconButton,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  InputAdornment,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import CloseIcon from "@mui/icons-material/Close";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import EditIcon from "@mui/icons-material/Edit";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import AssignmentIcon from "@mui/icons-material/Assignment";
import BusinessIcon from "@mui/icons-material/Business";
import PersonIcon from "@mui/icons-material/Person";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AspectRatioIcon from "@mui/icons-material/AspectRatio";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

const API = "https://fullstack-project-1-n510.onrender.com/api/estimate";

export default function EstimatePage() {
  const [form, setForm] = useState({
    projectTitle: "",
    ownerName: "",
    location: "",
    plotArea: "",
    notes: "",
    description: "",
  });

  const [items, setItems] = useState([
    { sno: 1, desc: "", qty: "", unit: "", rate: "" },
  ]);

  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);

  /* ================= FETCH ALL ================= */
  const loadEstimates = async () => {
    setLoading(true);
    try {
      const res = await fetch(API);
      const data = await res.json();
      setEstimates(data);
    } catch (err) {
      console.error("Error fetching estimates:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEstimates();
  }, []);

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (i, field, value) => {
    const updated = [...items];
    updated[i][field] = value;
    setItems(updated);
  };

  /* ================= ADD ROW ================= */
  const addRow = () => {
    setItems([
      ...items,
      { sno: items.length + 1, desc: "", qty: "", unit: "", rate: "" },
    ]);
  };

  /* ================= DELETE ROW ================= */
  const deleteRow = (i) => {
    const updated = items.filter((_, index) => index !== i).map((item, idx) => ({
      ...item,
      sno: idx + 1
    }));
    setItems(updated.length > 0 ? updated : [{ sno: 1, desc: "", qty: "", unit: "", rate: "" }]);
  };

  /* ================= TOTAL ================= */
  const total = items.reduce(
    (sum, i) => sum + Number(i.qty || 0) * Number(i.rate || 0),
    0
  );

  /* ================= SAVE / UPDATE ================= */
  const saveEstimate = async () => {
    try {
      const method = editId ? "PUT" : "POST";
      const url = editId ? `${API}/${editId}` : API;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, items, totalEstimate: total }),
      });

      if (res.ok) {
        alert(editId ? "Updated Successfully" : "Saved Successfully");
        setEditId(null);
        setForm({ projectTitle: "", ownerName: "", location: "", plotArea: "", notes: "", description: "" });
        setItems([{ sno: 1, desc: "", qty: "", unit: "", rate: "" }]);
        loadEstimates();
      } else {
        alert("Failed to save estimate");
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Error saving estimate");
    }
  };

  /* ================= DELETE ================= */
  const deleteEstimate = async (id) => {
    if (!window.confirm("Are you sure you want to delete this estimate?")) return;
    try {
      const res = await fetch(`${API}/${id}`, { method: "DELETE" });
      if (res.ok) {
        loadEstimates();
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  /* ================= EDIT ================= */
  const handleEdit = (est) => {
    setEditId(est._id);
    setForm({
      projectTitle: est.projectTitle || "",
      ownerName: est.ownerName || "",
      location: est.location || "",
      plotArea: est.plotArea || "",
      notes: est.notes || "",
      description: est.description || "",
    });
    setItems(est.items || [{ sno: 1, desc: "", qty: "", unit: "", rate: "" }]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ================= WHATSAPP ================= */
  const handleWhatsApp = (est) => {
    const text = `*D DESIGN ARCHITECTS STUDIO - PROPOSAL*\n\nProject: ${est.projectTitle}\nOwner: ${est.ownerName}\nTotal Estimated Amount: Rs. ${est.totalEstimate.toLocaleString("en-IN")}\n\nWe look forward to working with you!`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  /* ================= PDF ================= */
  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // --- HEADER HELPER ---
    const addHeader = () => {
      // Logo (Left)
      try {
        doc.addImage("/logo.png", "PNG", 15, 10, 22, 22);
      } catch (e) {
        console.error("Logo not found", e);
      }

      // Studio Info (Center)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("D DESIGN ARCHITECTS STUDIO", pageWidth / 2, 15, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(50, 50, 50);
      doc.text("Architects, Interior Designers, Planners.", pageWidth / 2, 20, { align: "center" });
      doc.text("Block No.C-12, Shop No. F-6,", pageWidth / 2, 24, { align: "center" });
      doc.text("Near Max Malll, Sanjay Place, Agra. 282002", pageWidth / 2, 28, { align: "center" });

      // Architect Info (Right)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text("AR. PREMVEER SINGH", pageWidth - 15, 15, { align: "right" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text("(B.Arch)", pageWidth - 15, 19, { align: "right" });
      doc.text("Regi. No.- CA/18/98236", pageWidth - 15, 23, { align: "right" });
      doc.text("Email- premchak24@gmail.com", pageWidth - 15, 27, { align: "right" });

      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.2);
      doc.line(15, 35, pageWidth - 15, 35);
    };

    addHeader();

    // --- TITLE ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("ESTIMATE / PROPOSAL", pageWidth / 2, 45, { align: "center" });

    // --- PROJECT DETAILS TABLE ---
    autoTable(doc, {
      startY: 50,
      theme: "grid",
      head: [[{ content: "Project Details", colSpan: 4, styles: { halign: "left", fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: "bold" } }]],
      body: [
        ["Project Title:", { content: form.projectTitle || "-", styles: { fontStyle: "bold" } }, "Owner Name:", form.ownerName || "-"],
        ["Location:", form.location || "-", "Plot Area:", form.plotArea ? `${form.plotArea} Sq.Ft` : "-"],
        ["Total Estimated Amount:", { content: `Rs. ${total.toLocaleString("en-IN")}`, colSpan: 3, styles: { fontStyle: "bold" } }],
      ],
      styles: { fontSize: 9, cellPadding: 3, textColor: [0, 0, 0] },
      headStyles: { lineWidth: 0.1, lineColor: [0, 0, 0] },
    });

    let currentY = doc.lastAutoTable.finalY + 10;

    // --- OVERALL DESCRIPTION ---
    if (form.description) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("Project Description / Introduction:", 15, currentY);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const splitDesc = doc.splitTextToSize(form.description, pageWidth - 30);
      doc.text(splitDesc, 15, currentY + 6);
      currentY += (splitDesc.length * 4.5) + 10;
    }

    // --- ITEMS TABLE ---
    const tableData = items.map((row) => [
      row.sno,
      row.desc,
      row.qty,
      row.unit,
      row.rate,
      (Number(row.qty) * Number(row.rate)).toLocaleString("en-IN"),
    ]);

    autoTable(doc, {
      startY: currentY,
      theme: "grid",
      head: [["S.No", "Description", "Qty", "Unit", "Rate (Rs)", "Amount (Rs)"]],
      body: tableData,
      headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: "bold", lineWidth: 0.1 },
      styles: { fontSize: 8.5, cellPadding: 3, textColor: [0, 0, 0] },
      columnStyles: {
        0: { cellWidth: 12 },
        1: { cellWidth: "auto" },
        2: { cellWidth: 15, halign: "center" },
        3: { cellWidth: 15, halign: "center" },
        4: { cellWidth: 22, halign: "right" },
        5: { cellWidth: 25, halign: "right" },
      },
      didDrawPage: (data) => {
        if (data.pageNumber > 1) {
          addHeader();
        }
      },
    });

    // --- SUMMARY ---
    const finalY = doc.lastAutoTable.finalY;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`GRAND TOTAL: Rs. ${total.toLocaleString("en-IN")}`, pageWidth - 20, finalY + 12, { align: "right" });

    // --- NOTES SECTION ---
    if (form.notes) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("Notes / Terms & Conditions:", 15, finalY + 25);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const splitNotes = doc.splitTextToSize(form.notes, pageWidth - 30);
      doc.text(splitNotes, 15, finalY + 31);
    }

    // --- FOOTER ---
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });
      doc.text("This is a computer generated estimate.", 15, doc.internal.pageSize.getHeight() - 10);
    }

    doc.save(`Estimate_${form.projectTitle || "Project"}.pdf`);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <MDBox pt={4} pb={3} px={3} sx={{ backgroundColor: "#f0f2f5", minHeight: "100vh" }}>
        <Grid container spacing={3}>
          {/* ================= QUICK STATS ================= */}
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 2, borderRadius: "20px", background: "#fff", display: "flex", flexDirection: "row", alignItems: "center", gap: 2, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
              <MDBox variant="gradient" bgcolor="info" color="white" borderRadius="12px" p={2} sx={{ boxShadow: "0 10px 20px rgba(26, 115, 232, 0.2)" }}>
                <AssignmentIcon fontSize="medium" />
              </MDBox>
              <Box>
                <MDTypography variant="caption" fontWeight="bold" color="text" sx={{ textTransform: "uppercase" }}>Total Estimates</MDTypography>
                <MDTypography variant="h4" fontWeight="bold">{estimates.length}</MDTypography>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 2, borderRadius: "20px", background: "#fff", display: "flex", flexDirection: "row", alignItems: "center", gap: 2, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
              <MDBox variant="gradient" bgcolor="success" color="white" borderRadius="12px" p={2} sx={{ boxShadow: "0 10px 20px rgba(76, 175, 80, 0.2)" }}>
                <BusinessIcon fontSize="medium" />
              </MDBox>
              <Box>
                <MDTypography variant="caption" fontWeight="bold" color="text" sx={{ textTransform: "uppercase" }}>Total Pipeline Value</MDTypography>
                <MDTypography variant="h4" fontWeight="bold">Rs. {estimates.reduce((s, e) => s + (e.totalEstimate || 0), 0).toLocaleString("en-IN")}</MDTypography>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 2, borderRadius: "20px", background: "#fff", display: "flex", flexDirection: "row", alignItems: "center", gap: 2, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
              <MDBox variant="gradient" bgcolor="warning" color="white" borderRadius="12px" p={2} sx={{ boxShadow: "0 10px 20px rgba(255, 152, 0, 0.2)" }}>
                <AspectRatioIcon fontSize="medium" />
              </MDBox>
              <Box>
                <MDTypography variant="caption" fontWeight="bold" color="text" sx={{ textTransform: "uppercase" }}>Avg. Project Size</MDTypography>
                <MDTypography variant="h4" fontWeight="bold">Rs. {estimates.length ? Math.round(estimates.reduce((s, e) => s + (e.totalEstimate || 0), 0) / estimates.length).toLocaleString("en-IN") : 0}</MDTypography>
              </Box>
            </Card>
          </Grid>

          {/* ================= HERO HEADER ================= */}
          <Grid item xs={12}>
            <MDBox
              variant="contained"
              sx={{
                background: "linear-gradient(135deg, #1A73E8 0%, #b6276aff 100%)",
                borderRadius: "24px",
                p: 4,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: "-50%",
                  right: "-10%",
                  width: "400px",
                  height: "400px",
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: "50%",
                  zIndex: 0
                }
              }}
            >
              <Box sx={{ zIndex: 1 }}>
                <MDTypography variant="h2" fontWeight="bold" color="white" sx={{ letterSpacing: "-1px" }}>
                  Estimate Studio
                </MDTypography>
                <MDBox display="flex" alignItems="center" mt={1}>
                  <Box sx={{ width: 4, height: 20, bgcolor: "#fff", mr: 1.5, borderRadius: 2 }} />
                  <MDTypography variant="button" color="white" fontWeight="regular" sx={{ fontSize: "1rem", opacity: 0.9 }}>
                    Architectural Proposal & Costing Engine
                  </MDTypography>
                </MDBox>
              </Box>
              <Box sx={{ zIndex: 1, display: "flex", gap: 2 }}>
                <MDButton
                  variant="gradient"
                  color="light"
                  startIcon={<PictureAsPdfIcon />}
                  onClick={generatePDF}
                  sx={{ borderRadius: "12px", px: 3, fontWeight: "bold" }}
                >
                  Download PDF
                </MDButton>
                <MDButton
                  variant="gradient"
                  color="dark"
                  startIcon={<SaveIcon />}
                  onClick={saveEstimate}
                  sx={{ borderRadius: "12px", px: 3, fontWeight: "bold" }}
                >
                  {editId ? "Update" : "Save Proposal"}
                </MDButton>
              </Box>
            </MDBox>
          </Grid>

          {/* ================= MAIN CONTENT ================= */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ 
              borderRadius: "24px", 
              border: "none", 
              boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
              overflow: "hidden"
            }}>
              <MDBox bgcolor="#1e293b" p={3}>
                <MDTypography variant="h5" color="white" fontWeight="bold" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <BusinessIcon /> Project Scope
                </MDTypography>
              </MDBox>
              <MDBox p={4} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <TextField
                  label="Project Title"
                  fullWidth
                  value={form.projectTitle}
                  onChange={(e) => setForm({ ...form, projectTitle: e.target.value })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><AssignmentIcon color="info" /></InputAdornment>,
                  }}
                />
                <TextField
                  label="Owner Name"
                  fullWidth
                  value={form.ownerName}
                  onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><PersonIcon color="info" /></InputAdornment>,
                  }}
                />
                <TextField
                  label="Location"
                  fullWidth
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><LocationOnIcon color="info" /></InputAdornment>,
                  }}
                />
                <TextField
                  label="Plot Area"
                  fullWidth
                  placeholder="e.g. 1500"
                  value={form.plotArea}
                  onChange={(e) => setForm({ ...form, plotArea: e.target.value })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><AspectRatioIcon color="info" /></InputAdornment>,
                    endAdornment: <InputAdornment position="end">Sq.Ft</InputAdornment>,
                  }}
                />
              </MDBox>
            </Card>
          </Grid>

          <Grid item xs={12} lg={8}>
            {/* Introduction Card */}
            <Card sx={{ 
              borderRadius: "24px", 
              boxShadow: "0 10px 30px rgba(0,0,0,0.05)", 
              mb: 3, 
              border: "1px solid #e2e8f0" 
            }}>
              <MDBox p={3} bgcolor="#f8fafc" borderBottom="1px solid #e2e8f0" borderRadius="24px 24px 0 0">
                <MDTypography variant="h6" fontWeight="bold" sx={{ color: "#334155" }}>Executive Summary / Introduction</MDTypography>
              </MDBox>
              <MDBox p={3}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Briefly describe the vision and scope of the project for the client..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px", backgroundColor: "#fff" } }}
                />
              </MDBox>
            </Card>

            {/* Items Breakdown Card */}
            <Card sx={{ 
              borderRadius: "24px", 
              boxShadow: "0 15px 35px rgba(0,0,0,0.08)", 
              overflow: "hidden",
              border: "none"
            }}>
              <MDBox 
                p={3} 
                display="flex" 
                justifyContent="space-between" 
                alignItems="center"
                sx={{ background: "#fff", borderBottom: "1px solid #f1f5f9" }}
              >
                <MDTypography variant="h5" fontWeight="bold" sx={{ color: "#1e293b" }}>Itemized Breakdown</MDTypography>
                <MDBox 
                  px={3} 
                  py={1} 
                  sx={{ 
                    bgcolor: "#f0fdf4", 
                    borderRadius: "12px", 
                    border: "1px solid #bbf7d0",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5
                  }}
                >
                  <MDTypography variant="button" fontWeight="bold" color="text">Total Estimate:</MDTypography>
                  <MDTypography variant="h4" fontWeight="bold" sx={{ color: "#16a34a" }}>
                    Rs. {total.toLocaleString("en-IN")}
                  </MDTypography>
                </MDBox>
              </MDBox>

              <MDBox p={3}>
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: "16px", border: "1px solid #e2e8f0", maxHeight: "500px" }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ bgcolor: "#f8fafc", fontWeight: "bold", color: "#64748b", textTransform: "uppercase", fontSize: "0.7rem", letterSpacing: 1, borderBottom: "2px solid #e2e8f0" }}>S.No</TableCell>
                        <TableCell sx={{ bgcolor: "#f8fafc", fontWeight: "bold", color: "#64748b", textTransform: "uppercase", fontSize: "0.7rem", letterSpacing: 1, borderBottom: "2px solid #e2e8f0", width: "45%" }}>Description</TableCell>
                        <TableCell sx={{ bgcolor: "#f8fafc", fontWeight: "bold", color: "#64748b", textTransform: "uppercase", fontSize: "0.7rem", letterSpacing: 1, borderBottom: "2px solid #e2e8f0", textAlign: "center" }}>Qty</TableCell>
                        <TableCell sx={{ bgcolor: "#f8fafc", fontWeight: "bold", color: "#64748b", textTransform: "uppercase", fontSize: "0.7rem", letterSpacing: 1, borderBottom: "2px solid #e2e8f0", textAlign: "center" }}>Unit</TableCell>
                        <TableCell sx={{ bgcolor: "#f8fafc", fontWeight: "bold", color: "#64748b", textTransform: "uppercase", fontSize: "0.7rem", letterSpacing: 1, borderBottom: "2px solid #e2e8f0", textAlign: "right" }}>Rate</TableCell>
                        <TableCell sx={{ bgcolor: "#f8fafc", fontWeight: "bold", color: "#64748b", textTransform: "uppercase", fontSize: "0.7rem", letterSpacing: 1, borderBottom: "2px solid #e2e8f0", textAlign: "right" }}>Amount</TableCell>
                        <TableCell sx={{ bgcolor: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {items.map((row, i) => (
                        <TableRow key={i} sx={{ "&:hover": { bgcolor: "#f1f5f9" }, transition: "0.2s" }}>
                          <TableCell sx={{ fontWeight: "bold", color: "#94a3b8" }}>{row.sno}</TableCell>
                          <TableCell>
                            <TextField
                              fullWidth
                              size="small"
                              variant="standard"
                              placeholder="Describe item or service..."
                              value={row.desc}
                              onChange={(e) => handleChange(i, "desc", e.target.value)}
                              InputProps={{ disableUnderline: true, sx: { fontSize: "0.9rem", fontWeight: 500 } }}
                            />
                          </TableCell>
                          <TableCell sx={{ textAlign: "center" }}>
                            <TextField
                              type="number"
                              size="small"
                              variant="standard"
                              value={row.qty}
                              onChange={(e) => handleChange(i, "qty", e.target.value)}
                              InputProps={{ disableUnderline: true, sx: { fontSize: "0.9rem", textAlign: "center", fontWeight: "bold" } }}
                            />
                          </TableCell>
                          <TableCell sx={{ textAlign: "center" }}>
                            <TextField
                              size="small"
                              variant="standard"
                              placeholder="Unit"
                              value={row.unit}
                              onChange={(e) => handleChange(i, "unit", e.target.value)}
                              InputProps={{ disableUnderline: true, sx: { fontSize: "0.85rem", textAlign: "center", color: "#64748b" } }}
                            />
                          </TableCell>
                          <TableCell sx={{ textAlign: "right" }}>
                            <TextField
                              type="number"
                              size="small"
                              variant="standard"
                              value={row.rate}
                              onChange={(e) => handleChange(i, "rate", e.target.value)}
                              InputProps={{ disableUnderline: true, sx: { fontSize: "0.9rem", textAlign: "right", fontWeight: "bold" } }}
                            />
                          </TableCell>
                          <TableCell sx={{ textAlign: "right", fontWeight: "bold", color: "#334155" }}>
                            {(row.qty * row.rate || 0).toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell align="right">
                            <IconButton color="error" onClick={() => deleteRow(i)} size="small" sx={{ opacity: 0.4, "&:hover": { opacity: 1 } }}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <MDBox mt={3} display="flex" justifyContent="center">
                  <MDButton 
                    variant="outlined" 
                    color="info" 
                    startIcon={<AddCircleIcon />} 
                    onClick={addRow}
                    sx={{ borderRadius: "12px", px: 4, textTransform: "none", fontWeight: "bold" }}
                  >
                    Add Another Line Item
                  </MDButton>
                </MDBox>
              </MDBox>
            </Card>

            {/* Notes Section */}
            <Card sx={{ mt: 3, borderRadius: "24px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
              <MDBox p={4}>
                <MDTypography variant="h6" fontWeight="bold" sx={{ mb: 2, color: "#475569" }}>Final Notes & Terms</MDTypography>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Mention important terms, validity, or exclusions here..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px", backgroundColor: "#f8fafc" } }}
                />
              </MDBox>
            </Card>
          </Grid>

          {/* ================= HISTORY SECTION ================= */}
          <Grid item xs={12}>
            <MDBox mt={4}>
              <Card sx={{ borderRadius: "24px", boxShadow: "0 20px 50px rgba(0,0,0,0.1)", overflow: "visible" }}>
                <MDBox
                  variant="gradient"
                  bgcolor="info"
                  borderRadius="20px"
                  coloredShadow="info"
                  mx={3}
                  mt={-4}
                  p={3}
                  mb={1}
                  textAlign="center"
                  sx={{ background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)" }}
                >
                  <MDTypography variant="h4" fontWeight="bold" color="white">
                    Proposal Records
                  </MDTypography>
                  <MDTypography variant="button" color="white" opacity={0.8}>
                    Track and manage previously issued project estimates
                  </MDTypography>
                </MDBox>
                <MDBox p={3}>
                  <DataTable
                    table={{
                      columns: [
                        { Header: "Project Name", accessor: "projectTitle", width: "35%" },
                        { Header: "Client", accessor: "ownerName", width: "20%" },
                        { 
                          Header: "Total Value", 
                          accessor: "totalEstimate", 
                          width: "15%", 
                          Cell: ({ value }) => (
                            <MDTypography variant="button" fontWeight="bold" color="success">
                              Rs. {value?.toLocaleString("en-IN")}
                            </MDTypography>
                          ) 
                        },
                        { 
                          Header: "Date Created", 
                          accessor: "createdAt", 
                          width: "15%", 
                          Cell: ({ value }) => (
                            <MDTypography variant="caption" fontWeight="bold" color="secondary">
                              {new Date(value).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
                            </MDTypography>
                          )
                        },
                        {
                          Header: "Actions",
                          accessor: "actions",
                          Cell: ({ row }) => (
                            <MDBox display="flex" gap={1.5}>
                              <Tooltip title="Edit Proposal">
                                <IconButton sx={{ bgcolor: "#f0f7ff", color: "#007bff", "&:hover": { bgcolor: "#007bff", color: "#fff" } }} onClick={() => handleEdit(row.original)}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Send via WhatsApp">
                                <IconButton sx={{ bgcolor: "#f0fdf4", color: "#28a745", "&:hover": { bgcolor: "#28a745", color: "#fff" } }} onClick={() => handleWhatsApp(row.original)}>
                                  <WhatsAppIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Permanently">
                                <IconButton sx={{ bgcolor: "#fff1f1", color: "#dc3545", "&:hover": { bgcolor: "#dc3545", color: "#fff" } }} onClick={() => deleteEstimate(row.original._id)}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </MDBox>
                          ),
                        },
                      ],
                      rows: estimates,
                    }}
                    isSorted={true}
                    entriesPerPage={{ defaultValue: 5, entries: [5, 10, 15, 20, 25] }}
                    showTotalEntries={true}
                    noEndBorder
                  />
                </MDBox>
              </Card>
            </MDBox>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}