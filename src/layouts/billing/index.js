// Professional Invoice Generator UI (Frontend)
// Connected with your existing backend: /api/invoices

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

const API = "http://127.0.0.1:5000/api/invoices"; // use 127.0.0.1 to avoid axios network error

const defaultForm = {
  clientName: "",
  email: "",
  company: "",
  address: "",
  gstin: "",
  phone: "",
  invoiceNo: `INV-${Date.now()}`, // auto generated invoice no
  date: "",
    sgst: 9,
  cgst: 9,
  items: [
    {
      name: "",
      hsn: "",
      qty: 1,
      price: 0,
    },
  ],
};

function numberToWords(num) {
  return `${Number(num).toLocaleString("en-IN")} Rupees Only`;
}

function InvoiceTemplate({ form, totals }, ref) {
  return (
    <div
      ref={ref}
      style={{
        width: "210mm",
        minHeight: "297mm",
        background: "#fff",
        padding: 24,
        fontFamily: "Arial",
        color: "#000",
        border: "1px solid #ddd",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: 20 }}>
        TAX INVOICE
      </h1>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ width: "60%" }}>
          <h3>{form.company || "Company Name"}</h3>
          <p>{form.address}</p>
          <p>GSTIN: {form.gstin}</p>
          <p>Phone: {form.phone}</p>
        </div>

        <div style={{ width: "35%" }}>
          <p><b>Invoice No:</b> {form.invoiceNo}</p>
          <p><b>Date:</b> {form.date}</p>
        </div>
      </div>

      <div style={{ marginTop: 20, border: "1px solid #000", padding: 12 }}>
        <h4>Buyer (Bill To)</h4>
        <p><b>{form.clientName}</b></p>
        <p>{form.email}</p>
        <p>{form.address}</p>
        
      </div>

      <table
        style={{
          width: "100%",
          marginTop: 20,
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr>
            {["Description", "HSN", "Qty", "Rate", "Amount"].map((h) => (
              <th
                key={h}
                style={{
                  border: "1px solid #000",
                  padding: 10,
                  background: "#f5f5f5",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {form.items.map((item, i) => (
            <tr key={i}>
              <td style={{ border: "1px solid #000", padding: 10 }}>{item.name}</td>
              <td style={{ border: "1px solid #000", padding: 10 }}>{item.hsn}</td>
              <td style={{ border: "1px solid #000", padding: 10 }}>{item.qty}</td>
              <td style={{ border: "1px solid #000", padding: 10 }}>₹{item.price}</td>
              <td style={{ border: "1px solid #000", padding: 10 }}>
                ₹{item.qty * item.price}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 20, textAlign: "right" }}>
        <p><b>Sub Total:</b> ₹{totals.subtotal}</p>
        <p><b>SGST:</b> ₹{totals.sgst}</p>
        <p><b>CGST:</b> ₹{totals.cgst}</p>
        <h2><b>Total:</b> ₹{totals.total}</h2>
      </div>

      <div style={{ marginTop: 20 }}>
        <b>Amount Payable (in words):</b>
        <p>{numberToWords(totals.total)}</p>
      </div>
    </div>
  );
}

const ForwardInvoice = React.forwardRef(InvoiceTemplate);

export default function InvoicePage() {
  const [form, setForm] = useState(defaultForm);
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [previewData, setPreviewData] = useState(null);
  const pdfRef = useRef();

  const fetchInvoices = async () => {
    try {
    const res = await axios.get(`${API}?search=${search}&filter=${filter}`);
    setInvoices(res.data.data || []);
    } catch (err) {
      console.log("Axios Error:", err);
      alert("Backend not connected. Please start backend server on port 5000.");
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [search, filter]);

  const updateItem = (index, field, value) => {
    const updated = [...form.items];
    updated[index][field] = value;
    setForm({ ...form, items: updated });
  };

  const addItem = () => {
    setForm({
      ...form,
      items: [...form.items, { name: "", hsn: "", qty: 1, price: 0 }],
    });
  };

  const subtotal = form.items.reduce(
    (sum, item) => sum + Number(item.qty) * Number(item.price),
    0
  );

  const sgstAmount = (subtotal * Number(form.sgst)) / 100;
  const cgstAmount = (subtotal * Number(form.cgst)) / 100;
  const total = subtotal + sgstAmount + cgstAmount;

  const totals = {
    subtotal: subtotal.toFixed(2),
    sgst: sgstAmount.toFixed(2),
    cgst: cgstAmount.toFixed(2),
    total: total.toFixed(2),
  };

  const saveInvoice = async () => {
    await axios.post(API, {
      ...form,
      subtotal,
      total,
    });

    fetchInvoices();
    downloadPDF();
    setForm(defaultForm);
  };

  const deleteInvoice = async (id) => {
    await axios.delete(`${API}/${id}`);
    fetchInvoices();
  };

  const downloadPDF = async () => {
    const canvas = await html2canvas(pdfRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save("invoice.pdf");
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <div style={{ padding: 24 }}>
        <h2>Professional Invoice Generator</h2>

        <div style={{ background: "#fff", padding: 20, borderRadius: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            {Object.keys(defaultForm)
              .filter((k) => k !== "items")
              .map((field) => (
                <input
                  key={field}
                  placeholder={field}
                  value={form[field]}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8 }}
                />
              ))}
          </div>

          <h3 style={{ marginTop: 20 }}>Invoice Items</h3>

          {form.items.map((item, i) => (
            <div
              key={i}
              style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 10 }}
            >
              {["name", "hsn", "qty", "price"].map((field) => (
                <input
                  key={field}
                  placeholder={field}
                  value={item[field]}
                  onChange={(e) => updateItem(i, field, e.target.value)}
                  style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8 }}
                />
              ))}
            </div>
          ))}

          <button onClick={addItem}>Add Item</button>
          <button onClick={saveInvoice} style={{ marginLeft: 10 }}>
            Save + Download PDF
          </button>
        </div>

        <h3 style={{ marginTop: 30 }}>Saved Invoices</h3>

        {invoices.map((inv) => (
          <div
            key={inv._id}
            style={{
              background: "#fff",
              padding: 16,
              borderRadius: 10,
              marginBottom: 10,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div>
              <b>{inv.clientName}</b>
              <p>{inv.invoiceNo}</p>
            </div>

            <button onClick={() => deleteInvoice(inv._id)}>
              Delete
            </button>
          </div>
        ))}

        <div style={{ position: "absolute", left: "-9999px" }}>
          <ForwardInvoice ref={pdfRef} form={form} totals={totals} />
        </div>
      </div>

      <Footer />
    </DashboardLayout>
  );
}
