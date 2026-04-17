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
  const paid = (project.payments || []).reduce(
    (s, p) => s + Number(p.amount),
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

    await fetch(`${Base_API}/projects/${project._id}/payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
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
      ? project.civilImages
      : project.interiorImages;

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
        <Card sx={{ p: 3, mb: 3 }}>
          <MDTypography variant="h4" fontWeight="bold">
            {project.projectName}
          </MDTypography>
          <MDTypography>
            Client: <b>{project.clientName}</b>
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
                        sx={{ position: "absolute", top: 10, right: 10 }}
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
                          src={img}
                          alt=""
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

            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() => setShowPaymentForm(true)}
            >
              + Add Payment
            </Button>

            {showPaymentForm && (
              <Card sx={{ p: 2, mt: 2 }}>
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
                <Button sx={{ mt: 1 }} onClick={handleAddPayment}>
                  Save
                </Button>
              </Card>
            )}

            <Card sx={{ mt: 2, p: 2 }}>
              {project.payments?.map((p, i) => (
                <MDBox
                  key={i}
                  display="flex"
                  justifyContent="space-between"
                >
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