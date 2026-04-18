import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import TextField from "@mui/material/TextField";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// ✅ IMPORTANT
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function VendorHome() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    fetch("https://fullstack-project-1-n510.onrender.com/api/vendor-categories")
      .then((res) => res.json())
      .then((data) => setCategories(data));
  }, []);

  const addCategory = async () => {
    if (!name) return alert("Enter category name");

    const res = await fetch(
      "https://fullstack-project-1-n510.onrender.com/api/vendor-categories",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      }
    );

    const data = await res.json();
    setCategories([...categories, data]);

    setOpen(false);
    setName("");
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />

      {/* ✅ HEADER (BLUE BAR) */}
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
                <MDTypography variant="h6" color="white">
                  Vendor Categories
                </MDTypography>

                <Button
                  variant="contained"
                  onClick={() => setOpen(true)}
                  sx={{
                    background: "#fff",
                    color: "#1976d2",
                    fontWeight: "600",
                  }}
                >
                  + Add Category
                </Button>
              </MDBox>

              {/* ✅ CATEGORY GRID */}
              <MDBox p={3}>
                <Grid container spacing={3}>
                  {categories.map((c) => (
                    <Grid item xs={12} md={3} key={c._id}>
                      <Card
                        sx={{
                          p: 3,
                          cursor: "pointer",
                          textAlign: "center",
                          color:"#fff"
                         
                        }}
                        onClick={() =>
                          navigate(`/vendor/category/${c._id}`)
                        }
                      >
                        <MDTypography variant="h6">
                          {c.name}
                        </MDTypography>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      {/* ✅ DIALOG */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <MDBox p={3} width="300px">
          <MDTypography mb={2}>Add Category</MDTypography>

          <TextField
            fullWidth
            label="Category Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Button
            fullWidth
            sx={{ mt: 2 , color: "#fff"}}

            variant="contained"
            onClick={addCategory}
          >
            Save
          </Button>
        </MDBox>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}

export default VendorHome;