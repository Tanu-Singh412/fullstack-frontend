import { useLocation } from "react-router-dom";
import { useState } from "react";

import { Box, Button, Grid } from "@mui/material";
import MDTypography from "components/MDTypography";

export default function ProjectDetails() {
  const { state: project } = useLocation();

  const [tab, setTab] = useState("drawings");

  if (!project) return <div>No Data</div>;

  return (
    <Box p={3}>
      {/* HEADER */}
      <MDTypography variant="h4" fontWeight="bold">
        {project.projectName}
      </MDTypography>

      <MDTypography variant="body2" mb={2}>
        Client: {project.clientName}
      </MDTypography>

      {/* TABS */}
      <Box display="flex" gap={2} mb={3}>
        <Button
          variant={tab === "drawings" ? "contained" : "outlined"}
          onClick={() => setTab("drawings")}
        >
          Drawings
        </Button>

        <Button
          variant={tab === "payments" ? "contained" : "outlined"}
          onClick={() => setTab("payments")}
        >
          Payments
        </Button>

        <Button
          variant={tab === "info" ? "contained" : "outlined"}
          onClick={() => setTab("info")}
        >
          Info
        </Button>
      </Box>

      {/* CONTENT */}
      {tab === "drawings" && (
        <Grid container spacing={2}>
          {(project.civilImages || []).map((img, i) => (
            <Grid item xs={6} md={3} key={i}>
              <img
                src={img}
                style={{
                  width: "100%",
                  height: "150px",
                  objectFit: "cover",
                  borderRadius: "10px",
                }}
              />
            </Grid>
          ))}

          {(project.interiorImages || []).map((img, i) => (
            <Grid item xs={6} md={3} key={i}>
              <img
                src={img}
                style={{
                  width: "100%",
                  height: "150px",
                  objectFit: "cover",
                  borderRadius: "10px",
                }}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {tab === "payments" && (
        <Box>
          {project.payments?.map((p, i) => (
            <Box
              key={i}
              sx={{
                p: 2,
                mb: 1,
                borderRadius: "10px",
                background: "#f5f5f5",
              }}
            >
              ₹ {p.amount} — {new Date(p.date || p.createdAt).toLocaleString()}
            </Box>
          ))}
        </Box>
      )}

      {tab === "info" && (
        <Box>
          <MDTypography>Description:</MDTypography>
          <MDTypography>{project.description}</MDTypography>

          <MDTypography mt={2}>Total: ₹ {project.totalAmount}</MDTypography>
        </Box>
      )}
    </Box>
  );
}