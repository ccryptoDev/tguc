import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import Layout from "../../layouts/admin";
import { routes } from "../../routes/Admin/routes.config";
import Card from "../../components/atoms/Cards/Large";
import Details from "../../components/templates/admin/LoanDetails";
import Container from "../../layouts/admin/container";
import { H3 as Heading } from "../../components/atoms/Typography";
import ActionButtons from "../../components/templates/admin/LoanDetails/ActionNav";
import { useUserData } from "../../contexts/admin";
import { getContractDataApi } from "../../api/admin-dashboard";

const FlexBetween = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const DetailsPage = () => {
  const { user } = useUserData();
  const params = useParams();
  const role = user?.user?.data?.role?.roleName;
  const [loanData, setLoanData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isContractor = loanData?.screenTracking?.isContractor;

  const fetchLoanData = async () => {
    const screenTrackingId = params.id;
    setLoading(true);
    const result = await getContractDataApi(screenTrackingId);
    if (result?.data && !result.error) {
      setLoanData(result.data);
    } else if (result.error) {
      const { message } = result.error;
      setError(message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLoanData();
    // eslint-disable-next-line
  }, []);

  const renderApplicationTitle = () => {
    if (isContractor) {
      return "Contractor Application Details";
    }
    return "Loan Details";
  };
  return (
    <Layout route={routes.LOAN_DETAILS}>
      <Container>
        <FlexBetween>
          <Heading style={{ marginBottom: "12px" }}>
            {renderApplicationTitle()}
          </Heading>
          <ActionButtons cb={fetchLoanData} loanData={loanData} role={role} />
        </FlexBetween>
        <Card>
          <Details
            fetchLoanData={fetchLoanData}
            loanData={loanData}
            loading={loading}
            error={error}
          />
        </Card>
      </Container>
    </Layout>
  );
};

export default DetailsPage;
