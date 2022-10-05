/* eslint-disable */
import {
  formatDate,
  formatPhoneNumber,
  parsePaymentStatus,
} from "../../../../../../utils/formats";

const businessAddressString = (address) => {
  if (address?.address && address?.city && address?.stateCode && address?.zip) {
    return `${address?.address}, ${address?.city}, ${address?.stateCode}, ${address?.zip}`;
  }
  return "--";
};

// eslint-disable-next-line
export default ({
  city = "",
  loanReference = "--",
  dateOfBirth = "--",
  email = "--",
  status = "--",
  updatedAt,
  firstName,
  lastName,
  phones = "--",
  createdAt,
  requestedAmount = "--",
  ssnNumber = "--",
  state = "--",
  street = "--",
  userReference = "--",
  contractorReference = "--",
  practiceName = "--",
  financingStatus,
  businessAddress = {},
  isAdmin,
}) =>
  [
    { label: "User Reference", value: userReference, id: "1" },
    { label: "Name", value: `${firstName} ${lastName}`, id: "2" },
    { label: "Email Address", value: email, id: "3" },
    { label: "Phone Number", value: formatPhoneNumber(phones[0]), id: "4" },
    { label: "Date of Birth", value: formatDate(dateOfBirth), id: "5" },
    { label: "Address", value: `${street}`, id: "6" },
    { label: "City", value: city, id: "7" },
    { label: "State", value: state, id: "8" },
    { label: "Social Security Number", value: ssnNumber, id: "9" },
    { label: "Registration Date", value: formatDate(createdAt), id: "10" },
    {
      label: "Last Profile Updated Date",
      value: formatDate(updatedAt),
      id: "11",
    },
    { label: "Anticipated Financed Amount", value: requestedAmount, id: "12" },
    { label: "Financing Reference Number", value: loanReference, id: "13" },
    { label: "Contractor", value: contractorReference, id: "14" },
    { label: "Contractor Business", value: practiceName, id: "15" },
    {
      label: "Business Address",
      value: businessAddressString(businessAddress),
      id: "16",
    },
    { label: financingStatus, value: parsePaymentStatus(status), id: "17" },
  ].filter((item) => {
    if (isAdmin) {
      return item;
    }
    return item.id !== "9";
  });
