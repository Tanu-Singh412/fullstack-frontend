import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { useEffect, useState, useParams } from "react";

function VendorDetail() {
  const { id } = useParams();
  const [vendor, setVendor] = useState(null);

  useEffect(() => {
    fetch(`https://fullstack-project-1-n510.onrender.com/api/vendors/${id}`)
      .then((res) => res.json())
      .then((res) => setVendor(res.data))
      .catch((err) => console.error(err));
  }, [id]);

  if (!vendor) return <p>Loading...</p>;

  return (
    <MDBox p={3}>
      <MDTypography variant="h4">{vendor.vendorName}</MDTypography>

      <p>Phone: {vendor.phone}</p>
      <p>Email: {vendor.email}</p>
      <p>Company: {vendor.company}</p>
      <p>GST: {vendor.gst}</p>

      <h3>Materials</h3>

      {vendor.materials?.length > 0 ? (
        vendor.materials.map((m, i) => (
          <p key={i}>
            {m.materialName} - ₹{m.rate}
          </p>
        ))
      ) : (
        <p>No materials</p>
      )}
    </MDBox>
  );
}

export default VendorDetail;