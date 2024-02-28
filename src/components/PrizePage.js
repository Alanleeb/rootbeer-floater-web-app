import React from "react";
import Form from "./Form/Form";
import { FaArrowLeft } from "react-icons/fa";

// Product page component
const PrizePage = (props) => {
  const { selectedPrize, isNewPrize, handleBack } = props;
  return (
    <div>
      <div style={{ width: "60%", margin: "auto" }}>
        <div
          onClick={() => handleBack()}
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            marginRight: "15px",
          }}
        >
          <FaArrowLeft size={30} style={{ marginRight: "15px" }} />
          {
            <p style={{ fontSize: "18px", fontWeight: "bold" }}>
              {!isNewPrize ? selectedPrize.prize : "New Prize"}
            </p>
          }
        </div>
      </div>
      {isNewPrize ? (
        <Form isNewPrize={true} />
      ) : (
        <>
          <Form defaultFormData={selectedPrize} isNewPrize={false} />
        </>
      )}
    </div>
  );
};

export default PrizePage;
