import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Offer from "./Offer";
import { mockRequest } from "../../../../../../utils/mockRequest";
import Loader from "../../../../../molecules/Loaders/LoaderWrapper";
import Calculator from "./Calculator";
import { H3, Text } from "../../../../../atoms/Typography";
import { formatCurrency } from "../../../../../../utils/formats";
import Button from "../../../../../atoms/Buttons/Button";
import Placeholder from "./OffersPlaceholder";
import {
  fetchBorrowerOfferApi,
  selectOfferApi,
} from "../../../../../../api/application";
import { useUserData } from "../../../../../../contexts/user";

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

  .offer-wrapper {
    max-width: 480px;
    width: 100%;

    & .offer {
      width: 100%;
      &:not(:first-child) {
        margin-top: 12px;
      }
    }
  }

  @media screen and (max-width: 767px) {
    .heading {
      display: none;
    }
  }
`;

// mock data
const mockOffers = [
  { apr: 780, term: 8, payment: 784.22, amount: 1200 },
  { apr: 720, term: 12, payment: 712.83, amount: 1200 },
  { apr: 720, term: 16, payment: 651.59, amount: 1200 },
  { apr: 600, term: 20, payment: 591.98, amount: 1200 },
  { apr: 780, term: 24, payment: 532.68, amount: 1200 },
];

const ChooseProviderForm = ({
  moveToNextStep,
  isActive,
  completed,
}: {
  moveToNextStep: any;
  isActive: boolean;
  completed: boolean;
}) => {
  const [selectedOffer, setSelectedOffer] = useState(0);
  const [maxAmount, setMaxAmount] = useState<string | number>("");
  const [offers, setOffers] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const { screenTrackingId, user } = useUserData();
  const userName = user?.data?.firstName;
  console.log(user);
  const fetchOffers = async () => {
    setLoading(true);
    const result = await fetchBorrowerOfferApi({
      screenTrackingId,
      amount: +user?.data?.paymentManagement?.requestedAmount,
    });
    setOffers(result);
    setLoading(false);
  };

  useEffect(() => {
    if (isActive && !completed) fetchOffers();
  }, [isActive, completed]);

  const onSubmit = async (offer: any) => {
    setLoading(true);
    const payload = {
      loanId: offer?.id,
      promoSelected: false,
      skipAutoPay: false,
      screenTrackingId,
    };
    const result = await selectOfferApi(payload);

    setLoading(false);
    moveToNextStep();
  };

  const calculateOffers = async (amount: string) => {
    setLoading(true);
    const result = await fetchBorrowerOfferApi({
      screenTrackingId,
      amount: +amount,
    });
    setLoading(false);
  };

  return (
    <Loader loading={loading}>
      <Wrapper>
        <H3 className="heading">Select Your Offer</H3>

        <Text>
          Dear {userName}, <br />
          Congratulations! You have the following pre-qualification offers
          available from TGUC Financial!
        </Text>
        <Text className="bold prequalified">
          You are pre-qualified for up to
          {formatCurrency(maxAmount)}
        </Text>

        <Calculator financedAmount={maxAmount} cb={calculateOffers} />
        <Text className="bold">Fixed Rate Payment Plans</Text>
        <div className="offer-wrapper">
          {offers.length < 1 && loading ? <Placeholder /> : ""}
          {offers.length
            ? offers.map((offer: any) => {
                return (
                  <Offer
                    onClick={(termSelected: number) =>
                      setSelectedOffer(termSelected)
                    }
                    {...offer}
                    termSelected={selectedOffer}
                    key={offer.term}
                  />
                );
              })
            : ""}
        </div>

        <Text>
          <b>0% APR</b> if financed amount is paid in full within 6 months
        </Text>
        <Button
          type="button"
          variant="contained"
          onClick={onSubmit}
          disabled={!selectedOffer}
        >
          Continue
        </Button>
      </Wrapper>
    </Loader>
  );
};

export default ChooseProviderForm;
