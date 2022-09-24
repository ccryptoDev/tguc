import styled from "styled-components";

const Table = styled.div`
  &.table {
    border: 1px solid var(--color-secondary-2);
    border-radius: 8px;
    overflow: hidden;
    min-width: 600px;

    & .thead {
      padding: 12px 24px;
      background: var(--color-bg-2);

      & .th {
        font-size: 18px;
        font-weight: 600;
      }
    }

    & .tbody {
      padding: 12px 24px;
    }
    & .tr {
      padding: 12px 0;
      display: grid;
      &:not(:last-child) {
        border-bottom: 1px solid var(--color-secondary-2);
      }

      & .td {
        font-size: 14px;

        &:not(:first-child) {
          padding: 0 12px;
          border-left: 1px solid var(--color-secondary-2);
        }

        & ul {
          list-style: disc;
          padding: 10px 0 10px 20px;
        }
      }
    }

    .tbody,
    .thead {
      &.col-3 {
        & .tr {
          grid-template-columns: 2fr 1fr 1fr;
        }
      }

      &.col-2 {
        & .tr {
          grid-template-columns: minmax(200px, 300px) 1fr;
        }
      }

      &.col-1 {
        & .tr {
          grid-template-columns: 1fr;
        }
      }
    }

    .center {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
`;

export default Table;
