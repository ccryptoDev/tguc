import styled from "styled-components";

export default styled.div`
  font-size: inherit;
  position: relative;
  input {
    opacity: 0;
    z-index: -5;
    height: 100%;
    position: relative;
    width: 100%;
    opacity: 0;
    padding: 2rem 10rem 2rem 1.6rem;

    &:focus + label,
    & + .success {
      border-color: #28a745;
      box-shadow: 0 0 0 0.2rem rgb(40 167 69 / 25%);
    }
  }

  .isFilled {
    border-color: #be881e;
    background: #fefcf8;
  }

  label {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100%;
    border: 1px solid #ced4da;
    display: flex;
    align-items: center;
    padding: 2rem 10rem 2rem 1.6rem;
    box-sizing: border-box;
    cursor: pointer;
    text-align: left;
    color: #363636;
    margin-bottom: 1.5rem;
    font-family: "Poppins";

    & span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      &:after {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        z-index: 3;
        display: block;
        padding: 6px 1.2rem;
        display: flex;
        align-items: center;
        line-height: inherit;
        color: #495057;
        content: "browse";
        background-color: #e9ecef;
        border-left: inherit;
        font-family: "Poppins";
        text-transform: lowercase;
        line-height: 1.6rem;
      }
    }
  }
`;
