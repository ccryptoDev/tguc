export const validateFinancedAmount = (value, maxValue) => {
  if (+value > +maxValue) {
    return "Cannot be higher than the pre-qualified up to amout";
  }
  return "";
};
