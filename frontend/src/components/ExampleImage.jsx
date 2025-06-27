import React from 'react';
import "../styles/ExampleImage.css";

const ExampleImage = ({ src, onClick }) => {
  return (
    <div className="example-image-container">
      <img
        src={src}
        alt="Example Receipt"
        className="example-image"
        onClick={onClick}
      />
    </div>
  );
}

export default ExampleImage;