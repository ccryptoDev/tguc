import React from "react";
import styled from "styled-components";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import { Link } from "react-router-dom";
import W9 from "../../../../../../assets/pdf/W9.pdf";
import icon from "../../../../../../assets/svgs/pdf.svg";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  column-gap: 30px;
  flex-wrap: wrap;
  span {
    font-size: 24px;
    line-height: 1.5;
    font-weight: 700;
  }
  a:link,
  a:visited {
    font-size: 14px;
    color: var(--color-main);
    cursor: pointer;
    display: flex;
    align-items: center;
    column-gap: 10px;
  }

  img {
    width: 30px;
  }
`;

const DownloadPdf = () => {
  return (
    <Wrapper>
      <span>Completed W-9</span>
      <Link to={W9} target="_blank" download>
        Download W-9 <img src={icon} alt="download w-9" />
      </Link>
      <a
        href="https://www.irs.gov/pub/irs-pdf/fw9.pdf"
        rel="noreferrer"
        target="_blank"
      >
        view online
        <TravelExploreIcon sx={{ fontSize: 20 }} />
      </a>
    </Wrapper>
  );
};

export default DownloadPdf;
