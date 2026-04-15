import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";

import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Avatar from "@mui/material/Avatar";

import Divider from "@mui/material/Divider";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

export default function useVendorTableData() {
  const navigate = useNavigate();

  const [vendors, setVendors] = useState([]);
  const [rows, setRows] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  // =====================
  // LOAD DATA
  // =====================
  const loadData = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/vendors");

      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error("Invalid JSON response:", text);
        return;
      }

      setVendors(data?.data || []);
    } catch (err) {
      console.error("LOAD ERROR:", err);
    }
  };

  // =====================
  // STATUS UPDATE
  // =====================
  const handleStatusChange = async (id, value) => {
    try {
      setVendors((prev) => prev.map((v) => (v._id === id ? { ...v, status: value } : v)));

      await fetch(`http://localhost:5000/api/vendors/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: value }),
      });
    } catch (err) {
      console.error("STATUS UPDATE ERROR:", err);
    }
  };

  // =====================
  // DELETE
  // =====================
  const deleteVendor = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/vendors/${id}`, {
        method: "DELETE",
      });

      loadData();
    } catch (err) {
      console.error("DELETE ERROR:", err);
    }
  };

  // =====================
  // EDIT
  // =====================
  const editVendor = (v) => {
    localStorage.setItem("editVendor", JSON.stringify(v));
    navigate("/add-vendor");
  };

  // =====================
  // FORMAT ROWS
  // =====================
  const formatRows = (data) =>
    data.map((v, i) => ({
      serial: <MDTypography fontSize="12px">{i + 1}</MDTypography>,

      expand: (
        <IconButton
          size="small"
          onClick={() => setSelectedVendor(v)}
          sx={{ backgroundColor: "#1976d2", color: "#fff" }}
        >
          <AddCircleIcon sx={{ fontSize: 18 }} />
        </IconButton>
      ),

      vendor: (
        <MDTypography fontSize="13px" fontWeight="bold">
          {v.vendorName || "-"}
        </MDTypography>
      ),

      company: (
        <MDTypography fontSize="13px" fontWeight="bold">
          {v.company || "-"}
        </MDTypography>
      ),
      phone: (
        <MDTypography fontSize="13px" fontWeight="bold">
          {v.phone || "-"}
        </MDTypography>
      ),
      gst: (
        <MDTypography fontSize="13px" fontWeight="bold">
          {v.gst || "-"}
        </MDTypography>
      ),

      date: (
        <MDTypography fontSize="12px">
          {v.createdAt ? new Date(v.createdAt).toLocaleString() : "-"}
        </MDTypography>
      ),

      status: (
        <Select
          size="small"
          value={v.status || "Active"}
          onChange={(e) => handleStatusChange(v._id, e.target.value)}
          sx={{
            bgcolor: v.status === "Active" ? "#4caf50" : "#f44336",
            color: "#fff",
            "& .MuiSelect-icon": { color: "#fff" },
            "& fieldset": { border: "none" },
            "& .MuiSelect-select": { color: "#fff" },
            "& .MuiSvgIcon-root": { color: "#fff" },
            p: 1,
          }}
        >
          <MenuItem value="Active">Active</MenuItem>
          <MenuItem value="Inactive">Inactive</MenuItem>
        </Select>
      ),

      actions: (
        <MDBox display="flex" gap={1}>
          <IconButton onClick={() => editVendor(v)} sx={{ color: "#1976d2" }}>
            <EditIcon />
          </IconButton>

          <IconButton onClick={() => setDeleteId(v._id)} sx={{ color: "#f44336" }}>
            <DeleteIcon />
          </IconButton>
        </MDBox>
      ),
    }));

  // =====================
  // EFFECTS
  // =====================
  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setRows(formatRows(vendors));
  }, [vendors]);

  // =====================
  // RETURN
  // =====================
  return {
    columns: [
      { Header: "#", accessor: "serial" },
      { Header: "", accessor: "expand" },
      { Header: "Vendor", accessor: "vendor" },
      { Header: "Company", accessor: "company" },
      { Header: "Phone", accessor: "phone" },
      { Header: "GST", accessor: "gst" },
      { Header: "Date", accessor: "date" },
      { Header: "Status", accessor: "status" },
      { Header: "Actions", accessor: "actions" },
    ],

    rows,

    dialog: (
      <>
        <Dialog
          open={!!selectedVendor}
          onClose={() => setSelectedVendor(null)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle
            sx={{ bgcolor: "#1976d2", color: "#fff", textAlign: "center", fontWeight: "bold" }}
          >
            Vendor Details
          </DialogTitle>

          <DialogContent>
            {selectedVendor && (
              <MDBox>
                {/* Avatar */}
                <Avatar
                  sx={{
                    bgcolor: "#1976d2",
                    width: 60,
                    height: 60,
                    margin: "0 auto",
                    mb: 2,
                    mt: 2,
                  }}
                >
                  {selectedVendor.vendorName?.charAt(0)}
                </Avatar>

                <MDTypography variant="h6" sx={{ textAlign: "center", mb: 2, mt: 2 }}>
                  {selectedVendor.vendorName}
                </MDTypography>

                <Divider sx={{ my: 2 }} />

                <p>
                  <b>Company:</b> {selectedVendor.company || "-"}
                </p>
                <p>
                  <b>Phone:</b> {selectedVendor.phone || "-"}
                </p>
                <p>
                  <b>Email:</b> {selectedVendor.email || "-"}
                </p>
                <p>
                  <b>Address:</b> {selectedVendor.address || "-"}
                </p>

                <Divider sx={{ my: 2 }} />

                <b>Materials:</b>

                {selectedVendor.materials?.length > 0 ? (
                  selectedVendor.materials.map((m, i) => (
                    <p key={i}>
                      • {m.materialName || "-"} — ₹{m.rate || 0}
                    </p>
                  ))
                ) : (
                  <p>No materials</p>
                )}
              </MDBox>
            )}
          </DialogContent>
        </Dialog>

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
            Are you sure you want to delete this vendor?
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
                await deleteVendor(deleteId);
                setDeleteId(null);
              }}
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                px: 3,
                background: "#f44336",
                color: "#fff",
                "&:hover": {
                  background: "#d32f2f",
                },
              }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </>
    ),
  };
}
