import Dashboard from "../../pages/admin/Dashboard";
import LendingCenter from "../../pages/admin/LendingCenter";
import Opportunities from "../../pages/admin/Opportunities";
import ContractorOpportunities from "../../pages/admin/ContractorOpportunities";
import ManageUsers from "../../pages/admin/ManageAdmins";
import ManageAgents from "../../pages/admin/ManageAgents";
import ManageClients from "../../pages/admin/ManageClients";
import ResetPassword from "../../pages/admin/Reset-password";
import InviteEmail from "../../pages/admin/InviteEmail";
import InviteText from "../../pages/admin/InviteText";
import LoanDetails from "../../pages/admin/Details";
import NotFound from "../../pages/admin/NotFound";
import UserDetails from "../../pages/admin/UserDetails";
import ManageRules from "../../pages/admin/ManageRules";
import roles from "./roles";
import { routes } from "./routes.config";

export const allRoles = [
  roles.ADMIN,
  roles.MERCHANT,
  roles.MANAGER,
  roles.MERCHANT_STAFF,
];

const routesList = [
  {
    key: routes.DASHBOARD,
    path: routes.DASHBOARD,
    roles: allRoles,
    component: Dashboard,
  },
  {
    key: routes.OPPORTUNITIES,
    path: routes.OPPORTUNITIES,
    roles: [roles.ADMIN, roles.MERCHANT, roles.MERCHANT_STAFF],
    component: Opportunities,
  },
  {
    key: routes.CONTRACTOR_OPPORTUNITIES,
    path: routes.CONTRACTOR_OPPORTUNITIES,
    roles: [roles.ADMIN, roles.MERCHANT],
    component: ContractorOpportunities,
  },
  {
    key: routes.MANAGE_USERS,
    path: routes.MANAGE_USERS,
    roles: [roles.ADMIN],
    component: ManageUsers,
  },
  {
    key: routes.MANAGE_AGENTS,
    path: routes.MANAGE_AGENTS,
    roles: [roles.ADMIN, roles.MERCHANT],
    component: ManageAgents,
  },
  {
    key: routes.MANAGE_CLIENTS,
    path: routes.MANAGE_CLIENTS,
    roles: [roles.ADMIN, roles.MERCHANT],
    component: ManageClients,
  },
  {
    key: routes.RESET_PASSWORD,
    path: routes.RESET_PASSWORD,
    roles: allRoles,
    component: ResetPassword,
  },
  {
    key: routes.INVITE_EMAIL,
    path: routes.INVITE_EMAIL,
    roles: allRoles,
    component: InviteEmail,
  },
  {
    key: routes.INVITE_TEXT,
    path: routes.INVITE_TEXT,
    roles: allRoles,
    component: InviteText,
  },
  {
    key: routes.LENDING_CENTER,
    path: routes.LENDING_CENTER,
    roles: allRoles,
    component: LendingCenter,
  },
  {
    key: routes.MANAGE_RULES,
    path: `${routes.MANAGE_RULES}`,
    roles: allRoles,
    component: ManageRules,
  },
  {
    key: routes.LOAN_DETAILS,
    path: `${routes.LOAN_DETAILS}/:id`,
    roles: allRoles,
    component: LoanDetails,
  },
  {
    key: routes.USER_DETAILS,
    path: `${routes.USER_DETAILS}/:id`,
    roles: allRoles,
    component: UserDetails,
  },
  { key: "notfound", component: NotFound },
];

export const renderRoutes = (role: string) =>
  routesList.filter((item: any) => item.roles?.includes(role));
