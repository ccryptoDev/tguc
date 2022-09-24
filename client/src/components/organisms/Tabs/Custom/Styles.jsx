import styled from "styled-components";

export const TabsAdmin = styled.div`
  position: relative;
  background: #fff;
  ul {
    list-style: none;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    position: relative;
    padding: 0 20px;

    & li {
      z-index: 100;
    }

    &:after {
      content: "";
      position: absolute;
      width: 100%;
      margin: 0 -20px;
      bottom: 0;
      width: 100%;
      height: 1px;
      background: var(--color-border);
    }

    button {
      padding: 20px;
      width: 100%;
      border: none;
      border-bottom: 1px solid transparent;
      background: transparent;
      color: var(--color-primary);
      box-sizing: border-box;
      font-size: 12px;
      line-height: 1.5;
      font-weight: 600;
    }

    & .active button {
      border-bottom: 1px solid var(--color-primary-hover);
      color: var(--color-primary-hover);
      z-index: 100;
    }
  }
`;
