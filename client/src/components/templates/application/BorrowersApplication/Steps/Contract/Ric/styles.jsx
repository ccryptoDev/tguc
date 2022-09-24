import styled from "styled-components";

export default styled.div`
  padding: 0;
  margin: 0;
  font-size: 14px;
  font-family: Poppins;

  p {
    text-align: justify;
    font-size: 1.4rem;
    margin: 8px 0;
    line-height: 1.5;
  }
  .text-center {
    text-align: center;
  }

  .underline {
    text-decoration: underline;
  }

  h4 {
    font-size: 1.8rem;
  }

  h5 {
    font-size: 1.6rem;
  }

  .section:not(:last-child) {
    margin-top: 4rem;
  }

  table {
    border-collapse: collapse;
    width: 100%;
    min-width: 600px;
  }

  table td,
  table th {
    border: 1px solid;
    padding: 5px;
  }

  .section-frame {
    border: 1px solid #000;
    padding: 1rem;
  }

  .table-container {
    overflow-x: auto;
  }

  .heading {
    text-align: center;
    margin: 1rem;
    font-size: 1.6rem;
  }

  .table-footer-item:nth-child(3) {
    border-right: none;
  }

  .signature-img {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
  }

  @media print {
    .contract-container {
      height: 11in;
      width: 8.5in;
    }
    body {
      font-size: 10pt;
    }
    .no-break {
      page-break-inside: avoid;
    }
  }

  @page {
    margin: 20mm 10mm;
  }

  @media screen and (max-width: 600px) {
    ol {
      padding: 0;
    }
  }
`;
