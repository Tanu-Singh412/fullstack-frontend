import React, { useState } from "react";
import {
  Box,
  Grid,
  Card,
  TextField,
  Button,
  IconButton,
  Divider,
} from "@mui/material";
import jsPDF from "jspdf";
import "jspdf-autotable";

// Dummy Typography (replace with your MDTypography)
const Text = ({ children, ...props }) => (
  <div style={{ fontSize: props.size || 14, fontWeight: props.bold ? "bold" : "normal", marginBottom: 4 }}>
    {children}
  </div>
);

export default function EstimatePage() {
  const [item, setItem] = useState({
    sno: "",
    desc: "",
    qty: "",
    unit: "",
    rate: "",
  });

  const [items, setItems] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  // ================= ADD =================
  const handleAddItem = () => {
    if (!item.desc || !item.qty || !item.rate) return;

    if (editIndex !== null) {
      const updated = [...items];
      updated[editIndex] = item;
      setItems(updated);
      setEditIndex(null);
    } else {
      setItems([...items, item]);
    }

    setItem({ sno: "", desc: "", qty: "", unit: "", rate: "" });
  };

  // ================= EDIT =================
  const handleEdit = (i) => {
    setItem(items[i]);
    setEditIndex(i);
  };

  // ================= DELETE =================
  const handleDelete = (i) => {
    const updated = items.filter((_, index) => index !== i);
    setItems(updated);
  };

  // ================= TOTAL =================
  const total = items.reduce(
    (sum, i) => sum + Number(i.qty) * Number(i.rate),
    0
  );

  // ================= PDF =================
  const generatePDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.text("D DESIGN ARCHITECTS STUDIO", 105, 10, { align: "center" });

    doc.setFontSize(10);
    doc.text("Boundary Wall Estimate - Agra", 105, 16, { align: "center" });

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
      startY: 25,
    });

    doc.text(`Total: ₹ ${total}`, 140, doc.lastAutoTable.finalY + 10);

    doc.save("estimate.pdf");
  };

  return (
    <Box sx={{ minHeight: "100vh", background: "#f1f5f9" }}>

      {/* ================= HEADER ================= */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          width: "100%",
          background: "#fff",
          zIndex: 1000,
          px: 4,
          py: 2,
          borderBottom: "2px solid #e2e8f0",
        }}
      >
        <Grid container alignItems="center">

          {/* LOGO */}
          <Grid item xs={3}>
            <img src="/logo.png" alt="logo" style={{ height: 50 }} />
          </Grid>

          {/* CENTER */}
          <Grid item xs={6} textAlign="center">
            <Text bold>D DESIGN ARCHITECTS STUDIO</Text>
            <Text size={12}>Architects, Interior Designers, Planners</Text>
            <Text size={12}>Sanjay Place, Agra - 282002</Text>
          </Grid>

          {/* RIGHT */}
          <Grid item xs={3} textAlign="right">
            <Text bold>AR. PREMVEER SINGH</Text>
            <Text size={12}>(B.Arch)</Text>
            <Text size={12}>CA/18/98236</Text>
          </Grid>

        </Grid>
      </Box>

      {/* ================= CONTENT ================= */}
      <Box sx={{ pt: 12, px: 4 }}>

        {/* TITLE */}
        <Card sx={{ p: 3, mb: 3 }}>
          <Text bold>Detailed Estimate - Boundary Wall Construction</Text>
          <Divider sx={{ my: 2 }} />
          <Text>Total Plot Area: 1425.55 SQFT</Text>
          <Text>Estimated Amount: ₹31,51,000</Text>
        </Card>

        {/* FORM */}
        <Card sx={{ p: 3, mb: 3 }}>
          <Text bold>Add Item</Text>

          <Grid container spacing={2}>
            <Grid item xs={2}>
              <TextField label="S.No" fullWidth value={item.sno}
                onChange={(e) => setItem({ ...item, sno: e.target.value })}
              />
            </Grid>

            <Grid item xs={4}>
              <TextField label="Description" fullWidth value={item.desc}
                onChange={(e) => setItem({ ...item, desc: e.target.value })}
              />
            </Grid>

            <Grid item xs={2}>
              <TextField label="Qty" type="number" fullWidth value={item.qty}
                onChange={(e) => setItem({ ...item, qty: e.target.value })}
              />
            </Grid>

            <Grid item xs={1.5}>
              <TextField label="Unit" fullWidth value={item.unit}
                onChange={(e) => setItem({ ...item, unit: e.target.value })}
              />
            </Grid>

            <Grid item xs={1.5}>
              <TextField label="Rate" type="number" fullWidth value={item.rate}
                onChange={(e) => setItem({ ...item, rate: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <Button variant="contained" onClick={handleAddItem}>
                {editIndex !== null ? "Update Item" : "Add Item"}
              </Button>
            </Grid>
          </Grid>
        </Card>

        {/* TABLE */}
        <Card sx={{ p: 3 }}>
          <Text bold>DETAILS OF ESTIMATE</Text>

          <table style={{ width: "100%", marginTop: 10 }}>
            <thead>
              <tr style={{ background: "#1e293b", color: "#fff" }}>
                <th>S.No</th>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Rate</th>
                <th>Amount</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {items.map((row, i) => (
                <tr key={i}>
                  <td>{row.sno}</td>
                  <td>{row.desc}</td>
                  <td>{row.qty}</td>
                  <td>{row.unit}</td>
                  <td>{row.rate}</td>
                  <td>{row.qty * row.rate}</td>
                  <td>
                    <IconButton onClick={() => handleEdit(i)}>✏️</IconButton>
                    <IconButton onClick={() => handleDelete(i)}>❌</IconButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Box mt={2} textAlign="right">
            <Text bold>Total: ₹ {total}</Text>
          </Box>
        </Card>

        {/* ACTIONS */}
        <Box mt={3}>
          <Button variant="contained" color="success" onClick={generatePDF}>
            Generate PDF
          </Button>
        </Box>

      </Box>
    </Box>
  );
}