import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import {
  Tabs,
  Tab,
  Grid,
  Button,
  Card,
  TextField,
  CircularProgress,
} from "@mui/material";

const Base_API = "https://fullstack-project-1-n510.onrender.com/api";

function ProjectDetails() {
  const { state } = useLocation();

  const [project, setProject] = useState({
    ...state,
    totalAmount: Number(state?.totalAmount || 0),
  });

  const [scopeData, setScopeData] = useState({
    projectType: "",
    workType: "",
    area: "",
    floors: "",

    conceptDesign: false,
    drawings2D: false,
    elevation3D: false,
    workingDrawings: false,

    interiorLayout: false,
    civil: false,
    electrical: false,
    plumbing: false,
    interiorExecution: false,
    supervision: false,

    revisions: "",
    timeline: "",

    costPerSqft: "",
    lumpSum: "",

    materialIncluded: false,
    notes: "",
  });

  const [scopeList, setScopeList] = useState([]);
  const [editScopeId, setEditScopeId] = useState(null);
  const [tab, setTab] = useState(0);

  const [drawingType, setDrawingType] = useState(null);
  const [openUpload, setOpenUpload] = useState(false);
  const [uploadType, setUploadType] = useState(null);
  const [files, setFiles] = useState([]);
  const [drawings, setDrawings] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: "",
    date: "",
    note: "",
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [imageIndex, setImageIndex] = useState(0);

  // ================= FETCH =================
const fetchProject = async () => {
  if (!state?._id) return;

  const res = await fetch(`${Base_API}/projects/${state._id}`);
  const data = await res.json();

  setProject({
    ...data,
    totalAmount: Number(data.totalAmount || 0),
  });
};

  const fetchScope = async () => {
    if (!project?._id) return;

    const res = await fetch(`${Base_API}/projects/${project._id}/scope`);
    const data = await res.json();
    setScopeList(data || []);
  };
  // ================= UPLOAD =================
const fetchDrawings = async () => {
  if (!project?._id) return;

  try {
    const res = await fetch(
      `${Base_API}/projects/${project._id}/drawing`
    );

    const data = await res.json();

    setDrawings(Array.isArray(data) ? data : []);

  } catch (err) {
    console.log("DRAWINGS ERROR:", err);
    setDrawings([]);
  }
};

const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

const handleUpload = async () => {
  if (!files.length || !uploadType) return;

  setLoading(true);

  try {
    const base64Images = await Promise.all(
      Array.from(files).map((file) => convertToBase64(file))
    );

    await fetch(`${Base_API}/projects/${project._id}/drawing/base64`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: uploadType,
        images: base64Images,
      }),
    });

    await fetchDrawings();
    setOpenUpload(false);
    setFiles([]);
  } catch (error) {
    console.error("Upload error:", error);
    alert("Failed to upload images. They might be too large.");
  } finally {
    setLoading(false);
  }
};
// ================= USE EFFECTS =================



useEffect(() => {
  fetchProject();
}, []);

useEffect(() => {
  if (project?._id) {
    fetchScope();
  }
}, [project?._id]);

useEffect(() => {
  if (project?._id) {
    fetchDrawings();
  }
}, [project?._id]);

// ✅ AFTER ALL HOOKS
if (!project?._id) return <div>Loading...</div>;
  // ================= PAYMENT =================
