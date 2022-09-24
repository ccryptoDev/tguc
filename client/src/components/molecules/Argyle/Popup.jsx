import React from "react";
import styled from "styled-components";
import LogoIcon from "../../../assets/svgs/Logo/TGUC-financial.svg";

export const Wrapper = styled.div`
  width: 375px;
  height: 667px;
  display: flex;
  flex-direction: column;
  padding: 30px;
  font-family: "Poppins";
  font-weight: 700;
  justify-content: space-between;
  position: relative;

  .note {
    color: #50585d;
    font-family: "Poppins";
    font-size: 13px;
    line-height: 20px;
  }

  .icon-wrapper {
    background: rgba(3, 67, 118, 0.3);
    display: flex;
    padding: 5px;
    box-sizing: border-box;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    margin-right: 20px;
  }

  .errorMessage {
    position: absolute;
    bottom: 0;
  }
`;

export const Logo = () => {
  return (
    <div>
      <img
        src={LogoIcon}
        alt="tguc-financial"
        style={{ height: "24px" }}
      />
    </div>
  );
};
