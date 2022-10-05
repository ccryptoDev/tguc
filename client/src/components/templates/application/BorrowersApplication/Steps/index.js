import PersonalInfo from "./PersonalInformation";
import Offer from "./Offer";
import ConnectBank from "./ConnectBank";
import Contract from "./Contract";
import LastStep from "./LastStep";
import WaitingToBeApproved from "./WaitingToBeApproved";
import PaymentDetails from "./PaymentMethods";
import SSN from "./SSN";
import Address from "./Address";
import Declined from "./WaitingToBeApproved/Declined";

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
    name: "Address Information",
    active: false,
    completed: false,
    component: Address,
  },
  {
    number: 3,
    name: "Connect Bank",
    active: false,
    completed: false,
    component: ConnectBank,
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
    name: "Select Offer",
    active: false,
    completed: false,
    component: Offer,
  },
  {
    number: 6,
    name: "Payment Details",
    active: false,
    completed: false,
    component: PaymentDetails,
  },
  {
    number: 7,
    name: "Sign Contract",
    active: false,
    completed: false,
    component: Contract,
  },
  {
    number: 8,
    name: "Social Security Number",
    active: false,
    completed: false,
    component: SSN,
  },
  {
    number: 9,
    name: isDeclined ? "Declined" : "Thank you",
    active: false,
    completed: false,
    component: isDeclined ? Declined : LastStep,
  },
];
