import { useLocation, useParams } from "react-router-dom";
import { useState, useEffect, Fragment, useCallback } from "react";

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

  const fetchProjectById = useCallback(async (projectId) => {
    try {
      const res = await fetch(`${Base_API}/projects/${projectId}`);
      const data = await res.json();
      setProject({
        ...data,
        totalAmount: Number(data.totalAmount || 0),
      });
    } catch (err) {
      console.error("Failed to fetch project", err);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("tab");
    if (t) setTab(parseInt(t));

    if (!project && id) {
      fetchProjectById(id);
    }
  }, [id, project, fetchProjectById]);

  const [drawingType, setDrawingType] = useState(null);
  const [openUpload, setOpenUpload] = useState(false);
  const [uploadType, setUploadType] = useState(null);
  const [files, setFiles] = useState([]);
  const [drawings, setDrawings] = useState([]);
  const [loading, setLoading] = useState(false);


  const [paymentData, setPaymentData] = useState({
    amount: "",
    date: "",
    note: "",
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [imageIndex, setImageIndex] = useState(0);

  // ================= FETCH =================
  const fetchProject = useCallback(async () => {
    if (!state?._id) return;

    const res = await fetch(`${Base_API}/projects/${state._id}`);
    const data = await res.json();

    setProject({
      ...data,
      totalAmount: Number(data.totalAmount || 0),
    });
  }, [state?._id]);

  const fetchScope = useCallback(async () => {
    if (!project?._id) return;

    const res = await fetch(`${Base_API}/projects/${project._id}/scope`);
    const data = await res.json();
    setScopeList(data || []);
  }, [project?._id]);
  // ================= UPLOAD =================
  const fetchDrawings = useCallback(async () => {
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
  }, [project?._id]);

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
          images: base64Images, // works for both images and PDFs
        }),
      });

      await fetchDrawings();
      setOpenUpload(false);
      setFiles([]);
      alert(`✓ ${files.length} file(s) uploaded successfully!`);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload files. They might be too large. Try fewer files.");
    } finally {
      setLoading(false);
    }
  };
  // ================= USE EFFECTS =================



  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  useEffect(() => {
    if (project?._id) {
      fetchScope();
    }
  }, [project?._id, fetchScope]);

  useEffect(() => {
    if (project?._id) {
      fetchDrawings();
    }
  }, [project?._id, fetchDrawings]);

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

    const text = `Hello ${project?.clientName || "Client"},\n\nWe have successfully received your payment of ₹${amount} on ${formattedDate} for the project "${project?.projectName}".\nThank you for your prompt payment!\n\n- ${project?.company}`;

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
            p: 4,
            mb: 3,
            borderRadius: "20px",
            background: "#1e293b",
            color: "#fff",
            boxShadow: "0 15px 40px rgba(30,41,59,0.2)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box sx={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
        
          <MDBox display="flex" justifyContent="space-between" alignItems="center">
            <MDBox sx={{ position: "relative", zIndex: 1 }}>
              <MDTypography variant="h4" fontWeight="bold" sx={{ color: "#fff", mb: 0.5 }}>
                {project.projectName}
              </MDTypography>
              <MDTypography sx={{ color: "rgba(255,255,255,0.85)", fontSize: "0.95rem" }}>
                CLIENT: <b style={{ color: "#10b981" }}>{project.clientName?.toUpperCase()}</b> 
                <span style={{ marginLeft: "16px", opacity: 0.6 }}>PROJECT ID: <b>{project.projectId || project._id?.slice(-8).toUpperCase()}</b></span>
              </MDTypography>
            </MDBox>
            
            {/* VISIT COUNTER DISPLAY */}
            <MDBox 
              sx={{ 
                position: "relative", zIndex: 1, 
                bgcolor: "rgba(255,255,255,0.2)", 
                p: 2, borderRadius: "15px", 
                textAlign: "center",
                minWidth: "120px",
                border: "1px solid rgba(255,255,255,0.3)"
              }}
            >
              <MDTypography variant="h4" fontWeight="bold" color="white">
                {project.visitCounter ?? 5}
              </MDTypography>
              <MDTypography variant="xxs" fontWeight="bold" color="white" sx={{ textTransform: "uppercase" }}>
                Visits Left
              </MDTypography>
            </MDBox>
          </MDBox>
        </Card>

        {/* TABS */}
        <Tabs
          value={tab}
          onChange={(e, v) => setTab(v)}
          sx={{
            mb: 1,
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 700,
              color: "#64748b",
              borderRadius: "10px",
              mx: 0.5,
              minHeight: "44px",
              px: 3,
              transition: "all 0.2s",
            },
            "& .Mui-selected": {
              background: "#2563eb !important",
              color: "#fff !important",
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)",
            },
            "& .MuiTabs-indicator": { display: "none" },
          }}
        >
          <Tab label="📊 Overview" />
          <Tab label="🗂 Drawings" />
          <Tab label="💰 Accounts" />
          <Tab label="📋 Scope of Work" />
        </Tabs>


        {/* OVERVIEW */}
        {tab === 0 && (() => {
          const allImages = [
            ...(drawings.find(d => d.type === "civil")?.images || []),
            ...(drawings.find(d => d.type === "interior")?.images || []),
          ];
          return (
            <MDBox mt={3}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Card sx={{ p: 4, borderRadius: "20px", height: "100%", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
                    <MDBox display="flex" alignItems="center" mb={3} gap={1}>
                      <MDTypography variant="h5" fontWeight="bold" color="dark">Project Insight</MDTypography>
                    </MDBox>
                    <MDTypography variant="body1" sx={{ lineHeight: 1.8, color: "#475569", fontSize: "1rem", fontWeight: 400 }}>
                      {project.description || "No detailed description available for this project. Please add one in the project settings."}
                    </MDTypography>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card sx={{ p: 3, borderRadius: "20px", background: "linear-gradient(135deg, #1e293b, #334155)", color: "#fff", height: "100%" }}>
                    <MDTypography variant="h6" fontWeight="bold" color="white" mb={2}>Project Pulse</MDTypography>
                    <MDBox display="flex" flexDirection="column" gap={2}>
                      <Box display="flex" justifyContent="space-between">
                        <MDTypography variant="caption" color="white" sx={{ opacity: 0.6 }}>STATUS</MDTypography>
                        <Chip label={project.status || "Active"} size="small" sx={{ bgcolor: "#34d399", color: "#064e3b", fontWeight: "bold" }} />
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <MDTypography variant="caption" color="white" sx={{ opacity: 0.6 }}>PROJECT ID</MDTypography>
                        <MDTypography variant="button" color="white" fontWeight="bold">#{project.projectId || project._id?.slice(-8).toUpperCase()}</MDTypography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <MDTypography variant="caption" color="white" sx={{ opacity: 0.6 }}>TOTAL BUDGET</MDTypography>
                        <MDTypography variant="h6" color="white" fontWeight="bold" sx={{ color: "#34d399" }}>₹{Number(project.totalAmount || 0).toLocaleString("en-IN")}</MDTypography>
                      </Box>
                      
                      {/* PAYMENT PROGRESS */}
                      <Box mt={1}>
                        <MDTypography variant="caption" color="white" sx={{ opacity: 0.6, fontWeight: "bold" }}>PAYMENT STATUS</MDTypography>
                        <MDBox display="flex" alignItems="center" gap={1} mt={0.5}>
                          <MDBox sx={{ flex: 1, height: 6, bgcolor: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden" }}>
                            <MDBox sx={{ 
                              width: `${Math.min(100, (Number(project.payments?.reduce((s,p) => s + (Number(p.amount || 0)), 0) || 0) / Number(project.totalAmount || 1)) * 100)}%`, 
                              height: "100%", 
                              bgcolor: "#34d399" 
                            }} />
                          </MDBox>
                          <MDTypography variant="caption" color="white" fontWeight="bold">
                            {Math.round((Number(project.payments?.reduce((s,p) => s + (Number(p.amount || 0)), 0) || 0) / Number(project.totalAmount || 1)) * 100)}%
                          </MDTypography>
                        </MDBox>
                      </Box>
                      <Divider sx={{ bgcolor: "rgba(255,255,255,0.1)", my: 1 }} />
                      
                      {/* VISIT COUNTER INTERACTION */}
                      <MDBox>
                        <MDTypography variant="caption" color="white" sx={{ opacity: 0.6, fontWeight: "bold" }}>RECORD VISIT</MDTypography>
                        <MDBox display="flex" gap={1} mt={1}>
                          <TextField 
                            size="small" 
                            placeholder="Visit note..." 
                            variant="outlined"
                            value={paymentData.visitNote || ""}
                            onChange={(e) => setPaymentData({ ...paymentData, visitNote: e.target.value })}
                            sx={{ 
                              bgcolor: "rgba(255,255,255,0.1)", 
                              borderRadius: "8px",
                              "& input": { color: "#fff", fontSize: "12px" },
                              "& fieldset": { border: "none" }
                            }}
                          />
                          <Button 
                            variant="contained" 
                            size="small"
                            onClick={async () => {
                              if (!paymentData.visitNote) return alert("Please add a note for the visit");
                              const res = await fetch(`${Base_API}/projects/${project._id}/visit`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ note: paymentData.visitNote })
                              });
                              if (res.ok) {
                                const updated = await res.json();
                                setProject({ ...project, visitCounter: updated.visitCounter, visitNotes: updated.visitNotes });
                                setPaymentData({ ...paymentData, visitNote: "" });
                                alert("Visit recorded!");
                              }
                            }}
                            sx={{ bgcolor: "#2563eb", color: "#fff", minWidth: "40px", borderRadius: "8px" }}
                          >
                            +
                          </Button>
                        </MDBox>
                      </MDBox>
                    </MDBox>
                  </Card>
                </Grid>

                {/* SCOPE OF WORK SUMMARY */}
                {scopeList.length > 0 && (
                  <Grid item xs={12}>
                    <Card sx={{ p: 4, borderRadius: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
                      <MDBox display="flex" alignItems="center" mb={2}>
                        <MDTypography variant="h5" fontWeight="bold">📋 Scope of Work Summary</MDTypography>
                      </MDBox>
                      <Grid container spacing={2}>
                        {scopeList.map((s, idx) => (
                          <Grid item xs={12} md={6} key={idx}>
                            <MDBox sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                              <MDTypography variant="button" fontWeight="bold" color="dark">{s.projectType} ({s.workType})</MDTypography>
                              <MDTypography variant="caption" display="block" color="text">Area: {s.area} sqft | Timeline: {s.timeline}</MDTypography>
                              <MDBox display="flex" flexWrap="wrap" gap={0.5} mt={1}>
                                {s.conceptDesign && <Chip label="Concept" size="small" variant="outlined" sx={{ fontSize: "10px" }} />}
                                {s.drawings2D && <Chip label="2D" size="small" variant="outlined" sx={{ fontSize: "10px" }} />}
                                {s.elevation3D && <Chip label="3D" size="small" variant="outlined" sx={{ fontSize: "10px" }} />}
                                {s.civil && <Chip label="Civil" size="small" variant="outlined" sx={{ fontSize: "10px" }} />}
                              </MDBox>
                            </MDBox>
                          </Grid>
                        ))}
                      </Grid>
                    </Card>
                  </Grid>
                )}

                {/* VISIT HISTORY TABLE */}
                <Grid item xs={12}>
                  <Card sx={{ p: 4, borderRadius: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
                    <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                      <MDTypography variant="h5" fontWeight="bold">🚗 Site Visit Log</MDTypography>
                      <MDBox sx={{ px: 2, py: 0.5, borderRadius: 10, bgcolor: "#eff6ff", border: "1px solid #dbeafe" }}>
                        <MDTypography variant="caption" fontWeight="bold" color="info">
                          {project.visitCounter ?? 5} VISITS REMAINING
                        </MDTypography>
                      </MDBox>
                    </MDBox>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <th style={{ textAlign: "left", padding: "12px", color: "#64748b", fontSize: "12px", textTransform: "uppercase" }}>Visit Date</th>
                          <th style={{ textAlign: "left", padding: "12px", color: "#64748b", fontSize: "12px", textTransform: "uppercase" }}>Observation/Note</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(project.visitNotes || []).map((v, i) => (
                          <tr key={i} style={{ borderBottom: "1px solid #f8fafc" }}>
                            <td style={{ padding: "12px" }}>
                              <MDTypography variant="button" fontWeight="bold">
                                {new Date(v.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                              </MDTypography>
                              <MDTypography variant="caption" display="block" color="text">
                                {new Date(v.date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                              </MDTypography>
                            </td>
                            <td style={{ padding: "12px" }}>
                              <MDTypography variant="caption" fontWeight="medium" color="text">{v.note}</MDTypography>
                            </td>
                          </tr>
                        ))}
                        {(project.visitNotes || []).length === 0 && (
                          <tr>
                            <td colSpan="2" style={{ padding: "30px", textAlign: "center" }}>
                              <MDTypography variant="caption" color="text">No visits recorded yet.</MDTypography>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </Card>
                </Grid>

                {/* ===== IMAGE SLIDER ===== */}
                {allImages.length > 0 && (
                  <Grid item xs={12}>
                    <Card sx={{ borderRadius: "20px", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}>
                      <Box sx={{
                        p: 3, background: "#2563eb",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                      }}>
                        <MDTypography variant="h5" fontWeight="900" sx={{ color: "#fff" }}>
                          🖼️ Project Drawings Gallery
                        </MDTypography>
                        <Box sx={{ bgcolor: "rgba(255,255,255,0.2)", px: 2, py: 0.5, borderRadius: 10 }}>
                          <MDTypography variant="caption" sx={{ color: "#fff", fontWeight: "bold" }}>
                            {drawings.find(d => d.type === "civil")?.images?.length || 0} Civil · {drawings.find(d => d.type === "interior")?.images?.length || 0} Interior
                          </MDTypography>
                        </Box>
                      </Box>
                      <Box sx={{
                        display: "flex",
                        overflowX: "auto",
                        gap: 2,
                        p: 3,
                        scrollbarWidth: "thin",
                        scrollbarColor: "#f97316 #f1f5f9",
                        "&::-webkit-scrollbar": { height: 6 },
                        "&::-webkit-scrollbar-track": { bgcolor: "#f1f5f9", borderRadius: 3 },
                        "&::-webkit-scrollbar-thumb": { bgcolor: "#f97316", borderRadius: 3 },
                      }}>
                        {allImages.map((img, idx) => {
                          const isPdf = typeof img === "string" && img.startsWith("data:application/pdf");
                          const isCivil = idx < (drawings.find(d => d.type === "civil")?.images?.length || 0);
                          return (
                            <Box key={idx} sx={{
                              minWidth: 220, maxWidth: 220, flexShrink: 0,
                              borderRadius: "14px", overflow: "hidden",
                              boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
                              transition: "all 0.3s",
                              "&:hover": { transform: "translateY(-6px)", boxShadow: "0 16px 35px rgba(0,0,0,0.15)" },
                              cursor: "pointer",
                            }}
                              onClick={() => { if (!isPdf) openImage(img, idx); else window.open(img, "_blank"); }}>
                              {isPdf ? (
                                <Box sx={{
                                  height: 160, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                                  background: "linear-gradient(135deg, #fff7ed, #fed7aa)",
                                }}>
                                  <Box sx={{ fontSize: 48 }}>📄</Box>
                                  <MDTypography variant="caption" fontWeight="bold" sx={{ color: "#475569", mt: 1 }}>PDF</MDTypography>
                                </Box>
                              ) : (
                                <img src={img} alt={`img-${idx}`}
                                  style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }} />
                              )}
                              <Box sx={{ p: 1.5, background: isCivil ? "#fff7ed" : "#eff6ff", display: "flex", justifyContent: "center" }}>
                                <Box sx={{
                                  px: 2, py: 0.3, borderRadius: 10,
                                  background: isCivil ? "#1e293b" : "#2563eb",
                                }}>
                                  <MDTypography variant="caption" fontWeight="bold" sx={{ color: "#fff", fontSize: "10px" }}>
                                    {isCivil ? "🏗️ CIVIL" : "🎨 INTERIOR"}
                                  </MDTypography>
                                </Box>
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>
                    </Card>
                  </Grid>
                )}
              </Grid>
            </MDBox>
          );
        })()}

        {/* DRAWINGS */}
        {tab === 1 && (
          <MDBox mt={3}>
            {!drawingType ? (
              <Grid container spacing={4}>
                {[
                  { type: "civil", label: "Civil Drawings", desc: "Structural plans, layouts & blueprints", icon: "🏗️", grad: "#f97316", pdfSupport: true },
                  { type: "interior", label: "Interior Drawings", desc: "3D elevations, interior schematics", icon: "🎨", grad: "#2563eb", pdfSupport: false },
                ].map(({ type, label, desc, icon, grad, pdfSupport }) => (
                  <Grid item xs={12} md={6} key={type}>
                    <Card sx={{
                      borderRadius: "20px",
                      overflow: "hidden",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                      transition: "all 0.3s",
                      "&:hover": { transform: "translateY(-8px)", boxShadow: "0 20px 50px rgba(0,0,0,0.15)" },
                    }}>
                      {/* Colored top */}
                      <Box sx={{ background: grad, p: 4, textAlign: "center" }}>
                        <Box sx={{ fontSize: 56, mb: 1 }}>{icon}</Box>
                        <MDTypography variant="h4" fontWeight="900" sx={{ color: "#fff", textTransform: "capitalize", mb: 0.5 }}>
                          {label}
                        </MDTypography>
                        <MDTypography variant="caption" sx={{ color: "rgba(255,255,255,0.85)", display: "block" }}>
                          {desc}
                        </MDTypography>
                      </Box>
                      {/* Buttons */}
                      <Box sx={{ p: 3, display: "flex", gap: 2, bgcolor: "#fff" }}>
                        <Button
                          fullWidth variant="contained"
                          onClick={() => { setUploadType(type); setOpenUpload(true); }}
                          sx={{
                            background: grad, color: "#fff",
                            py: 1.5, borderRadius: "12px", fontWeight: "bold", textTransform: "none",
                            boxShadow: "none",
                            "&:hover": { background: grad, opacity: 0.9, transform: "translateY(-2px)" },
                            transition: "all 0.25s",
                          }}
                        >
                          ⬆ Upload {pdfSupport ? "Images / PDF" : "Images"}
                        </Button>
                        <Button
                          fullWidth variant="outlined"
                          onClick={() => setDrawingType(type)}
                          sx={{
                            py: 1.5, borderRadius: "12px", fontWeight: "bold", textTransform: "none",
                            border: "2px solid",
                            borderColor: type === "civil" ? "#f97316" : "#2563eb",
                            color: type === "civil" ? "#f97316" : "#2563eb",
                            "&:hover": {
                              background: type === "civil" ? "#fff7ed" : "#eff6ff",
                              transform: "translateY(-2px)",
                            },
                            transition: "all 0.25s",
                          }}
                        >
                          🖼 View Gallery
                        </Button>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <MDBox>
                <Button
                  onClick={() => setDrawingType(null)}
                  sx={{
                    mb: 3, background: "#f97316",
                    color: "#fff", px: 3, py: 1.2, borderRadius: "10px", fontWeight: "bold",
                    textTransform: "none",
                    "&:hover": { opacity: 0.9 },
                  }}
                >
                  ⬅ Back to Folders
                </Button>

                {/* Upload more button in gallery */}
                <Button
                  onClick={() => { setUploadType(drawingType); setOpenUpload(true); }}
                  sx={{
                    mb: 3, ml: 2, background: "#16a34a",
                    color: "#fff", px: 3, py: 1.2, borderRadius: "10px", fontWeight: "bold",
                    textTransform: "none",
                    "&:hover": { opacity: 0.9 },
                  }}
                >
                  ⬆ Upload More
                </Button>

                <Grid container spacing={3}>
                  {images.map((img, i) => {
                    const isPdf = typeof img === "string" && (
                      img.startsWith("data:application/pdf") ||
                      img.toLowerCase().includes(".pdf")
                    );
                    return (
                      <Grid item xs={12} sm={6} md={3} key={i}>
                        <Card sx={{
                          borderRadius: "14px",
                          overflow: "hidden",
                          boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
                          transition: "all 0.3s",
                          "&:hover": { transform: "translateY(-8px)", boxShadow: "0 20px 40px rgba(0,0,0,0.15)" },
                        }}>
                          {isPdf ? (
                            <Box
                              onClick={() => window.open(img, "_blank")}
                              sx={{
                                height: 200, display: "flex", flexDirection: "column",
                                alignItems: "center", justifyContent: "center",
                                background: "linear-gradient(135deg, #fff7ed, #fed7aa)",
                                cursor: "pointer",
                              }}
                            >
                              <Box sx={{ fontSize: 60 }}>📄</Box>
                              <MDTypography variant="caption" fontWeight="bold" sx={{ color: "#f97316", mt: 1 }}>PDF Document</MDTypography>
                              <MDTypography variant="caption" sx={{ color: "#94a3b8" }}>Click to open</MDTypography>
                            </Box>
                          ) : (
                            <img
                              src={img}
                              onClick={() => openImage(img, i)}
                              style={{ width: "100%", height: 200, objectFit: "cover", cursor: "pointer", display: "block" }}
                              alt={`drawing-${i}`}
                            />
                          )}
                          <Box sx={{ p: 1.5, background: "#fff" }}>
                            <Button
                              size="small" fullWidth
                              sx={{
                                background: "#f87171",
                                color: "#fff", fontWeight: "bold", borderRadius: "8px",
                                textTransform: "none",
                                "&:hover": { opacity: 0.9 },
                              }}
                              onClick={() => handleDeleteImage(img)}
                            >
                              🗑 Delete
                            </Button>
                          </Box>
                        </Card>
                      </Grid>
                    );
                  })}
                  {images.length === 0 && (
                    <Grid item xs={12}>
                      <Box sx={{ py: 10, textAlign: "center", bgcolor: "#f8fafc", borderRadius: 4, border: "2px dashed #e2e8f0" }}>
                        <Box sx={{ fontSize: 64 }}>🗂</Box>
                        <MDTypography variant="h6" sx={{ color: "#94a3b8", fontWeight: 600, mt: 1 }}>No {drawingType} drawings found</MDTypography>
                        <MDTypography variant="caption" sx={{ color: "#cbd5e1" }}>Upload images or PDFs to see them here</MDTypography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </MDBox>
            )}
          </MDBox>
        )}

        {/* ACCOUNTS */}
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
                          borderRadius: "15px",
                          textAlign: "center",
                          background: "#fff",
                          border: `1px solid ${item.color}20`,
                          boxShadow: "0 4px 12px rgba(0,0,0,0.03)"
                        }}
                      >
                        <MDTypography variant="caption" fontWeight="bold" sx={{ color: "#64748b" }}>
                          {item.label.toUpperCase()}
                        </MDTypography>

                        <MDTypography
                          variant="h5"
                          fontWeight="bold"
                          sx={{ color: item.color, mt: 0.5 }}
                        >
                          ₹ {item.value.toLocaleString("en-IN")}
                        </MDTypography>
                      </Card>
                    ))}
                  </MDBox>

                  {/* ================= ADD PAYMENT ================= */}
                  <Card sx={{ p: 4, borderRadius: "20px", mb: 3, boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
                    <MDTypography variant="h6" fontWeight="bold" mb={3}>Add New Transaction</MDTypography>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Amount (₹)"
                          value={paymentData.amount}
                          onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          type="date"
                          label="Payment Date"
                          InputLabelProps={{ shrink: true }}
                          value={paymentData.date}
                          onChange={(e) => setPaymentData({ ...paymentData, date: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Note / Description"
                          value={paymentData.note}
                          onChange={(e) => setPaymentData({ ...paymentData, note: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={handleAddPayment}
                          sx={{ bgcolor: "#1e293b", color: "#fff", "&:hover": { bgcolor: "#334155" }, borderRadius: "8px", textTransform: "none", fontWeight: "bold" }}
                        >
                          {loading ? <CircularProgress size={20} color="inherit" /> : "Save Payment"}
                        </Button>
                      </Grid>
                    </Grid>
                  </Card>

                  {/* ================= TABLE ================= */}
                  <Card sx={{ p: 0, borderRadius: "20px", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                          <th style={{ padding: "20px", textAlign: "left", fontSize: "12px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>Transaction Details</th>
                          <th style={{ padding: "20px", textAlign: "center", fontSize: "12px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>Amount Received</th>
                          <th style={{ padding: "20px", textAlign: "right", fontSize: "12px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(project?.payments || []).map((pay, i) => {
                          const amount = Number(pay?.amount ?? pay?.payment?.amount ?? pay?.data?.amount ?? 0);
                          const date = pay?.date || pay?.createdAt;
                          return (
                            <Fragment key={i}>
                              <tr style={{ background: "#fff" }}>
                                <td style={{ padding: "16px 20px" }}>
                                  <MDTypography variant="button" fontWeight="bold" display="block" sx={{ color: "#1e293b" }}>
                                    {date ? new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-"}
                                  </MDTypography>
                                </td>
                                <td style={{ padding: "16px 20px", textAlign: "center" }}>
                                  <MDTypography variant="h6" fontWeight="bold" color="success">₹ {amount.toLocaleString("en-IN")}</MDTypography>
                                </td>
                                <td style={{ padding: "16px 20px", textAlign: "right" }}>
                                  <Button
                                    variant="contained"
                                    size="small"
                                    sx={{ bgcolor: "#25D366", color: "#fff", borderRadius: "8px", textTransform: "none", "&:hover": { bgcolor: "#128C7E" } }}
                                    onClick={() => sendWhatsAppSlip(pay)}
                                  >
                                    WhatsApp Receipt
                                  </Button>
                                </td>
                              </tr>
                              {pay?.note && (
                                <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                                  <td colSpan={3} style={{ padding: "0 20px 16px 20px" }}>
                                    <MDBox sx={{ bgcolor: "#f8fafc", p: 1.5, borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                                      <MDTypography variant="caption" sx={{ color: "#64748b", fontWeight: 600, display: "block" }}>
                                        📝 TRANSACTION NOTE:
                                      </MDTypography>
                                      <MDTypography variant="caption" sx={{ color: "#334155", fontWeight: 500 }}>
                                        {pay.note}
                                      </MDTypography>
                                    </MDBox>
                                  </td>
                                </tr>
                              )}
                              {!pay?.note && <tr style={{ borderBottom: "1px solid #f1f5f9" }}><td colSpan={3} /></tr>}
                            </Fragment>
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
                mb: 3,
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
                    background: "#4f46e5",
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
                    variant="contained"
                    sx={{ borderRadius: "10px", textTransform: "none", px: 4, bgcolor: "#64748b", color: "#fff", "&:hover": { bgcolor: "#475569" } }}
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
                    background: "#1e293b",
                    color: "#fff",
                    boxShadow: "0 10px 25px rgba(30, 41, 59, 0.2)",
                    "&:hover": { background: "#334155" }
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
                                sx={{ bgcolor: "#1e293b", color: "#fff", fontWeight: "bold", mb: 2, borderRadius: "6px" }}
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
                                      bgcolor: "#1e293b"
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
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            backdropFilter: "blur(8px)",
          }}
        >
          <Card
            sx={{
              width: 420,
              borderRadius: "24px",
              boxShadow: "0 30px 80px rgba(0,0,0,0.3)",
              overflow: "hidden",
            }}
          >
            {/* Modal Header */}
            <Box sx={{
              p: 3,
              background: uploadType === "civil"
                ? "#f97316"
                : "#2563eb",
              textAlign: "center",
            }}>
              <Box sx={{ fontSize: 40, mb: 0.5 }}>{uploadType === "civil" ? "🏗️" : "🎨"}</Box>
              <MDTypography variant="h5" fontWeight="900" sx={{ color: "#fff" }}>
                Upload {uploadType === "civil" ? "Civil" : "Interior"} Drawings
              </MDTypography>
              <MDTypography variant="caption" sx={{ color: "rgba(255,255,255,0.8)" }}>
                {uploadType === "civil" ? "Images & PDF supported" : "Images supported"}
              </MDTypography>
            </Box>

            <Box sx={{ p: 4 }}>
              {/* FILE INPUT AREA */}
              <MDBox
                sx={{
                  p: 3,
                  border: uploadType === "civil" ? "2px dashed #f97316" : "2px dashed #2563eb",
                  borderRadius: "14px",
                  background: uploadType === "civil" ? "#fff7ed" : "#eff6ff",
                  cursor: "pointer",
                  transition: "0.2s",
                  textAlign: "center",
                  "&:hover": { opacity: 0.85 },
                }}
              >
                <Box sx={{ fontSize: 36, mb: 1 }}>📁</Box>
                <input
                  type="file"
                  multiple
                  accept={uploadType === "civil" ? "image/*,.pdf" : "image/*"}
                  onChange={(e) => setFiles(e.target.files)}
                  style={{ width: "100%", cursor: "pointer" }}
                />
                <MDTypography variant="caption" sx={{ display: "block", mt: 1, color: "#64748b" }}>
                  {uploadType === "civil" ? "Images (PNG, JPG) or PDF files" : "Images (PNG, JPG, WEBP)"}
                </MDTypography>
              </MDBox>

              {files?.length > 0 && (
                <Box sx={{ mt: 2, p: 2, bgcolor: "#f0fdf4", borderRadius: 3, border: "1px solid #bbf7d0" }}>
                  <MDTypography variant="caption" sx={{ color: "#16a34a", fontWeight: "bold" }}>
                    ✓ {files.length} file(s) selected and ready to upload
                  </MDTypography>
                </Box>
              )}

              <Button
                onClick={handleUpload}
                fullWidth
                sx={{
                  mt: 3, py: 1.5, borderRadius: "12px",
                  textTransform: "none", fontWeight: "bold", color: "#fff",
                  background: uploadType === "civil"
                    ? "#f97316"
                    : "#2563eb",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                  "&:hover": { opacity: 0.9, transform: "translateY(-2px)" },
                  transition: "all 0.25s",
                }}
              >
                {loading ? "Uploading... ⏳" : "⬆ Upload Files"}
              </Button>

              <Button
                onClick={() => { setOpenUpload(false); setFiles([]); }}
                fullWidth
                sx={{
                  mt: 1.5, textTransform: "none",
                  color: "#64748b", fontWeight: 600, borderRadius: "10px",
                  "&:hover": { bgcolor: "#f1f5f9" },
                }}
              >
                Cancel
              </Button>
            </Box>
          </Card>
        </MDBox>
      )}
      <Footer />
    </DashboardLayout>
  );
}

export default ProjectDetails;
