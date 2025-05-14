import React from "react";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import "../styles/PaginationButtons.css";

const PaginationButtons = ({
  pageNumber,
  setPageNumber,
  totalItems,
  displayPerPage,
}) => {
  return (
    <div className="button-container">
      {pageNumber > 1 && (
        <button
          aria-label={"Previous page"}
          onClick={() => setPageNumber(pageNumber - 1)}
        >
          <FaAngleLeft />
          {"Previous"}
        </button>
      )}

      <div className="spacer"></div>

      {(pageNumber * displayPerPage) < totalItems && (
        <button
          aria-label={"Next page"}
          onClick={() => setPageNumber(pageNumber + 1)}
        >
          <FaAngleRight />
          {"Next"}
        </button>
      )}
    </div>
  );
};

export default PaginationButtons;
