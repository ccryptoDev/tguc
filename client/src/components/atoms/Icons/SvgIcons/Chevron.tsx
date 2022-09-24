import React from "react";
import styled from "styled-components";
import { IIConProps } from "./types";

const Wrapper = styled.span<{ transform?: string }>`
  display: flex;
  align-items: center;
  transform: rotate(180deg);
`;

export default function Icon({
  size = "2.4rem",
  fill = "none",
  color = "#28293D",
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 15L11.9874 9L18 15"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const Chevron = ({ style, size, color }: IIConProps) => {
  return (
    <Wrapper className="chevron-icon" style={style}>
      <Icon size={size} color={color} />
    </Wrapper>
  );
};

export const ChevronThick = ({ color = "#fff" }) => {
  return (
    <svg
      width="9"
      height="13"
      viewBox="0 0 9 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line
        x1="1"
        y1="-1"
        x2="8.06686"
        y2="-1"
        transform="matrix(0.772464 -0.635059 0.540292 0.841478 1.5 12.502)"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="1"
        y1="-1"
        x2="7.69151"
        y2="-1"
        transform="matrix(-0.772464 -0.635059 0.540292 -0.841478 8.21484 6.02148)"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};
