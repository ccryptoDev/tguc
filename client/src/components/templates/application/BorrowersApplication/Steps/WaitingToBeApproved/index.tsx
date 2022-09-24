import React, { useState, useEffect } from "react";
import Declined from "./Declined";
import PreApproved from "./Approved";
import Waiting from "./Waiting";
import { useUserData } from "../../../../../../contexts/user";

const renderStatus = (st: string) => {
  switch (st) {
    case "denied":
      return <Declined />;
    case "approved":
      return <PreApproved />;
    default:
      return <Waiting />;
  }
};

const WaitingForApproval = ({
  isActive,
  completed,
  moveToNextStep,
}: {
  isActive: boolean;
  completed: boolean;
  moveToNextStep: any;
}) => {
  const { user } = useUserData();
  const applicationStatus = user?.data?.paymentManagement?.status || "";

  useEffect(() => {
    if (isActive && !completed && applicationStatus) {
      moveToNextStep();
    }
  }, [isActive, completed, applicationStatus]);

  return <div>{renderStatus(applicationStatus)}</div>;
};

export default WaitingForApproval;
