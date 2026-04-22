import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";

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

      <Box sx={{ pt: 6, pb: 3, px: 2 }}>
        {/* HEADER */}
        <Box
          sx={{
            mb: 4,
            p: 3,
            borderRadius: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "linear-gradient(135deg, #1976d2, #42a5f5)",
            color: "white",
            boxShadow: 4,
          }}
        >
          <Typography variant="h5" fontWeight="bold" color="#fff">
            Vendor Categories
          </Typography>

          <Button
            variant="contained"
            onClick={() => setOpen(true)}
            sx={{
              background: "#fff",
              color: "#1976d2",
              fontWeight: "bold",
              borderRadius: 2,
              px: 3,
              '&:hover': { background: '#e3f2fd' },
            }}
          >
            + Add Category
          </Button>
        </Box>

        {/* CATEGORY GRID */}
        <Grid container spacing={3}>
          {categories.map((c) => (
            <Grid item xs={12} sm={6} md={3} key={c._id}>
              <Card
                onClick={() => navigate(`/vendor/category/${c.name}`)}
                sx={{
                  p: 3,
                  textAlign: "center",
                  cursor: "pointer",
                  borderRadius: 3,
                  transition: "0.3s",
                  boxShadow: 3,
                  '&:hover': {
                    transform: "translateY(-6px)",
                    boxShadow: 6,
                  },
                }}
              >
                <Avatar
                  sx={{
                    mx: "auto",
                    mb: 2,
                    bgcolor: "#1976d2",
                    width: 56,
                    height: 56,
                    fontSize: 22,
                  }}
                >
                  {c.name?.charAt(0).toUpperCase()}
                </Avatar>

                <Typography variant="h6" fontWeight="bold">
                  {c.name}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* DIALOG */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <Box sx={{ p: 4, width: 320 }}>
          <Typography variant="h6" mb={2} fontWeight="bold">
            Add Category
          </Typography>

          <TextField
            fullWidth
            label="Category Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Button
            fullWidth
            sx={{ mt: 3 }}
            variant="contained"
            onClick={addCategory}
          >
            Save Category
          </Button>
        </Box>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}

export default VendorHome;