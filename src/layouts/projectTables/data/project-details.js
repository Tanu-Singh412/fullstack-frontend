import { useLocation } from "react-router-dom";
import { useState } from "react";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";

function ProjectDetails() {
  const { state } = useLocation();
  const [tab, setTab] = useState(0);
  const [drawingType, setDrawingType] = useState(null); // civil / interior

const handleUpload = async (e) => {
  const file = e.target.files[0];
  if (!file || !drawingType) return;

  const formData = new FormData();
  formData.append("image", file);
  formData.append("type", drawingType); // civil or interior

  await fetch(`http://localhost:5000/api/projects/${state._id}/upload`, {
    method: "POST",
    body: formData,
  });

  alert("Uploaded successfully");
};



  if (!state) return <div>No Data</div>;

  const handleChange = (event, newValue) => {
    setTab(newValue);
  };

  const total = Number(state.totalAmount || 0);
  const paid = (state.payments || []).reduce((sum, p) => sum + Number(p.amount), 0);
  const balance = total - paid;

  return (
    <MDBox p={3}>
      {/* HEADER */}
      <MDTypography variant="h4" mb={1}>
        {state.projectName}
      </MDTypography>

      <MDTypography mb={2}>
        Client: <b>{state.clientName}</b>
      </MDTypography>

      {/* TABS */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={tab} onChange={handleChange}>
          <Tab label="Overview" />
          <Tab label="Drawings" />
          <Tab label="Accounts" />
        </Tabs>
      </Box>

      {/* TAB CONTENT */}

      {/* ✅ OVERVIEW */}
      {tab === 0 && (
        <MDBox mt={2}>
          <MDTypography variant="h6">Description</MDTypography>
          <MDTypography>{state.description}</MDTypography>
        </MDBox>
      )}

      {/* ✅ DRAWINGS */}
      {tab === 1 && (
        <MDBox mt={2}>
          {/* STEP 1: SELECT TYPE */}
          {!drawingType && (
            <MDBox display="flex" gap={2}>
              <MDBox
                onClick={() => setDrawingType("civil")}
                sx={{
                  flex: 1,
                  p: 3,
                  borderRadius: "12px",
                  bgcolor: "#e3f2fd",
                  cursor: "pointer",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                Civil Drawings
              </MDBox>

              <MDBox
                onClick={() => setDrawingType("interior")}
                sx={{
                  flex: 1,
                  p: 3,
                  borderRadius: "12px",
                  bgcolor: "#fce4ec",
                  cursor: "pointer",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                Interior Drawings
              </MDBox>
            </MDBox>
          )}

          {/* STEP 2: SHOW IMAGES */}
          {drawingType && (
            <>
              {/* BACK BUTTON */}
              <MDBox mb={2}>
                <button onClick={() => setDrawingType(null)}>⬅ Back</button>
              </MDBox>

              {/* UPLOAD BUTTON */}
              <MDBox mb={2}>
                <label
                  style={{
                    padding: "8px 16px",
                    background: "#1976d2",
                    color: "#fff",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  + Upload Image
                  <input type="file" hidden onChange={handleUpload} />
                </label>
              </MDBox>

              {/* IMAGE GRID */}
              <MDBox display="flex" flexWrap="wrap" gap={2}>
                {(drawingType === "civil" ? state.civilImages : state.interiorImages)?.map(
                  (img, i) => (
                    <img
                      key={i}
                      src={img}
                      style={{
                        width: drawingType === "interior" ? "300px" : "200px",
                        borderRadius: "10px",
                      }}
                    />
                  )
                )}
              </MDBox>
            </>
          )}
        </MDBox>
      )}

      {/* ✅ ACCOUNTS */}
      {tab === 2 && (
        <MDBox mt={2}>
          <MDTypography variant="h6" mb={2}>
            Payment Details
          </MDTypography>

          {/* SUMMARY */}
          <MDBox display="flex" gap={2} mb={2}>
            <MDBox p={2} bgColor="info" borderRadius="lg" color="white">
              Total: ₹ {total}
            </MDBox>

            <MDBox p={2} bgColor="success" borderRadius="lg" color="white">
              Paid: ₹ {paid}
            </MDBox>

            <MDBox p={2} bgColor="error" borderRadius="lg" color="white">
              Balance: ₹ {balance}
            </MDBox>
          </MDBox>

          {/* TABLE */}
          <table style={{ width: "100%" }}>
            <thead>
              <tr>
                <th align="left">Date</th>
                <th align="right">Amount</th>
              </tr>
            </thead>

            <tbody>
              {(state.payments || []).map((p, i) => (
                <tr key={i}>
                  <td>{new Date(p.date || p.createdAt).toLocaleString()}</td>
                  <td align="right">₹ {p.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </MDBox>
      )}
    </MDBox>
  );
}

export default ProjectDetails;
