import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import BusinessIcon from "@mui/icons-material/Business";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

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

      <MDBox sx={{ pt: 6, pb: 3, px: 3 }}>
        <MDBox display="flex" alignItems="center" mb={4} gap={2}>
            <Button 
                variant="contained" 
                startIcon={<ArrowBackIcon />} 
                onClick={() => navigate(-1)}
                sx={{ bgcolor: "#1e293b", color: "#fff", '&:hover': {bgcolor: "#000"} }}
            >
                Back
            </Button>
            <MDTypography variant="h4" fontWeight="bold">Vendors Directory</MDTypography>
        </MDBox>
        {/* HERO SECTION */}
        <Box
          sx={{
            mb: 5,
            p: 5,
            borderRadius: 5,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "linear-gradient(135deg, #1e293b, #3b82f6)",
            color: "white",
            boxShadow: "0 20px 40px rgba(59, 130, 246, 0.2)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative Circle */}
          <Box sx={{ 
            position: "absolute", top: -50, right: -50, width: 200, height: 200, 
            borderRadius: "50%", background: "rgba(59, 130, 246, 0.1)", zIndex: 0 
          }} />

          <Box sx={{ position: "relative", zIndex: 1, color:"#fff" }}>
            <Typography variant="h3" fontWeight="900" sx={{ mb: 1, textTransform: "capitalize", letterSpacing: -1 }}>
              {categoryId} 
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.7, fontWeight: 400 }}>
              Discover & manage {vendors.length} certified suppliers
            </Typography>
          </Box>

          <Button
            variant="contained"
            onClick={() => navigate(`/add-vendor/${categoryId}`)}
            sx={{
              position: "relative",
              zIndex: 1,
              background: "#fff",
              color: "#0f172a",
              fontWeight: "bold",
              borderRadius: 3,
              px: 4,
              py: 2,
              boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
              '&:hover': { background: '#f8fafc', transform: "translateY(-2px)" },
            }}
          >
            + Register Vendor
          </Button>
        </Box>

        {/* VENDOR GRID */}
        <Grid container spacing={4}>
          {vendors.length === 0 ? (
            <Box sx={{ width: '100%', textAlign: 'center', py: 10 }}>
              <BusinessIcon sx={{ fontSize: 80, color: "#e2e8f0", mb: 2 }} />
              <Typography variant="h5" color="text.secondary" fontWeight="bold">
                No vendors found for this category
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Start by adding your first vendor using the button above.
              </Typography>
            </Box>
          ) : (
            vendors.map((v) => (
              <Grid item xs={12} sm={6} md={4} key={v._id}>
                <Card
                  onClick={() => navigate(`/vendor/${v._id}`)}
                  sx={{
                    height: "100%",
                    cursor: "pointer",
                    borderRadius: 5,
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    border: "1px solid #f1f5f9",
                    '&:hover': {
                      transform: "translateY(-12px)",
                      boxShadow: "0 30px 60px rgba(15, 23, 42, 0.15)",
                      borderColor: "#3b82f6",
                    },
                  }}
                >
                  {/* Vendor Image / Header */}
                  <Box
                    sx={{
                      height: 160,
                      background: v.image 
                        ? `url(${v.image}) center/cover`
                        : "linear-gradient(135deg, #f1f5f9, #e2e8f0)",
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    {!v.image && (
                       <BusinessIcon sx={{ fontSize: 60, color: "#cbd5e1", opacity: 0.5 }} />
                    )}
                    
                    {/* Floating Avatar */}
                    <Avatar
                      sx={{
                        position: "absolute",
                        bottom: -30,
                        left: 24,
                        width: 70,
                        height: 70,
                        bgcolor: '#3b82f6',
                        border: "4px solid #fff",
                        boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                        fontSize: "1.8rem",
                        fontWeight: "bold",
                        color: "#fff"
                      }}
                    >
                      {v.vendorName?.charAt(0).toUpperCase()}
                    </Avatar>
                  </Box>

                  <CardContent sx={{ pt: 5, pb: 3, px: 3 }}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.5 }}>
                        {v.vendorName}
                      </Typography>
                      <Box display="flex" gap={1} alignItems="center">
                        <Typography variant="xxs" sx={{ color: "#64748b", display: "flex", alignItems: "center", gap: 0.5 }}>
                            <BusinessIcon sx={{ fontSize: 12 }} /> ID: {v._id?.slice(-8).toUpperCase()}
                        </Typography>
                        <Typography variant="xxs" sx={{ color: "#94a3b8", fontWeight: "bold" }}>
                            • {new Date(v.createdAt).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" sx={{ color: "#334155", display: "flex", alignItems: "center", mb: 1, gap: 1.5 }}>
                        <PhoneIcon sx={{ fontSize: 18, color: "#3b82f6" }} /> 
                        <span style={{ fontWeight: 600 }}>{v.phone}</span>
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#64748b", display: "flex", alignItems: "center", gap: 1.5 }}>
                        <BusinessIcon sx={{ fontSize: 18, color: "#3b82f6" }} />
                        {v.company || "No company specified"}
                      </Typography>
                    </Box>

                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ pt: 2, borderTop: "1px solid #f1f5f9" }}
                    >
                      <Chip
                        label="Verified Supplier"
                        size="small"
                        sx={{ 
                          bgcolor: "#f0fdf4", 
                          color: "#16a34a", 
                          fontWeight: "bold",
                          borderRadius: 2,
                          fontSize: "0.7rem",
                          border: "1px solid #dcfce7"
                        }}
                      />

                      <Button 
                        size="small" 
                        endIcon={<ArrowForwardIcon />}
                        sx={{ fontWeight: 'bold', color: "#3b82f6" }}
                      >
                        Profile
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </MDBox>

      <Footer />
    </DashboardLayout>
  );
}

export default VendorList;
