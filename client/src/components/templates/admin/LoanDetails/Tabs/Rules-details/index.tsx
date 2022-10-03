import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Heading from "../../../../../molecules/Typography/admin/DetailsHeading";
import { IRuleProps } from "./Rule";
import SummaryTable from "./Tables/Table-Application-Summary";
import { H5, Hr } from "../../../../../atoms/Typography";

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
  h5 {
    margin-top: 2rem;
  }
`;

const RulesDetails = ({ state }: { state: any }) => {
  const [rules, setRules] = useState<any[]>([]);

  useEffect(() => {
    const details = state?.rulesDetails?.ruleData;

    if (details) {
      // PARSE RULES TO ARRAY
      const rulesArray: any[] = [];
      Object.keys(details).forEach((key) => {
        rulesArray.push(details[key]);
      });
      setRules(rulesArray);
    }
  }, [state?.rulesDetails?.ruleData]);

  return (
    <Wrapper>
      <Heading text="Rules" />
      <div>
        {rules.length ? (
          rules.map((item: IRuleProps) => {
            return (
              <>
                <H5>Rule: {item?.description}</H5>
                <Hr />
                <SummaryTable {...item} />
              </>
            );
          })
        ) : (
          <b>No rules available at the moment.</b>
        )}
      </div>
    </Wrapper>
  );
};

export default RulesDetails;
