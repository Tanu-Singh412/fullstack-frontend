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
export default function useClientTableData() {
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
    { Header: "Date", accessor: "date" },
    { Header: "Status", accessor: "status" },
    { Header: "Actions", accessor: "actions" },
  ];

  // LOAD DATA
  const loadData = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/clients");
      const data = await res.json();
      setClients(data);
    } catch (error) {
      console.error("Failed to fetch clients:", error);
    }
  };

  // STATUS UPDATE
  const handleStatusChange = async (id, value) => {
    setClients((prev) =>
      prev.map((c) => (c._id === id ? { ...c, status: value } : c))
    );

    const clientToUpdate = clients.find((c) => c._id === id);
    if (!clientToUpdate) return;

    await fetch(`http://localhost:5000/api/clients/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...clientToUpdate, status: value }),
    });
  };

  // DELETE
  const deleteClient = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/clients/${id}`, {
        method: "DELETE",
      });
      loadData();
    } catch (error) {
      console.error("Failed to delete client:", error);
    }
  };

  // EDIT
  const editClient = (c) => {
    localStorage.setItem("editClient", JSON.stringify(c));
    navigate("/add-clients");
  };

  // FORMAT ROWS
  const formatRows = (data) => {
    return data
      .slice()
      .reverse()
      .map((c, i) => {
        const date = new Date(c.createdAt).toLocaleString();
        const currentStatus = c.status || "Active";
        const bg = currentStatus === "Active" ? "#4caf50" : "#f44336";

        return {
          serial: <MDTypography variant="caption">{i + 1}</MDTypography>,

          expand: (
            <IconButton onClick={() => setSelectedClient(c)}>
              <AddCircleIcon />
            </IconButton>
          ),

          client: <MDTypography variant="caption">{c.name}</MDTypography>,

          clientId: (
            <MDTypography variant="caption">
              {c.clientId || c._id}
            </MDTypography>
          ),

          date: <MDTypography variant="caption">{date}</MDTypography>,

          status: (
            <Select
              size="small"
              value={currentStatus}
              onChange={(e) => handleStatusChange(c._id, e.target.value)}
              sx={{ bgcolor: bg, color: "#fff" }}
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </Select>
          ),

          actions: (
            <MDBox display="flex">
              <IconButton onClick={() => editClient(c)}>
                <EditIcon />
              </IconButton>

              <IconButton onClick={() => setDeleteId(c._id)}>
                <DeleteIcon />
              </IconButton>
            </MDBox>
          ),
        };
      });
  };

  // EFFECTS
  useEffect(() => {
    setRows(formatRows(clients));
  }, [clients]);

  useEffect(() => {
    loadData();
  }, []);

  // RETURN
  return {
    columns,
    rows,
    dialog: (
      <>
        <Dialog
          open={!!selectedClient}
          onClose={() => setSelectedClient(null)}
        >
          <DialogTitle>Client Details</DialogTitle>
          <DialogContent>
            {selectedClient?.name}
          </DialogContent>
        </Dialog>

        <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogActions>
            <Button onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button
              onClick={async () => {
                await deleteClient(deleteId);
                setDeleteId(null);
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