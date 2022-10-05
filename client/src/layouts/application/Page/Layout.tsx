import React from "react";
import styled from "styled-components";
import Header from "./Header";
import Footer from "./Footer";

export const Wrapper = styled.div`
  &.contractor {
    & .app-wrapper {
      background: url("${process.env.PUBLIC_URL}/images/bg-contractor.png");
      background-position: center;
      background-size: cover;
    }
  }

  &.borrower {
    & .app-wrapper {
      background: url("${process.env.PUBLIC_URL}/images/app-bg.png");
      background-position: center;
      background-size: cover;
    }
  }
  .app-wrapper {
    display: flex;
    flex-direction: column;
    background-position: center;
    background-size: cover;
    height: 100vh;
    overflow-y: auto;
    justify-content: space-between;
    & main {
      width: 100%;
    }

    & .page-container {
      max-width: var(--stepper-width);
    }
  }
`;

const Layout = ({
  children,
  route,
  bg = "borrower",
}: {
  children: any;
  route: string;
  bg?: string;
}) => {
  return (
    <Wrapper className={bg}>
      <div className="app-wrapper">
        <div>
          <Header route={route} />
          <main>{children}</main>
        </div>
        <Footer />
      </div>
    </Wrapper>
  );
};

export default Layout;
