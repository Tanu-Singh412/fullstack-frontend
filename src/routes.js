import Dashboard from "layouts/dashboard";
import Tables from "layouts/tables";
import ProjectTables from "layouts/projectTables";
import Projects from "layouts/project";
import Add_clients from "layouts/Client/add_client";
import Billing from "layouts/billing";
import Vendor from "layouts/vendor";
import AddVendor from "layouts/vendor/add-vendor";
import SignIn from "layouts/authentication/sign-in";

import Icon from "@mui/material/Icon";

const routes = [
  {
    type: "route",
    name: "Sign In",
    key: "sign-in",
    route: "/authentication/sign-in",
    component: <SignIn />,
  },

  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
  },

  {
    type: "collapse",
    name: "Add Clients",
    key: "add_clients",
    icon: <Icon fontSize="small">person_add</Icon>,
    route: "/add-clients",
    component: <Add_clients />,
  },

  {
    type: "collapse",
    name: "Manage Clients",
    key: "tables",
    icon: <Icon fontSize="small">table_view</Icon>,
    route: "/tables",
    component: <Tables />,
  },

  {
    type: "collapse",
    name: "Add Projects",
    key: "projects",
    icon: <Icon fontSize="small">store</Icon>,
    route: "/projects",
    component: <Projects />,
  },

  {
    type: "collapse",
    name: "Manage Projects",
    key: "projectTables",
    icon: <Icon fontSize="small">receipt_long</Icon>,
    route: "/projectTables",
    component: <ProjectTables />,
  },

  {
    type: "collapse",
    name: "Invoice",
    key: "billing",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/billing",
    component: <Billing />,
  },
  {
    type: "collapse",
    name: "Vendor",
    key: "Vendor",
    icon: <Icon fontSize="small">receipt_long</Icon>,
    route: "/vendor",
    component: <Vendor />,
  },
  {
  type: "route", // 👈 IMPORTANT (not collapse)
  name: "Add Vendor",
  key: "add-vendor",
  route: "/add-vendor",
  component: <AddVendor />,
},
];

export default routes;
