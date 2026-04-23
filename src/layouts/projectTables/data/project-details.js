import { useLocation, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";


import {
  Tabs,
  Tab,
  Grid,
  Button,
  Card,
  TextField,
  CircularProgress,
  IconButton,
  Divider,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
const Base_API = "https://fullstack-project-1-n510.onrender.com/api";

function ProjectDetails() {
  const { state } = useLocation();
  const { id } = useParams();

  const [project, setProject] = useState(state || null);

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("tab");
    if (t) setTab(parseInt(t));

    if (!project && id) {
      fetchProjectById(id);
    }
  }, [id]);

  const fetchProjectById = async (projectId) => {
    try {
      const res = await fetch(`${Base_API}/projects/${projectId}`);
      const data = await res.json();
      setProject(data);
    } catch (err) {
      console.error("Failed to fetch project", err);
    }
  };

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
    let phone = project?.clientPhone || project?.phone;

    if (!phone) {
      alert("Client phone number is missing in project data! Please update the client record.");
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
  if (!project) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress color="info" />
        </MDBox>
      </DashboardLayout>
    );
  }

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
          <Tab label="Accounts (Financials)" />
          <Tab label="Scope of Work" />
        </Tabs>


        {/* OVERVIEW */}
        {tab === 0 && (
          <MDBox mt={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card sx={{ p: 4, borderRadius: "20px", height: "100%", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
                  <MDBox display="flex" alignItems="center" mb={3} gap={1}>
                    <MDTypography variant="h5" fontWeight="bold" color="dark">Project Insight</MDTypography>
                  </MDBox>
                  <MDTypography
                    variant="body1"
                    sx={{
                      lineHeight: 1.8,
                      color: "#475569",
                      fontSize: "1rem",
                      fontWeight: 400
                    }}
                  >
                    {project.description || "No detailed description available for this project. Please add one in the project settings."}
                  </MDTypography>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card sx={{ p: 4, borderRadius: "20px", background: "linear-gradient(135deg, #1e293b, #334155)", color: "#fff" }}>
                  <MDTypography variant="h6" fontWeight="bold" color="white" mb={3}>Project Pulse</MDTypography>

                  <MDBox display="flex" flexDirection="column" gap={2.5}>
                    <Box>
                      <MDTypography variant="caption" color="white" sx={{ opacity: 0.6, fontWeight: "bold", textTransform: "uppercase" }}>Registration Date</MDTypography>
                      <MDTypography variant="h6" color="white" fontWeight="bold">
                        {new Date(project.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'long', year: 'numeric' })}
                      </MDTypography>
                    </Box>

                    <Box>
                      <MDTypography variant="caption" color="white" sx={{ opacity: 0.6, fontWeight: "bold", textTransform: "uppercase" }}>Current Status</MDTypography>
                      <Chip
                        label={project.status || "Active"}
                        size="small"
                        sx={{ bgcolor: "#34d399", color: "#064e3b", fontWeight: "900", mt: 0.5 }}
                      />
                    </Box>

                    <Box>
                      <MDTypography variant="caption" color="white" sx={{ opacity: 0.6, fontWeight: "bold", textTransform: "uppercase" }}>Project ID</MDTypography>
                      <MDTypography variant="button" display="block" color="white" fontWeight="bold">
                        #{project.projectId || project._id?.slice(-8).toUpperCase()}
                      </MDTypography>
                    </Box>
                  </MDBox>
                </Card>
              </Grid>
            </Grid>
          </MDBox>
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
                          color: "#fff"
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
                        <tr style={{ background: "linear-gradient(90deg, #1e293b, #334155)", color: "#fff" }}>
                          <th style={{ padding: "15px", textAlign: "center", fontWeight: "bold", fontSize: "13px", textTransform: "uppercase" }}>Transaction Date</th>
                          <th style={{ padding: "15px", textAlign: "center", fontWeight: "bold", fontSize: "13px", textTransform: "uppercase" }}>Amount Received</th>
                          <th style={{ padding: "15px", textAlign: "center", fontWeight: "bold", fontSize: "13px", textTransform: "uppercase" }}>Description/Note</th>
                          <th style={{ padding: "15px", textAlign: "center", fontWeight: "bold", fontSize: "13px", textTransform: "uppercase" }}>Actions</th>
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
                                  sx={{ color: "#000", textTransform: "none", borderRadius: "20px", fontWeight: "bold", background: "#25D366", "&:hover": { background: "#128C7E" } }}
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
                p: 4,
                borderRadius: "18px",
                boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
                border: "1px solid #eef2f6",
                background: "#fff",
              }}
            >
              <Box display="flex" alignItems="center" mb={3} gap={1}>
                <MDBox
                  sx={{
                    width: 40, height: 40, borderRadius: "10px",
                    background: "linear-gradient(135deg, #4f46e5, #818cf8)",
                    display: "flex", alignItems: "center", justifyContent: "center", color: "#fff"
                  }}
                >
                  <MDTypography variant="h5" color="inherit">📋</MDTypography>
                </MDBox>
                <MDTypography variant="h5" fontWeight="bold" sx={{ color: "#1e293b" }}>
                  {editScopeId ? "Update Project Scope" : "Define New Scope"}
                </MDTypography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="Project Category"
                    placeholder="e.g. Residential, Villa"
                    fullWidth
                    variant="standard"
                    value={scopeData.projectType}
                    onChange={(e) => setScopeData({ ...scopeData, projectType: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="Work Nature"
                    placeholder="e.g. Interior, Architecture"
                    fullWidth
                    variant="standard"
                    value={scopeData.workType}
                    onChange={(e) => setScopeData({ ...scopeData, workType: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField
                    label="Total Area"
                    placeholder="sqft"
                    type="number"
                    fullWidth
                    variant="standard"
                    value={scopeData.area}
                    onChange={(e) => setScopeData({ ...scopeData, area: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField
                    label="Floors"
                    type="number"
                    fullWidth
                    variant="standard"
                    value={scopeData.floors}
                    onChange={(e) => setScopeData({ ...scopeData, floors: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField
                    label="Project Timeline"
                    placeholder="e.g. 4 Months"
                    fullWidth
                    variant="standard"
                    value={scopeData.timeline}
                    onChange={(e) => setScopeData({ ...scopeData, timeline: e.target.value })}
                  />
                </Grid>
              </Grid>

              {/* ================= SERVICES ================= */}
              <MDBox mt={5}>
                <MDTypography variant="button" fontWeight="bold" color="text" mb={2} display="block" sx={{ textTransform: "uppercase", letterSpacing: 1 }}>
                  Scope Deliverables & Inclusions
                </MDTypography>

                <Grid container spacing={2}>
                  {[
                    { id: "conceptDesign", label: "Concept Design" },
                    { id: "drawings2D", label: "2D Drawings" },
                    { id: "elevation3D", label: "3D Elevation" },
                    { id: "workingDrawings", label: "Working Drawings" },
                    { id: "interiorLayout", label: "Interior Layout" },
                    { id: "civil", label: "Civil Construction" },
                    { id: "electrical", label: "Electrical" },
                    { id: "plumbing", label: "Plumbing" },
                    { id: "interiorExecution", label: "Execution" },
                    { id: "supervision", label: "Site Supervision" },
                    { id: "materialIncluded", label: "Material Included" },
                  ].map((item) => (
                    <Grid item xs={12} sm={4} md={3} key={item.id}>
                      <MDBox
                        onClick={() => setScopeData({ ...scopeData, [item.id]: !scopeData[item.id] })}
                        sx={{
                          p: 1.5,
                          borderRadius: "10px",
                          border: "1px solid",
                          borderColor: scopeData[item.id] ? "#4f46e5" : "#e2e8f0",
                          background: scopeData[item.id] ? "#f5f3ff" : "transparent",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          transition: "0.2s",
                          "&:hover": { borderColor: "#4f46e5" }
                        }}
                      >
                        <MDBox
                          sx={{
                            width: 20, height: 20, borderRadius: "4px",
                            border: "2px solid",
                            borderColor: scopeData[item.id] ? "#4f46e5" : "#cbd5e1",
                            background: scopeData[item.id] ? "#4f46e5" : "transparent",
                            display: "flex", alignItems: "center", justifyContent: "center"
                          }}
                        >
                          {scopeData[item.id] && <span style={{ color: "#fff", fontSize: "12px" }}>✓</span>}
                        </MDBox>
                        <MDTypography variant="caption" fontWeight={scopeData[item.id] ? "bold" : "medium"} color={scopeData[item.id] ? "info" : "text"}>
                          {item.label}
                        </MDTypography>
                      </MDBox>
                    </Grid>
                  ))}
                </Grid>
              </MDBox>

              {/* ================= NOTES ================= */}
              <Grid container spacing={3} mt={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Specific Project Deliverable Notes"
                    multiline
                    rows={2}
                    placeholder="Describe specific requirements, exclusions, or site conditions..."
                    fullWidth
                    value={scopeData.notes}
                    onChange={(e) => setScopeData({ ...scopeData, notes: e.target.value })}
                  />
                </Grid>
              </Grid>

              <MDBox display="flex" justifyContent="flex-end" mt={4} gap={2}>
                {editScopeId && (
                  <Button
                    variant="outlined"
                    color="#fff"
                    sx={{ borderRadius: "10px", textTransform: "none", px: 4, bgcolor: "red" }}
                    onClick={() => { setEditScopeId(null); resetScopeForm(); }}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  variant="contained"
                  sx={{
                    px: 6,
                    py: 1.5,
                    borderRadius: "10px",
                    textTransform: "none",
                    fontWeight: "bold",
                    background: "linear-gradient(135deg, #4f46e5, #6366f1)",
                    color: "#fff",
                    boxShadow: "0 10px 25px rgba(79, 70, 229, 0.3)",
                    "&:hover": { background: "#4338ca" }
                  }}
                  onClick={editScopeId ? handleUpdateScope : handleAddScope}
                >
                  {loading ? <CircularProgress size={20} color="inherit" /> : (editScopeId ? "Update Specification" : "Finalize Scope")}
                </Button>
              </MDBox>
            </Card>

            {/* ================= DISPLAY LIST ================= */}
            <MDBox mt={6}>
              <Box display="flex" alignItems="center" mb={3} gap={1}>
                <MDTypography variant="h5" fontWeight="bold" color="dark">Scope Summary</MDTypography>
                <Chip label={scopeList.length} size="small" sx={{ bgcolor: "#eff6ff", color: "#2563eb", fontWeight: "bold" }} />
              </Box>

              {scopeList.length === 0 ? (
                <MDBox sx={{ p: 8, textAlign: "center", bgcolor: "#f8fafc", borderRadius: "20px", border: "2px dashed #e2e8f0" }}>
                  <MDTypography variant="h6" color="textSecondary">No active scope definitions found for this project.</MDTypography>
                  <MDTypography variant="caption" color="text">Use the form above to define the architectural or interior deliverables.</MDTypography>
                </MDBox>
              ) : (
                <Grid container spacing={4}>
                  {scopeList.map((s, i) => (
                    <Grid item xs={12} key={i}>
                      <Card sx={{
                        p: 0,
                        borderRadius: "20px",
                        boxShadow: "0 15px 35px rgba(0,0,0,0.05)",
                        border: "1px solid #f1f5f9",
                        background: "#fff",
                        overflow: "hidden",
                        transition: "0.3s",
                        "&:hover": { transform: "translateY(-5px)", boxShadow: "0 20px 45px rgba(0,0,0,0.1)" }
                      }}>
                        <Grid container>
                          {/* Left Panel: Primary Info */}
                          <Grid item xs={12} md={4} sx={{
                            p: 4,
                            background: "linear-gradient(135deg, #f8fafc, #f1f5f9)",
                            borderRight: "1px solid #e2e8f0",
                            display: "flex", flexDirection: "column", justifyContent: "space-between"
                          }}>
                            <MDBox>
                              <Chip
                                label={s.workType}
                                size="small"
                                sx={{ bgcolor: "#4f46e5", color: "#fff", fontWeight: "bold", mb: 2, borderRadius: "6px" }}
                              />
                              <MDTypography variant="h4" fontWeight="bold" sx={{ color: "#1e293b", mb: 1 }}>
                                {s.projectType}
                              </MDTypography>
                              <MDBox display="flex" gap={2}>
                                <MDTypography variant="caption" sx={{ color: "#64748b", fontWeight: "bold" }}>📐 {s.area} SQFT</MDTypography>
                                <MDTypography variant="caption" sx={{ color: "#64748b", fontWeight: "bold" }}>🏢 {s.floors} FLOORS</MDTypography>
                              </MDBox>
                            </MDBox>

                            <MDBox mt={4}>
                              <MDTypography variant="caption" fontWeight="bold" color="text" sx={{ display: "block", mb: 1, textTransform: "uppercase" }}>Project Metadata</MDTypography>
                              <MDBox sx={{ p: 2, bgcolor: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 10px rgba(0,0,0,0.02)" }}>
                                <MDTypography variant="caption" color="textSecondary" sx={{ fontWeight: "bold" }}>Est. Timeline: {s.timeline}</MDTypography>
                              </MDBox>
                            </MDBox>
                          </Grid>

                          {/* Right Panel: Inclusions & Actions */}
                          <Grid item xs={12} md={8} sx={{ p: 4, position: "relative" }}>
                            <MDBox sx={{ position: "absolute", top: 15, right: 15, display: "flex", gap: 1 }}>
                              <IconButton sx={{ bgcolor: "#f1f5f9", color: "#64748b" }} onClick={() => { setScopeData(s); setEditScopeId(s._id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                              <IconButton sx={{ bgcolor: "#fef2f2", color: "#ef4444" }} onClick={() => handleDeleteScope(s._id)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </MDBox>

                            <MDTypography variant="button" fontWeight="bold" color="dark" sx={{ display: "block", mb: 3, textTransform: "uppercase" }}>Defined Deliverables</MDTypography>

                            <Grid container spacing={2}>
                              {[
                                { label: "Concept Design", val: s.conceptDesign },
                                { label: "2D Drawings", val: s.drawings2D },
                                { label: "3D Elevation", val: s.elevation3D },
                                { label: "Working Drawings", val: s.workingDrawings },
                                { label: "Interior Layout", val: s.interiorLayout },
                                { label: "Civil Works", val: s.civil },
                                { label: "Electrical", val: s.electrical },
                                { label: "Plumbing", val: s.plumbing },
                                { label: "Supervision", val: s.supervision }
                              ].filter(item => item.val).map((item, idx) => (
                                <Grid item xs={6} sm={4} key={idx}>
                                  <MDBox sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <MDBox sx={{
                                      width: 8, height: 8, borderRadius: "50%",
                                      bgcolor: "#4f46e5"
                                    }} />
                                    <MDTypography variant="caption" sx={{
                                      color: "#1e293b",
                                      fontWeight: "bold",
                                    }}>
                                      {item.label}
                                    </MDTypography>
                                  </MDBox>
                                </Grid>
                              ))}
                            </Grid>

                            {s.notes && (
                              <MDBox mt={4} p={2} sx={{ bgcolor: "#fff7ed", borderRadius: "10px", borderLeft: "4px solid #f97316" }}>
                                <MDTypography variant="caption" sx={{ color: "#9a3412", fontWeight: "bold", display: "block", mb: 0.5 }}>Architect's Notes:</MDTypography>
                                <MDTypography variant="body2" sx={{ color: "#c2410c", fontSize: "13px", lineHeight: 1.6 }}>{s.notes}</MDTypography>
                              </MDBox>
                            )}
                          </Grid>
                        </Grid>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </MDBox>
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
