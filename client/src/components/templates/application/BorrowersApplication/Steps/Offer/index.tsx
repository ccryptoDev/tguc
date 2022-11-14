import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import Offer from "./Offer";
import Loader from "../../../../../molecules/Loaders/LoaderWrapper";
import { H3, Text } from "../../../../../atoms/Typography";
import { formatCurrency } from "../../../../../../utils/formats";
import Button from "../../../../../atoms/Buttons/Button";
import Placeholder from "./OffersPlaceholder";
import { setOfferApi } from "../../../../../../api/application";
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

const ChooseProviderForm = ({
  moveToNextStep,
  isActive,
}: {
  moveToNextStep: any;
  isActive: boolean;
}) => {
  const [selectedOffer, setSelectedOffer] = useState(0);
  const [amountApproved, setAmountApproved] = useState(0);
  const [offers, setOffers] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const { screenTrackingId, user, fetchUser } = useUserData();
  const userName = user?.data?.firstName;

  useEffect(() => {
    if (user?.data && isActive) {
      const screenTr = user.data?.screenTracking;
      if (Array.isArray(screenTr?.offers)) {
        setOffers(screenTr.offers);
      } else {
        toast.error("No offers available for this application");
      }
      if (screenTr?.maxAmountApproved) {
        setAmountApproved(screenTr?.maxAmountApproved);
      } else {
        toast.error("Pre-qualified amount was not found");
      }
    }
  }, [user?.data, isActive]);

  const onSubmit = async () => {
    setLoading(true);
    const selected = offers.find((offer: any) => {
      return offer.term === selectedOffer;
    });

    const result = await setOfferApi(selected);
    if (result && !result.error) {
      await fetchUser();
    } else {
      toast.error("something went wrong");
    }
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
          {formatCurrency(amountApproved)}
        </Text>
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
