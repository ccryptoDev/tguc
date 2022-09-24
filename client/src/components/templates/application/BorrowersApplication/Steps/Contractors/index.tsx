import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Contractor from "./Contractor";
import { mockRequest } from "../../../../../../utils/mockRequest";
import Loader from "../../../../../molecules/Loaders/LoaderWrapper";
import { H3, Text } from "../../../../../atoms/Typography";
import Button from "../../../../../atoms/Buttons/Button";
import Placeholder from "./ContractorsPlaceholder";

const Wrapper = styled.div`
  & > p {
    margin: 24px 0;
  }

  & .prequalified {
    & span {
      color: var(--color-green-1);
      font-weight: bold;
      margin-left: 5px;
    }
  }

  .contractor-wrapper {
    max-width: 480px;
    width: 100%;
    display: flex;
    flex-direction: column;
    row-gap: 12px;

    & .contractor {
      width: 100%;
    }
  }

  .buttons-wrapper {
    margin-top: 12px;
  }
`;

// mock data
const mockContractors = [
  {
    name: "Mock Construction Co Inc",
    location: "10950 Ford Ave, Richmond Hill, Georgia, 31324-3907, US",
    amount: 1100,
  },
  {
    name: "Mc Bride & Sons Inc",
    location: "17415 North Outer 40 Rd, Chesterfield, Missouri, 63005, US",
    amount: 1200,
  },
  {
    name: "NCR Corporation",
    location: "864 Spring St NW, Atlanta, Georgia, 30308-1007, US",
    amount: 1250,
  },
];

const ChooseProviderForm = ({
  moveToNextStep,
  active,
  completed,
}: {
  moveToNextStep: any;
  active: boolean;
  completed: boolean;
}) => {
  const [selectedContractor, setSelectedContractor] = useState("");
  const [contractors, setContractors] = useState<any>([]);
  const [loading, setLoading] = useState(false);

  const fetchOffers = async () => {
    setLoading(true);
    const result = await mockRequest(mockContractors);
    setContractors(result);
    setLoading(false);
  };

  useEffect(() => {
    if (!completed && active) {
      fetchOffers();
    }
  }, [completed]);

  const onSubmit = async () => {
    setLoading(true);
    await mockRequest();
    setLoading(false);
    moveToNextStep();
  };

  if (!active) {
    return <></>;
  }

  return (
    <Loader loading={loading}>
      <Wrapper>
        <H3>Select Your Contractor</H3>

        <Text>
          Dear Temeka, <br />
          Congratulations! You have the following pre-qualification offers
          available from TGUC Financial!
        </Text>
        <div className="contractor-wrapper">
          {contractors.length < 1 && loading ? <Placeholder /> : ""}
          {contractors.length
            ? contractors.map((contractor: any) => {
                return (
                  <Contractor
                    onClick={(name: string) => setSelectedContractor(name)}
                    {...contractor}
                    contractorSelected={selectedContractor}
                    key={contractor.name}
                  />
                );
              })
            : ""}
        </div>
        <div className="buttons-wrapper">
          <Button
            type="button"
            variant="contained"
            onClick={onSubmit}
            disabled={!selectedContractor}
          >
            Continue
          </Button>
        </div>
      </Wrapper>
    </Loader>
  );
};

export default ChooseProviderForm;
