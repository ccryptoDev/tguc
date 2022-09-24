import React, { useState, useEffect } from "react";
import styled from "styled-components";
import SearchIcon from "@mui/icons-material/Search";

const Wrapper = styled.div`
  position: relative;

  input {
    padding: 10px 20px 10px 40px;
    border: 1px solid #ebebeb;
    font-size: 12px;
  }

  .search-icon {
    display: flex;
    align-items: center;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: 10px;
  }
`;

const Search = ({ searchHandler }) => {
  const [input, setInput] = useState("");

  // input search debounce
  useEffect(() => {
    const debounce = setTimeout(() => {
      searchHandler(input);
    }, 1000);
    return () => {
      clearInterval(debounce);
    };
    // eslint-disable-next-line
  }, [input]);

  const onChangeHandler = (e) => setInput(e.target.value);

  return (
    <Wrapper>
      <input
        type="text"
        onChange={onChangeHandler}
        value={input}
        placeholder="Search"
      />
      <div className="search-icon">
        <SearchIcon sx={{ fontSize: 24 }} />
      </div>
    </Wrapper>
  );
};

export default Search;
