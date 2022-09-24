import styled from "styled-components";

export const Hr = styled.hr`
  margin-top: 1rem;
  margin-bottom: 1rem;
  border: 0;
  border-top: 1px solid var(--color-grey-light);
`;

export const H5 = styled.h5`
  &,
  & span {
    font-weight: 600;
    position: relative;
    font-size: 1.8rem;
    line-height: 2rem;
    color: #222222;
  }
  @media screen and (max-width: 767px) {
    &,
    & span {
      font-size: 1.8rem;
      line-height: 2rem;
      font-weight: 600;
    }
  }
`;

export const Note = styled.p`
  &,
  & span {
    font-size: 1.4rem;
    line-height: 1.6rem;
    font-weight: 400;
    font-weight: normal;
    color: #222222;
  }
`;

// -------------

export const H1 = styled.h1`
  font-size: 5.6rem;
  line-height: 1.5;
  font-weight: 700;
`;

export const H2 = styled.h2`
  font-size: 3.2rem;
  line-height: 1.5;
  font-weight: 700;
`;

export const H3 = styled.h3`
  font-size: 2.4rem;
  line-height: 1.5;
  font-weight: 700;
`;

export const H4 = styled.h4`
  font-size: 1.8rem;
  line-height: 1.5;
  font-weight: 700;
`;

export const Text = styled.p`
  font-size: 1.4rem;
  line-height: 1.5;
  font-weight: 400;
`;

export const Caption = styled.p`
  font-size: 1.2rem;
  line-height: 1.5;
  font-weight: 400;
`;

export const CaptionSmall = styled.p`
  font-size: 10px;
  line-height: 1.5;
  font-weight: 400;
`;
