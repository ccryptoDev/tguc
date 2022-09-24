import React, { useState, useEffect } from "react";
import DoneIcon from "@mui/icons-material/Done";
import ClearIcon from "@mui/icons-material/Clear";
import Tabs from "../Components/Tabs";
import Header from "../Components/Header";
import { H5 } from "../../../atoms/Typography";
import {
  userApproveWorkCompletion,
  userDeniedWorkCompletion,
} from "../../../../api/application";
import { useUserData } from "../../../../contexts/user";
import { Wrapper, Button, StatusWrapper } from "./styles";
import Loader from "../../../molecules/Loaders/LoaderWrapper";

const statuses = {
  APPROVED: "APPROVED",
  DECLINED: "DECLINED",
  PENDING: "PENDING",
};

const Approved = () => {
  return (
    <StatusWrapper>
      <DoneIcon sx={{ color: "var(--color-success)", fontSize: "56px" }} />
      <p>The project is approved. Your project will be funded shortly.</p>
    </StatusWrapper>
  );
};

const Declined = () => {
  return (
    <StatusWrapper>
      <ClearIcon sx={{ color: "var(--color-danger)", fontSize: "56px" }} />
      <p>The project completion was declined because...</p>
    </StatusWrapper>
  );
};

const Pending = ({ denyWorkCompletion, approveWorkCompletion }: any) => {
  return (
    <div className="form-wrapper">
      <H5>Was the work completed successfully?</H5>
      <div className="buttons-wrapper">
        <Button type="button" className="declined" onClick={denyWorkCompletion}>
          Decline
        </Button>
        <Button
          type="button"
          className="approved"
          onClick={approveWorkCompletion}
        >
          Approve
        </Button>
      </div>
    </div>
  );
};

const renderScreen = ({
  status,
  approveWorkCompletion,
  denyWorkCompletion,
}: {
  status: string;
  approveWorkCompletion: any;
  denyWorkCompletion: any;
}) => {
  switch (status) {
    case statuses.APPROVED:
      return <Approved />;
    case statuses.DECLINED:
      return <Declined />;
    case statuses.PENDING:
      return (
        <Pending
          approveWorkCompletion={approveWorkCompletion}
          denyWorkCompletion={denyWorkCompletion}
        />
      );
    default:
      return <></>;
  }
};

const UserInformation = ({ route }: { route: string }) => {
  const [status, setStatus] = useState("");
  const [loading, setLoadings] = useState(false);
  const { user, fetchUser } = useUserData();

  const approveWorkCompletion = async () => {
    setLoadings(true);
    const result = await userApproveWorkCompletion();
    setLoadings(false);
    if (result && !result.error) {
      setStatus(statuses.APPROVED);
    }
  };

  const denyWorkCompletion = async () => {
    setLoadings(true);
    const result = await userDeniedWorkCompletion();
    setLoadings(false);
    if (result && !result.error) {
      setStatus(statuses.DECLINED);
    }
  };

  useEffect(() => {
    if (user?.data?.paymentManagement?.status === "pending-disbursement") {
      setStatus(statuses.APPROVED);
    } else if (user?.data?.paymentManagement?.status === "declined") {
      setStatus(statuses.DECLINED);
    } else {
      setStatus(statuses.PENDING);
    }
  }, [user?.data?.paymentManagement?.status]);

  return (
    <Wrapper>
      <Tabs activeRoute={route} tabName="Work Completion" />
      <Header>Work Completion Center</Header>
      <Loader loading={loading}>
        {renderScreen({ status, denyWorkCompletion, approveWorkCompletion })}
      </Loader>
    </Wrapper>
  );
};

export default UserInformation;
