import React, { useRef, useState } from "react";
import PropTypes from "prop-types";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { useEffect } from "react";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

/* ================= PDF ================= */
const downloadPDF = async (el) => {
  if (!el) return alert("Invoice not ready");

  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true, // ✅ FIX
    allowTaint: true,
    backgroundColor: "#fff",
  });

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");
  const width = pdf.internal.pageSize.getWidth();
  const height = (canvas.height * width) / canvas.width;

  pdf.addImage(imgData, "PNG", 0, 0, width, height);
  pdf.save("invoice.pdf");
};

/* ================= NUMBER TO WORD ================= */
const numberToWords = (num) => {
  const a = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

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
const Invoice = React.forwardRef(({ data, totals }, ref) => {
  return (
    <div ref={ref} style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.logoBox}>
          {data.logo && (
            <img src={data.logo} alt="logo" style={styles.logo} crossOrigin="anonymous" />
          )}
        </div>

        <div style={styles.companyBox}>
          <h2 style={styles.title}>TAX INVOICE</h2>
          <b>{data.company}</b>
          <br />
          {data.address && (
            <>
              {data.address}
              <br />
            </>
          )}
          {data.gstin && (
            <>
              GSTIN: {data.gstin}
              <br />
            </>
          )}
          {data.phone && <>Phone: {data.phone}</>}
        </div>

        <div style={styles.invoiceBox}>
          <b>Invoice No:</b> {data.invoiceNo}
          <br />
          <b>Date:</b> {data.date}
        </div>
      </div>

      {/* BILL TO */}
      <div style={styles.billBox}>
        <b>Bill To</b>
        <br />
        {data.clientName}
        <br />
        {data.email && (
          <>
            {data.email}
            <br />
          </>
        )}
        {data.clientGstin && <>GSTIN: {data.clientGstin}</>}
      </div>

      {/* ITEMS */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Item</th>
            {data.items.some((i) => i.hsn) && <th style={styles.th}>HSN</th>}
            <th style={styles.th}>Qty</th>
            <th style={styles.th}>Rate</th>
            <th style={styles.th}>Amount</th>
          </tr>
        </thead>

        <tbody>
          {data.items.map((item, i) => (
            <tr key={i}>
              <td style={styles.td}>{item.name}</td>

              {data.items.some((i) => i.hsn) && <td style={styles.td}>{item.hsn || "-"}</td>}

              <td style={styles.td}>{item.qty}</td>
              <td style={styles.td}>₹{item.price}</td>
              <td style={styles.td}>₹{item.qty * item.price}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* TOTAL */}
      <div style={styles.totalBox}>
        <div>Subtotal: ₹{totals.subtotal}</div>

        {data.sgst > 0 && (
          <div>
            SGST ({data.sgst}%): ₹{totals.sgst}
          </div>
        )}

        {data.cgst > 0 && (
          <div>
            CGST ({data.cgst}%): ₹{totals.cgst}
          </div>
        )}

        <h3>Total: ₹{totals.total}</h3>
      </div>

      {/* WORDS */}
      <div style={styles.words}>
        <b>Amount in Words:</b> {numberToWords(totals.total)}
      </div>
    </div>
  );
});

Invoice.propTypes = {
  data: PropTypes.object.isRequired,
  totals: PropTypes.object.isRequired,
};

/* ================= MAIN ================= */
export default function InvoicePage() {
  const pdfRef = useRef();
  const [savedInvoices, setSavedInvoices] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [data, setData] = useState({
    logo: "",
    clientName: "",
    email: "",
    company: "",
    address: "",
    gstin: "",
    phone: "",
    invoiceNo: "",
    date: "",
    clientGstin: "",
    sgst: 9,
    cgst: 9,
    items: [{ name: "", hsn: "", qty: 1, price: 0 }],
  });
  useEffect(() => {
    const saved = localStorage.getItem("invoices");
    if (saved) {
      const parsed = JSON.parse(saved);

      // ✅ Fix old invoices
      const updated = parsed.map((inv) => ({
        ...inv,
        createdAt: inv.createdAt || new Date().toISOString(),
      }));

      setSavedInvoices(updated);
      localStorage.setItem("invoices", JSON.stringify(updated));
    }
  }, []);
  const updateItem = (i, field, value) => {
    const items = [...data.items];
    items[i][field] = value;
    setData({ ...data, items });
  };

  const addItem = () => {
    setData({
      ...data,
      items: [...data.items, { name: "", hsn: "", qty: 1, price: 0 }],
    });
  };
  const deleteInvoice = (id) => {
    const updated = savedInvoices.filter((inv) => inv.id !== id);

    setSavedInvoices(updated);

    // ✅ update localStorage also
    localStorage.setItem("invoices", JSON.stringify(updated));
  };

  const handleDownload = async (inv) => {
    // temporarily set data
    setData(inv.data);

    // wait for DOM update
    setTimeout(() => {
      downloadPDF(pdfRef.current);
    }, 300);
  };
  const subtotal = data.items.reduce((s, i) => s + i.qty * i.price, 0);
  const sgstAmount = (subtotal * data.sgst) / 100;
  const cgstAmount = (subtotal * data.cgst) / 100;
  const total = subtotal + sgstAmount + cgstAmount;

  const totals = {
    subtotal: subtotal.toFixed(2),
    sgst: sgstAmount.toFixed(2),
    cgst: cgstAmount.toFixed(2),
    total: total.toFixed(2),
  };

  const filteredInvoices = savedInvoices.filter((inv) => {
    if (!inv.createdAt) return true;

    const invDate = new Date(inv.createdAt);
    const now = new Date();

    if (filter === "month") {
      return invDate.getMonth() === now.getMonth() && invDate.getFullYear() === now.getFullYear();
    }

    if (filter === "year") {
      return invDate.getFullYear() === now.getFullYear();
    }

    return true; // all
  });

  const deleteDialog = (
    <Dialog
      open={!!deleteId}
      onClose={() => setDeleteId(null)}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          p: 1,
        },
      }}
    >
      {/* HEADER */}
      <DialogTitle
        sx={{
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "18px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
        }}
      >
        <WarningAmberIcon sx={{ color: "#f44336", fontSize: 40 }} />
        Confirm Delete
      </DialogTitle>

      {/* CONTENT */}
      <DialogContent sx={{ textAlign: "center", fontSize: "14px", color: "#555" }}>
        Are you sure you want to delete this invoice?
        <br />
        <b style={{ color: "#f44336" }}>This action cannot be undone.</b>
      </DialogContent>

      {/* ACTIONS */}
      <DialogActions
        sx={{
          justifyContent: "center",
          pb: 2,
          gap: 1,
        }}
      >
        {/* CANCEL */}
        <Button
          onClick={() => setDeleteId(null)}
          sx={{
            borderRadius: "8px",
            textTransform: "none",
            px: 3,
            border: "1px solid black",
            color: "#000",
          }}
        >
          Cancel
        </Button>

        {/* DELETE */}
        <Button
          variant="contained"
          color="error"
          onClick={() => {
            deleteInvoice(deleteId);
            setDeleteId(null);
          }}
          sx={{
            borderRadius: "8px",
            textTransform: "none",
            px: 3,
            background: "#f44336",
            color: "#fff",
            "&:hover": {
              background: "#d32f2f",
            },
          }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
  return (
    <DashboardLayout>
      <DashboardNavbar />

      <div style={{ padding: 20 }}>
        <h2>Invoice Generator</h2>

        <div style={styles.card}>
          <div style={styles.grid}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onloadend = () => {
                  setData({ ...data, logo: reader.result });
                };
                if (file) reader.readAsDataURL(file);
              }}
            />
            <input
              style={styles.input}
              placeholder="Client Name"
              onChange={(e) => setData({ ...data, clientName: e.target.value })}
            />

            <input
              style={styles.input}
              placeholder="Company"
              onChange={(e) => setData({ ...data, company: e.target.value })}
            />

            <input
              style={styles.input}
              placeholder="Invoice No"
              onChange={(e) => setData({ ...data, invoiceNo: e.target.value })}
            />

            <input
              style={styles.input}
              type="number"
              placeholder="SGST %"
              value={data.sgst}
              onChange={(e) => setData({ ...data, sgst: Number(e.target.value) })}
            />

            <input
              style={styles.input}
              type="number"
              placeholder="CGST %"
              value={data.cgst}
              onChange={(e) => setData({ ...data, cgst: Number(e.target.value) })}
            />

            <input
              style={styles.input}
              type="date"
              onChange={(e) => setData({ ...data, date: e.target.value })}
            />
          </div>

          <h4 style={{ marginTop: 20 }}>Items</h4>

          {data.items.map((item, i) => (
            <div key={i} style={styles.itemRow}>
              <input
                style={styles.input}
                placeholder="Item"
                onChange={(e) => updateItem(i, "name", e.target.value)}
              />

              <input
                style={styles.input}
                placeholder="HSN"
                onChange={(e) => updateItem(i, "hsn", e.target.value)}
              />

              <input
                style={styles.input}
                type="number"
                placeholder="Qty"
                onChange={(e) => updateItem(i, "qty", Number(e.target.value))}
              />

              <input
                style={styles.input}
                type="number"
                placeholder="Price"
                onChange={(e) => updateItem(i, "price", Number(e.target.value))}
              />
            </div>
          ))}

          <div style={styles.buttonBar}>
            <button style={styles.btn} onClick={addItem}>
              Add Item
            </button>
            <button style={styles.btnPrimary} onClick={() => setOpen(true)}>
              Preview
            </button>
            <button
              style={styles.btnSuccess}
              onClick={() => {
                const invoiceData = {
                  data,
                  totals,
                  id: Date.now(),
                  createdAt: new Date().toISOString(),
                };

                const updated = [...savedInvoices, invoiceData];

                setSavedInvoices(updated);

                // ✅ SAVE TO LOCAL STORAGE
                localStorage.setItem("invoices", JSON.stringify(updated));

                downloadPDF(pdfRef.current);
              }}
            >
              Download
            </button>
          </div>
        </div>

        {open && (
          <div style={styles.overlay} onClick={() => setOpen(false)}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
              <Invoice data={data} totals={totals} />
            </div>
          </div>
        )}
        <h3 style={{ marginTop: 20 }}>Saved Invoices</h3>
        <div style={{ marginBottom: 10 }}>
          <button
            style={{ background: filter === "all" ? "#000" : "#ccc", color: "#fff" }}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            style={{ background: filter === "month" ? "#000" : "#ccc", color: "#fff" }}
            onClick={() => setFilter("month")}
          >
            Monthly
          </button>
          <button
            style={{ background: filter === "year" ? "#000" : "#ccc", color: "#fff" }}
            onClick={() => setFilter("year")}
          >
            Yearly
          </button>
        </div>
        {savedInvoices.length === 0 ? (
          <p style={{ fontSize: 14 }}>No invoices yet</p>
        ) : (
          filteredInvoices.map((inv) => (
            <div
              key={inv.id}
              style={{
                border: "1px solid #ddd",
                padding: 10,
                marginBottom: 8,
                borderRadius: 6,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {/* LEFT */}
              <div>
                <b style={{ fontSize: 14 }}>{inv.data.clientName}</b>
                <div style={{ fontSize: 12 }}>
                  ₹{inv.totals.total} | Invoice: {inv.data.invoiceNo}
                  <br />
                  {new Date(inv.createdAt).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>

              {/* RIGHT BUTTONS */}
              <div style={{ display: "flex", gap: 5 }}>
                {/* VIEW */}
                <button
                  style={{
                    padding: "4px 8px",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setData(inv.data);
                    setOpen(true);
                  }}
                >
                  View
                </button>

                {/* DOWNLOAD */}
                <button
                  style={{
                    padding: "4px 8px",
                    fontSize: 12,
                    background: "#2e7d32",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                  }}
                  onClick={() => handleDownload(inv)}
                >
                  Download
                </button>

                {/* DELETE */}
                <button
                  style={{
                    padding: "4px 8px",
                    fontSize: 12,
                    background: "#d32f2f",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                  }}
                  onClick={() => setDeleteId(inv.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}

        <div style={{ position: "absolute", left: "-9999px" }}>
          <Invoice ref={pdfRef} data={data} totals={totals} />
        </div>
      </div>

      <Footer />
      {deleteDialog}
    </DashboardLayout>
  );
}

/* ================= STYLES ================= */
const styles = {
  page: {
    width: "210mm",
    padding: 25,
    background: "#fff",
    fontFamily: "Arial",
    color: "#000", // base color
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    borderBottom: "2px solid #000",
    paddingBottom: 10,
    color: "#000",
  },

  logo: { height: 60 },

  logoBox: { width: "20%" },

  companyBox: {
    width: "50%",
    textAlign: "center",
    color: "#000",
  },

  invoiceBox: {
    width: "30%",
    textAlign: "right",
    color: "#000",
  },

  title: {
    margin: 0,
    color: "#000",
    fontWeight: "bold",
  },

  billBox: {
    marginBottom: 20,
    padding: 10,
    border: "1px solid #000",
    color: "#000",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    color: "#000",
  },

  th: {
    border: "1px solid #000",
    padding: 8,
    background: "#eee",
    color: "#000",
    fontWeight: "bold",
  },

  td: {
    border: "1px solid #000",
    padding: 8,
    color: "#000",
  },

  totalBox: {
    marginTop: 20,
    textAlign: "right",
    color: "#000",
  },

  words: {
    marginTop: 20,
    color: "#000",
  },

  /* FORM (optional — keep normal UI colors) */
  card: {
    background: "#fff",
    padding: 20,
    borderRadius: 10,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: 10,
  },

  itemRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: 10,
  },

  input: {
    padding: 10,
    border: "1px solid #ccc",
  },

  buttonBar: {
    display: "flex",
    gap: 10,
    marginTop: 20,
    justifyContent: "flex-end",
  },

  btn: {
    padding: "10px 15px",
    background: "#666",
    color: "#fff",
    border: "none",
  },

  btnPrimary: {
    padding: "10px 15px",
    background: "#000",
    color: "#fff",
    border: "none",
  },

  btnSuccess: {
    padding: "10px 15px",
    background: "#2e7d32",
    color: "#fff",
    border: "none",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  modal: {
    width: "800px",
    maxHeight: "90vh",
    overflowY: "auto",
    background: "#fff",
    padding: 20,
  },
};
