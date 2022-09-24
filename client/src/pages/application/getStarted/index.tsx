import React from "react";
import styled from "styled-components";
import PageLayout from "../../../layouts/application/Page/Layout";
import { H3, H2, Text } from "../../../components/atoms/Typography";
import { routes } from "../../../routes/Application/routes";
import { ButtonLink } from "../../../components/atoms/Buttons/Link";

const Wrapper = styled.div`
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;
  padding-left: 2rem;
  row-gap: 2.4rem;

  & .subheading {
    font-size: 1.6rem;
  }

  .buttons-wrapper {
    display: flex;
    column-gap: 1rem;

    & .button-link {
      color: inherit;
      border-color: inherit;
    }
  }

  @media screen and (max-width: 767px) {
    justify-content: start;
    padding: 2rem;

    & > h1 {
      font-size: 2.4rem;
    }

    & > .subheading {
      font-size: 1.2rem;
    }
  }
`;

const Container = styled.div`
  min-height: calc(100vh - var(--header-height) - var(--footer-height));
  position: relative;
  max-width: var(--page-width);
  min-height: var(--content-height);
  margin: 0 auto;
  display: flex;
`;

const GetStarted = () => {
  const route = routes.HOME;
  return (
    <PageLayout route={route}>
      <Container>
        <Wrapper>
          <H2>Home Improvement Loans with Flexible Financing</H2>
          <div>
            <H3>Contractors</H3>
            <Text className="subheading">
              We are a Home Improvement lender nurturing contractors with
              pre-qualified, free consumer financing leads as well as a premium
              financing source to reduce lead and advertising costs with the
              opportunity to lower material costs while enlarging gross profits.
            </Text>
          </div>
          <div className="buttons-wrapper">
            <ButtonLink
              to={routes.APPLY_CONTRACTOR}
              variant="outlined"
              className="button-link"
            >
              Apply as a contractor
            </ButtonLink>
          </div>
          <div>
            <H3>Consumers</H3>
            <Text className="subheading">
              We are a Home Improvement lender providing prime and subprime, low
              costs loans for home improvement and repair projects with flexible
              rates and terms; in addition, we rapidly connect consumers to
              prequalified, vetted contractors that reduce time and money, while
              providing a seamless process and quality work.
            </Text>
          </div>
          <div className="buttons-wrapper">
            <ButtonLink
              to={routes.KUKUN}
              variant="outlined"
              className="button-link"
            >
              Apply as a borrower
            </ButtonLink>
          </div>
        </Wrapper>
      </Container>
    </PageLayout>
  );
};

export default GetStarted;
