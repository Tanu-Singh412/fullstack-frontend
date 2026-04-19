import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom"; // ✅ ADD THIS

// MUI
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import Divider from "@mui/material/Divider";

// Dashboard
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function AddVendor() {
  const navigate = useNavigate();
  const { categoryId } = useParams(); // ✅ GET CATEGORY FROM URL

  // =====================
  // FORM STATE
  // =====================
  const [form, setForm] = useState({
    vendorName: "",
    phone: "",
    email: "",
    address: "",
    company: "",
    gst: "",
    status: "Active",
    note: "",
    category: "",
    materials: [],
  });

  // =====================
  // AUTO SET CATEGORY FROM URL ✅
  // =====================
  useEffect(() => {
    if (categoryId) {
      setForm((prev) => ({
        ...prev,
        category: categoryId.toLowerCase(), // ✅ IMPORTANT
      }));
    }
  }, [categoryId]);

  // =====================
  // FETCH CATEGORIES
  // =====================
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch("https://fullstack-project-1-n510.onrender.com/api/vendor-categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.data || data))
      .catch((err) => console.log(err));
  }, []);

  // =====================
  // INPUT CHANGE
  // =====================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // =====================
  // ADD MATERIAL
  // =====================
  const addMaterial = () => {
    setForm({
      ...form,
      materials: [...form.materials, { materialName: "", rate: "" }],
    });
  };

  // =====================
  // UPDATE MATERIAL
  // =====================
  const updateMaterial = (index, field, value) => {
    const updated = [...form.materials];
    updated[index][field] = value;
    setForm({ ...form, materials: updated });
  };

  // =====================
  // REMOVE MATERIAL
  // =====================
  const removeMaterial = (index) => {
    const updated = form.materials.filter((_, i) => i !== index);
    setForm({ ...form, materials: updated });
  };

  // =====================
  // SUBMIT
  // =====================
  const handleSubmit = async () => {
    if (!form.vendorName || !form.phone || !form.category) {
      alert("Vendor Name, Phone & Category required");
      return;
    }

    const cleanedForm = {
      ...form,
      category: form.category.trim().toLowerCase(), // ✅ KEEP LOWERCASE
      materials: form.materials
        .filter((m) => m.materialName?.trim())
        .map((m) => ({
          materialName: m.materialName,
          rate: Number(m.rate) || 0,
        })),
    };

    try {
      await fetch(
        "https://fullstack-project-1-n510.onrender.com/api/vendors",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cleanedForm),
        }
      );

      alert("Vendor Saved Successfully");
      navigate("/vendor");
    } catch (err) {
      console.log(err);
      alert("Something went wrong");
    }
  };

  // =====================
  // UI
  // =====================
  return (
    <DashboardLayout>
      <DashboardNavbar />

      <MDBox pt={6} pb={3}>
        <Grid container justifyContent="center">
          <Grid item xs={12} md={10} lg={8}>
            <Card sx={{ p: 3 }}>

              <MDTypography variant="h5" mb={2}>
                Add Vendor ({categoryId}) {/* ✅ SHOW CATEGORY */}
              </MDTypography>

              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2}>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Vendor Name *"
                    name="vendorName"
                    value={form.vendorName}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone *"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Company"
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="GST Number"
                    name="gst"
                    value={form.gst}
                    onChange={handleChange}
                  />
                </Grid>

                {/* CATEGORY */}
                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    label="Category *"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    SelectProps={{ native: true }}
                  >
                    <option value=""></option>
                    {categories.map((cat) => (
                      <option key={cat._id || cat.name} value={cat.name.toLowerCase()}>
                        {cat.name}
                      </option>
                    ))}
                  </TextField>
                </Grid>

                {/* MATERIALS */}
                <Grid item xs={12}>
                  <MDBox display="flex" justifyContent="space-between">
                    <MDTypography variant="h6">
                      Materials
                    </MDTypography>

                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={addMaterial}
                    >
                      Add Material
                    </Button>
                  </MDBox>
                </Grid>

                {form.materials.map((mat, index) => (
                  <Grid container spacing={2} key={index} sx={{ mt: 1 }}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Material Name"
                        value={mat.materialName}
                        onChange={(e) =>
                          updateMaterial(index, "materialName", e.target.value)
                        }
                      />
                    </Grid>

                    <Grid item xs={4}>
                      <TextField
                        fullWidth
                        label="Rate"
                        type="number"
                        value={mat.rate}
                        onChange={(e) =>
                          updateMaterial(index, "rate", e.target.value)
                        }
                      />
                    </Grid>

                    <Grid item xs={2}>
                      <IconButton
                        onClick={() => removeMaterial(index)}
                        sx={{ color: "red" }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                ))}

                <Grid item xs={12} mt={2}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleSubmit}
                  >
                    Save Vendor
                  </Button>
                </Grid>

              </Grid>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      <Footer />
    </DashboardLayout>
  );
}

export default AddVendor;