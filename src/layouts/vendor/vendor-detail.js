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

function VendorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vendor, setVendor] = useState(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetch(`https://fullstack-project-1-n510.onrender.com/api/vendors/${id}`)
      .then((res) => res.json())
      .then((res) => setVendor(res.data))
      .catch((err) => console.error(err));
  }, [id]);

  const handleChange = (e) => {
    setVendor({ ...vendor, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    await fetch(`https://fullstack-project-1-n510.onrender.com/api/vendors/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vendor),
    });

    setEditMode(false);
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure?")) return;

    await fetch(`https://fullstack-project-1-n510.onrender.com/api/vendors/${id}`, {
      method: "DELETE",
    });

    navigate("/vendor");
  };

  if (!vendor) return <p>Loading...</p>;

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* MAIN CARD */}
          <Grid item xs={12}>
            <Card sx={{ p: 4, borderRadius: 3, boxShadow: 4 }}>
              {/* HEADER */}
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ bgcolor: '#1976d2', mr: 2 , color:"#fff" }}>
                    {vendor.vendorName?.charAt(0)}
                  </Avatar>
                  <Typography variant="h5" fontWeight="bold">
                    {editMode ? "Edit Vendor" : vendor.vendorName}
                  </Typography>
                </Box>

                <Box>
                  {!editMode ? (
                    <>
                      <Button variant="contained" sx={{ mr: 1, color :"#fff" }} onClick={() => setEditMode(true)}>
                        Edit
                      </Button>
                      <Button variant="contained" color="error" onClick={handleDelete}>
                        Delete
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="contained" sx={{ mr: 1 }} onClick={handleUpdate}>
                        Save
                      </Button>
                      <Button variant="outlined" onClick={() => setEditMode(false)}>
                        Cancel
                      </Button>
                    </>
                  )}
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* DETAILS */}
              {!editMode ? (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography>📞 {vendor.phone}</Typography>
                    <Typography>📧 {vendor.email}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography>🏢 {vendor.company}</Typography>
                    <Typography>📂 {vendor.category}</Typography>
                  </Grid>
                </Grid>
              ) : (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Vendor Name" name="vendorName" value={vendor.vendorName} onChange={handleChange} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Phone" name="phone" value={vendor.phone} onChange={handleChange} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Email" name="email" value={vendor.email} onChange={handleChange} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Company" name="company" value={vendor.company} onChange={handleChange} />
                  </Grid>
                </Grid>
              )}
            </Card>
          </Grid>

          {/* MATERIALS */}
          <Grid item xs={12}>
            <Card sx={{ p: 4, borderRadius: 3, boxShadow: 3 }}>
              <Typography variant="h6" mb={2} fontWeight="bold">
                Materials
              </Typography>

              {!editMode ? (
                vendor.materials?.length ? (
                  vendor.materials.map((m, i) => (
                    <Box key={i} display="flex" justifyContent="space-between" p={1} sx={{ borderBottom: '1px solid #eee' }}>
                      <Typography>{m.materialName}</Typography>
                      <Typography fontWeight="bold">₹{m.rate}</Typography>
                    </Box>
                  ))
                ) : (
                  <Typography>No materials</Typography>
                )
              ) : (
                <>
                  {vendor.materials?.map((m, index) => (
                    <Grid container spacing={2} key={index} sx={{ mb: 1 }}>
                      <Grid item xs={5}>
                        <TextField fullWidth label="Material" value={m.materialName} onChange={(e) => {
                          const updated = [...vendor.materials];
                          updated[index].materialName = e.target.value;
                          setVendor({ ...vendor, materials: updated });
                        }} />
                      </Grid>

                      <Grid item xs={5}>
                        <TextField fullWidth type="number" label="Rate" value={m.rate} onChange={(e) => {
                          const updated = [...vendor.materials];
                          updated[index].rate = e.target.value;
                          setVendor({ ...vendor, materials: updated });
                        }} />
                      </Grid>

                      <Grid item xs={2}>
                        <Button color="error" onClick={() => {
                          const updated = vendor.materials.filter((_, i) => i !== index);
                          setVendor({ ...vendor, materials: updated });
                        }}>Delete</Button>
                      </Grid>
                    </Grid>
                  ))}

                  <Button variant="contained" sx={{ mt: 2 }} onClick={() => setVendor({
                    ...vendor,
                    materials: [...(vendor.materials || []), { materialName: "", rate: "" }]
                  })}>
                    + Add Material
                  </Button>
                </>
              )}
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Footer />
    </DashboardLayout>
  );
}

export default VendorDetail;
