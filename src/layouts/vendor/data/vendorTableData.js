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
        const vendors = data.data || data;

        const formattedRows = vendors.map((v) => ({
          vendorName: (
            <Box display="flex" alignItems="center">
              <Avatar sx={{ mr: 1, bgcolor: '#1976d2', color: "#fff" }}>
                {v.vendorName?.charAt(0)}
              </Avatar>
              <Typography fontWeight="medium">{v.vendorName}</Typography>
            </Box>
          ),

          phone: <Typography>📞 {v.phone}</Typography>,

          email: (
            <Typography color="text.secondary">{v.email}</Typography>
          ),

          company: (
            <Chip
              label={v.company}
              variant="outlined"
              sx={{ borderRadius: 2 }}
            />
          ),

          action: (
            <Button
              variant="contained"
              size="small"
              onClick={() => navigate(`/vendor/${v._id}`)}
              sx={{ borderRadius: 2 }}
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
    { Header: "Vendor", accessor: "vendorName" },
    { Header: "Phone", accessor: "phone" },
    { Header: "Email", accessor: "email" },
    { Header: "Company", accessor: "company" },
    { Header: "Action", accessor: "action" },
  ];

  return {
    columns,
    rows,
    dialog: null,
  };
}

export default useVendorTableData;