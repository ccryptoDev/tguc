import React from "react";
import styled from "styled-components";

const Tr = styled.tr`
  .label {
    padding: 0 16px;
    font-weight: 700;
  }
`;

const Thead = () => {
  return (
    <Tr>
      <th>
        <div className="label">Options</div>
      </th>
      <th>
        <div className="label">Action</div>
      </th>
    </Tr>
  );
};

export default Thead;
