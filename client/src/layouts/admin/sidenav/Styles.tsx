import styled from "styled-components";

export default styled.aside`
  min-height: 100vh;
  background-color: #fff;
  color: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.2s;
  box-sizing: border-box;
  border-right: 1px solid rgba(0, 0, 0, 0.12);

  .logo {
    display: flex;
    align-items: center;
    width: var(--sidenav-open-width);
    padding: 16px 14px;
    box-sizing: border-box;

    & img {
      max-width: 100%;
      height: 30px;
    }
  }

  .logo-title {
    display: flex;
    justify-content: flex-start;
    flex-direction: column;

    p {
      font-family: var(--font-body);
      font-weight: var(--font-weight-regular);
      font-size: var(--font-size-md);
      color: var(--dark-04);
    }
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  ul .listItem {
    padding: 0;
    margin: 0;
  }

  ul .active a,
  ul .active button {
    background: #eee;
  }

  ul .listItem button {
    border: none;
    background: transparent;
    padding: unset;
  }

  ul .listItem a {
    padding: 8px 16px;
    color: #3c4858;

    & svg {
      margin-right: 10px;
    }
  }

  ul .listItem a,
  ul .listItem button {
    text-transform: unset;
    text-decoration: none;
    width: 100%;
    height: 100%;
    transition: all 0.1s;
    display: flex;
    align-items: center;
    font-size: 1.4rem;
    &:hover {
      background: #eee;
      opacity: 0.7;
    }
    &:visited,
    &:active {
      color: #3c4858;
    }
  }
  @media (max-width: 510px) {
    display: none;
  }

  .logout {
    padding: 2.8rem 0 0 0;
    border-top: 1px solid rgba(228, 228, 235, 1);

    button {
      display: flex;
      align-items: center;
      background: none;
      border: none;
      padding: 0 4px;
      font-style: normal;
      font-weight: 500;
      font-size: 1.6rem;
      line-height: 1.6rem;
      letter-spacing: 0.2px;
      color: #ebebf0;
      cursor: pointer;

      & span {
        margin-left: 0.8rem;
      }
    }
  }
`;
