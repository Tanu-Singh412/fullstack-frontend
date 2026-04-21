import React, { useEffect, useRef, useState } from "react";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import axios from "axios";

/* ================= API ================= */
const API = "http://localhost:5000/api/invoices";

/* ================= PDF ================= */
const downloadPDF = async (el) => {
  const canvas = await html2canvas(el, { scale: 2, useCORS: true });
  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");
  const width = pdf.internal.pageSize.getWidth();
  const height = (canvas.height * width) / canvas.width;

  pdf.addImage(imgData, "PNG", 0, 0, width, height);
  pdf.save("invoice.pdf");
};

/* ================= MAIN ================= */
export default function InvoicePage() {
  const pdfRef = useRef();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState({
    clientName: "",
    company: "",
    invoiceNo: "",
    date: "",
    sgst: 9,
    cgst: 9,
    items: [{ name: "", qty: 1, price: 0 }],
  });

  /* ================= FETCH ================= */
  const fetchInvoices = async () => {
    setLoading(true);
    const res = await axios.get(API);
    setInvoices(res.data.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  /* ================= ITEMS ================= */
  const updateItem = (i, field, value) => {
    const items = [...data.items];
    items[i][field] = value;
    setData({ ...data, items });
  };

  const addItem = () => {
    setData({
      ...data,
      items: [...data.items, { name: "", qty: 1, price: 0 }],
    });
  };

  /* ================= CALC ================= */
  const subtotal = data.items.reduce((s, i) => s + i.qty * i.price, 0);
  const tax = subtotal * ((data.sgst + data.cgst) / 100);
  const total = subtotal + tax;

  /* ================= SAVE ================= */
  const saveInvoice = async () => {
    const payload = {
      ...data,
      subtotal,
      total,
      date: new Date(),
    };

    await axios.post(API, payload);
    await fetchInvoices();
    downloadPDF(pdfRef.current);
  };

  /* ================= DELETE ================= */
  const deleteInvoice = async (id) => {
    await axios.delete(`${API}/${id}`);
    fetchInvoices();
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <div style={styles.container}>
        <h2 style={styles.title}>Invoice Generator</h2>

        {/* ================= FORM ================= */}
        <div style={styles.card}>
          <div style={styles.grid}>
            <input placeholder="Client Name" onChange={(e) => setData({ ...data, clientName: e.target.value })} />
            <input placeholder="Company" onChange={(e) => setData({ ...data, company: e.target.value })} />
            <input placeholder="Invoice No" onChange={(e) => setData({ ...data, invoiceNo: e.target.value })} />
            <input type="date" onChange={(e) => setData({ ...data, date: e.target.value })} />
          </div>

          <h4 style={{ marginTop: 20 }}>Items</h4>

          {data.items.map((item, i) => (
            <div key={i} style={styles.row}>
              <input placeholder="Item" onChange={(e) => updateItem(i, "name", e.target.value)} />
              <input type="number" placeholder="Qty" onChange={(e) => updateItem(i, "qty", +e.target.value)} />
              <input type="number" placeholder="Price" onChange={(e) => updateItem(i, "price", +e.target.value)} />
            </div>
          ))}

          <div style={styles.actions}>
            <button style={styles.btn} onClick={addItem}>+ Add Item</button>
            <button style={styles.btnPrimary} onClick={saveInvoice}>
              Save & Download
            </button>
          </div>
        </div>

        {/* ================= LIST ================= */}
        <h3 style={{ marginTop: 30 }}>Saved Invoices</h3>

        {loading ? (
          <p>Loading...</p>
        ) : (
          invoices.map((inv) => (
            <div key={inv._id} style={styles.cardRow}>
              <div>
                <b>{inv.clientName}</b>
                <div>Invoice: {inv.invoiceNo}</div>
                <div>₹{inv.total}</div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => downloadPDF(pdfRef.current)}>Download</button>
                <button onClick={() => deleteInvoice(inv._id)} style={{ background: "red", color: "#fff" }}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}

        {/* ================= PDF AREA ================= */}
        <div style={{ position: "absolute", left: "-9999px" }}>
          <div ref={pdfRef} style={styles.pdf}>
            <h2>TAX INVOICE</h2>
            <p><b>Client:</b> {data.clientName}</p>
            <p><b>Company:</b> {data.company}</p>

            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((i, idx) => (
                  <tr key={idx}>
                    <td>{i.name}</td>
                    <td>{i.qty}</td>
                    <td>₹{i.price}</td>
                    <td>₹{i.qty * i.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3>Total: ₹{total}</h3>
          </div>
        </div>
      </div>

      <Footer />
    </DashboardLayout>
  );
}

/* ================= STYLES ================= */
const styles = {
  container: {
    padding: 20,
    maxWidth: 1000,
    margin: "auto",
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },

  card: {
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2,1fr)",
    gap: 10,
  },

  row: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr",
    gap: 10,
    marginBottom: 10,
  },

  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 20,
  },

  btn: {
    padding: "10px 15px",
    border: "1px solid #000",
    background: "#fff",
    cursor: "pointer",
  },

  btnPrimary: {
    padding: "10px 15px",
    background: "#000",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },

  cardRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: 12,
    marginTop: 10,
    border: "1px solid #eee",
    borderRadius: 8,
    background: "#fafafa",
  },

  pdf: {
    padding: 20,
    background: "#fff",
    width: "210mm",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
};