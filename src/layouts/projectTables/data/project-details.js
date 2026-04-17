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

const API = "https://fullstack-project-1-n510.onrender.com/api";

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

  // LIGHTBOX
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageIndex, setImageIndex] = useState(0);

  if (!project) return <div>No Data</div>;

  // ================= FETCH PROJECT =================
  const fetchProject = async () => {
    const res = await fetch(`${API}/projects`);
    const data = await res.json();
    const current = data.find((p) => p._id === project._id);
    setProject(current);
  };

  useEffect(() => {
    fetchProject();
  }, []);

  const total = Number(project.totalAmount || 0);
  const paid = (project.payments || []).reduce(
    (s, p) => s + Number(p.amount),
    0
  );
  const balance = total - paid;

  // ================= UPLOAD =================
  const handleUpload = async () => {
    if (!files.length) return alert("Select files first");

    try {
      setLoading(true);

      const formData = new FormData();
      [...files].forEach((f) => formData.append("images", f));
      formData.append("drawingType", uploadType);

      const res = await fetch(
        `${API}/projects/${project._id}/drawing`,
        { method: "POST", body: formData }
      );

      if (!res.ok) throw new Error("Upload failed");

      await fetchProject(); // ✅ refresh UI
      setFiles([]);

      alert("Upload success ✅");
    } catch (err) {
      alert("Upload failed ❌");
    } finally {
      setLoading(false);
      setOpenUpload(false);
    }
  };

  // ================= PAYMENT =================
  const handleAddPayment = async () => {
    if (!paymentData.amount) return alert("Enter amount");

    try {
      setLoading(true);

      const res = await fetch(
        `${API}/projects/${project._id}/payment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paymentData),
        }
      );

      if (!res.ok) throw new Error("Payment failed");

      await fetchProject(); // ✅ refresh UI

      setPaymentData({ amount: "", date: "", note: "" });

      alert("Payment added ✅");
    } catch (err) {
      alert("Payment failed ❌");
    } finally {
      setLoading(false);
      setShowPaymentForm(false);
    }
  };

  // ================= DELETE IMAGE =================
  const handleDeleteImage = async (imgUrl, type) => {
    const field = type === "civil" ? "civilImages" : "interiorImages";

    const updatedImages = project[field].filter((img) => img !== imgUrl);

    await fetch(`${API}/projects/${project._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: updatedImages }),
    });

    await fetchProject();
  };

  // ================= LIGHTBOX =================
  const openImage = (img, index) => {
    setSelectedImage(img);
    setImageIndex(index);
  };

  const handleNext = () => {
    const imgs =
      drawingType === "civil"
        ? project.civilImages
        : project.interiorImages;

    const next = (imageIndex + 1) % imgs.length;
    setImageIndex(next);
    setSelectedImage(imgs[next]);
  };

  const handlePrev = () => {
    const imgs =
      drawingType === "civil"
        ? project.civilImages
        : project.interiorImages;

    const prev = (imageIndex - 1 + imgs.length) % imgs.length;
    setImageIndex(prev);
    setSelectedImage(imgs[prev]);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <MDBox p={3}>
        {/* HEADER */}
        <Card sx={{ p: 3, mb: 3 }}>
          <MDTypography variant="h4" fontWeight="bold">
            {project.projectName}
          </MDTypography>
          <MDTypography mt={1}>
            Client: <b>{project.clientName}</b>
          </MDTypography>
        </Card>

        <Tabs value={tab} onChange={(e, v) => setTab(v)}>
          <Tab label="Overview" />
          <Tab label="Drawings" />
          <Tab label="Accounts" />
        </Tabs>

        {/* OVERVIEW */}
        {tab === 0 && (
          <Card sx={{ p: 3, mt: 2 }}>
            <MDTypography variant="h6">Description</MDTypography>
            <MDTypography mt={1}>
              {project.description || "No description"}
            </MDTypography>
          </Card>
        )}

        {/* DRAWINGS */}
        {tab === 1 && (
          <MDBox mt={3}>
            {!drawingType ? (
              <Grid container spacing={3}>
                {["civil", "interior"].map((type) => (
                  <Grid item xs={12} md={6} key={type}>
                    <Card sx={{ p: 4 }}>
                      <MDTypography variant="h5">
                        {type === "civil"
                          ? "Civil Drawings"
                          : "Interior Drawings"}
                      </MDTypography>

                      <Button
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
                  {(drawingType === "civil"
                    ? project.civilImages
                    : project.interiorImages
                  )?.map((img, i) => (
                    <Grid item xs={12} sm={6} md={3} key={i}>
                      <Card sx={{ position: "relative" }}>
                        <img
                          src={img}
                          style={{ width: "100%", height: 200 }}
                          onClick={() => openImage(img, i)}
                        />

                        <Button
                          color="error"
                          size="small"
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
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Card sx={{ p: 2 }}>Total ₹ {total}</Card>
              </Grid>
              <Grid item xs={4}>
                <Card sx={{ p: 2 }}>Paid ₹ {paid}</Card>
              </Grid>
              <Grid item xs={4}>
                <Card sx={{ p: 2 }}>Balance ₹ {balance}</Card>
              </Grid>
            </Grid>

            <Button onClick={() => setShowPaymentForm(true)}>
              + Add Payment
            </Button>

            {showPaymentForm && (
              <Card sx={{ p: 2 }}>
                <TextField
                  label="Amount"
                  fullWidth
                  value={paymentData.amount}
                  onChange={(e) =>
                    setPaymentData({
                      ...paymentData,
                      amount: e.target.value,
                    })
                  }
                />
                <Button onClick={handleAddPayment}>Save</Button>
              </Card>
            )}

            {/* PAYMENT HISTORY */}
            <Card sx={{ mt: 2 }}>
              {(project.payments || []).map((p, i) => (
                <MDBox key={i} display="flex" justifyContent="space-between">
                  <span>{new Date(p.date).toLocaleString()}</span>
                  <span>₹ {p.amount}</span>
                </MDBox>
              ))}
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
            background: "rgba(0,0,0,0.9)",
          }}
        >
          <Button onClick={() => setSelectedImage(null)}>Close</Button>
          <Button onClick={handlePrev}>Prev</Button>
          <img src={selectedImage} style={{ maxHeight: "80%" }} />
          <Button onClick={handleNext}>Next</Button>
        </MDBox>
      )}

      {/* UPLOAD MODAL */}
      {openUpload && (
        <MDBox sx={{ position: "fixed", inset: 0 }}>
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