import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function MaterialVendor() {
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("https://fullstack-project-1-n510.onrender.com/api/vendors/material")
      .then((res) => res.json())
      .then((res) => setData(res.data || []))
      .catch((err) => console.error(err));
  }, []);

  return (
    <MDBox p={3}>
      <Grid container spacing={3}>
        {data.map((group, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card sx={{ p: 2 }}>
              <MDTypography variant="h6">
                {group._id || "Uncategorized"}
              </MDTypography>

              {group.vendors?.map((v) => (
                <MDBox
                  key={v._id}
                  onClick={() => navigate(`/vendor/${v._id}`)}
                  sx={{
                    mt: 1,
                    p: 1,
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  <MDTypography fontSize="14px">
                    {v.vendorName}
                  </MDTypography>
                </MDBox>
              ))}
            </Card>
          </Grid>
        ))}
      </Grid>
    </MDBox>
  );
}

export default MaterialVendor;