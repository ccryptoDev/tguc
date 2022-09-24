import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import InstagramIcon from "../../components/atoms/Icons/SvgIcons/Instagram";
import TwitterIcon from "../../components/atoms/Icons/SvgIcons/Twitter";
import TriggerButton from "../../components/atoms/Buttons/TriggerModal/Trigger-button-edit";
import Modal from "../../components/organisms/Modal/Regular/ModalAndTriggerButton";
import { PrivacyPolicy } from "../../components/templates/application/Consents";

const Wrapper = styled.footer`
  background: #f8f9fa;
  height: 8rem;
  margin-top: 5rem;
  font-family: Poppins;

  & .nav {
    margin: auto;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }
  & ul {
    display: flex;
    align-items: center;
    list-style: none;

    & li {
      padding: 5px 1rem;

      & a,
      & button {
        color: #50585d;
        font-size: 1.6rem;
      }

      & img {
        width: 3rem;
      }

      a {
        color: inherit;
        text-decoration: none;
      }

      button {
        background: transparent;
        border: none;
      }

      .socials {
        display: flex;
        align-items: center;
        cursor: pointer;
      }
    }
  }
`;

const Footer = () => {
  return (
    <Wrapper>
      <div className="nav">
        <ul>
          <li>
            <Link to="https://tguc-financial.com/contact-us/">
              <img src="/images/icon-color.png" alt="tguc-financial" />
            </Link>
          </li>
          <li>
            <Modal
              button={<TriggerButton>Privacy Policy</TriggerButton>}
              modalContent={PrivacyPolicy}
              modalTitle="Privacy Policy"
            />
          </li>
          <li>
            <a
              href="https://tguc-financial.com/contact-us/"
              target="_blank"
              rel="noreferrer"
            >
              Contact us
            </a>
          </li>
          <li>
            <div className="nav-link socials">
              <a href="https://twitter.com" target="_blank" rel="noreferrer">
                <TwitterIcon />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer">
                <InstagramIcon />
              </a>
            </div>
          </li>
        </ul>
      </div>
    </Wrapper>
  );
};

export default Footer;
