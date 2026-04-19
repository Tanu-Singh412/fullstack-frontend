import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function VendorList() {
  const { categoryId } = useParams(); // ✅ correct
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);

  const cleanCategory = categoryId?.trim().toLowerCase(); // ✅ IMPORTANT

  useEffect(() => {
    if (!cleanCategory) return;

    console.log("FETCH CATEGORY:", cleanCategory);

    fetch(
      `https://fullstack-project-1-n510.onrender.com/api/vendors?category=${cleanCategory}`
    )
      .then((res) => res.json())
      .then((res) => {
        console.log("API RESPONSE:", res);
        setVendors(res.data || []);
      })
      .catch((err) => console.log(err));
  }, [cleanCategory]);

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>

              {/* HEADER */}
              <MDBox
                mx={2}
                mt={-3}
                py={2.5}
                px={3}
                bgColor="info"
                borderRadius="lg"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <MDTypography variant="h6" color="white">
                  {categoryId} Vendors
                </MDTypography>

                <Button
                  variant="contained"
                  onClick={() => navigate(`/add-vendor/${categoryId}`)}
                  sx={{ background: "#fff", color: "#1976d2" }}
                >
                  + Add Vendor
                </Button>
              </MDBox>

              {/* LIST */}
              <MDBox p={3}>
                <Grid container spacing={3}>
                  {vendors.length === 0 ? (
                    <MDTypography>No vendors found</MDTypography>
                  ) : (
                    vendors.map((v) => (
                      <Grid item xs={12} md={4} key={v._id}>
                        <Card
                          sx={{ p: 2, cursor: "pointer" }}
                          onClick={() => navigate(`/vendor/${v._id}`)}
                        >
                          <MDTypography variant="h6">
                            {v.vendorName}
                          </MDTypography>
                          <MDTypography>{v.phone}</MDTypography>
                          <MDTypography>{v.company}</MDTypography>
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