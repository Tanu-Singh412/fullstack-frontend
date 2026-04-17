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
    materialIncluded: false,
    notes: "",
  });

  const [scopeList, setScopeList] = useState([]);
  const [tab, setTab] = useState(0);
  const [drawingType, setDrawingType] = useState(null);
  const [openUpload, setOpenUpload] = useState(false);
  const [uploadType, setUploadType] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

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
    if (current) setProject(current);
  };

  const fetchScope = async () => {
    if (!project?._id) return;

    const res = await fetch(
      `${Base_API}/projects/${project._id}/scope`
    );
    const data = await res.json();
    setScopeList(data || []);
  };

  useEffect(() => {
    fetchProject();
  }, []);

  useEffect(() => {
    if (project?._id) fetchScope();
  }, [project?._id]);

  if (!project?._id) return <div>Loading...</div>;

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
    setLoading(false);
  };

  // ================= SCOPE =================
  const handleAddScope = async () => {
    if (!scopeData.projectType) return alert("Enter project type");

    setLoading(true);

    await fetch(`${Base_API}/projects/${project._id}/scope`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(scopeData),
    });

    await fetchScope();
    setLoading(false);

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
      materialIncluded: false,
      notes: "",
    });
  };

  // ================= IMAGES =================
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
            borderRadius: 3,
            background: "linear-gradient(135deg, #1976d2, #42a5f5)",
            color: "#fff",
          }}
        >
          <MDTypography variant="h4">
            {project.projectName}
          </MDTypography>
          <MDTypography>
            Client: {project.clientName}
          </MDTypography>
        </Card>

        {/* TABS */}
        <Tabs
          value={tab}
          onChange={(e, v) => setTab(v)}
          sx={{
            "& .Mui-selected": { color: "#1976d2" },
            "& .MuiTabs-indicator": { background: "#1976d2" },
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
            {project.description}
          </Card>
        )}

        {/* DRAWINGS */}
        {tab === 1 && (
          <MDBox mt={3}>
            {!drawingType ? (
              <Grid container spacing={2}>
                {["civil", "interior"].map((type) => (
                  <Grid item xs={6} key={type}>
                    <Card sx={{ p: 3 }}>
                      <Button
                        onClick={() => {
                          setUploadType(type);
                          setOpenUpload(true);
                        }}
                      >
                        Upload
                      </Button>
                      <MDBox
                        onClick={() => setDrawingType(type)}
                      >
                        View {type}
                      </MDBox>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <>
                <Button onClick={() => setDrawingType(null)}>
                  Back
                </Button>

                <Grid container spacing={2}>
                  {images.map((img, i) => (
                    <Grid item xs={3} key={i}>
                      <img
                        src={img}
                        style={{ width: "100%" }}
                        onClick={() => openImage(img, i)}
                      />
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
            <TextField
              label="Amount"
              value={paymentData.amount}
              onChange={(e) =>
                setPaymentData({
                  ...paymentData,
                  amount: e.target.value,
                })
              }
            />
            <Button onClick={handleAddPayment}>
              Add Payment
            </Button>
          </MDBox>
        )}

        {/* SCOPE */}
        {tab === 3 && (
          <MDBox mt={3}>
            <Card sx={{ p: 3 }}>
              <TextField
                label="Project Type"
                value={scopeData.projectType}
                onChange={(e) =>
                  setScopeData({
                    ...scopeData,
                    projectType: e.target.value,
                  })
                }
              />

              <Button onClick={handleAddScope}>
                {loading ? (
                  <CircularProgress size={20} />
                ) : (
                  "Add Scope"
                )}
              </Button>
            </Card>

            <Card sx={{ mt: 2 }}>
              <table width="100%">
                <tbody>
                  {scopeList.map((s, i) => (
                    <tr key={i}>
                      <td>{s.projectType}</td>
                      <td>{s.notes}</td>
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
            background: "#000",
          }}
        >
          <Button onClick={() => setSelectedImage(null)}>
            Close
          </Button>
          <Button onClick={prev}>◀</Button>
          <img src={selectedImage} />
          <Button onClick={next}>▶</Button>
        </MDBox>
      )}

      <Footer />
    </DashboardLayout>
  );
}

export default ProjectDetails;