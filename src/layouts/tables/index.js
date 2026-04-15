import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

import useClientTableData from "layouts/tables/data/clientTableData";

import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";

function Tables() {
  const { columns, rows, dialog } = useClientTableData();
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              {/* ✅ HEADER */}
              <MDBox
                mx={2}
                mt={-3}
                py={2.5}
                px={3}
                bgColor="info"
                variant="gradient"
                borderRadius="lg"
                coloredShadow="info"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                {/* LEFT */}
                <MDTypography variant="h6" color="white" fontWeight="bold">
                  Client Management
                </MDTypography>

                {/* RIGHT BUTTON */}
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate("/add-clients")} // ✅ FIXED route
                  sx={{
                    textTransform: "none",
                    fontWeight: "600",
                    px: 2.5,
                    py: 1,
                    background: "#fff",
                    color: "#1976d2",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                    "&:hover": {
                      background: "#f1f5f9",
                    },
                  }}
                >
                  Add Client
                </Button>
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

              {dialog}
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      <Footer />
    </DashboardLayout>
  );
}

export default Tables;
