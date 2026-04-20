import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

function VendorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vendor, setVendor] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // ================= FETCH =================
  useEffect(() => {
    fetch(`https://fullstack-project-1-n510.onrender.com/api/vendors/${id}`)
      .then((res) => res.json())
      .then((res) => setVendor(res.data))
      .catch((err) => console.error(err));
  }, [id]);

  // ================= HANDLE CHANGE =================
  const handleChange = (e) => {
    setVendor({ ...vendor, [e.target.name]: e.target.value });
  };

  // ================= UPDATE =================
  const handleUpdate = async () => {
    try {
      await fetch(
        `https://fullstack-project-1-n510.onrender.com/api/vendors/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(vendor),
        }
      );

      alert("Vendor updated ✅");
      setEditMode(false);
    } catch (err) {
      console.log(err);
    }
  };

  // ================= DELETE =================
  const handleDelete = async () => {
    if (!window.confirm("Are you sure?")) return;

    try {
      await fetch(
        `https://fullstack-project-1-n510.onrender.com/api/vendors/${id}`,
        { method: "DELETE" }
      );

      alert("Vendor deleted ❌");
      navigate("/vendor");
    } catch (err) {
      console.log(err);
    }
  };

  if (!vendor) return <p>Loading...</p>;

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <MDBox p={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ p: 3 }}>

              {/* HEADER */}
              <MDBox display="flex" justifyContent="space-between">
                <MDTypography variant="h4">
                  {editMode ? "Edit Vendor" : vendor.vendorName}
                </MDTypography>

                <MDBox>
                  {!editMode ? (
                    <>
                      <Button
                        variant="contained"
                        sx={{ mr: 1 }}
                        onClick={() => setEditMode(true)}
                      >
                        Edit
                      </Button>

                      <Button
                        variant="contained"
                        color="error"
                        onClick={handleDelete}
                      >
                        Delete
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="contained"
                        sx={{ mr: 1 }}
                        onClick={handleUpdate}
                      >
                        Save
                      </Button>

                      <Button
                        variant="outlined"
                        onClick={() => setEditMode(false)}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </MDBox>
              </MDBox>

              {/* ================= VIEW / EDIT ================= */}
              {!editMode ? (
                <>
                  <MDTypography>📞 {vendor.phone}</MDTypography>
                  <MDTypography>📧 {vendor.email}</MDTypography>
                  <MDTypography>🏢 {vendor.company}</MDTypography>
                  <MDTypography>🧾 {vendor.gst}</MDTypography>
                  <MDTypography>📂 {vendor.category}</MDTypography>
                </>
              ) : (
                <>
                  <TextField
                    fullWidth
                    label="Vendor Name"
                    name="vendorName"
                    value={vendor.vendorName}
                    onChange={handleChange}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={vendor.phone}
                    onChange={handleChange}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={vendor.email}
                    onChange={handleChange}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="Company"
                    name="company"
                    value={vendor.company}
                    onChange={handleChange}
                    sx={{ mb: 2 }}
                  />
                </>
              )}
            </Card>
          </Grid>

          {/* MATERIALS */}
          <Grid item xs={12}>
            <Card sx={{ p: 3 }}>
              <MDTypography variant="h6" mb={2}>
                Materials
              </MDTypography>

              {vendor.materials?.length > 0 ? (
                vendor.materials.map((m, i) => (
                  <MDBox key={i}>
                    {m.materialName} — ₹{m.rate}
                  </MDBox>
                ))
              ) : (
                <MDTypography>No materials</MDTypography>
              )}
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      <Footer />
    </DashboardLayout>
  );
}

export default VendorDetail;