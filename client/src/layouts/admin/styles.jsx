import styled from "styled-components";

export default styled.div`
  min-height: 100vh;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  font-family: "Poppins";
  display: flex;

  .main-wrapper {
    flex-grow: 1;
  }

  & main {
    background: rgb(248, 248, 248);
    min-height: var(--admin-main-height);
  }

  &.expand .layout-sidenav {
    width: var(--sidenav-folded-width);
    min-width: var(--sidenav-folded-width);
  }

  &.expand .hxpt {
    display: none;
  }

  & .layout-sidenav {
    width: var(--sidenav-open-width);
    min-width: var(--sidenav-open-width);
  }

  & .sidenav-menu {
    width: var(--sidenav-open-width);
    min-width: 17rem;
  }

  .layout {
    display: flex;
    height: 100%;
    height: 100vh;
    background: var(--dashboard-bg-color);
    backdrop-filter: blur(5rem);

    /* on side pane open animation */
    @media (max-width: 1550px) {
      .pane-open {
        padding-left: 7rem;
      }
    }

    @media (max-width: 1480px) {
      .pane-open {
        padding-left: 12rem;
      }
    }
  }
`;
