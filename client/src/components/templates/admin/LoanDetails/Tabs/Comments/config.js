export const initForm = () => {
  return {
    subject: { value: "", valid: false, required: true, message: "" },
    comment: { value: "", valid: false, required: true, message: "" },
  };
};
