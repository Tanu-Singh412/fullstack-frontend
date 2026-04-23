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
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

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
      image: finalImage
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

      <Box sx={{ pt: 6, pb: 3, px: 3 }}>
        {/* HEADER */}
        <Box
          sx={{
            mb: 4,
            p: 4,
            borderRadius: 4,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "linear-gradient(135deg, #0284c7, #0d9488)", // Sapphire to Teal
            color: "white",
            boxShadow: "0 10px 40px rgba(13, 148, 136, 0.2)",
          }}
        >
          <Box>
            <Typography variant="h4" fontWeight="bold" color="#fff" sx={{ textShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
              Supplier Ecosystem
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5, fontWeight: "medium", color: "#fff" }}>
              Categorized procurement and resource tracking
            </Typography>
          </Box>

          <Button
            variant="contained"
            onClick={() => handleOpen()}
            sx={{
              background: "#fff",
              color: "#0d9488",
              fontWeight: "900",
              borderRadius: "12px",
              px: 4,
              py: 1.5,
              fontSize: "0.9rem",
              textTransform: "uppercase",
              letterSpacing: 1,
              '&:hover': { background: '#f0fdfa', transform: 'scale(1.02)' },
              boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
            }}
          >
            + Create Category
          </Button>
        </Box>

        {/* CATEGORY GRID */}
        <Grid container spacing={4}>
          {categories.map((c) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={c._id}>
              <Card
                sx={{
                  position: "relative",
                  height: "100%",
                  borderRadius: 4,
                  overflow: "hidden",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: "pointer",
                  '&:hover': {
                    transform: "translateY(-10px)",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
                    '& .category-actions': { opacity: 1 }
                  },
                }}
              >
                {/* Image Background */}
                <Box
                  onClick={() => navigate(`/vendor/category/${c.name}`)}
                  sx={{
                    height: 180,
                    background: c.image
                      ? `url(${c.image}) center/cover`
                      : `linear-gradient(135deg, ${["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444"][categories.indexOf(c) % 5]}, ${["#2563eb", "#059669", "#7c3aed", "#d97706", "#dc2626"][categories.indexOf(c) % 5]})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white"
                  }}
                >
                  {!c.image && (
                    <Typography variant="h1" sx={{ opacity: 0.3, fontWeight: 900, color: "#fff" }}>
                      {c.name?.charAt(0).toUpperCase()}
                    </Typography>
                  )}
                </Box>

                {/* Content */}
                <Box sx={{ p: 3, textAlign: "center", position: "relative" }}>
                  <Typography 
                    variant="h6" 
                    fontWeight="bold" 
                    onClick={() => navigate(`/vendor/category/${c.name}`)}
                    sx={{ 
                      mb: 0.5, 
                      color: "#1e293b", 
                      cursor: "pointer",
                      "&:hover": { color: "#3b82f6" } 
                    }}
                  >
                    {c.name}
                  </Typography>
                  <Typography variant="caption" sx={{ textTransform: "uppercase", letterSpacing: 1, color: "#64748b", fontWeight: "bold" }}>
                    Verified Category
                  </Typography>

                  {/* Actions Overlay */}
                  <Box
                    className="category-actions"
                    sx={{
                      position: "absolute",
                      top: -160,
                      right: 10,
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                      opacity: 0,
                      transition: "0.3s",
                    }}
                  >
                    <IconButton
                      size="small"
                      sx={{ bgcolor: "rgba(255,255,255,0.9)", '&:hover': { bgcolor: "#fff" } }}
                      onClick={(e) => { e.stopPropagation(); handleOpen(c); }}
                    >
                      <EditIcon fontSize="small" color="info" />
                    </IconButton>
                    <IconButton
                      size="small"
                      sx={{ bgcolor: "rgba(255,255,255,0.9)", '&:hover': { bgcolor: "#fff" } }}
                      onClick={(e) => { e.stopPropagation(); handleDelete(c._id); }}
                    >
                      <DeleteIcon fontSize="small" color="error" />
                    </IconButton>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* DIALOG */}
      <Dialog open={open} onClose={() => setOpen(false)} PaperProps={{ sx: { borderRadius: 4, width: 400 } }}>
        <Box sx={{ p: 4 }}>
          <Typography variant="h5" mb={3} fontWeight="bold">
            {editId ? "Edit Category" : "Add New Category"}
          </Typography>

          <TextField
            fullWidth
            label="Category Name"
            placeholder="e.g. Cement, Steel, Electrical"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 3 }}
          />

          <Box
            sx={{
              border: "2px dashed #e2e8f0",
              borderRadius: 3,
              p: 3,
              textAlign: "center",
              cursor: "pointer",
              transition: "0.3s",
              '&:hover': { borderColor: "#3b82f6", bgcolor: "#f8fafc" },
              position: "relative",
              mb: 3
            }}
            onClick={() => document.getElementById("cat-img").click()}
          >
            {preview ? (
              <Box sx={{ width: "100%", height: 120, borderRadius: 2, overflow: "hidden" }}>
                <img src={preview} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </Box>
            ) : (
              <Box>
                <CloudUploadIcon sx={{ fontSize: 40, color: "#94a3b8", mb: 1 }} />
                <Typography variant="body2" color="textSecondary">
                  Click to upload category photo
                </Typography>
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

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setOpen(false)}
              sx={{ py: 1.5, borderRadius: 2, bgcolor: "darkred", color: "#fff" }}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSave}
              sx={{
                py: 1.5,
                borderRadius: 2,
                background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                color: "#fff",
                '&:hover': { background: "linear-gradient(135deg, #2563eb, #1d4ed8)" }
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