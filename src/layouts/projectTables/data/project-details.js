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

function ProjectDetails() {
  const { state } = useLocation();
  const [tab, setTab] = useState(0);
  const [drawingType, setDrawingType] = useState(null);

  if (!state) return <div>No Data</div>;

  const handleChange = (event, newValue) => {
    setTab(newValue);
  };

  const total = Number(state.totalAmount || 0);
  const paid = (state.payments || []).reduce((sum, p) => sum + Number(p.amount), 0);
  const balance = total - paid;

  return (
    <DashboardLayout>
      <DashboardNavbar />

      {/* ✅ MAIN WRAPPER SAME AS TABLES */}
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            {/* ✅ HEADER CARD */}
            <MDBox
              mx={2}
              mt={-3}
              py={2.5}
              px={3}
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

            {/* ✅ CONTENT AREA */}
            <MDBox pt={3} px={2}>
              {/* TABS */}
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs value={tab} onChange={handleChange}>
                  <Tab label="Overview" />
                  <Tab label="Drawings" />
                  <Tab label="Accounts" />
                </Tabs>
              </Box>

              {/* ---------------- OVERVIEW ---------------- */}
              {tab === 0 && (
                <MDBox mt={3}>
                  <MDBox p={3} borderRadius="lg" bgColor="white" shadow="md">
                    <MDTypography variant="h6">Description</MDTypography>
                    <MDTypography mt={1}>
                      {state.description || "No description"}
                    </MDTypography>
                  </MDBox>
                </MDBox>
              )}

              {/* ---------------- DRAWINGS ---------------- */}
              {tab === 1 && (
                <MDBox mt={3}>
                  {/* SELECT TYPE */}
                  {!drawingType && (
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <MDBox
                          onClick={() => setDrawingType("civil")}
                          p={4}
                          borderRadius="lg"
                          textAlign="center"
                          sx={{
                            cursor: "pointer",
                            background: "#e3f2fd",
                            fontWeight: "bold",
                            "&:hover": { transform: "scale(1.03)" },
                          }}
                        >
                          Civil Drawings
                        </MDBox>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <MDBox
                          onClick={() => setDrawingType("interior")}
                          p={4}
                          borderRadius="lg"
                          textAlign="center"
                          sx={{
                            cursor: "pointer",
                            background: "#fce4ec",
                            fontWeight: "bold",
                            "&:hover": { transform: "scale(1.03)" },
                          }}
                        >
                          Interior Drawings
                        </MDBox>
                      </Grid>
                    </Grid>
                  )}

                  {/* SHOW IMAGES */}
                  {drawingType && (
                    <>
                      <MDBox mb={2}>
                        <button onClick={() => setDrawingType(null)}>⬅ Back</button>
                      </MDBox>

                      <Grid container spacing={2}>
                        {(drawingType === "civil"
                          ? state.civilImages || []
                          : state.interiorImages || []
                        ).length === 0 && (
                          <MDTypography>No Images Found</MDTypography>
                        )}

                        {(drawingType === "civil"
                          ? state.civilImages || []
                          : state.interiorImages || []
                        ).map((img, i) => (
                          <Grid item xs={12} sm={6} md={3} key={i}>
                            <MDBox
                              sx={{
                                borderRadius: "12px",
                                overflow: "hidden",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                              }}
                            >
                              <img
                                src={img}
                                style={{
                                  width: "100%",
                                  height: "200px",
                                  objectFit: "cover",
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

              {/* ---------------- ACCOUNTS ---------------- */}
              {tab === 2 && (
                <MDBox mt={3}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <MDBox p={3} bgColor="info" color="white" borderRadius="lg">
                        Total: ₹ {total}
                      </MDBox>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <MDBox p={3} bgColor="success" color="white" borderRadius="lg">
                        Paid: ₹ {paid}
                      </MDBox>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <MDBox p={3} bgColor="error" color="white" borderRadius="lg">
                        Balance: ₹ {balance}
                      </MDBox>
                    </Grid>
                  </Grid>
                </MDBox>
              )}
            </MDBox>
          </Grid>
        </Grid>
      </MDBox>

      <Footer />
    </DashboardLayout>
  );
}

export default ProjectDetails;