const handleAddPayment = async () => {
  if (!paymentData.amount) return;

  setLoading(true);

  const payload = {
    amount: Number(paymentData.amount),
    date: paymentData.date || new Date().toISOString(),
    note: paymentData.note,
  };

  const res = await fetch(`${Base_API}/projects/${project._id}/payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  const newPayment =
    data?.payment || data?.data || payload;

  // ✅ instant UI update (NO refresh needed)
  setProject((prev) => ({
    ...prev,
    payments: [...(prev.payments || []), newPayment],
  }));

  setPaymentData({ amount: "", date: "", note: "" });
  setLoading(false);
};

const sendWhatsAppSlip = (pay) => {
  const amount = Number(pay?.amount ?? pay?.payment?.amount ?? pay?.data?.amount ?? 0);
  const date = pay?.date || pay?.createdAt;
  const formattedDate = date ? new Date(date).toLocaleDateString("en-IN") : new Date().toLocaleDateString("en-IN");
  
  // Use clientPhone from backend
  const phone = project?.clientPhone || project?.phone;
  
  if (!phone) {
    alert("Client phone number is missing in project data!");
    return;
  }
  
  let cleanPhone = phone.toString().replace(/\D/g, '');
  if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone; // Ensure country code for India
  
  const text = `Hello ${project?.clientName || "Client"},\n\nWe have successfully received your payment of ₹${amount} on ${formattedDate} for the project "${project?.projectName}".\nThank you for your prompt payment!\n\n- ${project?.company || "Satya Group"}`;
  
  const encodedText = encodeURIComponent(text);
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodedText}`;
  window.open(waUrl, "_blank");
};

  // ================= DELETE IMAGE =================
const handleDeleteImage = async (imgUrl) => {
  await fetch(`${Base_API}/projects/${project._id}/drawing/image`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      imageUrl: imgUrl,
      type: drawingType, // 🔥 IMPORTANT FIX
    }),
  });

  await fetchDrawings();
};

  // ================= LIGHTBOX =================
  const civilImages =
  drawings.find((d) => d.type === "civil")?.images || [];

const interiorImages =
  drawings.find((d) => d.type === "interior")?.images || [];
const images =
  drawingType === "civil"
    ? civilImages
    : drawingType === "interior"
    ? interiorImages
    : [];

const openImage = (img, index) => {
  setSelectedImage(img);
  setImageIndex(index);
};

const next = () => {
  if (!images.length) return;

  const i = (imageIndex + 1) % images.length;
  setImageIndex(i);
  setSelectedImage(images[i]);
};

const prev = () => {
  if (!images.length) return;

  const i = (imageIndex - 1 + images.length) % images.length;
  setImageIndex(i);
  setSelectedImage(images[i]);
};

