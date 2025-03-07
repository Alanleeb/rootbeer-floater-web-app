import React from "react";

const ClickableComponent = ({ onPress, children }) => {
  return (
    <>
      <div
        onClick={onPress}
        style={{
          cursor: "pointer",
          padding: "10px",
          backgroundColor: "#f0f0f0",
          borderBottom: "1px",
          borderBottomStyle: "solid",
          borderBottomColor: "lightgrey",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        }}
      >
        {children}
      </div>
    </>
  );
};

export default ClickableComponent;
