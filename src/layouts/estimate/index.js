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
      // Background Block for Studio Name
      doc.setFillColor(44, 62, 80); // Dark Blue-Grey
      doc.rect(0, 0, pageWidth, 40, "F");

      // Logo
      try {
        doc.addImage("/logo.png", "PNG", 15, 8, 24, 24);
      } catch (e) {
        console.error("Logo not found", e);
      }

      // Studio Info
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.text("D DESIGN ARCHITECTS STUDIO", pageWidth / 2 + 10, 18, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(200, 200, 200);
      doc.text("Architects, Interior Designers, Planners | Sanjay Place, Agra", pageWidth / 2 + 10, 25, { align: "center" });

      // Architect Block (Right Side)
      doc.setFillColor(52, 73, 94);
      doc.rect(pageWidth - 65, 0, 65, 40, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.text("AR. PREMVEER SINGH", pageWidth - 15, 18, { align: "right" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("CA/18/98236", pageWidth - 15, 24, { align: "right" });
    };

    addHeader();

    // --- TITLE ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(44, 62, 80);
    doc.text("ESTIMATE / PROPOSAL", pageWidth / 2, 52, { align: "center" });
    doc.setDrawColor(44, 62, 80);
    doc.setLineWidth(0.5);
    doc.line(pageWidth / 2 - 30, 54, pageWidth / 2 + 30, 54);

    // --- PROJECT DETAILS TABLE ---
    autoTable(doc, {
      startY: 62,
      theme: "grid",
      head: [[{ content: "Project Summary & Details", colSpan: 4, styles: { halign: "left", fillColor: [44, 62, 80], fontSize: 11 } }]],
      body: [
        ["Project Title:", { content: form.projectTitle || "-", styles: { fontStyle: "bold" } }, "Owner Name:", form.ownerName || "-"],
        ["Location:", form.location || "-", "Plot Area:", form.plotArea ? `${form.plotArea} Sq.Ft` : "-"],
        ["Estimated Amount:", { content: `₹ ${total.toLocaleString("en-IN")}`, colSpan: 3, styles: { fontStyle: "bold", textColor: [183, 39, 106] } }],
      ],
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: [44, 62, 80], textColor: [255, 255, 255] },
      columnStyles: {
        0: { fillColor: [245, 245, 245], cellWidth: 35 },
        1: { cellWidth: 60 },
        2: { fillColor: [245, 245, 245], cellWidth: 35 },
        3: { cellWidth: 60 },
      },
    });

    let currentY = doc.lastAutoTable.finalY + 10;

    // --- OVERALL DESCRIPTION ---
    if (form.description) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text("Project Description:", 15, currentY);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const splitDesc = doc.splitTextToSize(form.description, pageWidth - 30);
      doc.text(splitDesc, 15, currentY + 7);
      currentY += (splitDesc.length * 5) + 12;
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
      theme: "striped",
      head: [["S.No", "Description", "Qty", "Unit", "Rate (₹)", "Amount (₹)"]],
      body: tableData,
      headStyles: { fillColor: [44, 62, 80], textColor: [255, 255, 255], fontStyle: "bold" },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: "auto" },
        2: { cellWidth: 20, halign: "center" },
        3: { cellWidth: 20, halign: "center" },
        4: { cellWidth: 25, halign: "right" },
        5: { cellWidth: 30, halign: "right" },
      },
      didDrawPage: (data) => {
        if (data.pageNumber > 1) {
          addHeader();
        }
      },
    });

    // --- SUMMARY ---
    const finalY = doc.lastAutoTable.finalY;
    doc.setFillColor(245, 245, 245);
    doc.rect(pageWidth - 85, finalY + 5, 70, 15, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(183, 39, 106);
    doc.text(`GRAND TOTAL:  ₹ ${total.toLocaleString("en-IN")}`, pageWidth - 15, finalY + 15, { align: "right" });

    // --- NOTES SECTION ---
    if (form.notes) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text("Notes / Terms & Conditions:", 15, finalY + 30);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const splitNotes = doc.splitTextToSize(form.notes, pageWidth - 30);
      doc.text(splitNotes, 15, finalY + 37);
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
        <Card sx={{ p: 3, mb: 3 }}>
          <MDTypography variant="h6" fontWeight="bold" mb={2}>
            Estimate Configuration
          </MDTypography>
          <Divider sx={{ my: 2 }} />

          <Grid container spacing={3}>
            {/* INTRO FIRST */}
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

            {/* DETAILS SECOND */}
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
        </Card>

        {/* ================= ESTIMATE ITEMS ================= */}
        <Card sx={{ p: { xs: 2, md: 3 } }}>
          <MDTypography variant="h6" fontWeight="bold" mb={3}>
            Estimate Items
          </MDTypography>

          {/* TABLE HEADER (HIDDEN ON MOBILE) */}
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
                border: { xs: "1px solid #eee", md: "none" },
                borderRadius: 2,
                background: { xs: "#fafafa", md: "transparent" }
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

          <MDBox mt={2}>
            <Button variant="gradient" color="info" startIcon={<AddIcon />} onClick={addRow}>
              Add Item
            </Button>
          </MDBox>

          <MDBox textAlign="right" mt={3} p={2} bgcolor="#f8f9fa" borderRadius={2}>
            <MDTypography variant="h5" fontWeight="bold" color="dark">
              Total Estimate: ₹ {total.toLocaleString("en-IN")}
            </MDTypography>
          </MDBox>
        </Card>

        {/* ================= NOTES ================= */}
        <Card sx={{ p: 3, mt: 3 }}>
          <MDTypography variant="h6" fontWeight="bold">Notes / Terms & Conditions</MDTypography>
          <Divider sx={{ my: 2 }} />
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Enter additional terms, conditions or notes here..."
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </Card>

        {/* ================= ACTIONS ================= */}
        <MDBox mt={4} display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={2}>
          <Button
            variant="gradient"
            color={editId ? "warning" : "success"}
            size="large"
            onClick={saveEstimate}
            fullWidth
            sx={{ borderRadius: 2, py: 1.5, fontSize: "1rem" }}
          >
            {editId ? "Update Estimate" : "Save Estimate"}
          </Button>

          <Button
            variant="gradient"
            color="info"
            size="large"
            onClick={generatePDF}
            fullWidth
            sx={{ borderRadius: 2, py: 1.5, fontSize: "1rem" }}
          >
            Generate PDF
          </Button>

          {editId && (
            <Button
              variant="outlined"
              color="error"
              size="large"
              onClick={() => {
                setEditId(null);
                setForm({ projectTitle: "", ownerName: "", location: "", plotArea: "", notes: "", description: "" });
                setItems([{ sno: 1, desc: "", qty: "", unit: "", rate: "" }]);
              }}
              fullWidth
            >
              Cancel Edit
            </Button>
          )}
        </MDBox>

        {/* ================= SAVED ESTIMATES ================= */}
        <MDBox mt={6}>
          <Card>
            <MDBox p={3} display="flex" justifyContent="space-between" alignItems="center">
              <MDTypography variant="h5" fontWeight="bold">Saved Estimates</MDTypography>
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
                          <Button variant="text" color="info" size="small" onClick={() => handleEdit(row.original)}>Edit</Button>
                          <Button variant="text" color="error" size="small" onClick={() => deleteEstimate(row.original._id)}>Delete</Button>
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