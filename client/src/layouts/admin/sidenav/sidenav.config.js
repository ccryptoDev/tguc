import DashboardIcon from "@mui/icons-material/Dashboard";
import ListAltIcon from "@mui/icons-material/ListAlt";
import CoPresentIcon from "@mui/icons-material/CoPresent";
import ContactsIcon from "@mui/icons-material/Contacts";
import BrowserUpdatedIcon from "@mui/icons-material/BrowserUpdated";
import { routes } from "../../../routes/Admin/routes.config";
import roles from "../../../routes/Admin/roles";

const sideNavTabs = [
  {
    route: routes.DASHBOARD,
    title: "Dashboard",
    icon: DashboardIcon,
    roles: [roles.ADMIN, roles.MERCHANT, roles.MANAGER, roles.MERCHANT_STAFF],
  },
  {
    route: routes.OPPORTUNITIES,
    title: "Loan Applications",
    icon: BrowserUpdatedIcon,
    roles: [roles.ADMIN, roles.MERCHANT, roles.MERCHANT_STAFF],
  },
  {
    route: routes.CONTRACTOR_OPPORTUNITIES,
    title: "Contractor Applications",
    icon: BrowserUpdatedIcon,
    roles: [roles.ADMIN],
  },
  {
    route: routes.MANAGE_CLIENTS,
    title: "Manage Borrowers",
    icon: ContactsIcon,
    roles: [roles.ADMIN],
  },
  {
    route: routes.MANAGE_AGENTS,
    title: "Manage Agents",
    icon: ContactsIcon,
    roles: [roles.ADMIN, roles.MERCHANT],
  },
  {
    route: routes.MANAGE_USERS,
    title: "Manage Admins",
    icon: CoPresentIcon,
    roles: [roles.ADMIN],
  },
  {
    route: routes.MANAGE_RULES,
    title: "Account Settings",
    icon: ListAltIcon,
    roles: [roles.MERCHANT],
  },
];

export const sidenav = (adminRole) =>
  sideNavTabs.filter((item) => item.roles.includes(adminRole));
