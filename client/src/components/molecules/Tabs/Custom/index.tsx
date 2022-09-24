import React from "react";
import styled from "styled-components";

interface ITab {
  value: string;
  button: any;
}

const Wrapper = styled.div`
  .tabs {
    &-buttons {
      list-style: none;
      display: flex;
    }
  }
`;

const Tabs = ({ onChange, buttons, activeTab }: { onChange: Function; buttons: ITab[]; activeTab: string }) => {
  return (
    <Wrapper className="tabs-wrapper">
      <ul className="tabs-buttons">
        {buttons.map((tab) => (
          <li className={`tabs-button ${tab.value === activeTab ? "active" : ""}`} key={tab.value}>
            <button type="button" onClick={() => onChange(tab.value)}>
              {tab.button}
            </button>
          </li>
        ))}
      </ul>
    </Wrapper>
  );
};

export default Tabs;
