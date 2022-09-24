import styled from "styled-components";
import MenuItem from "@material-ui/core/MenuItem";
import Popper from "@material-ui/core/Popper";

export const Wrapper = styled.div`
  .MuiButtonBase-root {
    min-width: 40px;
    border-radius: 0;
    border: none;
    border-radius: 0;
    text-transform: initial;
    &:hover {
      background: #fff;
    }
  }

  .name-wrapper {
    padding: 0 16px;
    text-align: left;

    & .user-name {
      font-size: 12px;
      line-height: 1.5;
      font-weight: 700;
      color: #000;
    }

    & .user-role {
      font-size: 10px;
      line-height: 1.5;
      color: #50585d;
    }
  }

  .avatar {
    display: flex;
    padding: 16px 24px;
    overflow: hidden;
    position: relative;
    align-items: center;
    flex-shrink: 0;
    font-family: "OpenSans", "Helvetica", "Arial", sans-serif;
    user-select: none;
    justify-content: center;
    background: #fff;
    box-sizing: border-box;
    height: 70px;

    & img {
      color: transparent;
      width: 100%;
      height: 100%;
      object-fit: cover;
      text-align: center;
      border-radius: 50%;
      padding: 5px;
    }
  }
`;

// dropdown li element
export const ListItem = styled(MenuItem)`
  & .item-wrapper a,
  & .item-wrapper button {
    display: flex;
    align-items: center;
    text-decoration: none;
    color: #000;
    background: transparent;
    height: 3.2rem;
    border: none;
    padding: 0;
    line-height: 2rem;
    font-size: 1.4rem;
  }

  & svg {
    margin-right: 5px;
  }

  & button svg {
    margin-left: 2px;
  }

  & .item-wrapper .MuiListItemText-root .MuiTypography-body1 {
    font-size: 1.4rem;
    font-weight: normal;
  }
`;

export const DropDown = styled(Popper)`
  background: #fff;
  z-index: 999;

  /* style the dropdown li element */
  .MuiButtonBase-root {
    border-radius: 0;
    transition: all 0.1s;
  }

  .MuiButtonBase-root:hover {
    background: var(--light-02);
    border-radius: 0;
  }
`;
