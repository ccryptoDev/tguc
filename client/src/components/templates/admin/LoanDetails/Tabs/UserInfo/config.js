/* eslint-disable */
import {
  formatDate,
  formatPhoneNumber,
  parsePaymentStatus,
} from "../../../../../../utils/formats";

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
  unitApt = "--",
  userReference = "--",
  contractorReference = '--',
  practiceName = "--",
  financingStatus,
}) => [
  { label: "User Reference", value: userReference },
  { label: "Name", value: `${firstName} ${lastName}` },
  { label: "Email Address", value: email },
  { label: "Phone Number", value: formatPhoneNumber(phones[0]) },
  // eslint-disable-next-line
  { label: "Date of Birth", value: formatDate(dateOfBirth) },
  { label: "Address", value: `${street}` },
  { label: "City", value: city },
  { label: "State", value: state },
  { label: "Social Security Number", value: ssnNumber },
  { label: "Registration Date", value: formatDate(createdAt) },
  { label: "Last Profile Updated Date", value: formatDate(updatedAt) },
  { label: "Anticipated Financed Amount", value: requestedAmount },
  { label: "Financing Reference Number", value: loanReference },
  { label: "Contractor", value: contractorReference },
  { label: "Contractor Business", value: practiceName },
  { label: financingStatus, value: parsePaymentStatus(status) },
];
