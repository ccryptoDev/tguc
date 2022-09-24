import { deepCopy } from "../../../../../../utils/deepCopy";

export const validateComment = (form: any) => {
  const updatedForm = deepCopy(form);
  let isValid = true;
  Object.keys(updatedForm).forEach((key: any) => {
    if (!updatedForm[key].value.length) {
      isValid = false;
      updatedForm[key].valid = false;
      updatedForm[key].message = "this field is required";
    } else {
      updatedForm[key].message = "";
      updatedForm[key].valid = true;
    }
  });
  return [isValid, updatedForm];
};
