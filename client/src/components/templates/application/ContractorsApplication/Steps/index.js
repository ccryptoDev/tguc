import PersonalInfo from "./PersonalInformation";
import UploadDocuments from "./UploadDocuments";
import Contract from "./Agreement";
import LastStep from "./LastStep";
// import BankDetails from "./PaymentMethod";
import WaitingToBeApproved from "./WaitingToBeApproved";
import BusinessInformation from "./BusinessInformation";
import denied from "./WaitingToBeApproved/Declined";

export const steps = () => [
  {
    number: 1,
    name: "Personal Information",
    active: false,
    completed: false,
    component: PersonalInfo,
  },
  {
    number: 2,
    name: "Business Information",
    active: false,
    completed: false,
    component: BusinessInformation,
  },
  {
    number: 3,
    name: "Upload Documents",
    active: false,
    completed: false,
    component: UploadDocuments,
  },
  {
    number: 4,
    name: "Waiting for Approval",
    active: false,
    completed: false,
    component: WaitingToBeApproved,
  },
  {
    number: 5,
    name: "Sign Contract",
    active: false,
    completed: false,
    component: Contract,
  },
  // {
  //   number: 6,
  //   name: "Bank Details",
  //   active: false,
  //   completed: false,
  //   component: BankDetails,
  // },
  {
    number: 6,
    name: "Thank you",
    active: false,
    completed: false,
    component: LastStep,
  },
  {
    number: 7,
    name: "Declined",
    active: false,
    completed: false,
    component: denied,
  },
];
