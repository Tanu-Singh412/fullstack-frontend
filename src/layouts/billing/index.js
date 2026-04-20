import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// MUI
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import Icon from "@mui/material/Icon";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

const API = "https://fullstack-project-1-n510.onrender.com/api/invoices";

const defaultForm = {
  clientName: "",
  company: "",
  invoiceNo: "",
  date: "",
  sgst: 9,
  cgst: 9,
  items: [{ name: "", qty: 1, price: 0 }],
};

export default function InvoicePage() {
  const [form, setForm] = useState(defaultForm);
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [preview, setPreview] = useState(null);

  const pdfRef = useRef();

  /* ================= FETCH ================= */
  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    const res = await axios.get(API);
    setInvoices(res.data.data || []);
  };

  /* ================= FILTER ================= */
  const filtered = invoices.filter((inv) => {
    const match =
      inv.clientName?.toLowerCase().includes(search.toLowerCase()) ||
      inv.invoiceNo?.toLowerCase().includes(search.toLowerCase());

    if (!match) return false;

    const d = new Date(inv.createdAt);
    const now = new Date();

    if (filter === "day") return d.toDateString() === now.toDateString();
    if (filter === "month")
      return d.getMonth() === now.getMonth() &&
             d.getFullYear() === now.getFullYear();
    if (filter === "year") return d.getFullYear() === now.getFullYear();

    return true;
  });

  /* ================= ITEMS ================= */
  const updateItem = (i, field, value) => {
    const items = [...form.items];
    items[i][field] = value;
    setForm({ ...form, items });
  };

  const addItem = () => {
    setForm({
      ...form,
      items: [...form.items, { name: "", qty: 1, price: 0 }],
    });
  };

  /* ================= TOTAL ================= */
  const subtotal = form.items.reduce((s, i) => s + i.qty * i.price, 0);
  const sgst = (subtotal * form.sgst) / 100;
  const cgst = (subtotal * form.cgst) / 100;
  const total = subtotal + sgst + cgst;

  /* ================= SAVE ================= */
  const saveInvoice = async () => {
    await axios.post(API, { ...form, subtotal, total });
    loadInvoices();
    downloadPDF();
    setForm(defaultForm);
  };

  /* ================= DELETE ================= */
  const deleteInvoice = async (id) => {
    await axios.delete(`${API}/${id}`);
    loadInvoices();
  };

  /* ================= PDF ================= */
  const downloadPDF = async () => {
    const canvas = await html2canvas(pdfRef.current, { scale: 2 });
    const img = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const w = pdf.internal.pageSize.getWidth();
    const h = (canvas.height * w) / canvas.width;

    pdf.addImage(img, "PNG", 0, 0, w, h);
    pdf.save("invoice.pdf");
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <MDBox p={3}>

        <MDTypography variant="h5" mb={2}>
          Invoice Generator
        </MDTypography>

        {/* FORM */}
        <Card sx={{ p: 3, mb: 3 }}>
          <MDBox display="grid" gridTemplateColumns="repeat(3,1fr)" gap={2}>
            <TextField label="Client Name"
              value={form.clientName}
              onChange={(e)=>setForm({...form, clientName:e.target.value})}
            />
            <TextField label="Company"
              value={form.company}
              onChange={(e)=>setForm({...form, company:e.target.value})}
            />
            <TextField label="Invoice No"
              value={form.invoiceNo}
              onChange={(e)=>setForm({...form, invoiceNo:e.target.value})}
            />
          </MDBox>

          <MDBox mt={2}>
            <MDTypography variant="h6">Items</MDTypography>

            {form.items.map((item,i)=>(
              <MDBox key={i} display="grid" gridTemplateColumns="2fr 1fr 1fr" gap={2} mt={1}>
                <TextField placeholder="Item"
                  value={item.name}
                  onChange={(e)=>updateItem(i,"name",e.target.value)}
                />
                <TextField type="number"
                  placeholder="Qty"
                  value={item.qty}
                  onChange={(e)=>updateItem(i,"qty",+e.target.value)}
                />
                <TextField type="number"
                  placeholder="Price"
                  value={item.price}
                  onChange={(e)=>updateItem(i,"price",+e.target.value)}
                />
              </MDBox>
            ))}

            <Button onClick={addItem} sx={{ mt:1 }}>
              + Add Item
            </Button>
          </MDBox>

          <MDTypography mt={2}>Total: ₹{total}</MDTypography>

          <Button variant="contained" color="success" sx={{ mt:2 }}
            onClick={saveInvoice}
          >
            Save + Download
          </Button>
        </Card>

        {/* SEARCH + FILTER */}
        <MDBox display="flex" gap={2} mb={2}>
          <TextField
            placeholder="Search"
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
          />

          <TextField
            select
            SelectProps={{ native:true }}
            value={filter}
            onChange={(e)=>setFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="day">Today</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </TextField>
        </MDBox>

        {/* LIST */}
        {filtered.map((inv)=>(
          <Card key={inv._id} sx={{ p:2, mb:1, display:"flex", justifyContent:"space-between" }}>
            <div>
              <MDTypography fontWeight="bold">{inv.clientName}</MDTypography>
              <MDTypography variant="caption">{inv.invoiceNo}</MDTypography>
            </div>

            <MDBox display="flex" gap={1}>
              <IconButton onClick={()=>setPreview(inv)}>
                <Icon>visibility</Icon>
              </IconButton>

              <IconButton onClick={()=>{
                setForm(inv);
                setTimeout(downloadPDF,400);
              }}>
                <Icon>download</Icon>
              </IconButton>

              <IconButton color="error" onClick={()=>deleteInvoice(inv._id)}>
                <Icon>delete</Icon>
              </IconButton>
            </MDBox>
          </Card>
        ))}

        {/* PDF */}
        <div ref={pdfRef} style={{ position:"absolute", left:-9999 }}>
          <h2>{form.company}</h2>
          <p>{form.clientName}</p>
          <h3>Total ₹{total}</h3>
        </div>

        {/* PREVIEW */}
        {preview && (
          <div className="modal" onClick={()=>setPreview(null)}>
            <div onClick={(e)=>e.stopPropagation()}>
              <h2>{preview.company}</h2>
              <p>{preview.clientName}</p>
              <h3>₹{preview.total}</h3>
            </div>
          </div>
        )}

      </MDBox>

      <Footer />
    </DashboardLayout>
  );
}