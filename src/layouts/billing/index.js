import React, { useRef, useState, useEffect } from "react";
import PropTypes from "prop-types";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

/* ================= PDF ================= */
const downloadPDF = async (el, invoiceNo = "invoice") => {
  if (!el) return alert("Invoice not ready");

  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#fff",
  });

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");
  const width = pdf.internal.pageSize.getWidth();
  const height = (canvas.height * width) / canvas.width;

  pdf.addImage(imgData, "PNG", 0, 0, width, height);
  pdf.save(`${invoiceNo}.pdf`);
};

/* ================= NUMBER TO WORD ================= */
const numberToWords = (num) => {
  const a = ["", "One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const b = ["", "", "Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];

  const inWords = (n) => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + " " + a[n % 10];
    if (n < 1000) return a[Math.floor(n / 100)] + " Hundred " + inWords(n % 100);
    if (n < 100000) return inWords(Math.floor(n / 1000)) + " Thousand " + inWords(n % 1000);
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + " Lakh " + inWords(n % 100000);
    return inWords(Math.floor(n / 10000000)) + " Crore " + inWords(n % 10000000);
  };

  return inWords(Math.floor(num)) + " Rupees Only";
};

/* ================= INVOICE ================= */
const Invoice = React.forwardRef(({ data, totals }, ref) => (
  <div ref={ref} style={styles.page}>
    <h2 style={{ textAlign: "center" }}>TAX INVOICE</h2>

    <div>
      <b>{data.company}</b><br />
      {data.clientName}
    </div>

    <hr />

    <table style={styles.table}>
      <thead>
        <tr>
          <th>Item</th>
          <th>Qty</th>
          <th>Rate</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        {data.items.map((item, i) => (
          <tr key={i}>
            <td>{item.name}</td>
            <td>{item.qty}</td>
            <td>{item.price}</td>
            <td>{item.qty * item.price}</td>
          </tr>
        ))}
      </tbody>
    </table>

    <h3>Total: ₹{totals.total}</h3>
    <p>{numberToWords(totals.total)}</p>
  </div>
));

Invoice.propTypes = {
  data: PropTypes.object,
  totals: PropTypes.object,
};

/* ================= MAIN ================= */
export default function InvoicePage() {
  const pdfRef = useRef();

  const [savedInvoices, setSavedInvoices] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [data, setData] = useState({
    clientName: "",
    company: "",
    invoiceNo: "",
    sgst: 9,
    cgst: 9,
    items: [{ name: "", qty: 1, price: 0 }],
  });

  /* LOAD */
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("invoices") || "[]");
    setSavedInvoices(saved);
  }, []);

  /* CALC */
  const subtotal = data.items.reduce((s, i) => s + i.qty * i.price, 0);
  const total = subtotal + (subtotal * data.sgst) / 100 + (subtotal * data.cgst) / 100;

  const totals = {
    total: total.toFixed(2),
  };

  /* ITEM UPDATE */
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

  const removeItem = (i) => {
    const items = data.items.filter((_, index) => index !== i);
    setData({ ...data, items });
  };

  /* SAVE */
  const saveInvoice = () => {
    if (!data.clientName) return alert("Client name required");

    const newInvoice = {
      id: editingId || Date.now(),
      data,
      totals,
      createdAt: new Date().toISOString(),
    };

    let updated;

    if (editingId) {
      updated = savedInvoices.map((inv) => (inv.id === editingId ? newInvoice : inv));
    } else {
      updated = [...savedInvoices, newInvoice];
    }

    setSavedInvoices(updated);
    localStorage.setItem("invoices", JSON.stringify(updated));

    setEditingId(null);

    // reset form
    setData({
      clientName: "",
      company: "",
      invoiceNo: "",
      sgst: 9,
      cgst: 9,
      items: [{ name: "", qty: 1, price: 0 }],
    });

    downloadPDF(pdfRef.current, data.invoiceNo || "invoice");
  };

  /* DELETE */
  const deleteInvoice = (id) => {
    const updated = savedInvoices.filter((i) => i.id !== id);
    setSavedInvoices(updated);
    localStorage.setItem("invoices", JSON.stringify(updated));
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <div style={{ padding: 20 }}>
        <h2>Invoice Generator</h2>

        {/* FORM */}
        <input
          placeholder="Client Name"
          value={data.clientName}
          onChange={(e) => setData({ ...data, clientName: e.target.value })}
        />

        <input
          placeholder="Company"
          value={data.company}
          onChange={(e) => setData({ ...data, company: e.target.value })}
        />

        <h4>Items</h4>

        {data.items.map((item, i) => (
          <div key={i}>
            <input
              placeholder="Item"
              onChange={(e) => updateItem(i, "name", e.target.value)}
            />
            <input
              type="number"
              placeholder="Qty"
              onChange={(e) => updateItem(i, "qty", Number(e.target.value))}
            />
            <input
              type="number"
              placeholder="Price"
              onChange={(e) => updateItem(i, "price", Number(e.target.value))}
            />

            <button onClick={() => removeItem(i)}>Remove</button>
          </div>
        ))}

        <button onClick={addItem}>Add Item</button>
        <button onClick={saveInvoice}>
          {editingId ? "Update Invoice" : "Save & Download"}
        </button>

        {/* SAVED LIST */}
        <h3>Saved</h3>

        {savedInvoices.map((inv) => (
          <div key={inv.id}>
            {inv.data.clientName} - ₹{inv.totals.total}

            <button
              onClick={() => {
                setData(inv.data);
                setEditingId(inv.id);
              }}
            >
              Edit
            </button>

            <button onClick={() => downloadPDF(pdfRef.current, inv.data.invoiceNo)}>
              Download
            </button>

            <button onClick={() => setDeleteId(inv.id)}>Delete</button>
          </div>
        ))}

        {/* HIDDEN PDF */}
        <div style={{ position: "absolute", left: "-9999px" }}>
          <Invoice ref={pdfRef} data={data} totals={totals} />
        </div>

        {/* DELETE DIALOG */}
        <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
          <DialogTitle>
            <WarningAmberIcon /> Confirm Delete
          </DialogTitle>
          <DialogContent>Are you sure?</DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button
              color="error"
              onClick={() => {
                deleteInvoice(deleteId);
                setDeleteId(null);
              }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </div>

      <Footer />
    </DashboardLayout>
  );
}

/* ================= STYLES ================= */
const styles = {
  page: {
    width: "210mm",
    padding: 20,
    background: "#fff",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
};