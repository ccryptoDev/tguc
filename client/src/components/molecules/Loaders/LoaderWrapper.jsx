import React from "react";
import styled from "styled-components";
import Loader from "./Circle";

const Wrapper = styled.div`
  position: relative;
  width: 100%;

  margin: ${(props) => props.margin};
  .content {
    opacity: ${(props) =>
      props.loading && props.type === "opacity" ? 0.2 : 1};
    visibility: ${(props) =>
      props.loading && props.type === "hide" ? "hidden" : "visible"};
  }
`;

const PageLoader = ({
  children,
  size = "7",
  position = "center",
  loading,
  type = "opacity",
}) => {
  return (
    <Wrapper loading={loading ? 1 : 0} type={type}>
      {loading ? <Loader size={size} position={position} /> : ""}
      <div className="content">{children}</div>
    </Wrapper>
  );
};
export default PageLoader;
