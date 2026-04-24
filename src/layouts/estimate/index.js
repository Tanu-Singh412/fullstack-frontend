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
import "jspdf-autotable";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

const API = "https://fullstack-project-1-n510.onrender.com/api/estimate";

export default function EstimatePage() {
  const [form, setForm] = useState({
    projectTitle: "",
    ownerName: "",
    location: "",
    plotArea: "",
    notes: "",
  });

  const [items, setItems] = useState([
    { sno: 1, desc: "", qty: "", unit: "", rate: "" },
  ]);

  /* ================= FETCH (AUTO LOAD FROM BACKEND) ================= */
  useEffect(() => {
    fetch(API)
      .then((res) => res.json())
      .then((data) => {
        if (data.length > 0) {
          const latest = data[0];
          setForm({
            projectTitle: latest.projectTitle || "",
            ownerName: latest.ownerName || "",
            location: latest.location || "",
            plotArea: latest.plotArea || "",
            notes: latest.notes || "",
          });
          setItems(latest.items || [{ sno: 1, desc: "", qty: "", unit: "", rate: "" }]);
        }
      })
      .catch(err => console.error("Error fetching estimates:", err));
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

  /* ================= SAVE ================= */
  const saveEstimate = async () => {
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...form, items, totalEstimate: total }),
      });
      if (res.ok) {
        alert("Saved Successfully");
      } else {
        alert("Failed to save estimate");
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Error saving estimate");
    }
  };

  /* ================= PDF ================= */
  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // --- HEADER HELPER ---
    const addHeader = () => {
      // Logo
      try {
        doc.addImage("/logo.png", "PNG", 15, 10, 25, 25);
      } catch (e) {
        console.error("Logo not found", e);
      }

      // Studio Info
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40);
      doc.text("D DESIGN ARCHITECTS STUDIO", pageWidth / 2, 18, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("Architects, Interior Designers, Planners", pageWidth / 2, 24, { align: "center" });
      doc.text("Sanjay Place, Agra", pageWidth / 2, 29, { align: "center" });

      // Architect Info
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text("AR. PREMVEER SINGH", pageWidth - 15, 18, { align: "right" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("CA/18/98236", pageWidth - 15, 23, { align: "right" });

      doc.setDrawColor(200, 200, 200);
      doc.line(15, 38, pageWidth - 15, 38);
    };

    addHeader();

    // --- PROJECT DETAILS TABLE ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("ESTIMATE / PROPOSAL", 15, 48);

    doc.autoTable({
      startY: 52,
      theme: "grid",
      head: [[{ content: "Project Details", colSpan: 4, styles: { halign: "center", fillColor: [44, 62, 80] } }]],
      body: [
        ["Project Title:", form.projectTitle || "-", "Owner Name:", form.ownerName || "-"],
        ["Location:", form.location || "-", "Plot Area:", form.plotArea ? `${form.plotArea} Sq.Ft` : "-"],
      ],
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [44, 62, 80], textColor: [255, 255, 255] },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 35 },
        1: { cellWidth: 60 },
        2: { fontStyle: "bold", cellWidth: 35 },
        3: { cellWidth: 60 },
      },
    });

    // --- ITEMS TABLE ---
    const tableData = items.map((row) => [
      row.sno,
      row.desc,
      row.qty,
      row.unit,
      row.rate,
      (Number(row.qty) * Number(row.rate)).toLocaleString("en-IN"),
    ]);

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 10,
      theme: "striped",
      head: [["S.No", "Description", "Qty", "Unit", "Rate (₹)", "Amount (₹)"]],
      body: tableData,
      headStyles: { fillColor: [52, 73, 94], textColor: [255, 255, 255], fontStyle: "bold" },
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

    // --- TOTAL ---
    const finalY = doc.lastAutoTable.finalY;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`GRAND TOTAL:  ₹ ${total.toLocaleString("en-IN")}`, pageWidth - 15, finalY + 15, { align: "right" });

    // --- NOTES SECTION ---
    if (form.notes) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Notes / Terms & Conditions:", 15, finalY + 25);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const splitNotes = doc.splitTextToSize(form.notes, pageWidth - 30);
      doc.text(splitNotes, 15, finalY + 32);
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
            Project Details
          </MDTypography>
          <Divider sx={{ my: 2 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField label="Project Title" fullWidth
                value={form.projectTitle}
                onChange={(e) => setForm({ ...form, projectTitle: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField label="Owner" fullWidth
                value={form.ownerName}
                onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField label="Location" fullWidth
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField label="Plot Area" fullWidth
                value={form.plotArea}
                onChange={(e) => setForm({ ...form, plotArea: e.target.value })}
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
          <Button variant="gradient" color="success" size="large" onClick={saveEstimate} fullWidth>
            Save Estimate
          </Button>

          <Button variant="gradient" color="dark" size="large" onClick={generatePDF} fullWidth>
            Generate PDF
          </Button>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}