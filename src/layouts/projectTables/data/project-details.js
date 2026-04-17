import { useLocation } from "react-router-dom";
import { useState } from "react";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";

function ProjectDetails() {
  const { state } = useLocation();

  const [tab, setTab] = useState(0);
  const [drawingType, setDrawingType] = useState(null);

  const [openUpload, setOpenUpload] = useState(false);
  const [uploadType, setUploadType] = useState(null);
  const [files, setFiles] = useState([]);

  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: "",
    date: "",
    note: "",
  });

  if (!state) return <div>No Data</div>;

  const handleChange = (e, val) => setTab(val);

  const total = Number(state.totalAmount || 0);
  const paid = (state.payments || []).reduce((s, p) => s + Number(p.amount), 0);
  const balance = total - paid;

  // UPLOAD
  const handleUploadClick = (type) => {
    setUploadType(type);
    setOpenUpload(true);
  };

const handleUpload = async () => {
  const formData = new FormData();

  [...files].forEach((f) => formData.append("images", f));

  formData.append("drawingType", uploadType);

  await fetch(`/api/projects/${state._id}/drawing`, {
    method: "POST",
    body: formData,
  });

  setOpenUpload(false);
  setFiles([]);
  window.location.reload();
};

  // PAYMENT
  const handlePaymentChange = (e) =>
    setPaymentData({ ...paymentData, [e.target.name]: e.target.value });

 const handleAddPayment = async () => {
  await fetch(`/api/projects/${state._id}/payment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(paymentData),
  });

  setShowPaymentForm(false);
  setPaymentData({ amount: "", date: "", note: "" });

  window.location.reload();
};

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            {/* HEADER */}
            <MDBox
              mx={2}
              mt={-3}
              p={3}
              bgColor="info"
              borderRadius="lg"
              coloredShadow="info"
            >
              <MDTypography variant="h5" color="white" fontWeight="bold">
                {state.projectName}
              </MDTypography>
              <MDTypography color="white">
                Client: <b>{state.clientName}</b>
              </MDTypography>
            </MDBox>

            <MDBox pt={3} px={2}>
              <Tabs value={tab} onChange={handleChange}>
                <Tab label="Overview" />
                <Tab label="Drawings" />
                <Tab label="Accounts" />
              </Tabs>

              {/* OVERVIEW */}
              {tab === 0 && (
                <Card sx={{ mt: 3, p: 3 }}>
                  <MDTypography variant="h6">Description</MDTypography>
                  <MDTypography mt={1}>
                    {state.description || "No description"}
                  </MDTypography>
                </Card>
              )}

              {/* DRAWINGS */}
              {tab === 1 && (
                <MDBox mt={3}>
                  {!drawingType && (
                    <Grid container spacing={3}>
                      {["civil", "interior"].map((type) => (
                        <Grid item xs={12} md={6} key={type}>
                          <MDBox
                            p={4}
                            borderRadius="xl"
                            sx={{
                              background:
                                type === "civil"
                                  ? "linear-gradient(#42a5f5,#478ed1)"
                                  : "linear-gradient(#ec407a,#d81b60)",
                              color: "#fff",
                              position: "relative",
                              cursor: "pointer",
                            }}
                          >
                            <MDTypography variant="h5">
                              {type === "civil"
                                ? "Civil Drawings"
                                : "Interior Drawings"}
                            </MDTypography>

                            <MDBox
                              onClick={() => handleUploadClick(type)}
                              sx={{
                                position: "absolute",
                                top: 15,
                                right: 15,
                                width: 40,
                                height: 40,
                                borderRadius: "50%",
                                background: "#fff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                              }}
                            >
                              +
                            </MDBox>

                            <MDBox mt={2} onClick={() => setDrawingType(type)}>
                              View Images →
                            </MDBox>
                          </MDBox>
                        </Grid>
                      ))}
                    </Grid>
                  )}

                  {/* IMAGE GRID */}
                  {drawingType && (
                    <>
                      <Button onClick={() => setDrawingType(null)}>
                        ⬅ Back
                      </Button>

                      <Grid container spacing={3} mt={1}>
                        {(drawingType === "civil"
                          ? state.civilImages
                          : state.interiorImages
                        )?.map((img, i) => (
                          <Grid item xs={12} sm={6} md={3} key={i}>
                            <MDBox
                              sx={{
                                borderRadius: 2,
                                overflow: "hidden",
                                "&:hover img": { transform: "scale(1.1)" },
                              }}
                            >
                              <img
                                src={img}
                                style={{
                                  width: "100%",
                                  height: 220,
                                  objectFit: "cover",
                                  transition: "0.3s",
                                }}
                              />
                            </MDBox>
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
                    <Grid item xs={12} md={4}>
                      <MDBox p={3} bgColor="info" color="white">
                        Total: ₹ {total}
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <MDBox p={3} bgColor="success" color="white">
                        Paid: ₹ {paid}
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <MDBox p={3} bgColor="error" color="white">
                        Balance: ₹ {balance}
                      </MDBox>
                    </Grid>
                  </Grid>

                  <MDBox mt={3} textAlign="right">
                    <Button
                      variant="contained"
                      onClick={() => setShowPaymentForm(!showPaymentForm)}
                    >
                      + Add Payment
                    </Button>
                  </MDBox>

                  {/* FORM */}
                  {showPaymentForm && (
                    <Card sx={{ mt: 2, p: 3 }}>
                      <Grid container spacing={2}>
                        {["amount", "date", "note"].map((field) => (
                          <Grid item xs={12} md={4} key={field}>
                            <input
                              type={field === "date" ? "date" : "text"}
                              name={field}
                              placeholder={field}
                              value={paymentData[field]}
                              onChange={handlePaymentChange}
                              style={{
                                width: "100%",
                                padding: 10,
                                borderRadius: 8,
                                border: "1px solid #ccc",
                              }}
                            />
                          </Grid>
                        ))}
                      </Grid>

                      <MDBox mt={2} textAlign="right">
                        <Button onClick={handleAddPayment} variant="contained">
                          Save
                        </Button>
                      </MDBox>
                    </Card>
                  )}

                  {/* TABLE */}
                  <Card sx={{ mt: 3 }}>
                    <MDBox p={2}>
                      <MDTypography variant="h6">
                        Payment History
                      </MDTypography>
                    </MDBox>

                    {(state.payments || []).map((p, i) => (
                      <MDBox
                        key={i}
                        px={3}
                        py={2}
                        display="flex"
                        justifyContent="space-between"
                        borderTop="1px solid #eee"
                      >
                        <span>{p.date}</span>
                        <span>₹ {p.amount}</span>
                        <span>{p.note}</span>
                      </MDBox>
                    ))}
                  </Card>
                </MDBox>
              )}
            </MDBox>
          </Grid>
        </Grid>
      </MDBox>

      {/* UPLOAD MODAL */}
      {openUpload && (
        <MDBox
          sx={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Card sx={{ p: 3 }}>
            <MDTypography mb={2}>
              Upload {uploadType} Images
            </MDTypography>

            <input
              type="file"
              multiple
              onChange={(e) => setFiles(e.target.files)}
            />

            <MDBox mt={2} display="flex" justifyContent="space-between">
              <Button onClick={() => setOpenUpload(false)}>Cancel</Button>
              <Button onClick={handleUpload} variant="contained">
                Upload
              </Button>
            </MDBox>
          </Card>
        </MDBox>
      )}

      <Footer />
    </DashboardLayout>
  );
}

export default ProjectDetails;