import { useEffect, useState } from "react";
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";

import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { useNavigate } from "react-router-dom";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";

import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
export default function clientTableData() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
const [deleteId, setDeleteId] = useState(null);
  const columns = [
    { Header: "S.No.", accessor: "serial" },
    { Header: "", accessor: "expand" },
    { Header: "Client", accessor: "client" },
    { Header: "Client ID", accessor: "clientId" },
    // { Header: "Payment", accessor: "total" },
    // { Header: "Paid", accessor: "advance" },
    // { Header: "Balance", accessor: "balance" },
    { Header: "Date", accessor: "date" },
    { Header: "Status", accessor: "status" },
    { Header: "Actions", accessor: "actions" },
  ];

  // =====================
  // LOAD DATA
  // =====================
  const loadData = async () => {
    try {
      const res = await fetch("https://fullstack-project-1-n510.onrender.com/api/clients");
      const data = await res.json();
      setClients(data);
    } catch (error) {
      console.error("Failed to fetch clients:", error);
    }
  };

  // =====================
  // STATUS UPDATE
  // =====================
  const handleStatusChange = async (id, value) => {
    setClients((prev) => prev.map((c) => (c._id === id ? { ...c, status: value } : c)));

    const clientToUpdate = clients.find((c) => c._id === id);
    if (!clientToUpdate) return;

    await fetch(`https://fullstack-project-1-n510.onrender.com/api/clients/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...clientToUpdate, status: value }),
    });
  };

  // =====================
  // DELETE
  // =====================
  const deleteClient = async (id) => {
    try {
      await fetch(`https://fullstack-project-1-n510.onrender.com/api/clients/${id}`, {
        method: "DELETE",
      });
      loadData();
    } catch (error) {
      console.error("Failed to delete client:", error);
    }
  };

  // =====================
  // EDIT
  // =====================
  const editClient = (c) => {
    localStorage.setItem("editClient", JSON.stringify(c));
    navigate("/add-clients");
  };

  // =====================
  // FORMAT ROWS
  // =====================
  const formatRows = (data) => {
    return data
      .slice()
      .reverse()
      .map((c, i) => {
        const balance = Number(c.totalAmount || 0) - Number(c.advance || 0);
        const date = new Date(c.createdAt).toLocaleString();
        const currentStatus = c.status || "Active";
        const bg = currentStatus === "Active" ? "#4caf50" : "#f44336";

        return {
          serial: <MDTypography variant="caption">{i + 1}</MDTypography>,

          expand: (
            <IconButton
              onClick={() => setSelectedClient(c)}
              sx={{
                color: "#1976d2",
                transition: "0.3s",
                "&:hover": {
                  color: "#0d47a1",
                  transform: "scale(1.2)",
                },
              }}
            >
              <AddCircleIcon />
            </IconButton>
          ),

          client: <MDTypography variant="caption">{c.name}</MDTypography>,

          clientId: <MDTypography variant="caption">{c.clientId || c._id}</MDTypography>,

          // total: <MDTypography variant="caption">{c.totalAmount}</MDTypography>,

          // advance: <MDTypography variant="caption">{c.advance}</MDTypography>,

          // balance: <MDTypography variant="caption">{balance}</MDTypography>,

          date: <MDTypography variant="caption">{date}</MDTypography>,

          status: (
            <Select
              size="small"
              value={currentStatus}
              onChange={(e) => handleStatusChange(c._id, e.target.value)}
              sx={{
                fontSize: 12,
                height: 30,
                bgcolor: bg,
                color: "#fff",
                "& .MuiSelect-select": { color: "#fff" },
                "& .MuiSvgIcon-root": { color: "#fff" },
              }}
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </Select>
          ),

          actions: (
            <MDBox display="flex">
              <IconButton color="info" onClick={() => editClient(c)}>
                <EditIcon />
              </IconButton>

              <IconButton color="error" onClick={() => setDeleteId(c._id)}>
                <DeleteIcon />
              </IconButton>
            </MDBox>
          ),
        };
      });
  };

  // =====================
  // UPDATE ROWS
  // =====================
  useEffect(() => {
    setRows(formatRows(clients));
  }, [clients]);

  // ✅ IMPORTANT FIX (force re-render)
  useEffect(() => {
    setRows((prev) => [...prev]);
  }, [selectedClient]);

  // =====================
  // SEARCH
  // =====================
  useEffect(() => {
    const handleSearch = (e) => {
      const query = e.detail.query.toLowerCase();

      const filtered = clients.filter((c) => {
        return (
          c.name?.toLowerCase().includes(query) ||
          c._id?.toLowerCase().includes(query) ||
          c.clientId?.toLowerCase().includes(query)
        );
      });

      setRows(formatRows(filtered));
    };

    window.addEventListener("searchChanged", handleSearch);
    return () => window.removeEventListener("searchChanged", handleSearch);
  }, [clients]);

  // =====================
  // INITIAL LOAD
  // =====================
  useEffect(() => {
    loadData();
  }, []);

  // =====================
  // RETURN
  // =====================
return {
  columns,
  rows,

  dialog: (
    <>
      {/* 👇 EXISTING VIEW DIALOG */}
      <Dialog
        open={!!selectedClient}
        onClose={() => setSelectedClient(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            fontWeight: "bold",
            bgcolor: "#1976d2",
            color: "#fff",
            marginBottom: 2,
          }}
        >
          Client Details
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {selectedClient && (
            <MDBox textAlign="center">
              <Avatar
                sx={{
                  bgcolor: "#1976d2",
                  width: 60,
                  height: 60,
                  margin: "0 auto",
                  mb: 2,
                }}
              >
                {selectedClient.name?.charAt(0)}
              </Avatar>

              <MDTypography variant="h6" mb={1}>
                {selectedClient.name}
              </MDTypography>

              <Divider sx={{ mb: 2 }} />

              <MDBox textAlign="left">
                <p><b>Email:</b> {selectedClient.email || "-"}</p>
                <p><b>Phone:</b> {selectedClient.phone || "-"}</p>
                <p><b>Address:</b> {selectedClient.address || "-"}</p>
              </MDBox>
            </MDBox>
          )}
        </DialogContent>
      </Dialog>

      {/* 👇 NEW DELETE CONFIRM DIALOG */}


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
    <DialogContent
      sx={{
        textAlign: "center",
        fontSize: "14px",
        color: "#555",
      }}
    >
      Do you really want to delete this client?
      <br />
      <b style={{ color: "#f44336" }}>
        This action cannot be undone.
      </b>
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
          border: "1px solid #000",
          color: "#000",
        }}
      >
        Cancel
      </Button>

      {/* DELETE */}
      <Button
        variant="contained"
        onClick={async () => {
          await deleteClient(deleteId);
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
