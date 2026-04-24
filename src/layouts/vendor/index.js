import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import StorefrontIcon from "@mui/icons-material/Storefront";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import CategoryIcon from "@mui/icons-material/Category";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

const COLORS = [
  { bg: "linear-gradient(135deg, #f97316, #fb923c)", icon: "🏗️" },
  { bg: "linear-gradient(135deg, #2563eb, #60a5fa)", icon: "🔩" },
  { bg: "linear-gradient(135deg, #16a34a, #4ade80)", icon: "🌿" },
  { bg: "linear-gradient(135deg, #9333ea, #c084fc)", icon: "⚡" },
  { bg: "linear-gradient(135deg, #dc2626, #f87171)", icon: "🔧" },
  { bg: "linear-gradient(135deg, #0891b2, #67e8f9)", icon: "💧" },
];

function VendorHome() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");

  const fetchCategories = () => {
    fetch("https://fullstack-project-1-n510.onrender.com/api/vendor-categories")
      .then((res) => res.json())
      .then((data) => setCategories(data));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpen = (cat = null) => {
    if (cat) {
      setEditId(cat._id);
      setName(cat.name);
      setPreview(cat.image || "");
    } else {
      setEditId(null);
      setName("");
      setImage(null);
      setPreview("");
    }
    setOpen(true);
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSave = async () => {
    if (!name) return alert("Enter category name");

    let finalImage = preview;

    if (image) {
      finalImage = await convertToBase64(image);
    }

    const payload = {
      name,
      image: finalImage,
    };

    const url = editId
      ? `https://fullstack-project-1-n510.onrender.com/api/vendor-categories/${editId}`
      : "https://fullstack-project-1-n510.onrender.com/api/vendor-categories";

    const method = editId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      fetchCategories();
      setOpen(false);
      setName("");
      setImage(null);
      setPreview("");
      setEditId(null);
    } else {
      alert("Error saving category");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    const res = await fetch(`https://fullstack-project-1-n510.onrender.com/api/vendor-categories/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      fetchCategories();
    } else {
      alert("Error deleting category");
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <Box sx={{ pt: 6, pb: 4, px: 3 }}>

        {/* ========== HERO HEADER ========== */}
        <Box
          sx={{
            mb: 5,
            p: { xs: 3, md: 5 },
            borderRadius: 5,
            background: "linear-gradient(135deg, #f97316 0%, #ea580c 40%, #2563eb 100%)",
            color: "white",
            boxShadow: "0 20px 60px rgba(249, 115, 22, 0.35)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* decorative circles */}
          <Box sx={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
          <Box sx={{ position: "absolute", bottom: -40, left: "30%", width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 3, position: "relative", zIndex: 1 }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Box sx={{ bgcolor: "rgba(255,255,255,0.2)", borderRadius: 3, p: 2, display: "flex" }}>
                <StorefrontIcon sx={{ fontSize: 40, color: "#fff" }} />
              </Box>
              <Box>
                <Typography variant="h3" fontWeight="900" sx={{ color: "#fff", letterSpacing: -1, lineHeight: 1.1 }}>
                  Supplier Ecosystem
                </Typography>
                <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.85)", mt: 0.5, fontWeight: 500 }}>
                  {categories.length} Active Categories · Categorized Procurement
                </Typography>
              </Box>
            </Box>

            <Button
              variant="contained"
              startIcon={<AddBusinessIcon />}
              onClick={() => handleOpen()}
              sx={{
                background: "#fff",
                color: "#f97316",
                fontWeight: "900",
                borderRadius: "14px",
                px: 4,
                py: 1.8,
                fontSize: "0.95rem",
                textTransform: "none",
                letterSpacing: 0.5,
                boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                "&:hover": {
                  background: "#fff7ed",
                  transform: "translateY(-3px)",
                  boxShadow: "0 15px 35px rgba(0,0,0,0.2)",
                },
                transition: "all 0.3s",
              }}
            >
              + Create Category
            </Button>
          </Box>
        </Box>

        {/* ========== STATS ROW ========== */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { label: "Total Categories", value: categories.length, color: "#f97316", bg: "#fff7ed", icon: <CategoryIcon /> },
            { label: "Active Suppliers", value: categories.length * 3 + "+", color: "#2563eb", bg: "#eff6ff", icon: <StorefrontIcon /> },
            { label: "Verified Vendors", value: categories.length * 2 + "+", color: "#16a34a", bg: "#f0fdf4", icon: <AddBusinessIcon /> },
          ].map((s, i) => (
            <Grid item xs={12} md={4} key={i}>
              <Card sx={{
                p: 3, borderRadius: 4,
                background: s.bg,
                border: `2px solid ${s.color}22`,
                boxShadow: `0 4px 20px ${s.color}15`,
                display: "flex", alignItems: "center", gap: 2,
              }}>
                <Box sx={{ bgcolor: s.color, borderRadius: 3, p: 1.5, color: "#fff", display: "flex" }}>{s.icon}</Box>
                <Box>
                  <Typography variant="h4" fontWeight="900" sx={{ color: s.color, lineHeight: 1 }}>{s.value}</Typography>
                  <Typography variant="caption" fontWeight="bold" sx={{ color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>{s.label}</Typography>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* ========== CATEGORY GRID ========== */}
        {categories.length === 0 ? (
          <Box sx={{ py: 10, textAlign: "center" }}>
            <CategoryIcon sx={{ fontSize: 80, color: "#e2e8f0", mb: 2 }} />
            <Typography variant="h5" color="text.secondary" fontWeight="bold">No categories yet</Typography>
            <Typography variant="body2" color="text.secondary">Click "Create Category" to add your first supplier category</Typography>
          </Box>
        ) : (
          <Grid container spacing={4}>
            {categories.map((c, idx) => {
              const colorSet = COLORS[idx % COLORS.length];
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={c._id}>
                  <Card
                    sx={{
                      position: "relative",
                      height: "100%",
                      borderRadius: 5,
                      overflow: "hidden",
                      transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
                      cursor: "pointer",
                      border: "2px solid transparent",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                      "&:hover": {
                        transform: "translateY(-12px)",
                        boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
                        border: "2px solid #f97316",
                        "& .cat-actions": { opacity: 1, transform: "translateY(0)" },
                        "& .cat-image-overlay": { opacity: 1 },
                      },
                    }}
                  >
                    {/* Image / Color Background */}
                    <Box
                      onClick={() => navigate(`/vendor/category/${c.name}`)}
                      sx={{
                        height: 200,
                        background: c.image
                          ? `url(${c.image}) center/cover no-repeat`
                          : colorSet.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                      }}
                    >
                      {/* Overlay on hover */}
                      <Box
                        className="cat-image-overlay"
                        sx={{
                          position: "absolute",
                          inset: 0,
                          background: "rgba(0,0,0,0.25)",
                          opacity: 0,
                          transition: "0.3s",
                        }}
                      />

                      {!c.image && (
                        <Typography sx={{ fontSize: 60, position: "relative", zIndex: 1 }}>
                          {colorSet.icon}
                        </Typography>
                      )}

                      {/* Action Buttons - always visible on hover */}
                      <Box
                        className="cat-actions"
                        sx={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                          opacity: 0,
                          transform: "translateY(-10px)",
                          transition: "all 0.3s",
                          zIndex: 10,
                        }}
                      >
                        <IconButton
                          size="small"
                          sx={{
                            bgcolor: "#fff",
                            color: "#2563eb",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                            "&:hover": { bgcolor: "#eff6ff", transform: "scale(1.15)" },
                            width: 38, height: 38,
                          }}
                          onClick={(e) => { e.stopPropagation(); handleOpen(c); }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          sx={{
                            bgcolor: "#fff",
                            color: "#dc2626",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                            "&:hover": { bgcolor: "#fef2f2", transform: "scale(1.15)" },
                            width: 38, height: 38,
                          }}
                          onClick={(e) => { e.stopPropagation(); handleDelete(c._id); }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>

                    {/* Card Content */}
                    <Box sx={{ p: 3, textAlign: "center", background: "#fff" }}>
                      <Typography
                        variant="h6"
                        fontWeight="900"
                        onClick={() => navigate(`/vendor/category/${c.name}`)}
                        sx={{
                          color: "#1e293b",
                          cursor: "pointer",
                          mb: 1,
                          "&:hover": { color: "#f97316" },
                          transition: "color 0.2s",
                        }}
                      >
                        {c.name}
                      </Typography>
                      <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
                        <Box sx={{
                          px: 2, py: 0.5, borderRadius: 10,
                          background: "linear-gradient(135deg, #f97316, #2563eb)",
                          color: "#fff",
                          fontSize: "11px", fontWeight: 700, letterSpacing: 0.5,
                        }}>
                          ✓ Verified
                        </Box>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>

      {/* ========== DIALOG ========== */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 5,
            width: 440,
            overflow: "hidden",
            boxShadow: "0 30px 80px rgba(0,0,0,0.2)",
          }
        }}
      >
        {/* Dialog Header */}
        <Box sx={{
          background: "linear-gradient(135deg, #f97316, #2563eb)",
          p: 3,
          display: "flex", alignItems: "center", gap: 2,
        }}>
          <CategoryIcon sx={{ color: "#fff", fontSize: 28 }} />
          <Typography variant="h5" fontWeight="900" sx={{ color: "#fff" }}>
            {editId ? "Edit Category" : "New Category"}
          </Typography>
        </Box>

        <Box sx={{ p: 4 }}>
          <TextField
            fullWidth
            label="Category Name"
            placeholder="e.g. Cement, Steel, Electrical"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 3 }}
            InputProps={{ style: { borderRadius: 10, fontWeight: 700 } }}
          />

          {/* Upload Area */}
          <Box
            sx={{
              border: "2px dashed #f97316",
              borderRadius: 4,
              p: 3,
              textAlign: "center",
              cursor: "pointer",
              transition: "0.3s",
              background: "#fff7ed",
              "&:hover": { borderColor: "#2563eb", bgcolor: "#eff6ff" },
              mb: 3,
            }}
            onClick={() => document.getElementById("cat-img").click()}
          >
            {preview ? (
              <Box sx={{ width: "100%", height: 130, borderRadius: 3, overflow: "hidden" }}>
                <img src={preview} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="preview" />
              </Box>
            ) : (
              <Box>
                <CloudUploadIcon sx={{ fontSize: 45, color: "#f97316", mb: 1 }} />
                <Typography variant="body2" fontWeight="bold" sx={{ color: "#f97316" }}>
                  Click to upload category photo
                </Typography>
                <Typography variant="caption" color="text.secondary">PNG, JPG, WEBP supported</Typography>
              </Box>
            )}
            <input
              type="file"
              id="cat-img"
              hidden
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setImage(file);
                  setPreview(URL.createObjectURL(file));
                }
              }}
            />
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => setOpen(false)}
              sx={{
                py: 1.5,
                borderRadius: 3,
                background: "linear-gradient(135deg, #dc2626, #ef4444)",
                color: "#fff",
                fontWeight: "bold",
                textTransform: "none",
                fontSize: "0.95rem",
                "&:hover": { background: "linear-gradient(135deg, #b91c1c, #dc2626)", transform: "translateY(-2px)" },
                transition: "all 0.25s",
                boxShadow: "0 6px 20px rgba(220,38,38,0.3)",
              }}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSave}
              sx={{
                py: 1.5,
                borderRadius: 3,
                background: "linear-gradient(135deg, #f97316, #2563eb)",
                color: "#fff",
                fontWeight: "bold",
                textTransform: "none",
                fontSize: "0.95rem",
                "&:hover": { background: "linear-gradient(135deg, #ea580c, #1d4ed8)", transform: "translateY(-2px)" },
                transition: "all 0.25s",
                boxShadow: "0 6px 20px rgba(249,115,22,0.35)",
              }}
            >
              {editId ? "Update" : "Save Category"}
            </Button>
          </Box>
        </Box>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}

export default VendorHome;