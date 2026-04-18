import { useNavigate } from "react-router-dom";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

import useVendorTableData from "./data/vendorTableData";

function VendorHome() {
  const navigate = useNavigate();

  return (
    <MDBox p={3}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card
            sx={{ p: 3, cursor: "pointer" }}
            onClick={() => navigate("/material-vendor")}
          >
            <MDTypography variant="h6">
              Material Vendors
            </MDTypography>
          </Card>
        </Grid>

        {/* future types */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3 }}>
            <MDTypography variant="h6">
              Labour Vendors (coming soon)
            </MDTypography>
          </Card>
        </Grid>
      </Grid>
    </MDBox>
  );
}

export default VendorHome;