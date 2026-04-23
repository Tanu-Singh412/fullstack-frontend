import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import EditIcon from "@mui/icons-material/Edit";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import BusinessIcon from "@mui/icons-material/Business";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
function VendorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vendor, setVendor] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [clients, setClients] = useState([]);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");

  const fetchVendor = () => {
    fetch(`https://fullstack-project-1-n510.onrender.com/api/vendors/${id}`)
      .then((res) => res.json())
      .then((res) => {
        setVendor(res.data);
        setPreview(res.data.image || "");
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchVendor();

    fetch("https://fullstack-project-1-n510.onrender.com/api/clients")
      .then((res) => res.json())
      .then((data) => setClients(data))
      .catch((err) => console.log(err));
  }, [id]);

  const handleChange = (e) => {
    setVendor({ ...vendor, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    const formData = new FormData();
    Object.keys(vendor).forEach(key => {
      if (key === "materials") {
        formData.append(key, JSON.stringify(vendor[key]));
      } else {
        formData.append(key, vendor[key]);
      }
    });

    if (image) {
      formData.append("image", image);
    }

    await fetch(`https://fullstack-project-1-n510.onrender.com/api/vendors/${id}`, {
      method: "PUT",
      body: formData,
    });

    setEditMode(false);
    setImage(null);
    fetchVendor();
  };

  const updateMaterial = (index, field, value) => {
    const updated = [...vendor.materials];
    if (field === "clientId") {
      const client = clients.find(c => c.clientId === value);
      updated[index].clientId = value;
      updated[index].clientName = client?.name || "";
    } else {
      updated[index][field] = value;
    }
    setVendor({ ...vendor, materials: updated });
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this vendor?")) return;
    await fetch(`https://fullstack-project-1-n510.onrender.com/api/vendors/${id}`, {
      method: "DELETE",
    });
    navigate("/vendor");
  };

  if (!vendor) return <p>Loading...</p>;

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <Box sx={{ p: 4 }}>
        <Grid container spacing={4}>
          {/* PROFILE SIDEBAR */}
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 4, textAlign: "center", borderRadius: 5, boxShadow: "0 10px 40px rgba(0,0,0,0.08)" }}>
              <Box sx={{ position: "relative", width: 150, height: 150, mx: "auto", mb: 3 }}>
                <Avatar src={preview} sx={{ width: "100%", height: "100%", bgcolor: '#3b82f6', fontSize: "3rem", border: "4px solid #fff", boxShadow: 2 }}>
                  {vendor.vendorName?.charAt(0)}
                </Avatar>
                {editMode && (
                  <IconButton component="label" sx={{ position: "absolute", bottom: 0, right: 0, bgcolor: "#fff", boxShadow: 1 }}>
                    <CloudUploadIcon fontSize="small" color="primary" />
                    <input type="file" hidden accept="image/*" onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setImage(file);
                        setPreview(URL.createObjectURL(file));
                      }
                    }} />
                  </IconButton>
                )}
              </Box>

              <Typography variant="h4" fontWeight="bold">{vendor.vendorName}</Typography>
              <Chip label={vendor.category?.toUpperCase()} size="small" sx={{ mt: 1, bgcolor: "#eff6ff", color: "#3b82f6", fontWeight: "bold" }} />

              <Divider sx={{ my: 3 }} />

              <Box sx={{ textAlign: "left", display: "flex", flexDirection: "column", gap: 2 }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <PhoneIcon color="info" fontSize="small" />
                  <Typography variant="body2">{vendor.phone}</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={2}>
                  <EmailIcon color="info" fontSize="small" />
                  <Typography variant="body2">{vendor.email || "N/A"}</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={2}>
                  <BusinessIcon color="info" fontSize="small" />
                  <Typography variant="body2">{vendor.company || "N/A"}</Typography>
                </Box>
                <Box display="flex" alignItems="start" gap={2}>
                  <LocationOnIcon color="info" fontSize="small" sx={{ mt: 0.5 }} />
                  <Typography variant="body2">{vendor.address || "N/A"}</Typography>
                </Box>
              </Box>

              <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
                {!editMode ? (
                  <Button fullWidth variant="contained" sx={{ bgcolor: "#3b82f6", color: "#fff" }} onClick={() => setEditMode(true)}>Edit</Button>
                ) : (
                  <Button fullWidth variant="contained" sx={{ bgcolor: "#10b981", color: "#fff" }} onClick={handleUpdate}>Save</Button>
                )}
                <Button variant="outlined" color="error" onClick={handleDelete}>Delete</Button>
              </Box>
            </Card>
          </Grid>

          {/* MATERIAL LIST WITH CLIENTS */}
          <Grid item xs={12} md={8}>
            <Card sx={{ p: 4, borderRadius: 5, boxShadow: "0 10px 40px rgba(0,0,0,0.05)" }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h5" fontWeight="bold">Material & Client Breakdown</Typography>
                {editMode && (
                  <Button variant="outlined" size="small" onClick={() => setVendor({ ...vendor, materials: [...vendor.materials, { materialName: "", rate: 0, quantity: 0, clientId: "", clientName: "" }] })}>
                    + Add Material Row
                  </Button>
                )}
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {vendor.materials?.map((m, i) => (
                  <MDBox key={i} sx={{ p: 3, borderRadius: 4, bgcolor: "#f8fafc", border: "1px solid #f1f5f9" }}>
                    {!editMode ? (
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={4}>
                          <Typography variant="subtitle2" color="textSecondary">Material</Typography>
                          <Typography fontWeight="bold">{m.materialName}</Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography variant="subtitle2" color="textSecondary">Associated Client</Typography>
                          <Chip label={m.clientName || "Direct / No Client"} size="small" sx={{ bgcolor: "#3b82f6", color: "#fff", fontWeight: "bold" }} />
                        </Grid>
                        <Grid item xs={6} md={2}>
                          <Typography variant="subtitle2" color="textSecondary">Rate</Typography>
                          <Typography fontWeight="bold">₹{m.rate}</Typography>
                        </Grid>
                        <Grid item xs={6} md={2}>
                          <Typography variant="subtitle2" color="textSecondary">Qty</Typography>
                          <Typography fontWeight="bold">{m.quantity}</Typography>
                        </Grid>
                      </Grid>
                    ) : (
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={4}>
                          <TextField fullWidth label="Material" value={m.materialName} onChange={(e) => updateMaterial(i, "materialName", e.target.value)} />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Select fullWidth value={m.clientId || ""} displayEmpty onChange={(e) => updateMaterial(i, "clientId", e.target.value)} sx={{ height: 45 }}>
                            <MenuItem value="" disabled>Select Client</MenuItem>
                            {clients.map((c) => (
                              <MenuItem key={c._id} value={c.clientId}>{c.name}</MenuItem>
                            ))}
                          </Select>
                        </Grid>
                        <Grid item xs={6} md={2}>
                          <TextField fullWidth type="number" label="Rate" value={m.rate} onChange={(e) => updateMaterial(i, "rate", e.target.value)} />
                        </Grid>
                        <Grid item xs={5} md={1}>
                          <TextField fullWidth type="number" label="Qty" value={m.quantity} onChange={(e) => updateMaterial(i, "quantity", e.target.value)} />
                        </Grid>
                        <Grid item xs={1} md={1}>
                          <IconButton onClick={() => {
                            const updated = vendor.materials.filter((_, idx) => idx !== i);
                            setVendor({ ...vendor, materials: updated });
                          }} color="error">
                            <DeleteIcon />
                          </IconButton>
                        </Grid>
                      </Grid>
                    )}
                  </MDBox>
                ))}
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Box>
      <Footer />
    </DashboardLayout>
  );
}

export default VendorDetail;
