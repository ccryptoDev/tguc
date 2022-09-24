import React from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;
`;

const ColorWrapper = styled.div`
  display: flex;
  align-items: center;
  grid-gap: 10px;
  margin: 20px;

  .color-cube {
    height: 30px;
    width: 30px;
    background: ${(props) => props.color};
    border: 1px solid #ebebeb;
  }
`;

const Color = ({ title, color }) => {
  return (
    <ColorWrapper className="color-wrapper" color={color}>
      <div className="color-cube" />
    </ColorWrapper>
  );
};

const Colors = () => {
  const main = "--color-main";
  const gray1 = "--color-gray-dark";
  const gray2 = "--color-gray-light";
  const bgWhite = "--color-background-white";
  const bgGray = "--color-background-gray";
  const bgBlue = "--color-background-blue";
  const purple1 = "--color-purple-1";
  const purple2 = "--color-purple-2";
  const purple3 = "--color-purple-3";
  const purple4 = "--color-purple-4";
  const pink1 = "--color-pink-1";
  const pink2 = "--color-pink-2";
  const pink3 = "--color-pink-3";
  const pink4 = "--color-pink-4";
  const blue1 = "--color-blue-1";
  const blue2 = "--color-blue-2";
  const blue3 = "--color-blue-3";
  const blue4 = "--color-blue-4";
  const red1 = "--color-red-1";
  const red2 = "--color-red-2";
  const red3 = "--color-red-3";
  const red4 = "--color-red-4";
  const yellow1 = "--color-yellow-1";
  const yellow2 = "--color-yellow-2";
  const yellow3 = "--color-yellow-3";
  const yellow4 = "--color-yellow-4";
  const green1 = "--color-green-1";
  const green2 = "--color-green-2";
  const green3 = "--color-green-3";
  const green4 = "--color-green-4";

  return (
    <Wrapper>
      <div className="column">
        <Color title={main} color={`var(${main})`} />
        <Color title={gray1} color={`var(${gray1})`} />
        <Color title={gray2} color={`var(${gray2})`} />
      </div>
      <div className="column">
        <Color title={bgWhite} color={`var(${bgWhite})`} />
        <Color title={bgGray} color={`var(${bgGray})`} />
        <Color title={bgBlue} color={`var(${bgBlue})`} />
      </div>
      <div className="column">
        <Color title={purple1} color={`var(${purple1})`} />
        <Color title={purple2} color={`var(${purple2})`} />
        <Color title={purple3} color={`var(${purple3})`} />
        <Color title={purple4} color={`var(${purple4})`} />
      </div>
      <div className="column">
        <Color title={pink1} color={`var(${pink1})`} />
        <Color title={pink2} color={`var(${pink2})`} />
        <Color title={pink3} color={`var(${pink3})`} />
        <Color title={pink4} color={`var(${pink4})`} />
      </div>
      <div className="column">
        <Color title={blue1} color={`var(${blue1})`} />
        <Color title={blue2} color={`var(${blue2})`} />
        <Color title={blue3} color={`var(${blue3})`} />
        <Color title={blue4} color={`var(${blue4})`} />
      </div>
      <div className="column">
        <Color title={red1} color={`var(${red1})`} />
        <Color title={red2} color={`var(${red2})`} />
        <Color title={red3} color={`var(${red3})`} />
        <Color title={red4} color={`var(${red4})`} />
      </div>
      <div className="column">
        <Color title={yellow1} color={`var(${yellow1})`} />
        <Color title={yellow2} color={`var(${yellow2})`} />
        <Color title={yellow3} color={`var(${yellow3})`} />
        <Color title={yellow4} color={`var(${yellow4})`} />
      </div>
      <div className="column">
        <Color title={green1} color={`var(${green1})`} />
        <Color title={green2} color={`var(${green2})`} />
        <Color title={green3} color={`var(${green3})`} />
        <Color title={green4} color={`var(${green4})`} />
      </div>
    </Wrapper>
  );
};

export default Colors;
