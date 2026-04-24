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
import AddCircleIcon from "@mui/icons-material/AddCircle";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import VerifiedIcon from "@mui/icons-material/Verified";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

const AVATAR_COLORS = [
  "linear-gradient(135deg, #f97316, #fb923c)",
  "linear-gradient(135deg, #2563eb, #60a5fa)",
  "linear-gradient(135deg, #16a34a, #4ade80)",
  "linear-gradient(135deg, #9333ea, #c084fc)",
  "linear-gradient(135deg, #dc2626, #f87171)",
  "linear-gradient(135deg, #0891b2, #67e8f9)",
];

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
    e.stopPropagation();
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

      <MDBox sx={{ pt: 6, pb: 4, px: 3 }}>

        {/* ========== HERO BANNER ========== */}
        <Box
          sx={{
            mb: 5,
            p: { xs: 3, md: 5 },
            borderRadius: 5,
            background: "linear-gradient(135deg, #2563eb 0%, #16a34a 60%, #f97316 100%)",
            color: "white",
            boxShadow: "0 20px 60px rgba(37, 99, 235, 0.35)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box sx={{ position: "absolute", top: -80, right: -80, width: 260, height: 260, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
          <Box sx={{ position: "absolute", bottom: -50, left: "15%", width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 3, position: "relative", zIndex: 1 }}>
            <Box>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Button
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate(-1)}
                  sx={{
                    background: "rgba(255,255,255,0.2)",
                    color: "#fff",
                    borderRadius: 3,
                    textTransform: "none",
                    fontWeight: "bold",
                    px: 2, py: 0.8,
                    "&:hover": { background: "rgba(255,255,255,0.35)" },
                  }}
                >
                  Back
                </Button>
              </Box>
              <Typography variant="h3" fontWeight="900" sx={{ color: "#fff", letterSpacing: -1, textTransform: "capitalize", lineHeight: 1.1, mb: 0.5 }}>
                {categoryId}
              </Typography>
              <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>
                <PeopleAltIcon sx={{ fontSize: 16, verticalAlign: "middle", mr: 0.5 }} />
                {vendors.length} Premium Suppliers · Verified Vendors
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<AddCircleIcon />}
              onClick={() => navigate(`/add-vendor/${categoryId}`)}
              sx={{
                background: "#fff",
                color: "#2563eb",
                fontWeight: "900",
                borderRadius: 4,
                px: 4,
                py: 2,
                fontSize: "0.95rem",
                textTransform: "none",
                boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                "&:hover": {
                  background: "#eff6ff",
                  transform: "translateY(-4px)",
                  boxShadow: "0 18px 40px rgba(0,0,0,0.2)",
                },
                transition: "all 0.3s",
              }}
            >
              + Register Supplier
            </Button>
          </Box>
        </Box>

        {/* ========== VENDOR GRID ========== */}
        <Grid container spacing={4}>
          {vendors.length === 0 ? (
            <Box sx={{ width: "100%", textAlign: "center", py: 10 }}>
              <BusinessIcon sx={{ fontSize: 80, color: "#e2e8f0", mb: 2 }} />
              <Typography variant="h5" color="text.secondary" fontWeight="bold">No vendors found</Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                Click "Register Supplier" to add your first vendor
              </Typography>
            </Box>
          ) : (
            vendors.map((v, idx) => {
              const colorSet = AVATAR_COLORS[idx % AVATAR_COLORS.length];
              return (
                <Grid item xs={12} sm={6} md={4} key={v._id}>
                  <Card
                    sx={{
                      height: "100%",
                      borderRadius: 5,
                      transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
                      border: "2px solid #f1f5f9",
                      position: "relative",
                      overflow: "hidden",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                      "&:hover": {
                        transform: "translateY(-14px)",
                        boxShadow: "0 30px 60px rgba(37,99,235,0.2)",
                        borderColor: "#2563eb",
                        "& .vendor-cta": { opacity: 1, transform: "translateY(0)" },
                      },
                    }}
                  >
                    {/* Delete Button */}
                    <IconButton
                      onClick={(e) => handleDelete(e, v._id)}
                      sx={{
                        position: "absolute", top: 12, right: 12, zIndex: 10,
                        bgcolor: "#fff",
                        color: "#dc2626",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                        "&:hover": { bgcolor: "#fef2f2", transform: "scale(1.15)" },
                        transition: "all 0.2s",
                        width: 36, height: 36,
                      }}
                      size="small"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>

                    {/* Header banner */}
                    <Box
                      sx={{
                        height: 120,
                        background: v.image ? `url(${v.image}) center/cover no-repeat` : colorSet,
                        position: "relative",
                      }}
                    >
                      {!v.image && (
                        <Box sx={{
                          position: "absolute", inset: 0,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <BusinessIcon sx={{ fontSize: 48, color: "rgba(255,255,255,0.4)" }} />
                        </Box>
                      )}
                      {/* Avatar */}
                      <Avatar
                        sx={{
                          position: "absolute",
                          bottom: -28, left: 24,
                          width: 64, height: 64,
                          background: colorSet,
                          border: "4px solid #fff",
                          boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                          fontSize: "1.6rem", fontWeight: "bold",
                        }}
                      >
                        {v.vendorName?.charAt(0).toUpperCase()}
                      </Avatar>
                    </Box>

                    <CardContent sx={{ pt: 5, pb: 3, px: 3 }}>
                      <Box sx={{ mb: 2 }}>
                        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                          <Typography variant="h5" fontWeight="900" sx={{ color: "#1e293b" }}>
                            {v.vendorName}
                          </Typography>
                          <VerifiedIcon sx={{ fontSize: 18, color: "#2563eb" }} />
                        </Box>
                        <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: "bold", letterSpacing: 0.5 }}>
                          ID: {v._id?.slice(-8).toUpperCase()}
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 3, display: "flex", flexDirection: "column", gap: 1.5 }}>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Box sx={{ bgcolor: "#eff6ff", borderRadius: 2, p: 0.7, display: "flex" }}>
                            <PhoneIcon sx={{ fontSize: 16, color: "#2563eb" }} />
                          </Box>
                          <Typography variant="body2" fontWeight="600" sx={{ color: "#334155" }}>{v.phone || "N/A"}</Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Box sx={{ bgcolor: "#f0fdf4", borderRadius: 2, p: 0.7, display: "flex" }}>
                            <BusinessIcon sx={{ fontSize: 16, color: "#16a34a" }} />
                          </Box>
                          <Typography variant="body2" fontWeight="600" sx={{ color: "#334155" }}>{v.company || "N/A"}</Typography>
                        </Box>
                      </Box>

                      {/* CTA Strip */}
                      <Box
                        sx={{
                          pt: 2,
                          borderTop: "1px solid #f1f5f9",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Chip
                          label="✓ Verified"
                          size="small"
                          sx={{
                            background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
                            color: "#15803d",
                            fontWeight: "900",
                            border: "1px solid #86efac",
                            borderRadius: "8px",
                          }}
                        />
                        <Button
                          size="small"
                          endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                          onClick={() => navigate(`/vendor/${v._id}`)}
                          sx={{
                            background: "linear-gradient(135deg, #2563eb, #f97316)",
                            color: "#fff",
                            fontWeight: "900",
                            borderRadius: 3,
                            px: 2.5,
                            py: 0.8,
                            textTransform: "none",
                            fontSize: "0.8rem",
                            "&:hover": {
                              background: "linear-gradient(135deg, #1d4ed8, #ea580c)",
                              transform: "translateX(4px)",
                            },
                            transition: "all 0.25s",
                            boxShadow: "0 4px 15px rgba(37,99,235,0.3)",
                          }}
                        >
                          View Profile
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })
          )}
        </Grid>
      </MDBox>

      <Footer />
    </DashboardLayout>
  );
}

export default VendorList;
