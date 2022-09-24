export const validate = (form) => {
  let isValid = true;
  const newForm = { ...form };
  if (newForm.radius.value.length < 1) {
    newForm.radius.message = "Enter Radius";
    isValid = false;
  }
  if (+newForm.radius.value > 200) {
    newForm.radius.message = "Max Miles Radius is 200";
    isValid = false;
  }

  if (newForm.zipCode.value.length < 5) {
    newForm.zipCode.message = "Enter a valid zip code";
    isValid = false;
  }

  return [isValid, newForm];
};
