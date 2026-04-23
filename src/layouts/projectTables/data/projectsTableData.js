import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";

import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";

import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";

import Button from "@mui/material/Button";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import DialogActions from "@mui/material/DialogActions";

export default function useProjectData() {
  const [rows, setRows] = useState([]);
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const target = params.get("target");
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

    const amount = paymentType === "subtract" ? -Math.abs(paymentAmount) : Math.abs(paymentAmount);

    await fetch(`https://fullstack-project-1-n510.onrender.com/api/projects/${paymentProject._id}/payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount }),
    });

    setPaymentProject(null);
    setPaymentAmount("");
    loadData();
  };

  const columns = [
    { Header: "S.No.", accessor: "serial" },
    { Header: "Project", accessor: "project" },
    { Header: "Client", accessor: "client" },
    { Header: "Total", accessor: "total" },
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
    await fetch(`https://fullstack-project-1-n510.onrender.com/api/projects/${id}`, {
      method: "DELETE",
    });
    loadData();
  };

  // Update project status
  const handleStatusChange = async (id, value) => {
    setProjects((prev) => prev.map((p) => (p._id === id ? { ...p, status: value } : p)));

    await fetch(`https://fullstack-project-1-n510.onrender.com/api/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: value }),
    });
  };

  // Load projects from backend
  const loadData = async () => {
    const res = await fetch("https://fullstack-project-1-n510.onrender.com/api/projects");
    const data = await res.json();
    setProjects(data);
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
      const date = new Date(p.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' });
      const currentStatus = p.status || "Pending";

      const downloadDWG = (file) => {
        const link = document.createElement("a");
        link.href = file.url;
        link.download = file.name || "drawing.dwg";
        link.click();
      };

      return {
        serial: <MDTypography variant="caption" fontWeight="bold" sx={{ color: "#3b82f6" }}>{i + 1}</MDTypography>,

        project: (
          <MDBox display="flex" alignItems="center">
            <MDBox
              sx={{
                width: 36,
                height: 36,
                borderRadius: "10px",
                background: "linear-gradient(135deg, #10b981, #3b82f6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: "bold",
                mr: 1.5,
                fontSize: 14,
                boxShadow: "0 4px 10px rgba(16, 185, 129, 0.2)"
              }}
            >
              {p.projectName?.charAt(0).toUpperCase()}
            </MDBox>
            <MDBox>
              <MDTypography variant="caption" fontWeight="bold" display="block" sx={{ color: "#1e293b" }}>
                {p.projectName}
              </MDTypography>
              <MDTypography variant="xxs" color="text">ID: {p.projectId || p._id?.slice(-6)}</MDTypography>
            </MDBox>
          </MDBox>
        ),

        client: (
          <MDBox>
            <MDTypography variant="caption" fontWeight="bold" color="info" display="block">
              {p.clientName}
            </MDTypography>
            <MDTypography variant="xxs" color="text">{p.clientId}</MDTypography>
          </MDBox>
        ),

        total: (
          <MDBox sx={{ px: 1, py: 0.5, borderRadius: 1.5, bgcolor: "#f0fdf4", border: "1px solid #dcfce7" }}>
            <MDTypography variant="caption" fontWeight="bold" color="success">
              ₹ {p.totalAmount?.toLocaleString("en-IN")}
            </MDTypography>
          </MDBox>
        ),

        date: (
          <MDBox>
            <MDTypography variant="caption" fontWeight="bold" display="block">
              {new Date(p.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
            </MDTypography>
            <MDTypography variant="xxs" color="text">
              {new Date(p.createdAt).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' })}
            </MDTypography>
          </MDBox>
        ),

        status: (
          <Select
            size="small"
            value={currentStatus}
            onChange={(e) => handleStatusChange(p._id, e.target.value)}
            sx={{
              fontSize: 11,
              height: 28,
              minWidth: 100,
              borderRadius: 2,
              fontWeight: "bold",
              bgcolor:
                currentStatus === "Pending" ? "#fef2f2" :
                  currentStatus === "Running" ? "#eff6ff" :
                    currentStatus === "Assigned" ? "#fff7ed" : "#f0fdf4",
              color:
                currentStatus === "Pending" ? "#dc2626" :
                  currentStatus === "Running" ? "#2563eb" :
                    currentStatus === "Assigned" ? "#ea580c" : "#16a34a",
              "& fieldset": { border: "none" },
            }}
          >
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Running">Running</MenuItem>
            <MenuItem value="Assigned">Assigned</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
          </Select>
        ),

        actions: (
          <MDBox display="flex" gap={0.5}>
            <Button
              variant="contained"
              size="small"
              onClick={() => {
                const tabMap = { drawings: 1, accounts: 2, scope: 3 };
                const tab = tabMap[target] || 0;
                navigate(`/project-details/${p._id}?tab=${tab}`, { state: p });
              }}
              sx={{
                textTransform: "none",
                fontSize: "10px",
                px: 1,
                py: 0.3,
                bgcolor: "#6366f1",
                color: "#fff",
                borderRadius: 1.5,
                '&:hover': { bgcolor: "#6366f1" }
              }}
            >
              Details
            </Button>

            <IconButton
              size="small"
              onClick={() => editProject(p)}
              sx={{ color: "#3b82f6", bgcolor: "#eff6ff", borderRadius: 1.5 }}
            >
              <EditIcon fontSize="inherit" />
            </IconButton>

            <IconButton
              size="small"
              onClick={() => setDeleteId(p._id)}
              sx={{ color: "#ef4444", bgcolor: "#fef2f2", borderRadius: 1.5 }}
            >
              <DeleteIcon fontSize="inherit" />
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

  // Initial load
  useEffect(() => {
    loadData();
  }, []);

  return {
    columns,
    rows,
    dialog: (
      <>
        {/* Delete Confirmation */}
        <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} PaperProps={{ sx: { borderRadius: 3 } }}>
          <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <WarningAmberIcon color="error" /> Delete Project
          </DialogTitle>
          <DialogContent>
            Are you sure you want to delete this project? All associated data will be lost.
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => { deleteProject(deleteId); setDeleteId(null); }}
              sx={{ borderRadius: 2, color: "#fff" }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </>
    )
  };
}
