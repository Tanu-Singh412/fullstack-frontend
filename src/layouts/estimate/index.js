import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  TextField,
  Button,
  IconButton,
  Typography,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import jsPDF from "jspdf";
import "jspdf-autotable";

const API = "https://fullstack-project-1-n510.onrender.com/api/estimate";
const SIDEBAR_WIDTH = 260;

export default function EstimatePage() {
  const [form, setForm] = useState({
    projectTitle: "",
    ownerName: "",
    location: "",
    plotArea: "",
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
          setForm(latest);
          setItems(latest.items || []);
        }
      });
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
    setItems(items.filter((_, index) => index !== i));
  };

  /* ================= TOTAL ================= */
  const total = items.reduce(
    (sum, i) => sum + Number(i.qty || 0) * Number(i.rate || 0),
    0
  );

  /* ================= SAVE ================= */
  const saveEstimate = async () => {
    await fetch(API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...form, items, totalEstimate: total }),
    });

    alert("Saved Successfully");
  };

  /* ================= PDF ================= */
  const generatePDF = () => {
    const doc = new jsPDF();

    // LOGO
    doc.addImage("/logo.png", "PNG", 15, 10, 30, 30);

    // HEADER
    doc.setFontSize(16);
    doc.text("D DESIGN ARCHITECTS STUDIO", 105, 15, { align: "center" });

    doc.setFontSize(10);
    doc.text("Architects, Interior Designers, Planners", 105, 20, { align: "center" });

    doc.text(`Owner: ${form.ownerName}`, 150, 15);
    doc.text(`Location: ${form.location}`, 150, 20);

    doc.line(10, 35, 200, 35);

    // TABLE
    const tableData = items.map((row) => [
      row.sno,
      row.desc,
      row.qty,
      row.unit,
      row.rate,
      row.qty * row.rate,
    ]);

    doc.autoTable({
      startY: 40,
      head: [["S.No", "Description", "Qty", "Unit", "Rate", "Amount"]],
      body: tableData,
    });

    doc.text(`Total: ₹ ${total}`, 140, doc.lastAutoTable.finalY + 10);

    doc.save("estimate.pdf");
  };

  return (
    <Box sx={{ display: "flex" }}>
      
      {/* SIDEBAR SPACE */}
      <Box sx={{ width: SIDEBAR_WIDTH }} />

      {/* MAIN */}
      <Box sx={{ flex: 1, background: "#f1f5f9" }}>
        
        {/* ================= HEADER ================= */}
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 1000,
            background: "#fff",
            px: 4,
            py: 2,
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          }}
        >
          <Grid container alignItems="center">
            
            {/* LEFT LOGO */}
            <Grid item xs={3}>
              <img src="/logo.png" alt="logo" style={{ height: 50 }} />
            </Grid>

            {/* CENTER */}
            <Grid item xs={6} textAlign="center">
              <Typography fontWeight="bold">
                D DESIGN ARCHITECTS STUDIO
              </Typography>
              <Typography variant="caption">
                Architects, Interior Designers, Planners
              </Typography>
              <Typography variant="caption" display="block">
                Sanjay Place, Agra
              </Typography>
            </Grid>

            {/* RIGHT */}
            <Grid item xs={3} textAlign="right">
              <Typography fontWeight="bold">
                AR. PREMVEER SINGH
              </Typography>
              <Typography variant="caption">
                CA/18/98236
              </Typography>
            </Grid>

          </Grid>
        </Box>

        {/* ================= CONTENT ================= */}
        <Box sx={{ p: 4 }}>

          {/* DETAILS */}
          <Card sx={{ p: 3, mb: 3 }}>
            <Typography fontWeight="bold">Project Details</Typography>
            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={3}>
                <TextField label="Project Title" fullWidth
                  value={form.projectTitle}
                  onChange={(e) => setForm({ ...form, projectTitle: e.target.value })}
                />
              </Grid>

              <Grid item xs={3}>
                <TextField label="Owner" fullWidth
                  value={form.ownerName}
                  onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                />
              </Grid>

              <Grid item xs={3}>
                <TextField label="Location" fullWidth
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </Grid>

              <Grid item xs={3}>
                <TextField label="Plot Area" fullWidth
                  value={form.plotArea}
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

            {items.map((row, i) => (
              <Grid container spacing={2} key={i} mb={1}>
                <Grid item xs={1}>
                  <TextField value={row.sno} size="small" disabled />
                </Grid>

                <Grid item xs={3}>
                  <TextField fullWidth size="small"
                    value={row.desc}
                    onChange={(e) => handleChange(i, "desc", e.target.value)}
                  />
                </Grid>

                <Grid item xs={1}>
                  <TextField type="number" size="small"
                    value={row.qty}
                    onChange={(e) => handleChange(i, "qty", e.target.value)}
                  />
                </Grid>

                <Grid item xs={1}>
                  <TextField size="small"
                    value={row.unit}
                    onChange={(e) => handleChange(i, "unit", e.target.value)}
                  />
                </Grid>

                <Grid item xs={2}>
                  <TextField type="number" size="small"
                    value={row.rate}
                    onChange={(e) => handleChange(i, "rate", e.target.value)}
                  />
                </Grid>

                <Grid item xs={2}>
                  <TextField value={row.qty * row.rate || ""} size="small" disabled />
                </Grid>

                <Grid item xs={2}>
                  <IconButton onClick={() => deleteRow(i)}>
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}

            <Button startIcon={<AddIcon />} onClick={addRow} sx={{ mt: 2 }}>
              Add Row
            </Button>

            <Box textAlign="right" mt={3}>
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
      </Box>
    </Box>
  );
}