import styled from "styled-components";

const Wrapper = styled.div`
  .tabs-wrapper {
    padding: 0;
    & .MuiTabs-root .MuiPaper-root .MuiButtonBase-root {
      width: auto !important;
    }

    & .MuiTabs-root .MuiButtonBase-root.MuiTab-root {
      width: auto;
    }

    & .MuiTabs-flexContainer {
      justify-content: start;
      column-gap: 30px;
    }

    & .MuiTab-root {
      text-transform: capitalize;
      font-size: 14px;
    }
  }

  @media screen and (max-width: 767px) {
    .heading {
      display: none;
    }
  }
`;

export default Wrapper;
