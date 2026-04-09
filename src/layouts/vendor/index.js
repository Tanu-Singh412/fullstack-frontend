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

function Vendors() {
  const navigate = useNavigate(); // ✅ FIX

  const { columns, rows, dialog } = useVendorTableData();

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
                py={3}
                px={2}
                bgColor="info"
                variant="gradient"
                borderRadius="lg"
                coloredShadow="info"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <MDTypography variant="h6" color="white">
                  Vendor Management
                </MDTypography>

                {/* ✅ FIXED BUTTON */}
                <MDBox
                  sx={{
                    cursor: "pointer",
                    border: "1px solid white",
                    px: 2,
                    py: 1,
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "14px",
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.2)",
                    },
                  }}
onClick={() => navigate("/add-vendor")}                >
                  + Add Vendor
                </MDBox>
              </MDBox>

              {/* TABLE */}
              <MDBox pt={3}>
                <DataTable
                  table={{ columns, rows }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                />
              </MDBox>

              {/* DIALOG */}
              {dialog}

            </Card>
          </Grid>
        </Grid>
      </MDBox>

      <Footer />
    </DashboardLayout>
  );
}

export default Vendors;