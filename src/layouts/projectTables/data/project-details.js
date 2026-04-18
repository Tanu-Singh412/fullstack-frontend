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

const handleUpload = async () => {
  if (!files.length || !uploadType) return;

  const formData = new FormData();

  Array.from(files).forEach((file) => {
    formData.append("images", file);
  });

  formData.append("type", uploadType);

  await fetch(`${Base_API}/projects/${project._id}/drawing`, {
    method: "POST",
    body: formData,
  });

  await fetchDrawings();
  setOpenUpload(false);
  setFiles([]);
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

    await fetch(`${Base_API}/projects/${project._id}/payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    await fetchProject();
    setPaymentData({ amount: "", date: "", note: "" });
    setShowPaymentForm(false);
    setLoading(false);
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
      <Grid container spacing={3}>
        {["civil", "interior"].map((type) => (
          <Grid item xs={12} md={6} key={type}>
            <Card sx={{ p: 3, position: "relative" }}>
              <MDTypography variant="h5">
                {type === "civil" ? "Civil Drawings" : "Interior Drawings"}
              </MDTypography>

              <Button
                size="small"
                sx={{ position: "absolute", top: 10, right: 10, color: "#fff"}}
                variant="contained"
                onClick={() => {
                  setUploadType(type);
                  setOpenUpload(true);
                }}

              >
                Upload
              </Button>

              <MDBox
                mt={2}
                sx={{ cursor: "pointer", color: "#1976d2" }}
                onClick={() => setDrawingType(type)}
              >
                View Images →
              </MDBox>
            </Card>
          </Grid>
        ))}
      </Grid>
    ) : (
      <>
        <Button onClick={() => setDrawingType(null)}>⬅ Back</Button>

        <Grid container spacing={3} mt={1}>
          {images.map((img, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card sx={{ p: 1 }}>
                <img
                  src={img}
                  onClick={() => openImage(img, i)}
                  style={{
                    width: "100%",
                    height: 180,
                    objectFit: "cover",
                    borderRadius: 10,
                    cursor: "pointer",
                  }}
                />

                <Button
                  size="small"
                  color="error"
                  fullWidth
                  onClick={() => handleDeleteImage(img)}
                >
                  Delete
                </Button>
              </Card>
            </Grid>
          ))}
        </Grid>
      </>
    )}
  </MDBox>
)}        {/* ACCOUNTS */}



        {tab === 2 && (
          <MDBox mt={3}>
            {/* ================= CALCULATIONS ================= */}
            {(() => {
              const total = Number(project?.totalAmount || 0);

              const paid = (project?.payments || []).reduce(
                (sum, p) => sum + Number(p?.amount || 0),
                0,
              );

              const balance = total - paid;

              return (
                <>
                  {/* ================= SUMMARY ================= */}
                  <MDBox display="flex" gap={2} mb={2}>
                    {/* TOTAL */}
                    <MDBox
                      sx={{
                        flex: 1,
                        p: 2,
                        borderRadius: "10px",
                        background: "#e3f2fd",
                        textAlign: "center",
                      }}
                    >
                      <MDTypography variant="caption">Total</MDTypography>
                      <MDTypography fontWeight="bold">₹ {total}</MDTypography>
                    </MDBox>

                    {/* PAID */}
                    <MDBox
                      sx={{
                        flex: 1,
                        p: 2,
                        borderRadius: "10px",
                        background: "#e8f5e9",
                        textAlign: "center",
                      }}
                    >
                      <MDTypography variant="caption">Paid</MDTypography>
                      <MDTypography fontWeight="bold" color="success">
                        ₹ {paid}
                      </MDTypography>
                    </MDBox>

                    {/* BALANCE */}
                    <MDBox
                      sx={{
                        flex: 1,
                        p: 2,
                        borderRadius: "10px",
                        background: "#ffebee",
                        textAlign: "center",
                      }}
                    >
                      <MDTypography variant="caption">Balance</MDTypography>
                      <MDTypography fontWeight="bold" color="error">
                        ₹ {balance}
                      </MDTypography>
                    </MDBox>
                  </MDBox>

                  {/* ================= ADD PAYMENT ================= */}
                  <MDBox mt={3} display="flex" gap={1} flexWrap="wrap">
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
                        px: 3,
                        background: "#1976d2",
                        color: "#fff",
                      }}
                    >
                      {loading ? <CircularProgress size={20} /> : "Add"}
                    </Button>
                  </MDBox>

                  {/* ================= TABLE ================= */}
                  <Card sx={{ mt: 3, p: 2, borderRadius: "12px" }}>
                    <table
                      style={{ width: "100%", borderCollapse: "collapse" }}
                    >
                      <thead>
                        <tr style={{ background: "#f1f5f9" }}>
                          <th style={{ padding: "8px", textAlign: "left" }}>
                            Date
                          </th>
                          <th style={{ padding: "8px", textAlign: "right" }}>
                            Amount
                          </th>
                          <th style={{ padding: "8px", textAlign: "left" }}>
                            Note
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {(project?.payments || []).map((pay, i) => (
                          <tr key={i}>
                            <td style={{ padding: "8px" }}>
                              {new Date(
                                pay.date || pay.createdAt,
                              ).toLocaleDateString()}
                            </td>

                            <td
                              style={{
                                padding: "8px",
                                textAlign: "right",
                                color: "green",
                                fontWeight: "600",
                              }}
                            >
                              ₹ {pay.amount}
                            </td>

                            <td style={{ padding: "8px" }}>
                              {pay.note || "-"}
                            </td>
                          </tr>
                        ))}
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
                p: 2,
                borderRadius: "12px",
                boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
                overflowX: "auto",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#1976d2", color: "#fff" }}>
                    <th style={{ padding: 10 }}>Project</th>
                    <th>Work</th>
                    <th>Area</th>
                    <th>Floors</th>
                    <th>Timeline</th>
                    <th>Services</th>
                    <th>Notes</th>
                    <th>Actions</th>
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
                          borderBottom: "1px solid #eee",
                          background: i % 2 === 0 ? "#fff" : "#f9f9f9",
                        }}
                      >
                        <td style={{ padding: 10 }}>{s.projectType}</td>
                        <td>{s.workType}</td>
                        <td>{s.area}</td>
                        <td>{s.floors}</td>
                        <td>{s.timeline}</td>

                        <td style={{ fontSize: 12 }}>
                          {Object.keys(s)
                            .filter((k) => s[k] === true)
                            .join(", ")}
                        </td>

                        <td>{s.notes}</td>

                        {/* ACTIONS */}
                        <td>
                          <Button
                            size="small"
                            onClick={() => {
                              setScopeData(s);
                              setEditScopeId(s._id);
                            }}
                          >
                            Edit
                          </Button>

                          <Button
                            size="small"
                            color="error"
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
      background: "rgba(0,0,0,0.6)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
    }}
  >
    <Card
      sx={{
        p: 3,
        minWidth: 300,
        borderRadius: "12px",
        textAlign: "center",
      }}
    >
      {/* FILE INPUT */}
      <input
        type="file"
        multiple
        onChange={(e) => setFiles(e.target.files)}
        style={{ marginBottom: "15px" }}
      />

      {/* UPLOAD BUTTON */}
      <Button
        onClick={handleUpload}
        variant="contained"
        fullWidth
        sx={{
          textTransform: "none",
          borderRadius: "8px",
          color:"#fff"
        }}
      >
        {loading ? "Uploading..." : "Upload"}
      </Button>

      {/* CANCEL BUTTON */}
      <Button
        onClick={() => {
          setOpenUpload(false);
          setFiles([]);
        }}
        fullWidth
        sx={{ mt: 1, textTransform: "none" }}
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
