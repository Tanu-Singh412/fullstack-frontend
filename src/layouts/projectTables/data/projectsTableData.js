import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";

import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Grid from "@mui/material/Grid";
import { color } from "chart.js/helpers";

import Button from "@mui/material/Button";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import DialogActions from "@mui/material/DialogActions";

export default function useProjectData() {
  const [rows, setRows] = useState([]);
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();
  const [viewClientProjects, setViewClientProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [paymentProject, setPaymentProject] = useState(null);
  const [paymentType, setPaymentType] = useState("add");
const [paymentAmount, setPaymentAmount] = useState("");
  const [imageIndex, setImageIndex] = useState(0);
  const [selectedDescription, setSelectedDescription] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
const openPaymentDialog = (project, type) => {
  setPaymentProject(project);
  setPaymentType(type);
  setPaymentAmount("");
};
const handleAddPayment = async () => {
  if (!paymentAmount || !paymentProject) return;

  const amount =
    paymentType === "subtract"
      ? -Math.abs(paymentAmount)
      : Math.abs(paymentAmount);

  await fetch(
    `http://localhost:5000/api/projects/${paymentProject._id}/payment`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount }),
    }
  );

  setPaymentProject(null);
  setPaymentAmount("");
  loadData();
};


const columns = [
    { Header: "S.No.", accessor: "serial" },
    { Header: "Image", accessor: "image" },
    { Header: "Project", accessor: "project" },
    { Header: "Client ID", accessor: "clientId" },
    { Header: "Description", accessor: "description" },
    { Header: "DWG File", accessor: "dwg" }, // ✅ NEW COLUMN

    { Header: "Client", accessor: "client" },
    { Header: "Payment", accessor: "total" },
    { Header: "Paid", accessor: "paid" },
    { Header: "Balance", accessor: "balance" },
    { Header: "Date", accessor: "date" },
    { Header: "Status", accessor: "status" },
    { Header: "Actions", accessor: "actions" },
  ];

  // Edit project
  const editProject = (p) => {
    navigate("/projects", { state: p });
  };

  // Delete project
  const deleteProject = async (id) => {
    await fetch(`http://localhost:5000/api/projects/${id}`, { method: "DELETE" });
    loadData();
  };

  // Update project status
  const handleStatusChange = async (id, value) => {
    setProjects((prev) => prev.map((p) => (p._id === id ? { ...p, status: value } : p)));

    await fetch(`http://localhost:5000/api/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: value }),
    });
  };

  // Load projects from backend
  const loadData = async () => {
    const res = await fetch("http://localhost:5000/api/projects");
    const data = await res.json();
    setProjects(data);
  };
  const handleView = (project) => {
    const sameClientProjects = projects.filter((p) => p.clientId === project.clientId);

    if (sameClientProjects.length === 1) {
      setSelectedProject(sameClientProjects[0]); // direct open
    } else {
      setViewClientProjects(sameClientProjects); // open grid
    }
  };
  const openImage = (img, index) => {
    setSelectedImage(img);
    setImageIndex(index);
  };
  const handleNext = () => {
    const imgs = selectedProject?.images || [];
    const next = (imageIndex + 1) % imgs.length;
    setImageIndex(next);
    setSelectedImage(imgs[next]);
  };

  const handlePrev = () => {
    const imgs = selectedProject?.images || [];
    const prev = (imageIndex - 1 + imgs.length) % imgs.length;
    setImageIndex(prev);
    setSelectedImage(imgs[prev]);
  };

  // Function to format project data into table rows
  const formatRows = (data) => {
    return data.map((p, i) => {
const totalPaid = (p.payments || []).reduce(
  (sum, pay) => sum + Number(pay.amount),
  0
);

const balance = Number(p.totalAmount || 0) - totalPaid;
      const date = new Date(p.createdAt).toLocaleString();
      const currentStatus = p.status || "Pending";

      // Status colors
      let bgColor = "#1976d2"; // default
      if (currentStatus === "Pending") bgColor = "#f44336";
      else if (currentStatus === "Assigned") bgColor = "#ff9800";
      else if (currentStatus === "Completed") bgColor = "#9c27b0";
      else if (currentStatus === "Running") bgColor = "#4da9ce";
      const downloadDWG = (file) => {
        const link = document.createElement("a");
        link.href = file.url;
        link.download = file.name || "drawing.dwg";
        link.click();
      };
      return {
             dwg: p.dwgFile && p.dwgFile.url ? (
  <button
    onClick={() => downloadDWG(p.dwgFile)}
    style={{
      padding: "5px 10px",
      background: "#1976d2",
      color: "#fff",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
    }}
  >
    Download
  </button>
) : (
  <span style={{ fontSize: 12 }}>No File</span>
),

        serial: <MDTypography variant="caption">{i + 1}</MDTypography>,
        image: <img src={p.images?.[0] || "https://via.placeholder.com/60"} width="60" />,
        project: <MDTypography variant="caption">{p.projectName}</MDTypography>,
        clientId: <MDTypography variant="caption">{p.clientId || "-"}</MDTypography>,
description: (
  <MDTypography
    variant="caption"
    sx={{
      cursor: "pointer",
      maxWidth: 150,
      display: "inline-block",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    }}
    onClick={() => setSelectedDescription(p.description)}
  >
    {p.description || "-"}
  </MDTypography>
),

client: <MDTypography variant="caption">{p.clientName}</MDTypography>,
        total: <MDTypography variant="caption">{p.totalAmount}</MDTypography>,
paid: <MDTypography variant="caption">{totalPaid}</MDTypography>,
balance: <MDTypography variant="caption">{balance}</MDTypography>,
        date: <MDTypography variant="caption">{date}</MDTypography>,
        status: (
          <Select
            size="small"
            value={currentStatus}
            onChange={(e) => handleStatusChange(p._id, e.target.value)}
            sx={{
              fontSize: 12,
              height: 30,
              bgcolor:
                currentStatus === "Pending"
                  ? "#f44336"
                  : currentStatus === "Assigned"
                  ? "#ff9800"
                  : currentStatus === "Completed"
                  ? "#9c27b0"
                  : "#4da9ce", // Running
              color: "#fff",
              "& .MuiSelect-select": { color: "#fff" },
              "& .MuiSvgIcon-root": { color: "#fff" },
            }}
          >
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Running">Running</MenuItem>
            <MenuItem value="Assigned">Assigned</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
          </Select>
        ),

        actions: (
          <MDBox display="flex">
  {/* ➕ Add */}
  <IconButton
    color="success"
    size="small"
    onClick={() => openPaymentDialog(p, "add")}
  >
    +
  </IconButton>

  {/* ➖ Subtract */}
  <IconButton
    color="warning"
    size="small"
    onClick={() => openPaymentDialog(p, "subtract")}
  >
    -
  </IconButton>
            <IconButton color="primary" size="small" onClick={() => handleView(p)}>
              <VisibilityIcon />
            </IconButton>

            <IconButton color="info" size="small" onClick={() => editProject(p)}>
              <EditIcon />
            </IconButton>
            <IconButton color="error" size="small" onClick={() => setDeleteId(p._id)}>
              <DeleteIcon />
            </IconButton>
          </MDBox>
        ),
      };
    });
  };

  // Update rows whenever projects change
  useEffect(() => {
    setRows(formatRows(projects));
  }, [projects]);

  // Search functionality
  useEffect(() => {
    const handleSearch = (e) => {
      const query = e.detail.query.toLowerCase();
      const filtered = projects.filter(
        (p) =>
          p.projectName.toLowerCase().includes(query) ||
          p.clientName.toLowerCase().includes(query) ||
          (p.projectId && p.projectId.toLowerCase().includes(query)) ||
          (p.clientId && p.clientId.toLowerCase().includes(query)) || // ✅ ADD THIS
          p._id.toLowerCase().includes(query)
      );
      setRows(formatRows(filtered));
    };

    window.addEventListener("searchChanged", handleSearch);
    return () => window.removeEventListener("searchChanged", handleSearch);
  }, [projects]);

  // Initial load
  useEffect(() => {
    loadData();
  }, []);
  const clientProjectsDialog = (
    <Dialog
      open={viewClientProjects.length > 0}
      onClose={() => setViewClientProjects([])}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle
        sx={{
          textAlign: "center",
          fontWeight: 700,
          fontSize: "18px",
          background: "linear-gradient(90deg, #1e293b, #334155)",
          color: "#fff",
          py: 2,
        }}
      >
        All Projects
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        <Grid container spacing={3}>
          {viewClientProjects.map((p) => (
            <Grid item xs={12} sm={6} md={4} key={p._id}>
              <MDBox
                onClick={() => {
                  setSelectedProject(p);
                  setViewClientProjects([]);
                }}
                sx={{
                  position: "relative",
                  borderRadius: "18px",
                  overflow: "hidden",
                  cursor: "pointer",
                  height: 200,
                  boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                  transition: "all 0.35s ease",
                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: "0 14px 30px rgba(0,0,0,0.2)",
                  },
                }}
              >
                {/* IMAGE */}
                <img
                  src={p.images?.[0] || "https://via.placeholder.com/300"}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    filter: "brightness(0.75)",
                  }}
                />

                {/* TEXT OVER IMAGE */}
                <MDBox
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    p: 2,
                    background: "linear-gradient(to top, rgba(0,0,0,0.85), transparent)",
                  }}
                >
                  <MDTypography
                    sx={{
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "15px",
                      letterSpacing: 0.3,
                    }}
                  >
                    {p.projectName}
                  </MDTypography>

                  <MDTypography
                    sx={{
                      color: "rgba(255,255,255,0.7)",
                      fontSize: "12px",
                      mt: 0.3,
                    }}
                  >
                    Tap to view details
                  </MDTypography>
                </MDBox>
              </MDBox>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
    </Dialog>
  );

  const projectDetailsDialog = (
    <Dialog
      open={!!selectedProject}
      onClose={() => setSelectedProject(null)}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "20px",
          overflow: "hidden",
          background: "#f4f7fb",
        },
      }}
    >
      {selectedProject && (
        <>
          {/* 🌈 PREMIUM HEADER (FIXED WHITE TEXT) */}
          <MDBox
            sx={{
              p: 3,
              background: "linear-gradient(135deg, #0b1220, #1e293b, #0b1220)",
              color: "#fff",
              position: "relative",
            }}
          >
            {/* PROJECT NAME */}
            <MDTypography
              variant="h4"
              fontWeight="bold"
              sx={{
                color: "#ffffff",
                letterSpacing: 0.5,
              }}
            >
              {selectedProject.projectName}
            </MDTypography>

            {/* CLIENT BADGE */}
            <MDBox
              sx={{
                mt: 1.5,
                display: "inline-flex",
                alignItems: "center",
                px: 2,
                py: 0.7,
                borderRadius: "30px",
                background: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(10px)",
                fontSize: "13px",
                color: "#ffffff",
              }}
            >
              <MDTypography
                component="span"
                sx={{
                  color: "#ffffff",
                  fontSize: "13px",
                }}
              >
                Client:
              </MDTypography>

              <b style={{ marginLeft: 6, color: "#ffffff" }}>{selectedProject.clientName}</b>
            </MDBox>
          </MDBox>

          <DialogContent sx={{ p: 3 }}>
            {/* 📌 DESCRIPTION CARD */}
            <MDBox
              sx={{
                p: 3,
                borderRadius: "18px",
                background: "#fff",
                boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
                mb: 3,
              }}
            >
              <MDTypography variant="h6" fontWeight="bold">
                Project Overview
              </MDTypography>

              <MDTypography variant="body2" sx={{ mt: 1.5, color: "#475569", lineHeight: 1.7 }}>
                {selectedProject.description}
              </MDTypography>
            </MDBox>

            {/* 🖼️ GALLERY TITLE */}
            <MDTypography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Project Gallery
            </MDTypography>

            {/* 🖼️ IMAGE GRID */}
            {/* 🖼️ IMAGE GRID */}
            <Grid container spacing={2}>
              {selectedProject.images?.map((img, i) => (
                <Grid item xs={12} sm={6} md={4} key={i}>
                  <MDBox
                    onClick={() => openImage(img, i)}
                    sx={{
                      height: 240,
                      borderRadius: "18px",
                      overflow: "hidden",
                      cursor: "pointer",
                      position: "relative",
                      background: "#0b1220", // dark frame so full image looks premium
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                      transition: "0.35s",
                      "&:hover": {
                        transform: "translateY(-6px)",
                        boxShadow: "0 18px 40px rgba(0,0,0,0.15)",
                      },
                    }}
                  >
                    {/* FULL IMAGE (NO CROPPING) */}
                    <img
                      src={img}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain",
                        transition: "0.4s",
                      }}
                    />

                    {/* overlay */}
                    <MDBox
                      sx={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(to top, rgba(0,0,0,0.25), transparent)",
                        opacity: 0,
                        transition: "0.3s",
                        "&:hover": { opacity: 1 },
                        display: "flex",
                        alignItems: "flex-end",
                        p: 2,
                      }}
                    >
                      <MDTypography sx={{ color: "#fff", fontSize: "12px" }}>
                        Click to view
                      </MDTypography>
                    </MDBox>
                  </MDBox>
                </Grid>
              ))}
            </Grid>
          </DialogContent>
        </>
      )}
    </Dialog>
  );
  const imageLightbox = (
    <Dialog
      open={!!selectedImage}
      onClose={() => setSelectedImage(null)}
      maxWidth={false}
      PaperProps={{
        sx: {
          background: "rgba(0,0,0,0.9)",
          backdropFilter: "blur(10px)",
        },
      }}
    >
      {selectedImage && (
        <MDBox
          sx={{
            width: "70vw",
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {/* ❌ CLOSE */}
          <MDBox
            onClick={() => setSelectedImage(null)}
            sx={{
              position: "absolute",
              top: 20,
              right: 20,
              color: "#fff",
              fontSize: 18,
              cursor: "pointer",
              background: "rgba(255,255,255,0.1)",
              px: 2,
              py: 1,
              borderRadius: "10px",
            }}
          >
            Close
          </MDBox>

          {/* ⬅️ PREV */}
          <MDBox
            onClick={handlePrev}
            sx={{
              position: "absolute",
              left: 20,
              color: "#fff",
              fontSize: 30,
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            ‹
          </MDBox>

          {/* ➡️ NEXT */}
          <MDBox
            onClick={handleNext}
            sx={{
              position: "absolute",
              right: 20,
              color: "#fff",
              fontSize: 30,
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            ›
          </MDBox>

          {/* COUNTER */}
          <MDTypography
            sx={{
              position: "absolute",
              bottom: 30,
              color: "#fff",
              fontSize: "13px",
              background: "rgba(255,255,255,0.1)",
              px: 2,
              py: 1,
              borderRadius: "20px",
            }}
          >
            {imageIndex + 1} / {selectedProject?.images?.length}
          </MDTypography>

          {/* IMAGE */}
          <img
            src={selectedImage}
            style={{
              maxWidth: "90%",
              maxHeight: "85%",
              borderRadius: "14px",
              boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
              transition: "0.3s",
            }}
          />
        </MDBox>
      )}
    </Dialog>
  );

  const paymentDialog = (
  <Dialog open={!!paymentProject} onClose={() => setPaymentProject(null)}>
<DialogTitle>
  {paymentType === "add" ? "Add Payment" : "Deduct Payment"}
</DialogTitle>
    <DialogContent>
      <input
        type="number"
        placeholder="Enter amount"
        value={paymentAmount}
        onChange={(e) => setPaymentAmount(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginTop: "10px",
          marginBottom: "10px",
        }}
      />

      <button onClick={handleAddPayment}>Save</button>
    </DialogContent>
  </Dialog>
);
const descriptionDialog = (
  <Dialog
    open={!!selectedDescription}
    onClose={() => setSelectedDescription(null)}
    fullWidth
    maxWidth="sm"
  >
    <DialogTitle
      sx={{
        textAlign: "center",
        bgcolor: "#1976d2",
        color: "#fff",
        fontSize: "16px",
        fontWeight: "bold",
      }}
    >
      Description
    </DialogTitle>

    <DialogContent sx={{ mt: 2 }}>
      <MDBox textAlign="left">
        <MDTypography
          variant="body2"
          sx={{
            fontSize: "14px",
            lineHeight: 1.6,
            whiteSpace: "pre-line",
          }}
        >
          {selectedDescription || "-"}
        </MDTypography>
      </MDBox>
    </DialogContent>
  </Dialog>
);



const deleteDialog = (
  <Dialog
    open={!!deleteId}
    onClose={() => setDeleteId(null)}
    maxWidth="xs"
    fullWidth
    PaperProps={{
      sx: {
        borderRadius: "16px",
        p: 1,
      },
    }}
  >
    {/* HEADER */}
    <DialogTitle
      sx={{
        textAlign: "center",
        fontWeight: "bold",
        fontSize: "18px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1,
      }}
    >
      <WarningAmberIcon sx={{ color: "#f44336", fontSize: 40 }} />
      Confirm Delete
    </DialogTitle>

    {/* CONTENT */}
    <DialogContent sx={{ textAlign: "center", fontSize: "14px", color: "#555" }}>
      Are you sure you want to delete this project?
      <br />
      <b style={{ color: "#f44336" }}>This action cannot be undone.</b>
    </DialogContent>

    {/* ACTIONS */}
    <DialogActions
      sx={{
        justifyContent: "center",
        pb: 2,
        gap: 1,
      }}
    >
      {/* CANCEL */}
      <Button
        onClick={() => setDeleteId(null)}
        sx={{
          borderRadius: "8px",
          textTransform: "none",
          px: 3,
          border: "1px solid black",
          color: "#000",
        }}
      >
        Cancel
      </Button>

      {/* DELETE */}
      <Button
        variant="contained"
        color="error"
        onClick={async () => {
          await deleteProject(deleteId);
          setDeleteId(null);
        }}
        sx={{
          borderRadius: "8px",
          textTransform: "none",
          px: 3,
          background: "#f44336",
          color: "#fff",
          "&:hover": {
            background: "#d32f2f"
          }
        }}
      >
        Delete
      </Button>
    </DialogActions>
  </Dialog>
);
  return {
    columns,
    rows,
    dialog: (
      <>
        {clientProjectsDialog}
        {projectDetailsDialog}
        {imageLightbox}
        {paymentDialog}
            {descriptionDialog}
            {deleteDialog}

      </>
    ),
    
  };
}
