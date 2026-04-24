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
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import EditIcon from "@mui/icons-material/Edit";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import BusinessIcon from "@mui/icons-material/Business";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function VendorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vendor, setVendor] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [clients, setClients] = useState([]);
  const [allVendors, setAllVendors] = useState([]);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");

  const [whatsappOpen, setWhatsappOpen] = useState(false);
  const [whatsappMessage, setWhatsappMessage] = useState("");

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
    fetch("https://fullstack-project-1-n510.onrender.com/api/clients").then(res => res.json()).then(data => setClients(data));
    fetch("https://fullstack-project-1-n510.onrender.com/api/vendors").then(res => res.json()).then(data => setAllVendors(data.data || data));
  }, [id]);

  const handleUpdate = async () => {
    let finalImage = vendor.image;
    if (image) finalImage = await convertToBase64(image);
    const payload = { ...vendor, image: finalImage, materials: JSON.stringify(vendor.materials) };
    await fetch(`https://fullstack-project-1-n510.onrender.com/api/vendors/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setEditMode(false); fetchVendor();
  };

  const convertToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader(); reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result); reader.onerror = (err) => reject(err);
  });

  const updateMaterial = (index, field, value) => {
    const updated = [...vendor.materials];
    if (field === "clientId") {
      const client = clients.find(c => c.clientId === value);
      updated[index].clientId = value; updated[index].clientName = client?.name || "";
    } else {
      updated[index][field] = value;
    }
    if (field === "materialName" && value) {
      const previousMat = allVendors.flatMap(v => v.materials || []).find(m => m.materialName?.toLowerCase() === value.toLowerCase());
      if (previousMat) { updated[index].rate = previousMat.rate || ""; updated[index].clientId = previousMat.clientId || ""; updated[index].clientName = previousMat.clientName || ""; }
    }
    setVendor({ ...vendor, materials: updated });
  };

  const addMaterialRow = () => {
    setVendor({ ...vendor, materials: [...(vendor.materials || []), { materialName: "", rate: 0, quantity: 0, clientId: "", clientName: "" }] });
    setEditMode(true); // Automatically enter edit mode so user can type
  };

  const handleOpenWhatsApp = () => {
    let message = `*D DESIGN ARCHITECTS STUDIO*\n\nHello *${vendor.vendorName}*,\nDetails stored:\n\n`;
    vendor.materials?.forEach((m, i) => { message += `${i + 1}. *${m.materialName}* - ₹${m.rate} (Qty: ${m.quantity})\n`; });
    setWhatsappMessage(message); setWhatsappOpen(true);
  };

  if (!vendor) return <p>Loading...</p>;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox p={4}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <MDTypography variant="h4" fontWeight="bold">Vendor Profile</MDTypography>
          <Button variant="contained" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ bgcolor: "#3b82f6", color: "#fff" }}>Back</Button>
        </MDBox>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 4, textAlign: "center", borderRadius: 5 }}>
              <Avatar src={preview} sx={{ width: 150, height: 150, mx: "auto", mb: 3, border: "4px solid #fff", boxShadow: 2 }}>{vendor.vendorName?.charAt(0)}</Avatar>
              <Typography variant="h4" fontWeight="bold">{vendor.vendorName}</Typography>
              <Chip label={vendor.category?.toUpperCase()} size="small" sx={{ mt: 1, bgcolor: "#eff6ff", color: "#3b82f6" }} />
              <Divider sx={{ my: 3 }} />
              <Box sx={{ textAlign: "left", display: "flex", flexDirection: "column", gap: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center"><Box display="flex" gap={2}><PhoneIcon color="info" fontSize="small" /><Typography variant="body2">{vendor.phone}</Typography></Box><IconButton size="small" onClick={handleOpenWhatsApp} sx={{ bgcolor: "#25d366", color: "#fff" }}><WhatsAppIcon fontSize="small" /></IconButton></Box>
                <Box display="flex" gap={2}><EmailIcon color="info" fontSize="small" /><Typography variant="body2">{vendor.email || "N/A"}</Typography></Box>
                <Box display="flex" gap={2}><BusinessIcon color="info" fontSize="small" /><Typography variant="body2">{vendor.company || "N/A"}</Typography></Box>
                <Box display="flex" gap={2}><LocationOnIcon color="info" fontSize="small" /><Typography variant="body2">{vendor.address || "N/A"}</Typography></Box>
              </Box>
              <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
                {!editMode ? <Button fullWidth variant="contained" color="info" onClick={() => setEditMode(true)}>Edit</Button> : <Button fullWidth variant="contained" color="success" onClick={handleUpdate} sx={{ color: "#fff" }}>Save</Button>}
                <Button variant="outlined" color="error" onClick={async () => { if (window.confirm("Delete?")) { await fetch(`https://fullstack-project-1-n510.onrender.com/api/vendors/${id}`, { method: "DELETE" }); navigate("/vendor"); } }}>Delete</Button>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} md={8}>
            <Card sx={{ p: 4, borderRadius: 5 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h5" fontWeight="bold">Material Breakdown</Typography>
                <Box display="flex" gap={2}>
                  <Button variant="outlined" startIcon={<AddCircleIcon />} color="info" onClick={addMaterialRow}>Add Material Row</Button>
                  <Button variant="outlined" startIcon={<AutoFixHighIcon />} color="success" onClick={handleOpenWhatsApp}>AI Share</Button>
                </Box>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {vendor.materials?.map((m, i) => (
                  <MDBox key={i} sx={{ p: 3, borderRadius: 4, bgcolor: "#f8fafc", border: "1px solid #f1f5f9" }}>
                    {!editMode ? (
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={4}><Typography variant="subtitle2" color="textSecondary">Material</Typography><Typography fontWeight="bold">{m.materialName}</Typography></Grid>
                        <Grid item xs={12} md={4}><Typography variant="subtitle2" color="textSecondary">Client</Typography><Chip label={m.clientName || "Direct"} size="small" color="info" /></Grid>
                        <Grid item xs={6} md={2}><Typography variant="subtitle2" color="textSecondary">Rate</Typography><Typography fontWeight="bold">₹{m.rate}</Typography></Grid>
                        <Grid item xs={6} md={2}><Typography variant="subtitle2" color="textSecondary">Qty</Typography><Typography fontWeight="bold">{m.quantity}</Typography></Grid>
                      </Grid>
                    ) : (
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={4}><TextField fullWidth label="Material" value={m.materialName} onChange={(e) => updateMaterial(i, "materialName", e.target.value)} /></Grid>
                        <Grid item xs={12} md={4}><Select fullWidth value={m.clientId || ""} displayEmpty onChange={(e) => updateMaterial(i, "clientId", e.target.value)} sx={{ height: 45 }}><MenuItem value="" disabled>Select Client</MenuItem>{clients.map(c => <MenuItem key={c._id} value={c.clientId}>{c.name}</MenuItem>)}</Select></Grid>
                        <Grid item xs={6} md={2}><TextField fullWidth type="number" label="Rate" value={m.rate} onChange={(e) => updateMaterial(i, "rate", e.target.value)} /></Grid>
                        <Grid item xs={5} md={1.5}><TextField fullWidth type="number" label="Qty" value={m.quantity} onChange={(e) => updateMaterial(i, "quantity", e.target.value)} /></Grid>
                        <Grid item xs={1} md={0.5}><IconButton onClick={() => { const updated = vendor.materials.filter((_, idx) => idx !== i); setVendor({ ...vendor, materials: updated }); }} color="error"><DeleteIcon /></IconButton></Grid>
                      </Grid>
                    )}
                  </MDBox>
                ))}
              </Box>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Dialog open={whatsappOpen} onClose={() => setWhatsappOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>AI WhatsApp Message</DialogTitle>
        <DialogContent dividers><TextField fullWidth multiline rows={10} value={whatsappMessage} onChange={(e) => setWhatsappMessage(e.target.value)} /></DialogContent>
        <DialogActions><Button onClick={() => setWhatsappOpen(false)}>Cancel</Button><Button variant="contained" onClick={() => { window.open(`https://wa.me/91${vendor.phone?.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(whatsappMessage)}`, "_blank"); setWhatsappOpen(false); }} sx={{ bgcolor: "#25d366", color: "#fff" }}>Send</Button></DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}
export default VendorDetail;
