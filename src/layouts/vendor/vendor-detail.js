import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

function VendorDetail() {
  const { id } = useParams();
  const [vendor, setVendor] = useState(null);

useEffect(() => {
  fetch(`/api/vendors/${id}`)
    .then((res) => res.json())
    .then((res) => setVendor(res.data))
    .catch((err) => console.error(err));
}, [id]);

  if (!vendor) return <p>Loading...</p>;

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <MDBox p={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ p: 3 }}>
              <MDTypography variant="h4" mb={2}>
                {vendor.vendorName}
              </MDTypography>

              <MDTypography>📞 Phone: {vendor.phone}</MDTypography>
              <MDTypography>📧 Email: {vendor.email}</MDTypography>
              <MDTypography>🏢 Company: {vendor.company}</MDTypography>
              <MDTypography>🧾 GST: {vendor.gst}</MDTypography>
              <MDTypography>📂 Category: {vendor.category}</MDTypography>
            </Card>
          </Grid>

          {/* MATERIALS */}
          <Grid item xs={12}>
            <Card sx={{ p: 3 }}>
              <MDTypography variant="h6" mb={2}>
                Materials
              </MDTypography>

              {vendor.materials?.length > 0 ? (
                vendor.materials.map((m, i) => (
                  <MDBox key={i} mb={1}>
                    {m.materialName} — ₹{m.rate}
                  </MDBox>
                ))
              ) : (
                <MDTypography>No materials</MDTypography>
              )}
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      <Footer />
    </DashboardLayout>
  );
}

export default VendorDetail;