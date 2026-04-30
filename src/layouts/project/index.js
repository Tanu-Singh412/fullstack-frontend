import { useState, useEffect } from "react";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
// MUI
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";

import DeleteIcon from "@mui/icons-material/Delete";

// Dashboard
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import { useNavigate, useLocation } from "react-router-dom";

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
    visitCounter: 5,
  });

  const [images, setImages] = useState([]);

  const [clients, setClients] = useState([]);


  useEffect(() => {
    fetch("https://fullstack-project-1-n510.onrender.com/api/clients")
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
        visitCounter: editData.visitCounter || 5,
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
    if (!form.projectName || !form.clientId || !form.totalAmount) {
      alert("Project Name, Associated Client, and Total Amount are required");
      return;
    }

    // CHECK UNIQUE PROJECT NAME
    const resExisting = await fetch("https://fullstack-project-1-n510.onrender.com/api/projects");
    const existingProjectsRes = await resExisting.json();
    const existingProjects = existingProjectsRes.data || existingProjectsRes;
    
    const isDuplicate = existingProjects.some(p => 
      p.projectName.toLowerCase().trim() === form.projectName.toLowerCase().trim() && p._id !== editData?._id
    );

    if (isDuplicate) {
      alert("A project with this name already exists. Please use a unique name.");
      return;
    }

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


    if (editData?._id) {
      await fetch("https://fullstack-project-1-n510.onrender.com/api/projects/" + editData._id, {
        method: "PUT",
        body: formData,
      });

      alert("Project Updated");
    } else {
      await fetch("https://fullstack-project-1-n510.onrender.com/api/projects", {
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
                variant="contained"
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
                      displayEmpty
                      onChange={(e) => {
                        const selected = clients.find((c) => c.clientId === e.target.value);
                        if (!selected) return;
                        setForm({
                          ...form,
                          clientId: selected.clientId,
                          clientName: selected.name,
                        });
                      }}
                      sx={{
                        height: 45,
                        borderRadius: "10px",
                        bgcolor: "#f8fafc",
                        "& .MuiSelect-select": {
                          py: 1.5,
                          fontSize: "0.875rem",
                          fontWeight: "500"
                        },
                        "& fieldset": {
                          borderColor: "#e2e8f0",
                        },
                        "&:hover fieldset": {
                          borderColor: "#3b82f6 !important"
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#3b82f6 !important",
                          borderWidth: "1px"
                        }
                      }}
                    >
                      <MenuItem value="" disabled>
                        <span style={{ color: "#94a3b8" }}>Select Associated Client</span>
                      </MenuItem>
                      {clients.map((c) => (
                        <MenuItem key={c._id} value={c.clientId} sx={{ py: 1.2, borderRadius: 1.5, mx: 1, my: 0.5 }}>
                          {c.name} <span style={{ marginLeft: 8, color: "#64748b", fontSize: "0.75rem" }}>({c.clientId})</span>
                        </MenuItem>
                      ))}
                    </Select>
                  </Grid>
                  {/* Project */}

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
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
                      required
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
                    <TextField fullWidth label="Balance" value={form.balance} InputProps={{ readOnly: true }} />
                  </Grid>

                  {/* Visit Counter */}
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Initial Site Visits"
                      name="visitCounter"
                      type="number"
                      value={form.visitCounter}
                      onChange={handleChange}
                    />
                  </Grid>

                  {/* Upload */}

                  {/* <Grid item xs={12}>
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
                  </Grid> */}
                  {/* Preview */}

                  <Grid item xs={12}>
                    <Grid container spacing={2}>
                      {images.map((img, index) => (
                        <Grid item key={index}>
                          <MDBox position="relative">
                            <img src={img.url} width="120" height="100" alt={`Project ${index + 1}`} />

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

                  <Grid item xs={12} display="flex" justifyContent="center">
                    <MDButton 
                      variant="contained" 
                      sx={{ 
                        px: 6, 
                        py: 1.5,
                        background: "#1e293b", 
                        color: "#fff",
                        "&:hover": { background: "#334155" }
                      }} 
                      onClick={handleSubmit}
                    >
                      Save Project
                    </MDButton>
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
export default AddProject;