const inputStyle = {
    flex: 1,
    minWidth: "140px",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    outline: "none",
    fontSize: "14px",
  };

  const handleAddScope = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${Base_API}/projects/${project._id}/scope`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(scopeData),
      });

      if (!res.ok) throw new Error("Failed");

      await fetchScope(); // ✅ instant update

      // reset
      setScopeData({
        projectType: "",
        workType: "",
        area: "",
        floors: "",
        conceptDesign: false,
        drawings2D: false,
        elevation3D: false,
        workingDrawings: false,
        interiorLayout: false,
        civil: false,
        electrical: false,
        plumbing: false,
        interiorExecution: false,
        supervision: false,
        revisions: "",
        timeline: "",
        costPerSqft: "",
        lumpSum: "",
        materialIncluded: false,
        notes: "",
      });
    } catch (err) {
      alert("Error saving scope");
    } finally {
      setLoading(false);
    }
  };
  const handleUpdateScope = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${Base_API}/projects/${project._id}/scope/${editScopeId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(scopeData),
        },
      );

      if (!res.ok) throw new Error("Update failed");

      await fetchScope();

      setEditScopeId(null); // exit edit mode
      resetScopeForm();
    } catch (err) {
      alert("Error updating scope");
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteScope = async (id) => {
    if (!window.confirm("Delete this scope?")) return;

    try {
      await fetch(`${Base_API}/projects/${project._id}/scope/${id}`, {
        method: "DELETE",
      });

      await fetchScope();
    } catch (err) {
      alert("Delete failed");
    }
  };
  const resetScopeForm = () => {
    setScopeData({
      projectType: "",
      workType: "",
      area: "",
      floors: "",
      conceptDesign: false,
      drawings2D: false,
      elevation3D: false,
      workingDrawings: false,
      interiorLayout: false,
      civil: false,
      electrical: false,
      plumbing: false,
      interiorExecution: false,
      supervision: false,
      revisions: "",
      timeline: "",
      costPerSqft: "",
      lumpSum: "",
      materialIncluded: false,
      notes: "",
    });
  };
  return (
    <DashboardLayout>
      <DashboardNavbar />

      <MDBox p={3}>
        {/* HEADER */}
        <Card
          sx={{
            p: 3,
            mb: 3,
            borderRadius: "16px",
            background: "linear-gradient(135deg, #1976d2, #42a5f5)",
            color: "#fff",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          }}
        >
          <MDTypography variant="h4" fontWeight="bold" sx={{ color: "#fff" }}>
            {project.projectName}
          </MDTypography>

          <MDTypography sx={{ mt: 1, color: "#e3f2fd" }}>
            Client: <b style={{ color: "#fff" }}>{project.clientName}</b>
          </MDTypography>
        </Card>

        {/* TABS */}
<Tabs
  value={tab}
  onChange={(e, v) => setTab(v)}
  sx={{
    "& .MuiTab-root": {
      textTransform: "none",
      fontWeight: 500,
      color: "#555",
      borderRadius: "8px",
      mx: 0.5,
      minHeight: "40px",
    },

    "& .Mui-selected": {
      backgroundColor: "#1976d2",
      color: "#fff !important",
    },

    "& .MuiTabs-indicator": {
      display: "none", // ❌ hide bottom line
    },
  }}
>
  <Tab label="Overview" />
  <Tab label="Drawings" />
  <Tab label="Accounts" />
  <Tab label="Scope of Work" />
</Tabs>


        {/* OVERVIEW */}
        {tab === 0 && (
          <Card sx={{ p: 3, mt: 2 }}>
            <MDTypography>{project.description}</MDTypography>
          </Card>
        )}

        {/* DRAWINGS */}
{tab === 1 && (
  <MDBox mt={3}>
    {!drawingType ? (
      <Grid container spacing={4}>
        {["civil", "interior"].map((type) => (
          <Grid item xs={12} md={6} key={type}>
            <Card sx={{ p: 4, position: "relative", textAlign: "center", borderRadius: "16px", boxShadow: "0px 10px 30px rgba(0,0,0,0.08)", borderTop: type === "civil" ? "5px solid #1976d2" : "5px solid #9c27b0" }}>
              <MDTypography variant="h4" fontWeight="bold" sx={{ color: "#2c3e50", textTransform: "capitalize", mb: 1 }}>
                {type} Drawings
              </MDTypography>
              <MDTypography variant="button" sx={{ color: "#7f8c8d", display: "block", mb: 4 }}>
                Manage {type} schematics and blueprints
              </MDTypography>
              
              <MDBox display="flex" justifyContent="center" gap={3}>
                <Button
                  sx={{ color: "#fff", background: type === "civil" ? "linear-gradient(135deg, #1976d2, #42a5f5)" : "linear-gradient(135deg, #9c27b0, #ce93d8)", px: 4, py: 1.5, borderRadius: "8px", fontWeight: "bold" }}
                  variant="contained"
                  onClick={() => {
                    setUploadType(type);
                    setOpenUpload(true);
                  }}
                >
                  Upload New
                </Button>
                <Button
                  sx={{ color: type === "civil" ? "#1976d2" : "#9c27b0", border: `2px solid ${type === "civil" ? "#1976d2" : "#9c27b0"}`, px: 4, py: 1.5, borderRadius: "8px", fontWeight: "bold" }}
                  variant="outlined"
                  onClick={() => setDrawingType(type)}
                >
                  View Gallery
                </Button>
              </MDBox>
            </Card>
          </Grid>
        ))}
      </Grid>
    ) : (
      <MDBox>
        <Button onClick={() => setDrawingType(null)} sx={{ mb: 3, background: "#f1f5f9", color: "#334155", px: 3, py: 1, borderRadius: "8px", fontWeight: "bold" }}>⬅ Back to Folders</Button>

        <Grid container spacing={3}>
          {images.map((img, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card sx={{ p: 1.5, borderRadius: "12px", boxShadow: "0 6px 15px rgba(0,0,0,0.06)", transition: "transform 0.2s", "&:hover": { transform: "translateY(-5px)" } }}>
                <img
                  src={img}
                  onClick={() => openImage(img, i)}
                  style={{
                    width: "100%",
                    height: 220,
                    objectFit: "cover",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                />

                <Button
                  size="small"
                  color="error"
                  fullWidth
                  sx={{ mt: 1.5, fontWeight: "bold", background: "#fff5f5" }}
                  onClick={() => handleDeleteImage(img)}
                >
                  Delete Image
                </Button>
              </Card>
            </Grid>
          ))}
          {images.length === 0 && (
             <Grid item xs={12}>
               <MDTypography variant="h6" align="center" sx={{ mt: 8, color: "#94a3b8", fontWeight: "500" }}>No {drawingType} drawings found. Upload some to see them here.</MDTypography>
             </Grid>
          )}
        </Grid>
      </MDBox>
    )}
  </MDBox>
)}        {/* ACCOUNTS */}



{tab === 2 && (
  <MDBox mt={3}>
    {(() => {
      const total = Number(project?.totalAmount || 0);

      const paid = (project?.payments || []).reduce((sum, p) => {
        const amount =
          Number(
            p?.amount ??
            p?.payment?.amount ??
            p?.data?.amount ??
            0
          );

        return sum + amount;
      }, 0);

      const balance = total - paid;

      return (
        <>
          {/* ================= SUMMARY ================= */}
          <MDBox
            display="grid"
            gridTemplateColumns="repeat(3, 1fr)"
            gap={2}
            mb={3}
          >
            {[
              { label: "Total", value: total, color: "#1976d2", bg: "#e3f2fd" },
              { label: "Paid", value: paid, color: "#2e7d32", bg: "#e8f5e9" },
              { label: "Balance", value: balance, color: "#d32f2f", bg: "#ffebee" },
            ].map((item, i) => (
              <Card
                key={i}
                sx={{
                  p: 2,
                  borderRadius: "12px",
                  textAlign: "center",
                  background: item.bg,
                }}
              >
                <MDTypography variant="caption">
                  {item.label}
                </MDTypography>

                <MDTypography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ color: item.color }}
                >
                  ₹ {item.value}
                </MDTypography>
              </Card>
            ))}
          </MDBox>

          {/* ================= ADD PAYMENT ================= */}
          <Card sx={{ p: 2, borderRadius: "12px", mb: 3 }}>
            <MDBox
              display="grid"
              gridTemplateColumns="repeat(4, 1fr)"
              gap={2}
            >
              <input
                type="number"
                placeholder="Amount"
                value={paymentData.amount}
                onChange={(e) =>
                  setPaymentData({
                    ...paymentData,
                    amount: e.target.value,
                  })
                }
                style={inputStyle}
              />

              <input
                type="date"
                value={paymentData.date}
                onChange={(e) =>
                  setPaymentData({
                    ...paymentData,
                    date: e.target.value,
                  })
                }
                style={inputStyle}
              />

              <input
                type="text"
                placeholder="Note"
                value={paymentData.note}
                onChange={(e) =>
                  setPaymentData({
                    ...paymentData,
                    note: e.target.value,
                  })
                }
                style={inputStyle}
              />

              <Button
                variant="contained"
                onClick={handleAddPayment}
                sx={{
                  borderRadius: "8px",
                  textTransform: "none",
                  height: "40px",
                  color:"#fff"
                }}
              >
                {loading ? <CircularProgress size={20} /> : "Add Payment"}
              </Button>
            </MDBox>
          </Card>

          {/* ================= TABLE ================= */}
          <Card sx={{ p: 2, borderRadius: "12px" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr style={{ background: "#e0e7ff", color: "#3730a3" }}>
                  <th style={{ padding: "15px", textAlign: "center", fontWeight: "bold" }}>Date</th>
                  <th style={{ padding: "15px", textAlign: "center", fontWeight: "bold" }}>Amount</th>
                  <th style={{ padding: "15px", textAlign: "center", fontWeight: "bold" }}>Note</th>
                  <th style={{ padding: "15px", textAlign: "center", fontWeight: "bold" }}>Action</th>
                </tr>
              </thead>

              <tbody>
                {(project?.payments || []).map((pay, i) => {
                  const amount =
                    Number(
                      pay?.amount ??
                      pay?.payment?.amount ??
                      pay?.data?.amount ??
                      0
                    );

                  const date = pay?.date || pay?.createdAt;

                  return (
                    <tr key={i}>
                      <td style={{ padding: "10px", textAlign: "center" }}>
                        {date
                          ? new Date(date).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            })
                          : "-"}
                      </td>

                      <td
                        style={{
                          padding: "10px",
                          textAlign: "center",
                          fontWeight: "600",
                          color: "#2e7d32",
                        }}
                      >
                        ₹ {amount}
                      </td>

                      <td style={{ padding: "15px", textAlign: "center" }}>
                        {pay?.note || pay?.payment?.note || "-"}
                      </td>
                      
                      <td style={{ padding: "15px", textAlign: "center" }}>
                        <Button 
                          size="small" 
                          variant="contained" 
                          color="success" 
                          sx={{ color: "white", textTransform: "none", borderRadius: "20px", fontWeight: "bold", background: "#25D366", "&:hover": { background: "#128C7E" } }}
                          onClick={() => sendWhatsAppSlip(pay)}
                        >
                          Send WA Slip
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </>
      );
    })()}
  </MDBox>
)}      



  {tab === 3 && (


  
          <MDBox mt={3}>
            {/* ================= FORM ================= */}
            <Card
              sx={{
                p: 3,
                mb: 3,
                borderRadius: "12px",
                boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
              }}
            >
              <MDTypography variant="h6" mb={2}>
                Add Scope of Work
              </MDTypography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="Project Type"
                    fullWidth
                    size="small"
                    value={scopeData.projectType}
                    onChange={(e) =>
                      setScopeData({
                        ...scopeData,
                        projectType: e.target.value,
                      })
                    }
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    label="Work Type"
                    fullWidth
                    size="small"
                    value={scopeData.workType}
                    onChange={(e) =>
                      setScopeData({ ...scopeData, workType: e.target.value })
                    }
                  />
                </Grid>

                <Grid item xs={12} md={2}>
                  <TextField
                    label="Area (sqft)"
                    type="number"
                    fullWidth
                    size="small"
                    value={scopeData.area}
                    onChange={(e) =>
                      setScopeData({ ...scopeData, area: e.target.value })
                    }
                  />
                </Grid>

                <Grid item xs={12} md={2}>
                  <TextField
                    label="Floors"
                    type="number"
                    fullWidth
                    size="small"
                    value={scopeData.floors}
                    onChange={(e) =>
                      setScopeData({ ...scopeData, floors: e.target.value })
                    }
                  />
                </Grid>

                <Grid item xs={12} md={2}>
                  <TextField
                    label="Timeline"
                    fullWidth
                    size="small"
                    value={scopeData.timeline}
                    onChange={(e) =>
                      setScopeData({ ...scopeData, timeline: e.target.value })
                    }
                  />
                </Grid>
              </Grid>

              {/* ================= CHECKBOX ================= */}
              <MDBox mt={3}>
                <MDTypography variant="subtitle2" mb={1}>
                  Services Included
                </MDTypography>

                <Grid container spacing={1}>
                  {[
                    "conceptDesign",
                    "drawings2D",
                    "elevation3D",
                    "workingDrawings",
                    "interiorLayout",
                    "civil",
                    "electrical",
                    "plumbing",
                    "interiorExecution",
                    "supervision",
                    "materialIncluded",
                  ].map((field) => (
                    <Grid item xs={6} md={3} key={field}>
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "13px",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={scopeData[field]}
                          onChange={(e) =>
                            setScopeData({
                              ...scopeData,
                              [field]: e.target.checked,
                            })
                          }
                        />
                        {field}
                      </label>
                    </Grid>
                  ))}
                </Grid>
              </MDBox>

              {/* ================= NOTES ================= */}
              <MDBox mt={3}>
                <TextField
                  label="Notes"
                  multiline
                  rows={2}
                  fullWidth
                  value={scopeData.notes}
                  onChange={(e) =>
                    setScopeData({ ...scopeData, notes: e.target.value })
                  }
                />
              </MDBox>

              {/* ================= BUTTON ================= */}
              <Button
                variant="contained"
                sx={{
                  mt: 3,
                  px: 4,
                  borderRadius: "8px",
                  textTransform: "none",
                  background: "#1976d2",
                  color: "#fff",
                }}
                onClick={editScopeId ? handleUpdateScope : handleAddScope}
              >
                {loading ? (
                  <CircularProgress size={20} />
                ) : editScopeId ? (
                  "Update Scope"
                ) : (
                  "Add Scope"
                )}
              </Button>
            </Card>

            {/* ================= TABLE ================= */}
            <Card
              sx={{
                p: 0,
                borderRadius: "16px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                overflow: "hidden",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "linear-gradient(135deg, #1976d2, #42a5f5)", color: "#fff" }}>
                    <th style={{ padding: "15px 10px", textAlign: "left", fontWeight: "bold" }}>Project</th>
                    <th style={{ padding: "15px 10px", textAlign: "left", fontWeight: "bold" }}>Work</th>
                    <th style={{ padding: "15px 10px", textAlign: "left", fontWeight: "bold" }}>Area</th>
                    <th style={{ padding: "15px 10px", textAlign: "left", fontWeight: "bold" }}>Floors</th>
                    <th style={{ padding: "15px 10px", textAlign: "left", fontWeight: "bold" }}>Timeline</th>
                    <th style={{ padding: "15px 10px", textAlign: "left", fontWeight: "bold" }}>Services</th>
                    <th style={{ padding: "15px 10px", textAlign: "left", fontWeight: "bold" }}>Notes</th>
                    <th style={{ padding: "15px 10px", textAlign: "center", fontWeight: "bold" }}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {scopeList.length === 0 ? (
                    <tr>
                      <td
                        colSpan="8"
                        style={{ textAlign: "center", padding: 20 }}
                      >
                        No scope added yet
                      </td>
                    </tr>
                  ) : (
                    scopeList.map((s, i) => (
                      <tr
                        key={i}
                        style={{
                          borderBottom: "1px solid #e2e8f0",
                          background: i % 2 === 0 ? "#ffffff" : "#f8fafc",
                          fontSize: "14px",
                          color: "#334155"
                        }}
                      >
                        <td style={{ padding: "15px 10px", fontWeight: "600" }}>{s.projectType}</td>
                        <td style={{ padding: "15px 10px" }}>{s.workType}</td>
                        <td style={{ padding: "15px 10px" }}>{s.area} sqft</td>
                        <td style={{ padding: "15px 10px" }}>{s.floors}</td>
                        <td style={{ padding: "15px 10px" }}>{s.timeline}</td>

                        <td style={{ padding: "15px 10px", fontSize: "13px", color: "#1e293b", maxWidth: "200px" }}>
                          {Object.keys(s)
                            .filter((k) => s[k] === true)
                            .join(", ")}
                        </td>

                        <td style={{ padding: "15px 10px", fontStyle: "italic", color: "#64748b" }}>{s.notes}</td>

                        {/* ACTIONS */}
                        <td style={{ padding: "15px 10px", textAlign: "center" }}>
                          <Button
                            size="small"
                            variant="outlined"
                            sx={{ mr: 1, color: "#1976d2", borderColor: "#1976d2", textTransform: "none", fontWeight: "bold" }}
                            onClick={() => {
                              setScopeData(s);
                              setEditScopeId(s._id);
                            }}
                          >
                            Edit
                          </Button>

                          <Button
                            size="small"
                            variant="contained"
                            color="error"
                            sx={{ color: "white", textTransform: "none", fontWeight: "bold" }}
                            onClick={() => handleDeleteScope(s._id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </Card>
          </MDBox>
        )}
      </MDBox>

      {/* LIGHTBOX */}
{/* LIGHTBOX */}
{selectedImage && (
  <MDBox
    sx={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.85)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
    }}
  >
    {/* CLOSE BUTTON */}
    <Button
      sx={{ position: "absolute", top: 20, right: 20, color: "#fff" }}
      onClick={() => setSelectedImage(null)}
    >
      Close
    </Button>

    {/* PREV BUTTON */}
    <Button
      onClick={prev}
      disabled={!images.length}
      sx={{ color: "#fff", fontSize: "20px" }}
    >
      ◀
    </Button>

    {/* IMAGE */}
    <img
      src={selectedImage}
      alt="preview"
      style={{
        maxHeight: "80%",
        maxWidth: "80%",
        borderRadius: "10px",
      }}
    />

    {/* NEXT BUTTON */}
    <Button
      onClick={next}
      disabled={!images.length}
      sx={{ color: "#fff", fontSize: "20px" }}
    >
      ▶
    </Button>
  </MDBox>
)}

{/* UPLOAD MODAL */}
{openUpload && (
  <MDBox
    sx={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.65)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
      backdropFilter: "blur(6px)",
    }}
  >
    <Card
      sx={{
        p: 3,
        width: 380,
        borderRadius: "18px",
        boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
        textAlign: "center",
        background: "linear-gradient(145deg, #ffffff, #f8fafc)",
      }}
    >
      {/* TITLE */}
      <MDTypography variant="h6" fontWeight="bold" mb={1}>
        Upload Drawings
      </MDTypography>

      <MDTypography variant="caption" sx={{ opacity: 0.6 }}>
        Select images to upload for this project
      </MDTypography>

      {/* FILE INPUT AREA */}
      <MDBox
        sx={{
          mt: 3,
          p: 2,
          border: "2px dashed #1976d2",
          borderRadius: "14px",
          background: "#f5f9ff",
          cursor: "pointer",
          transition: "0.2s",
          "&:hover": {
            background: "#eaf3ff",
          },
        }}
      >
        <input
          type="file"
          multiple
          onChange={(e) => setFiles(e.target.files)}
          style={{
            width: "100%",
            cursor: "pointer",
          }}
        />

        <MDTypography
          variant="caption"
          sx={{ display: "block", mt: 1, opacity: 0.7 }}
        >
          Drag & drop or select files
        </MDTypography>
      </MDBox>

      {/* FILE COUNT */}
      {files?.length > 0 && (
        <MDBox mt={2}>
          <MDTypography variant="caption" sx={{ color: "#1976d2" }}>
            {files.length} file(s) selected
          </MDTypography>
        </MDBox>
      )}

      {/* UPLOAD BUTTON */}
      <Button
        onClick={handleUpload}
        fullWidth
        sx={{
          mt: 3,
          py: 1.2,
          borderRadius: "10px",
          textTransform: "none",
          fontWeight: 600,
          color: "#fff",
          background: "linear-gradient(135deg,#1976d2,#42a5f5)",
          boxShadow: "0 8px 20px rgba(25,118,210,0.3)",
          "&:hover": {
            background: "linear-gradient(135deg,#1565c0,#1e88e5)",
          },
        }}
      >
        {loading ? "Uploading..." : "Upload Files"}
      </Button>

      {/* CANCEL BUTTON */}
      <Button
        onClick={() => {
          setOpenUpload(false);
          setFiles([]);
        }}
        fullWidth
        sx={{
          mt: 1.5,
          textTransform: "none",
          color: "#666",
          fontWeight: 500,
        }}
      >
        Cancel
      </Button>
    </Card>
  </MDBox>
)}
      <Footer />
    </DashboardLayout>
  );
}

export default ProjectDetails;
