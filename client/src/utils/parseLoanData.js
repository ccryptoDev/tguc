export const getLoanData = ({
  screenTrackings,
  paymentManagements,
  practiceManagements,
  id: screenId,
}) => {
  const pms = Array.isArray(paymentManagements) ? [...paymentManagements] : [];
  const sts = Array.isArray(screenTrackings) ? [...screenTrackings] : [];
  const practiceM = Array.isArray(practiceManagements)
    ? [...practiceManagements]
    : [];

  // IF APPLICTION ID IS PRESENT ON URL
  if (screenId) {
    const screenTracking = sts.find((st) => st.id === screenId);
    const paymentManagement = pms.find(
      (pm) => pm.screenTrackingId === screenId
    );
    const practiceManagement = pms.find(
      (practice) => practice.id === practiceM
    );
    return { screenTracking, paymentManagement, practiceManagement };
  }

  // IF APPLICATION ID IS NOT PRESENT ON URL - TAKE THE LAST ITEMS
  if (pms.length && sts.length) {
    return {
      screenTracking: sts[sts.length - 1],
      paymentManagement: pms[pms.length - 1],
    };
  }
  return null;
};
