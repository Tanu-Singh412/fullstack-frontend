import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  TextField,
  Button,
  IconButton,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import CloseIcon from "@mui/icons-material/Close";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import EditIcon from "@mui/icons-material/Edit";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

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
        ["Total Estimated Amount:", { content: `₹ ${total.toLocaleString("en-IN")}`, colSpan: 3, styles: { fontStyle: "bold" } }],
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
      head: [["S.No", "Description", "Qty", "Unit", "Rate (₹)", "Amount (₹)"]],
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
    doc.text(`GRAND TOTAL:  ₹ ${total.toLocaleString("en-IN")}`, pageWidth - 15, finalY + 12, { align: "right" });

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

      <MDBox pt={6} pb={3}>
        <MDBox mb={3}>
          <MDTypography variant="h4" fontWeight="bold">
            Project Estimate
          </MDTypography>
        </MDBox>

        {/* ================= PROJECT DETAILS ================= */}
        <Card sx={{ mb: 3, overflow: "visible" }}>
          <MDBox
            variant="gradient"
            bgcolor="info"
            borderRadius="lg"
            coloredShadow="info"
            mx={2}
            mt={-3}
            p={3}
            mb={1}
            textAlign="center"
          >
            <MDTypography variant="h4" fontWeight="medium" color="white">
              Estimate Configuration
            </MDTypography>
            <MDTypography display="block" variant="button" color="white" my={1}>
              Define your project scope and general details
            </MDTypography>
          </MDBox>
          <MDBox p={3}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Overall Project Detail / Introduction"
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Briefly describe the project scope or introduction..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField label="Project Title" fullWidth
                  value={form.projectTitle}
                  onChange={(e) => setForm({ ...form, projectTitle: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField label="Owner" fullWidth
                  value={form.ownerName}
                  onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField label="Location" fullWidth
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField label="Plot Area" fullWidth
                  value={form.plotArea}
                  onChange={(e) => setForm({ ...form, plotArea: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={12} md={3}>
                <TextField
                  label="Estimated Amount (Auto)"
                  fullWidth
                  value={`₹ ${total.toLocaleString("en-IN")}`}
                  InputProps={{ readOnly: true }}
                  sx={{ bgcolor: "#f0f2f5" }}
                />
              </Grid>
            </Grid>
          </MDBox>
        </Card>

        {/* ================= ESTIMATE ITEMS ================= */}
        <Card sx={{ mb: 3, overflow: "visible" }}>
          <MDBox
            variant="gradient"
            bgcolor="success"
            borderRadius="lg"
            coloredShadow="success"
            mx={2}
            mt={-3}
            p={2}
            mb={1}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <MDBox>
              <MDTypography variant="h6" color="white" fontWeight="bold">
                Estimate Items
              </MDTypography>
              <MDTypography variant="button" color="white" fontWeight="regular">
                List of materials, services, and rates
              </MDTypography>
            </MDBox>
            <Button 
              variant="contained" 
              color="white" 
              startIcon={<AddCircleIcon />} 
              onClick={addRow}
              sx={{ color: (theme) => theme.palette.success.main }}
            >
              Add New Item
            </Button>
          </MDBox>
          <MDBox p={3}>
            <Box sx={{ display: { xs: "none", md: "block" }, mb: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={1}><MDTypography variant="caption" fontWeight="bold">S.No</MDTypography></Grid>
                <Grid item xs={4}><MDTypography variant="caption" fontWeight="bold">Description</MDTypography></Grid>
                <Grid item xs={1}><MDTypography variant="caption" fontWeight="bold">Qty</MDTypography></Grid>
                <Grid item xs={1.5}><MDTypography variant="caption" fontWeight="bold">Unit</MDTypography></Grid>
                <Grid item xs={1.5}><MDTypography variant="caption" fontWeight="bold">Rate</MDTypography></Grid>
                <Grid item xs={2}><MDTypography variant="caption" fontWeight="bold">Amount</MDTypography></Grid>
                <Grid item xs={1}></Grid>
              </Grid>
            </Box>

            {items.map((row, i) => (
              <MDBox
                key={i}
                mb={2}
                p={2}
                sx={{
                  border: "1px solid #f0f2f5",
                  borderRadius: "10px",
                  background: i % 2 === 0 ? "#ffffff" : "#f8f9fa",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    borderColor: (theme) => theme.palette.info.main,
                    transform: "translateY(-2px)"
                  }
                }}
              >
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={2} md={1}>
                    <TextField label="S.No" value={row.sno} size="small" disabled fullWidth />
                  </Grid>
                  <Grid item xs={10} md={4}>
                    <TextField label="Description" fullWidth size="small"
                      value={row.desc}
                      onChange={(e) => handleChange(i, "desc", e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={6} md={1}>
                    <TextField label="Qty" type="number" size="small" fullWidth
                      value={row.qty}
                      onChange={(e) => handleChange(i, "qty", e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={6} md={1.5}>
                    <TextField label="Unit" size="small" fullWidth
                      value={row.unit}
                      onChange={(e) => handleChange(i, "unit", e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={6} md={1.5}>
                    <TextField label="Rate" type="number" size="small" fullWidth
                      value={row.rate}
                      onChange={(e) => handleChange(i, "rate", e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={6} md={2}>
                    <TextField label="Amount" value={(row.qty * row.rate || 0).toLocaleString("en-IN")} size="small" disabled fullWidth />
                  </Grid>
                  <Grid item xs={12} md={1} textAlign="right">
                    <IconButton color="error" onClick={() => deleteRow(i)}>
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </MDBox>
            ))}

            <MDBox mt={2} display="flex" justifyContent="space-between" alignItems="center">
              <MDTypography variant="button" color="text" fontWeight="regular">
                Total items: {items.length}
              </MDTypography>
              <Button variant="gradient" color="success" startIcon={<AddIcon />} onClick={addRow}>
                Add Item
              </Button>
            </MDBox>

            <MDBox textAlign="right" mt={3} p={2} variant="gradient" bgcolor="light" borderRadius="lg">
              <MDTypography variant="h4" fontWeight="bold" color="dark">
                Grand Total: <span style={{ color: "#2e7d32" }}>₹ {total.toLocaleString("en-IN")}</span>
              </MDTypography>
            </MDBox>
          </MDBox>
        </Card>

        {/* ================= NOTES ================= */}
        <Card sx={{ mt: 3 }}>
          <MDBox p={3}>
            <MDTypography variant="h6" fontWeight="bold">Notes / Terms & Conditions</MDTypography>
            <Divider sx={{ my: 1 }} />
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Enter additional terms, conditions or notes here..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </MDBox>
        </Card>

        {/* ================= ACTIONS ================= */}
        <MDBox mt={4} display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={2}>
          <Button
            variant="gradient"
            color={editId ? "warning" : "info"}
            size="large"
            onClick={saveEstimate}
            fullWidth
            startIcon={<SaveIcon />}
            sx={{ borderRadius: "12px", py: 1.5, fontSize: "1rem" }}
          >
            {editId ? "Update Estimate" : "Save Estimate"}
          </Button>

          <Button
            variant="gradient"
            color="dark"
            size="large"
            onClick={generatePDF}
            fullWidth
            startIcon={<PictureAsPdfIcon />}
            sx={{ borderRadius: "12px", py: 1.5, fontSize: "1rem" }}
          >
            Download PDF
          </Button>

          {editId && (
            <Button
              variant="outlined"
              color="error"
              size="large"
              startIcon={<CloseIcon />}
              onClick={() => {
                setEditId(null);
                setForm({ projectTitle: "", ownerName: "", location: "", plotArea: "", notes: "", description: "" });
                setItems([{ sno: 1, desc: "", qty: "", unit: "", rate: "" }]);
              }}
              fullWidth
              sx={{ borderRadius: "12px" }}
            >
              Cancel
            </Button>
          )}
        </MDBox>

        {/* ================= SAVED ESTIMATES ================= */}
        <MDBox mt={8}>
          <Card sx={{ overflow: "visible" }}>
            <MDBox
              variant="gradient"
              bgcolor="primary"
              borderRadius="lg"
              coloredShadow="primary"
              mx={2}
              mt={-3}
              p={3}
              mb={1}
              textAlign="center"
            >
              <MDTypography variant="h5" fontWeight="medium" color="white">
                Saved Estimates Records
              </MDTypography>
            </MDBox>
            <MDBox pb={3}>
              <DataTable
                table={{
                  columns: [
                    { Header: "Project Title", accessor: "projectTitle", width: "30%" },
                    { Header: "Owner", accessor: "ownerName", width: "20%" },
                    { Header: "Amount", accessor: "totalEstimate", width: "15%", Cell: ({ value }) => `₹${value?.toLocaleString("en-IN")}` },
                    { Header: "Date", accessor: "createdAt", width: "15%", Cell: ({ value }) => new Date(value).toLocaleDateString() },
                    {
                      Header: "Actions",
                      accessor: "actions",
                      Cell: ({ row }) => (
                        <MDBox display="flex" gap={1}>
                          <IconButton color="info" onClick={() => handleEdit(row.original)} title="Edit">
                            <EditIcon />
                          </IconButton>
                          <IconButton color="error" onClick={() => deleteEstimate(row.original._id)} title="Delete">
                            <DeleteIcon />
                          </IconButton>
                        </MDBox>
                      ),
                    },
                  ],
                  rows: estimates,
                }}
                isSorted={false}
                entriesPerPage={{ defaultValue: 5, entries: [5, 10, 15, 20, 25] }}
                showTotalEntries={true}
                noEndBorder
              />
            </MDBox>
          </Card>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}