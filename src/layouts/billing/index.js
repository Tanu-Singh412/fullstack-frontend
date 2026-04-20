import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  Container,
  Card,
  Grid,
  TextField,
  Button,
  Typography,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import "./invoice.css";

const downloadPDF = async (el) => {
  const canvas = await html2canvas(el, { scale: 2 });
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");
  const width = pdf.internal.pageSize.getWidth();
  const height = (canvas.height * width) / canvas.width;
  pdf.addImage(imgData, "PNG", 0, 0, width, height);
  pdf.save("invoice.pdf");
};

const Invoice = React.forwardRef(({ data, total }, ref) => (
  <div ref={ref} style={{ padding: 30, background: "#fff" }}>
    <h2>TAX INVOICE</h2>
    <p><b>{data.company}</b></p>
    <p>{data.clientName}</p>
    <table width="100%" border="1" cellPadding="8">
      <thead>
        <tr>
          <th>Item</th>
          <th>Qty</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
        {data.items.map((i, idx) => (
          <tr key={idx}>
            <td>{i.name}</td>
            <td>{i.qty}</td>
            <td>{i.price}</td>
          </tr>
        ))}
      </tbody>
    </table>
    <h3>Total: ₹{total}</h3>
  </div>
));

export default function InvoicePage() {
  const pdfRef = useRef();

  const [data, setData] = useState({
    clientName: "",
    company: "",
    items: [{ name: "", qty: 1, price: 0 }],
  });

  const [saved, setSaved] = useState([]);

  const subtotal = data.items.reduce((s, i) => s + i.qty * i.price, 0);

  const addItem = () => {
    setData({
      ...data,
      items: [...data.items, { name: "", qty: 1, price: 0 }],
    });
  };

  const updateItem = (i, field, value) => {
    const items = [...data.items];
    items[i][field] = value;
    setData({ ...data, items });
  };

  return (
    <Container maxWidth="lg" style={{ marginTop: 30 }}>
      <Typography variant="h4" gutterBottom>
        Invoice Generator
      </Typography>

      <Card style={{ padding: 20, marginBottom: 20 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Client Name"
              onChange={(e) => setData({ ...data, clientName: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Company"
              onChange={(e) => setData({ ...data, company: e.target.value })}
            />
          </Grid>
        </Grid>

        <Typography variant="h6" style={{ marginTop: 20 }}>
          Items
        </Typography>

        {data.items.map((item, i) => (
          <Grid container spacing={2} key={i} style={{ marginTop: 10 }}>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Item"
                onChange={(e) => updateItem(i, "name", e.target.value)}
              />
            </Grid>

            <Grid item xs={3}>
              <TextField
                type="number"
                fullWidth
                label="Qty"
                onChange={(e) => updateItem(i, "qty", +e.target.value)}
              />
            </Grid>

            <Grid item xs={3}>
              <TextField
                type="number"
                fullWidth
                label="Price"
                onChange={(e) => updateItem(i, "price", +e.target.value)}
              />
            </Grid>
          </Grid>
        ))}

        <Button onClick={addItem} style={{ marginTop: 10 }}>
          Add Item
        </Button>

        <Typography variant="h6" style={{ marginTop: 20 }}>
          Total: ₹{subtotal}
        </Typography>

        <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
          <Button
            variant="contained"
            onClick={() => downloadPDF(pdfRef.current)}
          >
            Download PDF
          </Button>

          <Button
            variant="outlined"
            onClick={() => setSaved([...saved, { ...data, total: subtotal }])}
          >
            Save
          </Button>
        </div>
      </Card>

      <Typography variant="h5">Saved Invoices</Typography>

      {saved.map((inv, i) => (
        <Card
          key={i}
          style={{
            padding: 15,
            marginTop: 10,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div>
            <Typography>{inv.clientName}</Typography>
            <Typography variant="body2">₹{inv.total}</Typography>
          </div>

          <div>
            <IconButton onClick={() => setData(inv)}>
              <VisibilityIcon />
            </IconButton>

            <IconButton
              onClick={() =>
                setSaved(saved.filter((_, idx) => idx !== i))
              }
            >
              <DeleteIcon />
            </IconButton>
          </div>
        </Card>
      ))}

      <div style={{ position: "absolute", left: -9999 }}>
        <Invoice ref={pdfRef} data={data} total={subtotal} />
      </div>
    </Container>
  );
}

