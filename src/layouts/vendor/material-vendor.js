import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

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
  <DashboardLayout>
    <DashboardNavbar />

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
                  {v.vendorName}
                </MDBox>
              ))}
            </Card>
          </Grid>
        ))}
      </Grid>
    </MDBox>

    <Footer />
  </DashboardLayout>
);
};

export default MaterialVendor;