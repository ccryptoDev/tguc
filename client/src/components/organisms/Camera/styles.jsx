import styled from "styled-components";

const Wrapper = styled.div`
  position: relative;
  width: 100%;
  overflow: hidden;

  .camera {
    display: flex;
  }

  .result {
    position: absolute;
    top: 0;
    left: 100%;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.9);
    transition: 0.4s;

    &.hasPhoto {
      left: 0;
      width: 100%;
      height: 100%;
    }
  }

  .buttons-wrapper {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    margin-bottom: 5vh;
    display: flex;
    column-gap: 20px;
    &.isSafari {
      margin-bottom: 10vh;
    }
  }

  .buttons-wrapper-center {
    height: 100px;
    position: relative;
  }
  .buttons-center {
    margin: 0;
    position: absolute;
    top: 50%;
    left: 50%;
    -ms-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
  }

  .action-button {
    border-radius: 50%;
    width: 60px;
    height: 60px;
    background: var(--color-primary);
    border: none;
    font-size: 12px;
    color: #fff;
  }

  .video,
  .canvas {
    width: 100%;
    max-width: 100%;
    height: 90vh;
    min-height: 100%;
    object-fit: fill;
  }
`;

export default Wrapper;
