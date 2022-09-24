import React from "react";
import styled from "styled-components";
import { makeStyles, createStyles } from "@material-ui/core/styles";
import LinearProgress from "@material-ui/core/LinearProgress";
import { Wrapper as LayoutWrapper } from "../../../layouts/application/Page/Layout";
import logo from "../../../assets/svgs/Logo/Logo-TGUC-financial.svg";

const useStyles = makeStyles((theme) => {
  return createStyles({
    bar: {
      width: "100%",
      "& > * + *": {
        marginTop: theme.spacing(2),
      },
    },
  });
});

const Main = styled.div`
  display: flex;
  justify-content: center;

  img {
    height: 5rem;
    animation: zoom 1s;
  }

  @keyframes zoom {
    from {
      transform: scale(0.2);
    }
    to {
      transform: scale(1);
    }
  }
`;

const Progress = () => {
  const classes = useStyles();
  return (
    <LayoutWrapper>
      <div className="app-wrapper">
        <div className={classes.bar}>
          <LinearProgress />
        </div>
        <Main>
          <img src={logo} alt="TGUC-Financial" />
        </Main>
        <div />
      </div>
    </LayoutWrapper>
  );
};

export default Progress;
