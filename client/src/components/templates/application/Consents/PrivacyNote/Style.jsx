import styled from "styled-components";

export const Wrapper = styled.div`
  font-size: 14px;
  line-height: 1.5;
  .header {
    text-align: center;
    margin-bottom: 10px;
    display: none;
  }

  .signatures,
  .signatures td {
    border: none;
  }

  .signatures {
    display: none;
  }

  .no-break {
    page-break-inside: avoid;
  }

  p,
  ul li {
    margin: 10px 0;
    line-height: 26px;
  }

  ul {
    padding: 0 20px;
  }

  @media print {
    .header,
    .signatures {
      display: block;
    }

    table {
      page-break-inside: avoid;
    }
  }

  .bg-gray {
    background: #888888;
    color: #fff;
  }

  table,
  table td {
    border: 1px solid #888888;
  }

  table tr {
    page-break-inside: avoid;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    & .cell {
      padding: 1rem;
    }
    &:not(:last-child) {
      margin-bottom: 5px;
    }
  }

  .reasons-table tr td:first-child {
    width: 50%;
  }

  .qa-table td:first-child {
    width: 110px;
    color: #fff;
    vertical-align: top;
  }

  .qa-table td.facts {
    background: #444440;
    color: #fff;
    vertical-align: middle;
    font-size: 22px;
  }

  @media screen and (max-width: 400px) {
    .qa-table td:first-child {
      width: auto;
    }
  }
`;
