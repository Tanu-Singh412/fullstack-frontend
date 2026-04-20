// Professional Invoice Generator UI (Frontend)
// Connected with your existing backend: /api/invoices

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

const API = "https://fullstack-project-1-n510.onrender.com/api/invoices"; // use 127.0.0.1 to avoid axios network error

const generateInvoiceNo = () => `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

const defaultForm = {
  clientName: "",
  email: "",
  company: "",
  address: "",
  gstin: "",
  phone: "",
  invoiceNo: generateInvoiceNo(),
  date: new Date().toISOString().split("T")[0],
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
  const [openPreview, setOpenPreview] = useState(false);
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
        <h2 style={{ fontWeight:'700', marginBottom:20 }}>Professional Invoice Generator</h2>

        <div style={{ background:'#fff', padding:24, borderRadius:16, boxShadow:'0 8px 24px rgba(0,0,0,0.06)' }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            {Object.keys(defaultForm)
              .filter((k) => k !== "items")
              .map((field) => (
                <input
                  key={field}
                  placeholder={field.replace(/([A-Z])/g,' $1')}
                  value={form[field]}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  style={{ padding:14, border:'1px solid #dcdcdc', borderRadius:10, width:'100%' }}
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
                  placeholder={field.replace(/([A-Z])/g,' $1')}
                  value={item[field]}
                  onChange={(e) => updateItem(i, field, e.target.value)}
                  style={{ padding:14, border:'1px solid #dcdcdc', borderRadius:10, width:'100%' }}
                />
              ))}
            </div>
          ))}

          <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginTop:20 }}>
<button onClick={addItem} style={{ padding:'12px 20px', border:'none', borderRadius:10, background:'#111', color:'#fff', cursor:'pointer' }}>Add Item</button>
          <button
  onClick={saveInvoice}
  style={{
    padding:'12px 20px',
    border:'none',
    borderRadius:10,
    background:'#2e7d32',
    color:'#fff',
    cursor:'pointer'
  }}
>
  Save + Download PDF
</button>
</div>
        </div>

        <div style={{ display:'flex', gap:10, marginTop:30, marginBottom:20, flexWrap:'wrap' }}>
  <input
    placeholder="Search by client or invoice no"
    value={search}
    onChange={(e)=>setSearch(e.target.value)}
    style={{ padding:12, minWidth:260, border:'1px solid #ddd', borderRadius:8 }}
  />

  <select
    value={filter}
    onChange={(e)=>setFilter(e.target.value)}
    style={{ padding:12, border:'1px solid #ddd', borderRadius:8 }}
  >
    <option value="all">All</option>
    <option value="day">Today</option>
    <option value="month">This Month</option>
    <option value="year">This Year</option>
  </select>
</div>

<h3 style={{ marginTop: 10 }}>Saved Invoices</h3>

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
              <b style={{ fontSize:15 }}>{inv.clientName}</b>
              <p style={{ margin:'6px 0' }}>{inv.invoiceNo}</p>
              <small>{new Date(inv.createdAt).toLocaleDateString('en-IN')}</small>
            </div>

            <div style={{ display:'flex', gap:10 }}>
            <button
              onClick={() => {
                setPreviewData(inv);
                setOpenPreview(true);
              }}
              style={{ padding:'8px 14px', border:'1px solid #ddd', borderRadius:8, cursor:'pointer' }}
            >
              View
            </button>

            <button
              onClick={async () => {
                setForm(inv);
                setTimeout(() => downloadPDF(), 500);
              }}
              style={{ padding:'8px 14px', background:'#1976d2', color:'#fff', border:'none', borderRadius:8, cursor:'pointer' }}
            >
              Download
            </button>

            <button
  onClick={() => deleteInvoice(inv._id)}
  style={{
    padding:'8px 14px',
    background:'#d32f2f',
    color:'#fff',
    border:'none',
    borderRadius:8,
    cursor:'pointer'
  }}
>
  Delete
</button>
            </div>
          </div>
        ))}

        <div style={{ position: "absolute", left: "-9999px" }}>
          <ForwardInvoice ref={pdfRef} form={form} totals={totals} />
        </div>
      </div>

      {openPreview && previewData && (
  <div
    style={{
      position:'fixed',
      inset:0,
      background:'rgba(0,0,0,0.6)',
      display:'flex',
      justifyContent:'center',
      alignItems:'center',
      zIndex:9999,
      padding:20
    }}
    onClick={() => setOpenPreview(false)}
  >
    <div
      style={{ background:'#fff', borderRadius:12, maxHeight:'90vh', overflow:'auto' }}
      onClick={(e)=>e.stopPropagation()}
    >
      <ForwardInvoice
  form={previewData}
  totals={{
    subtotal: previewData.subtotal || 0,
    sgst: ((previewData.subtotal || 0) * (previewData.sgst || 0) / 100).toFixed(2),
    cgst: ((previewData.subtotal || 0) * (previewData.cgst || 0) / 100).toFixed(2),
    total: previewData.total || 0,
  }}
/>
    </div>
  </div>
)}

<Footer />
    </DashboardLayout>
  );
}
