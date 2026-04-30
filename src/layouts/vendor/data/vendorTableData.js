import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const Base_API = "https://fullstack-project-1-n510.onrender.com/api";

function useVendorTableData() {
  const [rows, setRows] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${Base_API}/vendors`)
      .then((res) => res.json())
      .then((data) => {
        const formattedRows = (data.data || data).map((v, i) => ({
          serial: (
            <Typography variant="caption" fontWeight="bold" sx={{ color: "#3b82f6" }}>
              {i + 1}
            </Typography>
          ),
          vendorName: (
            <Box display="flex" alignItems="center">
              <Avatar sx={{ bgcolor: "#3b82f6", width: 24, height: 24, fontSize: 11, mr: 1 }}>
                {v.vendorName?.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="caption" fontWeight="bold">
                {v.vendorName}
              </Typography>
            </Box>
          ),
          phone: <Typography variant="caption">📞 {v.phone}</Typography>,
          email: <Typography variant="caption" color="text.secondary">{v.email}</Typography>,
          company: (
            <Chip
              label={v.company || "N/A"}
              size="small"
              variant="outlined"
              sx={{ borderRadius: 1.5, fontSize: "10px", height: "20px" }}
            />
          ),
          date: (
            <Box>
              <Typography variant="caption" fontWeight="bold" display="block">
                {new Date(v.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
              </Typography>
              <Typography variant="xxs" sx={{ fontSize: "10px", color: "text.secondary" }}>
                {new Date(v.createdAt).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' })}
              </Typography>
            </Box>
          ),
          action: (
            <Button
              variant="contained"
              size="small"
              onClick={() => navigate(`/vendor/${v._id}`)}
              sx={{ borderRadius: 1.5, textTransform: "none", py: 0.5, minHeight: 0, fontSize: "10px" }}
            >
              View
            </Button>
          ),
        }));

        setRows(formattedRows);
      })
      .catch((err) => {
        console.error("Vendor fetch error:", err);
        setRows([]);
      });
  }, []);

  const columns = [
    { Header: "S.No.", accessor: "serial", width: "5%" },
    { Header: "Vendor", accessor: "vendorName", width: "25%" },
    { Header: "Phone", accessor: "phone", width: "15%" },
    { Header: "Company", accessor: "company", width: "20%" },
    { Header: "Registration", accessor: "date", width: "20%" },
    { Header: "Action", accessor: "action", width: "15%" },
  ];

  return {
    columns,
    rows,
    dialog: null,
  };
}

export default useVendorTableData;