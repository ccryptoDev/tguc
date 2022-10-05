export const getLoanData = ({
  screenTrackings,
  paymentManagements,
  practiceManagements,
}) => {
  const pms = Array.isArray(paymentManagements) ? [...paymentManagements] : [];
  const sts = Array.isArray(screenTrackings) ? [...screenTrackings] : [];
  const practiceM = Array.isArray(practiceManagements)
    ? [...practiceManagements]
    : [];

  // IF APPLICATION ID IS PRESENT ON URL
  const getScreenId = () => {
    const array = window.location.pathname.split("/");
    return array[array.length - 1];
  };

  const screenId = getScreenId();

  const screenTracking =
    sts.find((st) => st.id === screenId) || sts[sts.length - 1] || null;

  const paymentManagement =
    pms.find((pm) => pm.screenTrackingId === screenId) ||
    pms[pms.length - 1] ||
    null;

  const practiceManagement =
    practiceM.find((practice) => practice.id === screenId) ||
    practiceM[practiceM.length - 1] ||
    null;

  return { screenTracking, paymentManagement, practiceManagement };
};
