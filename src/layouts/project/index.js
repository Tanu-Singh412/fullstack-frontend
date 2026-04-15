import { useState, useEffect } from "react";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
// MUI
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";

import DeleteIcon from "@mui/icons-material/Delete";

// Dashboard
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import { useNavigate, useLocation } from "react-router-dom";
import { Margin } from "@mui/icons-material";

function AddProject() {
  const navigate = useNavigate();
  const location = useLocation();
  const editData = location.state;

  // =====================
  // FORM STATE
  // =====================

  const [form, setForm] = useState({
    projectName: "",
    clientName: "",
    clientId: "",
    description: "",
    totalAmount: "",
    advanceAmount: "",
    balance: "",
  });

  const [images, setImages] = useState([]);

  const [clients, setClients] = useState([]);

  const [dwgFile, setDwgFile] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/clients")
      .then((res) => res.json())
      .then((data) => setClients(data));
  }, []);
  // =====================
  // LOAD OLD DATA (EDIT)
  // =====================

  useEffect(() => {
    if (editData) {
      setForm({
        projectName: editData.projectName || "",
        clientName: editData.clientName || "",
        clientId: editData.clientId || "",
        description: editData.description || "",
        totalAmount: editData.totalAmount || "",
        advanceAmount: editData.advanceAmount || "",
        balance: editData.balance || "",
      });

      if (editData.images) {
        setImages(
          editData.images.map((url) => ({
            url,
          }))
        );
      }
    }
  }, [editData]);

  // =====================
  // CHANGE
  // =====================

  const handleChange = (e) => {
    const { name, value } = e.target;

    let newForm = {
      ...form,
      [name]: value,
    };

    const total = parseFloat(newForm.totalAmount) || 0;
    const advance = parseFloat(newForm.advanceAmount) || 0;

    newForm.balance = total - advance;

    setForm(newForm);
  };

  // =====================
  // UPLOAD IMAGE
  // =====================

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    const newImages = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newImages]);
  };

  // =====================
  // DELETE IMAGE
  // =====================

  const removeImage = (index) => {
    const newList = [...images];

    newList.splice(index, 1);

    setImages(newList);
  };

  // =====================
  // SAVE
  // =====================

  const handleSubmit = async () => {
    const formData = new FormData();

    // form fields
    Object.keys(form).forEach((key) => {
      formData.append(key, form[key]);
    });

    // images
    // ✅ Send existing image URLs
    const existingImages = images
      .filter((img) => !img.file) // old images
      .map((img) => img.url);

    formData.append("existingImages", JSON.stringify(existingImages));

    // ✅ Send new files
    images.forEach((img) => {
      if (img.file) {
        formData.append("images", img.file);
      }
    });

    if (dwgFile) {
      formData.append("dwgFile", dwgFile);
    }
    if (editData?._id) {
      await fetch("http://localhost:5000/api/projects/" + editData._id, {
        method: "PUT",
        body: formData,
      });

      alert("Project Updated");
    } else {
      await fetch("http://localhost:5000/api/projects", {
        method: "POST",
        body: formData,
      });

      alert("Project Successfully Added");
    }

    navigate("/projectTables");
  };

  // =====================
  // UI
  // =====================

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <MDBox pt={6} pb={3}>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} md={10} lg={8}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                bgColor="info"
                variant="gradient"
                borderRadius="lg"
              >
                <MDTypography variant="h6" color="white">
                  Add Project
                </MDTypography>
              </MDBox>

              <MDBox p={3}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Select
                      fullWidth
                      value={form.clientId || ""}
                      displayEmpty // ✅ IMPORTANT
                      onChange={(e) => {
                        const selected = clients.find((c) => c.clientId === e.target.value);

                        if (!selected) return;

                        setForm({
                          ...form,
                          clientId: selected.clientId,
                          clientName: selected.name,
                        });
                      }}
                    >
                      {/* ✅ Placeholder */}
                      <MenuItem value="" disabled>
                        Select Client
                      </MenuItem>

                      {clients.map((c) => (
                        <MenuItem key={c._id} value={c.clientId}>
                          {c.name} ({c.clientId})
                        </MenuItem>
                      ))}
                    </Select>
                  </Grid>
                  {/* Project */}

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Project Name"
                      name="projectName"
                      value={form.projectName}
                      onChange={handleChange}
                    />
                  </Grid>

                  {/* Description */}

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Description"
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                    />
                  </Grid>

                  {/* Total */}

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Total Amount"
                      name="totalAmount"
                      value={form.totalAmount}
                      onChange={handleChange}
                    />
                  </Grid>

                  {/* Advance */}

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Advance Amount"
                      name="advanceAmount"
                      value={form.advanceAmount}
                      onChange={handleChange}
                    />
                  </Grid>

                  {/* Balance */}

                  <Grid item xs={12} md={4}>
                    <TextField fullWidth label="Balance" value={form.balance} />
                  </Grid>

                  {/* Upload */}

                  <Grid item xs={12}>
                    <Button variant="contained" component="label" sx={{ color: "#fff" }}>
                      Upload Images
                      <input hidden multiple type="file" onChange={handleImageUpload} />
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <div style={styles.uploadWrapper}>
                      <label style={styles.uploadLabel}>
                        📐 Upload DWG
                        <input
                          type="file"
                          accept=".dwg,.dxf"
                          style={styles.hiddenInput}
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              setDwgFile(file); // ✅ store actual file
                            }
                          }}
                        />
                      </label>
                    </div>
                  </Grid>
                  {/* Preview */}

                  <Grid item xs={12}>
                    <Grid container spacing={2}>
                      {images.map((img, index) => (
                        <Grid item key={index}>
                          <MDBox position="relative">
                            <img src={img.url} width="120" height="100" />

                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => removeImage(index)}
                              style={{
                                position: "absolute",
                                top: 0,
                                right: 0,
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </MDBox>
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>

                  {/* Save */}

                  <Grid item xs={12}>
                    <Button variant="contained" color="info" onClick={handleSubmit}>
                      Save Project
                    </Button>
                  </Grid>
                </Grid>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      <Footer />
    </DashboardLayout>
  );
}
const styles = {
  uploadWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "10px",
  },

  uploadLabel: {
    padding: "10px 18px",
    background: "linear-gradient(135deg, #1e293b, #334155)",
    color: "#fff",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 500,
    transition: "0.3s",
    boxShadow: "0 6px 15px rgba(0,0,0,0.15)",
  },

  hiddenInput: {
    display: "none",
  },
};
export default AddProject;
