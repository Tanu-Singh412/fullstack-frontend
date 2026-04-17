import { useLocation } from "react-router-dom";
import { useState } from "react";

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

  if (!state) return <div>No Data</div>;

  const total = Number(state.totalAmount || 0);
  const paid = (state.payments || []).reduce(
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
        `${API}/projects/${state._id}/drawing`,
        { method: "POST", body: formData }
      );

      if (!res.ok) throw new Error("Upload failed");

      alert("Upload success ✅");
      window.location.reload();

    } catch (err) {
      console.error(err);
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
        `${API}/projects/${state._id}/payment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paymentData),
        }
      );

      if (!res.ok) throw new Error("Payment failed");

      alert("Payment added ✅");
      window.location.reload();

    } catch (err) {
      console.error(err);
      alert("Payment failed ❌");
    } finally {
      setLoading(false);
      setShowPaymentForm(false);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <MDBox p={3}>
        {/* HEADER */}
        <Card sx={{ p: 3, mb: 3 }}>
          <MDTypography variant="h4" fontWeight="bold">
            {state.projectName}
          </MDTypography>
          <MDTypography mt={1}>
            Client: <b>{state.clientName}</b>
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
            <MDTypography variant="h6">Description</MDTypography>
            <MDTypography mt={1}>
              {state.description || "No description"}
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
                    <Card
                      sx={{
                        p: 4,
                        position: "relative",
                        cursor: "pointer",
                      }}
                    >
                      <MDTypography variant="h5">
                        {type === "civil"
                          ? "Civil Drawings"
                          : "Interior Drawings"}
                      </MDTypography>

                      <Button
                        variant="contained"
                        sx={{ position: "absolute", top: 20, right: 20 }}
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
                    ? state.civilImages
                    : state.interiorImages
                  )?.map((img, i) => (
                    <Grid item xs={12} sm={6} md={3} key={i}>
                      <Card>
                        <img
                          src={img}
                          style={{
                            width: "100%",
                            height: 220,
                            objectFit: "cover",
                          }}
                        />
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
              <Grid item xs={12} md={4}>
                <Card sx={{ p: 3 }}>Total: ₹ {total}</Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ p: 3 }}>Paid: ₹ {paid}</Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ p: 3 }}>Balance: ₹ {balance}</Card>
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

            {showPaymentForm && (
              <Card sx={{ p: 3, mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      label="Amount"
                      value={paymentData.amount}
                      onChange={(e) =>
                        setPaymentData({
                          ...paymentData,
                          amount: e.target.value,
                        })
                      }
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      type="date"
                      value={paymentData.date}
                      onChange={(e) =>
                        setPaymentData({
                          ...paymentData,
                          date: e.target.value,
                        })
                      }
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      label="Note"
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

                <MDBox mt={2} textAlign="right">
                  <Button onClick={handleAddPayment} variant="contained">
                    Save
                  </Button>
                </MDBox>
              </Card>
            )}
          </MDBox>
        )}
      </MDBox>

      {/* UPLOAD MODAL */}
      {openUpload && (
        <MDBox
          sx={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 9999, // ✅ FIXED
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Card sx={{ p: 3, minWidth: 300 }}>
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
                {loading ? <CircularProgress size={20} /> : "Upload"}
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