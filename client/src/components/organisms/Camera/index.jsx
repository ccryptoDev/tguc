/*eslint-disable*/
import React, { useState, useEffect, useRef } from "react";
import Wrapper from "./styles";
import Loader from "../../molecules/Loaders/LoaderWrapper";

const Component = ({ closeModal, state: { saveImage } }) => {
  const videoRef = useRef(null);
  const photoRef = useRef(null);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);

  // DETECT DEVICE (fix positioning buttons bug)
  const isMobile = navigator?.userAgentData?.mobile;
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
  const isIPhoneUsingSafari = isMobile && isSafari;

  const getVideo = () => {
    navigator.mediaDevices
      .getUserMedia({
        video: {
          width: {
            min: 1280,
            ideal: 1920,
            max: 2560,
          },
          height: {
            min: 720,
            ideal: 1080,
            max: 1440,
          },
          facingMode: "environment",
        },
      })
      .then((stream) => {
        let video = videoRef.current;
        video.srcObject = stream;
        video.play();
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  };

  const takePhoto = () => {
    const width = 1280;
    const height = width / (16 / 9);
    let video = videoRef.current;
    let photo = photoRef.current;

    photo.width = width;
    photo.height = height;
    let ctx = photo.getContext("2d");
    ctx.drawImage(video, 0, 0, width, height);
    const img = photo.toDataURL("image/webp");
    setImage(img);
    setHasPhoto(true);
  };

  const closePhoto = () => {
    let photo = photoRef.current;
    let ctx = photo.getContext("2d");
    ctx.clearRect(0, 0, photo.width, photo.height);
    setHasPhoto(false);
  };

  useEffect(() => {
    getVideo();
  }, [videoRef]);

  const onSaveImageHandler = () => {
    saveImage(image);
    closeModal();
  };

  return (
    <Loader loading={loading}>
      <Wrapper>
        <div className="camera">
          <video playsInline ref={videoRef} className="video" />
          {videoRef?.current ? (
            <div className="buttons-wrapper">
              <button
                type="button"
                className="action-button"
                onClick={takePhoto}
              >
                Snap
              </button>
              <button
                type="button"
                className="action-button"
                onClick={closeModal}
              >
                Cancel
              </button>
            </div>
          ) : (
            ""
          )}
        </div>
        <div className={`result ${hasPhoto ? "hasPhoto" : ""}`}>
          <canvas ref={photoRef} className="canvas" />
          {photoRef?.current ? (
            <div className={`buttons-wrapper ${isIPhoneUsingSafari ? "isSafari" : ""}`}>
              <button
                type="button"
                className="action-button"
                onClick={closePhoto}
              >
                Close
              </button>
              <button
                type="button"
                className="action-button"
                onClick={onSaveImageHandler}
              >
                Save
              </button>
            </div>
          ) : (
            ""
          )}
        </div>
      </Wrapper>
    </Loader>
  );
};

export default Component;
