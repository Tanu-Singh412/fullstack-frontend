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

  const categories = [
    { name: "Material Vendors", path: "/material-vendor" },
    { name: "Labour Vendors", path: "/labour-vendor" },
    { name: "Contractors", path: "/contractor-vendor" },
    { name: "Consultants", path: "/consultant-vendor" },
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <MDBox p={3}>
        <Grid container spacing={3}>
          {categories.map((cat, i) => (
            <Grid item xs={6} md={3} key={i}>
              <Card
                sx={{ p: 3, cursor: "pointer", textAlign: "center" }}
                onClick={() => navigate(cat.path)}
              >
                <MDTypography variant="h6">{cat.name}</MDTypography>
              </Card>
            </Grid>
             <Grid item xs={6} md={3} key={i}>
             <Button onClick={() => navigate("/add-vendor")}>
  + Add Vendor
</Button>
            </Grid>
          ))}
        </Grid>
      </MDBox>

      <Footer />
    </DashboardLayout>
  );
}