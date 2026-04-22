

import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

// ================= PREMIUM VENDOR LIST UI =================

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function VendorList() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);

  const cleanCategory = categoryId?.trim().toLowerCase();

  useEffect(() => {
    if (!cleanCategory) return;

    fetch(`https://fullstack-project-1-n510.onrender.com/api/vendors?category=${cleanCategory}`)
      .then((res) => res.json())
      .then((res) => setVendors(res.data || []))
      .catch((err) => console.log(err));
  }, [cleanCategory]);

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <Box sx={{ pt: 6, pb: 3, px: 2 }}>
        {/* HEADER */}
        <Box
          sx={{
            mb: 4,
            p: 3,
            borderRadius: 4,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "linear-gradient(135deg, #1565c0, #42a5f5)",
            color: "white",
            boxShadow: 5,
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight="bold">
              {categoryId} Vendors
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              {vendors.length} total vendors
            </Typography>
          </Box>

          <Button
            variant="contained"
            onClick={() => navigate(`/add-vendor/${categoryId}`)}
            sx={{
              background: "#fff",
              color: "#1565c0",
              fontWeight: "bold",
              borderRadius: 3,
              px: 3,
              '&:hover': { background: '#e3f2fd' },
            }}
          >
            + Add Vendor
          </Button>
        </Box>

        {/* GRID */}
        <Grid container spacing={3}>
          {vendors.length === 0 ? (
            <Box sx={{ width: '100%', textAlign: 'center', mt: 8 }}>
              <Typography variant="h6" color="text.secondary">
                No vendors found
              </Typography>
            </Box>
          ) : (
            vendors.map((v) => (
              <Grid item xs={12} sm={6} md={4} key={v._id}>
                <Card
                  onClick={() => navigate(`/vendor/${v._id}`)}
                  sx={{
                    cursor: "pointer",
                    borderRadius: 4,
                    transition: "all 0.35s ease",
                    boxShadow: 2,
                    overflow: "hidden",
                    position: "relative",
                    background: '#fff',
                    '&:hover': {
                      transform: "translateY(-10px)",
                      boxShadow: 10,
                    },
                  }}
                >
                  {/* Accent Gradient */}
                  <Box
                    sx={{
                      height: 6,
                      background: "linear-gradient(90deg, #1565c0, #42a5f5)",
                    }}
                  />

                  <CardContent>
                    {/* HEADER */}
                    <Box display="flex" alignItems="center" mb={2}>
                      <Avatar
                        sx={{
                          mr: 2,
                          bgcolor: '#1565c0',
                          width: 50,
                          height: 50,
                          fontSize: 20,
                          boxShadow: 2,
                        }}
                      >
                        {v.vendorName?.charAt(0).toUpperCase()}
                      </Avatar>

                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {v.vendorName}
                        </Typography>
                        <Typography variant="caption" color="#000 ">
                          Vendor ID: {v._id?.slice(-5)}
                        </Typography>
                      </Box>
                    </Box>

                    {/* DETAILS */}
                    <Typography variant="body2" color="#000">
                      📞 {v.phone}
                    </Typography>

                    {/* FOOTER */}
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mt={2}
                    >
                      <Chip
                        label={v.company}
                        size="small"
                        sx={{ borderRadius: 2 }}
                      />

                      <Button size="small" sx={{ fontWeight: 'bold' }}>
                        View →
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Box>

      <Footer />
    </DashboardLayout>
  );
}

export default VendorList;
