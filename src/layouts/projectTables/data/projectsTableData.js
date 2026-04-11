import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";

import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Grid from "@mui/material/Grid";

import Button from "@mui/material/Button";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

export default function useProjectData() {
  const [rows, setRows] = useState([]);
  const [projects, setProjects] = useState([]);

  const [drawingProject, setDrawingProject] = useState(null);
  const [drawingDialog, setDrawingDialog] = useState(false);
  const [uploadDialog, setUploadDialog] = useState(false);

  const [drawingImages, setDrawingImages] = useState([]);
  const [deleteId, setDeleteId] = useState(null);

  const [tab, setTab] = useState("civil");

  const navigate = useNavigate();

  // 🔵 COMMON BUTTON STYLE
  const buttonStyle = {
    textTransform: "none",
    borderRadius: "8px",
    px: 3,
    fontWeight: "600",
    color: "#fff",
  };

  // =========================
  // ✅ LOAD DATA
  // =========================
  const loadData = async () => {
    try {
      const res = await fetch("https://fullstack-project-1-n510.onrender.com/api/projects");

      if (!res.ok) throw new Error("Failed to fetch projects");

      const data = await res.json();
      setProjects(data || []);
    } catch (err) {
      console.error("Load Error:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // =========================
  // ✅ DELETE PROJECT
  // =========================
  const deleteProject = async (id) => {
    if (!id) return;

    try {
      await fetch(`https://fullstack-project-1-n510.onrender.com/api/projects/${id}`, {
        method: "DELETE",
      });

      loadData();
    } catch (err) {
      console.error("Delete Error:", err);
    }
  };

  // =========================
  // ✅ UPDATE STATUS
  // =========================
  const handleStatusChange = async (id, value) => {
    if (!id) return;

    try {
      await fetch(`https://fullstack-project-1-n510.onrender.com/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: value }),
      });

      loadData();
    } catch (err) {
      console.error("Status Error:", err);
    }
  };

  // =========================
  // ✅ SAFE OPEN DRAWING
  // =========================
  const openDrawingDialog = (project) => {
    if (!project || !project._id) {
      console.error("Invalid project");
      return;
    }

    setDrawingProject(project);
    setDrawingDialog(true);
  };

  // =========================
  // ✅ UPLOAD DRAWINGS
  // =========================
  const handleUpload = async () => {
    if (!drawingProject || !drawingProject._id) {
      alert("No project selected");
      return;
    }

    if (drawingImages.length === 0) {
      alert("Please select images");
      return;
    }

    try {
      const formData = new FormData();

      drawingImages.forEach((file) => {
        formData.append("images", file);
      });

      formData.append("drawingType", tab);

      const res = await fetch(
        `https://fullstack-project-1-n510.onrender.com/api/projects/${drawingProject._id}/drawing`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) throw new Error("Upload failed");

      // RESET
      setUploadDialog(false);
      setDrawingImages([]);
      loadData();
    } catch (err) {
      console.error("Upload Error:", err);
      alert("Upload failed");
    }
  };

  // =========================
  // ✅ FORMAT TABLE
  // =========================
  const formatRows = (data) =>
    data.map((p, i) => ({
      serial: <MDTypography variant="caption">{i + 1}</MDTypography>,

      project: <MDTypography variant="caption">{p?.projectName || "-"}</MDTypography>,

      client: <MDTypography variant="caption">{p?.clientName || "-"}</MDTypography>,

      image: (
        <Button
          variant="contained"
          onClick={() => openDrawingDialog(p)}
          sx={{ ...buttonStyle, background: "#1976d2", fontSize: "12px" }}
        >
          View Drawings
        </Button>
      ),

      status: (
        <Select
          size="small"
          value={p?.status || "Pending"}
          onChange={(e) => handleStatusChange(p?._id, e.target.value)}
          sx={{
            height: 30,
            bgcolor: "#1976d2",
            color: "#fff",
            "& .MuiSvgIcon-root": { color: "#fff" },
          }}
        >
          <MenuItem value="Pending">Pending</MenuItem>
          <MenuItem value="Running">Running</MenuItem>
          <MenuItem value="Completed">Completed</MenuItem>
        </Select>
      ),

      actions: (
        <MDBox>
          <IconButton onClick={() => navigate("/projects", { state: p })}>
            <EditIcon />
          </IconButton>

          <IconButton onClick={() => p?._id && setDeleteId(p._id)}>
            <DeleteIcon />
          </IconButton>
        </MDBox>
      ),
    }));

  useEffect(() => {
    setRows(formatRows(projects));
  }, [projects]);

  // =========================
  // ✅ DRAWING DIALOG
  // =========================
  const drawingDialogUI = (
    <Dialog open={drawingDialog} onClose={() => setDrawingDialog(false)} fullWidth>
      <DialogTitle>Project Drawings</DialogTitle>

      <DialogContent>
        <MDBox display="flex" gap={2} mb={2}>
          {["civil", "interior"].map((t) => (
            <Button
              key={t}
              onClick={() => setTab(t)}
              sx={{
                ...buttonStyle,
                background: tab === t ? "#1976d2" : "#9e9e9e",
              }}
            >
              {t.toUpperCase()}
            </Button>
          ))}
        </MDBox>

        <Grid container spacing={2}>
          {(drawingProject?.[tab + "Images"] || []).map((img, i) => (
            <Grid item xs={6} key={i}>
              <img src={img} style={{ width: "100%", borderRadius: "8px" }} />
            </Grid>
          ))}
        </Grid>

        <MDBox mt={2}>
          <Button
            variant="contained"
            onClick={() => setUploadDialog(true)}
            sx={{ ...buttonStyle, background: "#1976d2" }}
          >
            Add Drawings
          </Button>
        </MDBox>
      </DialogContent>
    </Dialog>
  );

  // =========================
  // ✅ UPLOAD DIALOG
  // =========================
  const uploadDialogUI = (
    <Dialog open={uploadDialog} onClose={() => setUploadDialog(false)} fullWidth>
      <DialogTitle>Upload Drawings</DialogTitle>

      <DialogContent>
        <Button variant="contained" component="label" sx={{ ...buttonStyle, background: "#1976d2" }}>
          Select Images
          <input
            hidden
            type="file"
            multiple
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              setDrawingImages(files);
            }}
          />
        </Button>

        <Grid container spacing={2} mt={2}>
          {drawingImages.map((file, i) => (
            <Grid item key={i}>
              <img src={URL.createObjectURL(file)} width="80" />
            </Grid>
          ))}
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={() => setUploadDialog(false)}>Cancel</Button>

        <Button
          variant="contained"
          sx={{ ...buttonStyle, background: "#1976d2" }}
          onClick={handleUpload}
        >
          Upload
        </Button>
      </DialogActions>
    </Dialog>
  );

  // =========================
  // ✅ DELETE DIALOG
  // =========================
  const deleteDialog = (
    <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <WarningAmberIcon color="error" />
        Confirm Delete
      </DialogTitle>

      <DialogActions>
        <Button onClick={() => setDeleteId(null)}>Cancel</Button>

        <Button
          variant="contained"
          sx={{ ...buttonStyle, background: "#f44336" }}
          onClick={async () => {
            await deleteProject(deleteId);
            setDeleteId(null);
          }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );

  return {
    columns: [
      { Header: "S.No.", accessor: "serial" },
      { Header: "Project", accessor: "project" },
      { Header: "Client", accessor: "client" },
      { Header: "Drawings", accessor: "image" },
      { Header: "Status", accessor: "status" },
      { Header: "Actions", accessor: "actions" },
    ],
    rows,
    dialog: (
      <>
        {drawingDialogUI}
        {uploadDialogUI}
        {deleteDialog}
      </>
    ),
  };
}