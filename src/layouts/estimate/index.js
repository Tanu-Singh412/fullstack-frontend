import React, { useEffect, useState } from "react";
import {
  Box, Grid, Card, TextField, Button,
  IconButton, Typography
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import jsPDF from "jspdf";
import "jspdf-autotable";

const API = "https://fullstack-project-1-n510.onrender.com/api/estimate";

export default function EstimatePage() {

  const [form, setForm] = useState({
    projectTitle: "",
    ownerName: "",
    location: "",
    plotArea: "",
  });

  const [items, setItems] = useState([
    { sno: 1, desc: "", qty: "", unit: "", rate: "" }
  ]);

  // ================= ADD ROW =================
  const addRow = () => {
    setItems([
      ...items,
      { sno: items.length + 1, desc: "", qty: "", unit: "", rate: "" }
    ]);
  };

  // ================= DELETE =================
  const deleteRow = (i) => {
    setItems(items.filter((_, index) => index !== i));
  };

  // ================= CHANGE =================
  const handleChange = (i, field, value) => {
    const updated = [...items];
    updated[i][field] = value;
    setItems(updated);
  };

  // ================= TOTAL =================
  const total = items.reduce(
    (sum, i) => sum + (i.qty * i.rate || 0),
    0
  );

  // ================= SAVE =================
  const saveEstimate = async () => {
    await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, items })
    });

    alert("Saved Successfully");
  };

  // ================= PDF =================
  const generatePDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("D DESIGN ARCHITECTS STUDIO", 105, 10, { align: "center" });

    doc.setFontSize(10);
    doc.text(form.projectTitle, 105, 18, { align: "center" });

    doc.text(`Owner: ${form.ownerName}`, 14, 30);
    doc.text(`Location: ${form.location}`, 14, 35);
    doc.text(`Plot Area: ${form.plotArea}`, 14, 40);

    const tableData = items.map((row) => [
      row.sno,
      row.desc,
      row.qty,
      row.unit,
      row.rate,
      row.qty * row.rate,
    ]);

    doc.autoTable({
      head: [["S.No", "Description", "Qty", "Unit", "Rate", "Amount"]],
      body: tableData,
      startY: 45,
    });

    doc.text(`Total: ₹ ${total}`, 140, doc.lastAutoTable.finalY + 10);

    doc.save("estimate.pdf");
  };

  return (
    <Box sx={{ p: 4, background: "#f1f5f9", minHeight: "100vh" }}>

      {/* HEADER */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography fontWeight="bold">Estimate Details</Typography>

        <Grid container spacing={2} mt={1}>
          <Grid item xs={3}>
            <TextField label="Project Title" fullWidth
              onChange={(e) => setForm({ ...form, projectTitle: e.target.value })}
            />
          </Grid>

          <Grid item xs={3}>
            <TextField label="Owner" fullWidth
              onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
            />
          </Grid>

          <Grid item xs={3}>
            <TextField label="Location" fullWidth
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </Grid>

          <Grid item xs={3}>
            <TextField label="Plot Area" fullWidth
              onChange={(e) => setForm({ ...form, plotArea: e.target.value })}
            />
          </Grid>
        </Grid>
      </Card>

      {/* TABLE */}
      <Card sx={{ p: 3 }}>
        <Typography fontWeight="bold" mb={2}>
          Estimate Items
        </Typography>

        {/* HEADER */}
        <Grid container spacing={2}>
          <Grid item xs={1}><b>S.No</b></Grid>
          <Grid item xs={3}><b>Description</b></Grid>
          <Grid item xs={1}><b>Qty</b></Grid>
          <Grid item xs={1}><b>Unit</b></Grid>
          <Grid item xs={2}><b>Rate</b></Grid>
          <Grid item xs={2}><b>Amount</b></Grid>
          <Grid item xs={2}><b>Action</b></Grid>
        </Grid>

        {/* ROWS */}
        {items.map((row, i) => (
          <Grid container spacing={2} key={i} mt={1}>
            <Grid item xs={1}>
              <TextField value={row.sno} size="small" disabled />
            </Grid>

            <Grid item xs={3}>
              <TextField fullWidth size="small"
                onChange={(e) => handleChange(i, "desc", e.target.value)}
              />
            </Grid>

            <Grid item xs={1}>
              <TextField type="number" size="small"
                onChange={(e) => handleChange(i, "qty", e.target.value)}
              />
            </Grid>

            <Grid item xs={1}>
              <TextField size="small"
                onChange={(e) => handleChange(i, "unit", e.target.value)}
              />
            </Grid>

            <Grid item xs={2}>
              <TextField type="number" size="small"
                onChange={(e) => handleChange(i, "rate", e.target.value)}
              />
            </Grid>

            <Grid item xs={2}>
              <TextField
                value={row.qty * row.rate || ""}
                size="small"
                disabled
              />
            </Grid>

            <Grid item xs={2}>
              <IconButton onClick={() => deleteRow(i)}>
                <DeleteIcon />
              </IconButton>
            </Grid>
          </Grid>
        ))}

        {/* ADD ROW */}
        <Button startIcon={<AddIcon />} onClick={addRow} sx={{ mt: 2 }}>
          Add Row
        </Button>

        {/* TOTAL */}
        <Box textAlign="right" mt={2}>
          <Typography fontWeight="bold">
            Total: ₹ {total}
          </Typography>
        </Box>
      </Card>

      {/* ACTION */}
      <Box mt={3} display="flex" gap={2}>
        <Button variant="contained" onClick={saveEstimate}>
          Save
        </Button>

        <Button variant="contained" color="success" onClick={generatePDF}>
          Generate PDF
        </Button>
      </Box>

    </Box>
  );
}