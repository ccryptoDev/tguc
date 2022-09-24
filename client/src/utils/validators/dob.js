import moment from "moment";

export const validateDob = (dob) => {
  const message = "Enter a valid date of birth";
  if (dob && dob.replaceAll("/", "").length === 8) {
    const birthday = moment(dob, "MM/DD/YYYY");
    if (moment(birthday).isValid()) {
      const age = moment().diff(birthday, "years");
      if (age < 18) {
        return "You should be at least 18 years old";
      }
      if (age > 100) {
        return message;
      }
      return "";
    }
    return message;
  }
  return message;
};
