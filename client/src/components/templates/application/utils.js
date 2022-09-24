import { RegisterBorrowerAccount } from "../../../api/authorization";

function parseDob(dob) {
  // dob format = 112121999
  const day = dob.slice(0, 2);
  const month = dob.slice(2, 4);
  const year = dob.slice(4);
  return { month, day, year };
}

export const parseUserDataForm = ({ form, setForm }) => {
  setForm(form);
  const parsedForm = {};
  // 1. PARSE DOB FROM INPUT FORMAT TO REQUEST FORMAL
  const parsedDob = parseDob(form.dob.value);
  // 2. EXTRACT FORM VALUES
  Object.keys(form).forEach((field) => {
    if (field === "dob") {
      parsedForm.dob_day = parsedDob.day;
      parsedForm.dob_month = parsedDob.month;
      parsedForm.dob_year = parsedDob.year;
    } else parsedForm[field] = form[field].value;
  });
  // 3. REMOVE UNNECCESSARY FORM FIELDS
  delete parsedForm.dob;
  delete parsedForm.terms;
  delete parsedForm.repassword;

  // 4. RETURN PARSED FORM
  return parsedForm;
};

export const registerUser = async ({
  form,
  setError,
  fetchUser,
  lastScreen,
}) => {
  const result = await RegisterBorrowerAccount({
    ...form,
    lastScreen,
    addNewScreenTracking: true,
  });
  if (result && !result?.error) {
    return fetchUser();
  }
  if (result?.error) {
    setError("This user already exists");
  }
  return null;
};

export const sortBy = (field, order, primer) => {
  const key = primer
    ? (x) => primer(x[field])
    : (x) => {
        return x[field];
      };

  const reverse = !order ? 1 : -1;

  return (a, b) => {
    const valA = key(a);
    const valB = key(b);
    return reverse * ((valA > valB) - (valB > valA));
  };
};

export const sort = (data, key) => {
  return data.sort(sortBy(key, false, (a) => a.toUpperCase()));
};
