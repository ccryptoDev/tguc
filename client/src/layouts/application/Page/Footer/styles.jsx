import styled from "styled-components";

export const ListWrapper = styled.ul`
  list-style: none;
  & li {
    & a:visited,
    & a:link,
    & button {
      text-decoration: none;
      color: var(--color-main);
      font-size: 12px;
      line-height: 1.5;
    }
    &:not(:last-child) {
      margin-bottom: 6px;
    }
  }
`;

const Footer = styled.footer`
  background: #fff;
  font-family: Poppins;
  height: var(--footer-height);

  .nav {
    max-width: var(--page-width);
    width: 100%;
    margin: auto;
    padding: 24px 20px;
    display: flex;
    align-items: stretch;
    justify-content: space-between;
  }

  .copyright {
    background: var(--color-main);
    text-align: center;
    color: #fff;
    font-size: 12px;
    padding: 12px;
  }

  @media screen and (max-width: 767px) {
    padding: 16px;
    height: auto;
    & .nav {
      flex-wrap: wrap;
      column-gap: 16px;
      row-gap: 16px;
      align-items: flex-start;
      justify-content: space-between;
    }
  }

  @media screen and (max-width: 620px) {
    .news-and-offers {
      &-heading {
        font-size: 12px;
        margin-bottom: 12px;
      }
    }
  }
`;

export default Footer;
