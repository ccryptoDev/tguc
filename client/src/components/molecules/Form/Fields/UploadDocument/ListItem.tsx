import React from "react";
import styled from "styled-components";
import imageIcon from "../../../../../assets/png/image-icon.png";
import { formatDate } from "../../../../../utils/formats";
import { Note } from "../../../../atoms/Typography";
import DeleteButton from "../File/Remove-button";

const Li = styled.li`
  display: flex;
  justify-content: space-between;
  column-gap: 1rem;
  &:not(:first-child) {
    margin-top: 1.2rem;
  }

  .file {
    &-info-wrapper {
      display: flex;
      align-items: center;
      column-gap: 1.2rem;
    }

    &-icon {
      height: 1.8rem;
      width: 2.1rem;
    }

    &-name {
      color: var(--color-primary);
      margin-bottom: 2px;
    }

    &-date {
      color: var(--color-grey-light);
      font-size: 10px;
      line-height: 12px;
    }
  }

  .remove-btn {
    border: none;
    background: transparent;
  }
`;

const ListItem = ({
  onRemove,
  name,
  date,
}: {
  onRemove: any;
  name: string;
  date: string;
}) => {
  return (
    <Li>
      <div className="file-info-wrapper">
        <img src={imageIcon} alt={name} className="file-icon" />
        <div className="file-name-box">
          <Note className="file-name">{name}</Note>
          <div className="file-date">{formatDate(date)}</div>
        </div>
      </div>
      <DeleteButton onClick={onRemove} />
    </Li>
  );
};

export default ListItem;
