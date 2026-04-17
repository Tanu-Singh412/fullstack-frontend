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

  const [project, setProject] = useState(state);
  const [tab, setTab] = useState(0);

  const [drawingType, setDrawingType] = useState(null);
  const [openUpload, setOpenUpload] = useState(false);
  const [uploadType, setUploadType] = useState(null);
  const [files, setFiles] = useState([]);

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

    const res = await fetch(`${Base_API}/projects`);
    const data = await res.json();
    const current = data.find((p) => p._id === state._id);
    setProject(current);
  };

  useEffect(() => {
    fetchProject();
  }, []);

  if (!project) return <div>No Data</div>;

const total = Number(project.totalAmount || 0);
          const paid = (project?.payments || []).reduce(
            (sum, p) => sum + Number(p.amount),
            0
          );

          const balance = total - paid;

  // ================= UPLOAD =================
  const handleUpload = async () => {
    if (!files.length) return alert("Select files");

    setLoading(true);

    const formData = new FormData();
    [...files].forEach((f) => formData.append("images", f));
    formData.append("drawingType", uploadType);

    await fetch(`${Base_API}/projects/${project._id}/drawing`, {
      method: "POST",
      body: formData,
    });

    await fetchProject();
    setFiles([]);
    setOpenUpload(false);
    setLoading(false);
  };

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
  const handleDeleteImage = async (imgUrl, type) => {
    const field = type === "civil" ? "civilImages" : "interiorImages";

    const updated = project[field].filter((img) => img !== imgUrl);

    await fetch(`${Base_API}/projects/${project._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: updated }),
    });

    await fetchProject();
  };

  // ================= LIGHTBOX =================
 const images =
  drawingType === "civil"
    ? project?.civilImages || []
    : project?.interiorImages || [];

  const openImage = (img, index) => {
    setSelectedImage(img);
    setImageIndex(index);
  };

  const next = () => {
    const i = (imageIndex + 1) % images.length;
    setImageIndex(i);
    setSelectedImage(images[i]);
  };

  const prev = () => {
    const i = (imageIndex - 1 + images.length) % images.length;
    setImageIndex(i);
    setSelectedImage(images[i]);
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
        <Tabs value={tab} onChange={(e, v) => setTab(v)}>
          <Tab label="Overview" />
          <Tab label="Drawings" />
          <Tab label="Accounts" />
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
                        {type === "civil"
                          ? "Civil Drawings"
                          : "Interior Drawings"}
                      </MDTypography>

                      <Button
                        size="small"
                        sx={{ position: "absolute", top: 10, right: 10, color: "#fff" }}
                        variant="contained"
                        onClick={() => {
                          setUploadType(type);
                          setOpenUpload(true);
                        }}
                      >
                        Upload
                      </Button>

                      <MDBox mt={2} onClick={() => setDrawingType(type)}>
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
                  {images?.map((img, i) => (
                    <Grid item xs={12} sm={6} md={3} key={i}>
                      <Card sx={{ position: "relative", p: 1 }}>
                        <img
src={`${img}?t=${Date.now()}`}
  alt=""
  onError={(e) => {
    e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
  }}
  style={{
    width: "100%",
    height: 180,
    objectFit: "cover",
    borderRadius: 6,
    cursor: "pointer",
  }}
  onClick={() => openImage(img, i)}
/>

                        <Button
                          size="small"
                          color="error"
                          fullWidth
                          onClick={() =>
                            handleDeleteImage(img, drawingType)
                          }
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
        )}

        {/* ACCOUNTS */}
{tab === 2 && (
  <MDBox mt={3}>
    {/* SUMMARY CARDS */}
    <Grid container spacing={2}>
    <Grid item xs={12} md={4}>
  <Card
  sx={{
    p: 3,
    borderRadius: "16px",
    textAlign: "center",
    background: "linear-gradient(135deg, #0f172a, #1e293b)",
    color: "#fff",
    boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
  }}
>
  <MDTypography variant="caption" sx={{ color: "#cbd5f5" }}>
    Total Amount
  </MDTypography>

  <MDTypography
    variant="h3"
    fontWeight="bold"
    sx={{ mt: 1 }}
  >
    ₹ {total.toLocaleString()}
  </MDTypography>
</Card>
</Grid>

      <Grid item xs={12} md={4}>
        <Card sx={{ p: 3, bgcolor: "#e8f5e9", textAlign: "center" }}>
          <MDTypography variant="caption">Paid</MDTypography>
          <MDTypography variant="h5" fontWeight="bold" color="success">
            ₹ {paid}
          </MDTypography>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card sx={{ p: 3, bgcolor: "#ffebee", textAlign: "center" }}>
          <MDTypography variant="caption">Balance</MDTypography>
          <MDTypography variant="h5" fontWeight="bold" color="error">
            ₹ {balance}
          </MDTypography>
        </Card>
      </Grid>
    </Grid>

    {/* ADD PAYMENT BUTTON */}
    <Button
      variant="contained"
      sx={{
        mt: 3,
        borderRadius: "10px",
        textTransform: "none",
        px: 3,
        color: "#fff",
        background: "linear-gradient(135deg,#1976d2,#42a5f5)",
      }}
      onClick={() => setShowPaymentForm(true)}
    >
      + Add Payment
    </Button>

    {/* PAYMENT FORM */}
    {showPaymentForm && (
      <Card sx={{ p: 3, mt: 2, borderRadius: "12px" }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              label="Amount"
              fullWidth
              type="number"
              value={paymentData.amount}
              onChange={(e) =>
                setPaymentData({
                  ...paymentData,
                  amount: e.target.value,
                })
              }
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              type="datetime-local"
              fullWidth
              value={paymentData.date}
              onChange={(e) =>
                setPaymentData({
                  ...paymentData,
                  date: e.target.value,
                })
              }
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              label="Note"
              fullWidth
              value={paymentData.note}
              onChange={(e) =>
                setPaymentData({
                  ...paymentData,
                  note: e.target.value,
                })
              }
            />
          </Grid>
        </Grid>

        <Button
          variant="contained"
          sx={{ mt: 2, borderRadius: "8px", color: "#fff", background: "#1976d2" }}
          onClick={handleAddPayment}
        >
          {loading ? <CircularProgress size={20} /> : "Save Payment"}
        </Button>
      </Card>
    )}

    {/* PAYMENT TABLE */}
    <Card sx={{ mt: 3, p: 2, borderRadius: "12px" }}>
      <MDTypography fontWeight="bold" mb={1}>
        Payment History
      </MDTypography>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f1f5f9" }}>
            <th style={{ padding: "10px", textAlign: "left" }}>Date</th>
            <th style={{ padding: "10px", textAlign: "right" }}>Amount</th>
            <th style={{ padding: "10px", textAlign: "left" }}>Note</th>
          </tr>
        </thead>

        <tbody>
          {(project.payments || []).map((p, i) => (
            <tr key={i}>
              <td style={{ padding: "10px" }}>
                {new Date(p.date || p.createdAt).toLocaleString()}
              </td>

              <td
                style={{
                  padding: "10px",
                  textAlign: "right",
                  color: "green",
                  fontWeight: "600",
                }}
              >
                ₹ {p.amount}
              </td>

              <td style={{ padding: "10px" }}>{p.note || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  </MDBox>
)}

      </MDBox>

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
          <Button
            sx={{ position: "absolute", top: 20, right: 20 }}
            onClick={() => setSelectedImage(null)}
          >
            Close
          </Button>

          <Button onClick={prev}>◀</Button>

          <img
            src={selectedImage}
            style={{ maxHeight: "80%", maxWidth: "80%" }}
          />

          <Button onClick={next}>▶</Button>
        </MDBox>
      )}

      {/* UPLOAD MODAL */}
      {openUpload && (
        <MDBox
          sx={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            color: "#fff",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <Card sx={{ p: 3 }}>
            <input
              type="file"
              multiple
              onChange={(e) => setFiles(e.target.files)}
            />
            <Button onClick={handleUpload}>
              {loading ? <CircularProgress size={20} /> : "Upload"}
            </Button>
          </Card>
        </MDBox>
      )}

      <Footer />
    </DashboardLayout>
  );
}

export default ProjectDetails;