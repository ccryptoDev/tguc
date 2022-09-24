import styled from "styled-components";
import { common } from "../../../atoms/Buttons/Button";

export const Wrapper = styled.div`
  .form-wrapper {
    padding: 24px 0;
    & h5 {
      text-align: center;
      margin-bottom: 24px;
    }
    & .buttons-wrapper {
      display: flex;
      gap: 24px;
      align-items: center;
      justify-content: center;
    }
  }
`;

export const Button = styled.button`
  ${common}
  color: #fff;
  transform: scale(1);
  &:active {
    transform: translate(0, -1px) scale(0.98);
  }

  &.declined {
    background: var(--color-danger);
  }

  &.approved {
    background: var(--color-success);
  }
`;

export const StatusWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  padding: 24px 12px;
`;
