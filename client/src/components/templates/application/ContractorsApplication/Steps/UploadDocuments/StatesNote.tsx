import React from "react";
import styled from "styled-components";
import Checkbox from "../../../../../molecules/Form/Fields/Checkbox/Custom";

const Wrapper = styled.div`
  .note {
    font-size: 12px;
  }
  .checkbox-wrapper {
    margin-top: 10px;
  }
`;

const StatesNote = ({
  onCheckbox,
  value,
  name,
}: {
  onCheckbox: any;
  name: string;
  value: boolean;
}) => {
  return (
    <Wrapper>
      <div className="note">
        Required if you operate in any of the following states:
      </div>
      <div className="note">
        AL, AK, AZ, AR, CA, FL, GA, HI, LA, MD, MA, MI, MN, MS, NV, NM, NC, ND,
        OR, SC, TN, UT, VA, WI, WV.
      </div>
      <div className="note">
        TX requires a State license for Plumbing, electrical and HVAC only.
      </div>
      <Checkbox
        className="checkbox-wrapper"
        value={value}
        onChange={onCheckbox}
        name={name}
        label="My company does not do projects in any state listed above"
      />
    </Wrapper>
  );
};

export default StatesNote;
