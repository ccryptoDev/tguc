import PersonalInfo from "./PersonalInformation";
import UploadDocuments from "./UploadDocuments";
import Contract from "./Agreement";
import LastStep from "./LastStep";
// import BankDetails from "./PaymentMethod";
import WaitingToBeApproved from "./WaitingToBeApproved";
import BusinessInformation from "./BusinessInformation";
import Denied from "./WaitingToBeApproved/Declined";

export const steps = (isDeclined = false) => [
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
  {
    number: 6,
    name: isDeclined ? "Declined" : "Thank you",
    active: false,
    completed: false,
    component: isDeclined ? Denied : LastStep,
  },
];
