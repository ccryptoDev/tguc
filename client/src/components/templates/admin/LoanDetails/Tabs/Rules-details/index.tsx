import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Heading from "../../../../../molecules/Typography/admin/DetailsHeading";
import Rule, { IRuleProps } from "./Rule";
import Modal from "../../../../../organisms/Modal/Regular/ModalAndTriggerButton";
import TriggerButton from "../../../../../atoms/Buttons/TriggerModal/Trigger-button-edit";
import EditIcon from "../../../../../atoms/Icons/SvgIcons/Edit";
import Form from "./ModalForm";

const Wrapper = styled.div`
  font-family: "OpenSans";
  font-size: 1.4rem;
  line-height: 3rem;
  .row {
    display: flex;
  }
  .key {
    padding-right: 1rem;
  }
  .heading-wrapper {
    display: flex;
  }
`;

const RulesDetails = ({ state }: { state: any }) => {
  const [rules, setRules] = useState<any[]>([]);

  useEffect(() => {
    // const details = state?.screenTracking?.rulesDetails.ruleData;
    const details = state?.rulesDetails.ruleData;

    if (details) {
      // PARSE RULES TO ARRAY
      const rulesArray: any[] = [];
      Object.keys(details).forEach((key) => {
        rulesArray.push(details[key]);
      });
      setRules(rulesArray);
    }
  }, [state?.rulesDetails.ruleData]);

  return (
    <Wrapper>
      <Heading text="Rules" />
      {/* <Modal
        button={
          <TriggerButton className="edit-btn" style={{ width: "3rem" }}>
            <EditIcon />
          </TriggerButton>
        }
        modalContent={Form}
      /> */}
      <div>
        {rules.length
          ? rules.map((item: IRuleProps) => {
              return (
                <div key={item.ruleId} className="rule-wrapper">
                  <div className="heading-wrapper">
                    <div className="heading">Rule: {item.ruleId}</div>
                  </div>
                  <Rule {...item} />
                </div>
              );
            })
          : ""}
      </div>
    </Wrapper>
  );
};

export default RulesDetails;
