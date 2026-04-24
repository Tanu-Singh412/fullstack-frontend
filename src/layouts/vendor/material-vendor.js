import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PhoneIcon from "@mui/icons-material/Phone";
import BusinessIcon from "@mui/icons-material/Business";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
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

  const fetchVendors = () => {
    if (!cleanCategory) return;
    fetch(`https://fullstack-project-1-n510.onrender.com/api/vendors?category=${cleanCategory}`)
      .then((res) => res.json())
      .then((res) => setVendors(res.data || []))
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    fetchVendors();
  }, [cleanCategory]);

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Prevent navigating to detail page
    if (!window.confirm("Are you sure you want to delete this vendor?")) return;
    
    try {
      const res = await fetch(`https://fullstack-project-1-n510.onrender.com/api/vendors/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchVendors();
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <MDBox sx={{ pt: 6, pb: 3, px: 3 }}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <MDBox>
            <MDTypography variant="h4" fontWeight="bold" sx={{ color: "#1e293b", letterSpacing: -0.5 }}>Vendors Directory</MDTypography>
            <MDTypography variant="caption" sx={{ color: "#64748b", fontWeight: "bold" }}>Verified suppliers for {categoryId}</MDTypography>
          </MDBox>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{
              bgcolor: "#1e293b",
              color: "#fff",
              '&:hover': { bgcolor: "#0f172a" },
              borderRadius: 2,
              px: 3,
              textTransform: "none",
              fontWeight: "bold",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
            }}
          >
            Back to Categories
          </Button>
        </MDBox>

        {/* HERO SECTION */}
        <Box
          sx={{
            mb: 5,
            p: 5,
            borderRadius: 6,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "linear-gradient(135deg, #3b82f6, #1d4ed8)", // Sapphire to Deep Blue
            color: "white",
            boxShadow: "0 20px 50px rgba(59, 130, 246, 0.25)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box sx={{ position: "absolute", top: -80, right: -80, width: 250, height: 250, borderRadius: "50%", background: "rgba(255, 255, 255, 0.1)", zIndex: 0 }} />
          <Box sx={{ position: "absolute", bottom: -40, left: "20%", width: 120, height: 120, borderRadius: "50%", background: "rgba(255, 255, 255, 0.05)", zIndex: 0 }} />

          <Box sx={{ position: "relative", zIndex: 1, color: "#fff" }}>
            <Typography variant="h2" fontWeight="900" sx={{ mb: 1, textTransform: "capitalize", letterSpacing: -2, color: "#fff" }}>
              {categoryId}
            </Typography>
            <Typography variant="h5" sx={{ opacity: 0.9, fontWeight: 500, color: "#fff" }}>
              Managing {vendors.length} Premium Suppliers
            </Typography>
          </Box>

          <Button
            variant="contained"
            onClick={() => navigate(`/add-vendor/${categoryId}`)}
            sx={{
              position: "relative",
              zIndex: 1,
              background: "#fff",
              color: "#1d4ed8",
              fontWeight: "900",
              borderRadius: 3,
              px: 5,
              py: 2,
              fontSize: "1rem",
              boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
              '&:hover': { background: '#f8fafc', transform: "translateY(-3px)", boxShadow: "0 15px 35px rgba(0,0,0,0.2)" },
              transition: "all 0.3s"
            }}
          >
            + Register Supplier
          </Button>
        </Box>

        {/* VENDOR GRID */}
        <Grid container spacing={4}>
          {vendors.length === 0 ? (
            <Box sx={{ width: '100%', textAlign: 'center', py: 10 }}>
              <BusinessIcon sx={{ fontSize: 80, color: "#e2e8f0", mb: 2 }} />
              <Typography variant="h5" color="text.secondary" fontWeight="bold">No vendors found</Typography>
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
                    transition: "all 0.4s",
                    border: "1px solid #f1f5f9",
                    position: "relative",
                    '&:hover': { transform: "translateY(-12px)", boxShadow: "0 30px 60px rgba(15, 23, 42, 0.15)", borderColor: "#3b82f6" },
                  }}
                >
                  {/* Delete Button */}
                  <IconButton 
                    onClick={(e) => handleDelete(e, v._id)}
                    sx={{ position: "absolute", top: 10, right: 10, zIndex: 10, bgcolor: "rgba(255,255,255,0.8)", color: "#ef4444", "&:hover": { bgcolor: "#fee2e2" } }}
                    size="small"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>

                  <Box
                    sx={{
                      height: 160,
                      background: v.image ? `url(${v.image}) center/cover` : "linear-gradient(135deg, #f1f5f9, #e2e8f0)",
                      position: "relative",
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}
                  >
                    {!v.image && <BusinessIcon sx={{ fontSize: 60, color: "#cbd5e1", opacity: 0.5 }} />}
                    <Avatar sx={{ position: "absolute", bottom: -30, left: 24, width: 70, height: 70, bgcolor: '#3b82f6', border: "4px solid #fff", boxShadow: "0 8px 16px rgba(0,0,0,0.1)", fontSize: "1.8rem", fontWeight: "bold" }}>
                      {v.vendorName?.charAt(0).toUpperCase()}
                    </Avatar>
                  </Box>

                  <CardContent sx={{ pt: 5, pb: 3, px: 3 }}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h4" fontWeight="bold" sx={{ color: "#1e293b" }}>{v.vendorName}</Typography>
                      <Typography variant="caption" sx={{ color: "#64748b", fontWeight: "bold" }}>ID: {v._id?.slice(-8).toUpperCase()}</Typography>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ color: "#334155", display: "flex", alignItems: "center", mb: 1.5, gap: 1.5 }}>
                        <PhoneIcon sx={{ fontSize: 20, color: "#3b82f6" }} /> {v.phone}
                      </Typography>
                      <Typography variant="body1" sx={{ color: "#64748b", display: "flex", alignItems: "center", gap: 1.5 }}>
                        <BusinessIcon sx={{ fontSize: 20, color: "#3b82f6" }} /> {v.company || "N/A"}
                      </Typography>
                    </Box>

                    <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ pt: 2, borderTop: "1px solid #f1f5f9" }}>
                      <Chip label="Verified" size="small" sx={{ bgcolor: "#dcfce7", color: "#166534", fontWeight: "900", borderRadius: "6px" }} />
                      <Typography variant="button" sx={{ fontWeight: '900', color: "#3b82f6", display: "flex", alignItems: "center", gap: 0.5 }}>
                        VIEW PROFILE <ArrowForwardIcon sx={{ fontSize: 16 }} />
                      </Typography>
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
