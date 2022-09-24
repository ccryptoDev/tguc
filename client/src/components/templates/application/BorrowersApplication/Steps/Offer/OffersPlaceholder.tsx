import React from "react";
import styled from "styled-components";
import { v4 as uuid } from "uuid";

const Item = styled.div`
  width: 100%;
  height: 79px;
  border: 1px solid var(--color-gray-1);
`;

const items = Array(5).fill({});

const Placeholder = () => {
  return (
    <>
      {items.map(() => {
        return <Item className="offer" key={uuid()} />;
      })}
    </>
  );
};

export default Placeholder;
