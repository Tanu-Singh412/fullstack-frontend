import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

// MUI
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";

// Dashboard
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function VendorList() {
  const { category } = useParams();
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);

useEffect(() => {
  fetch(
    `https://fullstack-project-1-n510.onrender.com/api/vendors?category=${category}`
  )
    .then((res) => res.json())
    .then((res) => setVendors(res.data || []))
    .catch((err) => console.log(err));
}, [category]);

  return (
    <DashboardLayout>
      <DashboardNavbar />

      {/* ✅ HEADER */}
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={2.5}
                px={3}
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                {/* LEFT */}
                <MDTypography variant="h6" color="white">
                  {category} Vendors
                </MDTypography>

                {/* RIGHT */}
                <Button
                  variant="contained"
                  onClick={() => navigate(`/add-vendor/${category}`)}
                  sx={{
                    background: "#fff",
                    color: "#1976d2",
                    fontWeight: "600",
                  }}
                >
                  + Add Vendor
                </Button>
              </MDBox>

              {/* ✅ VENDOR LIST */}
              <MDBox p={3}>
                <Grid container spacing={3}>
                  {vendors.length === 0 ? (
                    <MDTypography>No vendors found</MDTypography>
                  ) : (
                    vendors.map((v) => (
                      <Grid item xs={12} md={4} key={v._id}>
                        <Card
                          sx={{
                            p: 2,
                            cursor: "pointer",
                            transition: "0.3s",
                            "&:hover": {
                              transform: "translateY(-5px)",
                              boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                            },
                          }}
                          onClick={() => navigate(`/vendor/${v._id}`)}
                        >
                          <MDTypography variant="h6">
                            {v.vendorName}
                          </MDTypography>

                          <MDTypography fontSize="14px">
                            {v.phone}
                          </MDTypography>

                          <MDTypography fontSize="13px" color="text">
                            {v.company}
                          </MDTypography>
                        </Card>
                      </Grid>
                    ))
                  )}
                </Grid>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      <Footer />
    </DashboardLayout>
  );
}

export default VendorList;