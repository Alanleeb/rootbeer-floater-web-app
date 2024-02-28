import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore"; // Import firestore functions
import { FIREBASE_DB } from "../firebase/firebase-config";

import ClickableComponent from "./ClickableComponent";
import PrizePage from "./PrizePage"; // Import the PrizePageContainer component

function AllPrizes() {
  const [raffData, setRaffleData] = useState();
  const [selectedPrize, setSelectedPrize] = useState(null); // State to store the selected prize
  const [newPrize, setNewPrize] = useState(false);

  useEffect(() => {
    // Example usage:
    fetchRaffleData()
      .then((raffleData) => {
        console.log("Raffle data:", raffleData);
        setRaffleData(raffleData);
        // Do something with the fetched raffle data
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, []);

  const handleClick = (prize) => {
    const selectedObject = raffData.find((obj) => obj.prize === prize);
    setSelectedPrize(selectedObject); // Set the selected prize
  };

  // Function to fetch raffle data from Firestore
  const fetchRaffleData = async () => {
    try {
      const raffleDataCollection = collection(FIREBASE_DB, "raffleData");
      const querySnapshot = await getDocs(raffleDataCollection);
      const raffleData = [];
      querySnapshot.forEach((doc) => {
        // Extract data from each document
        const data = doc.data();
        console.log("DATA DOT IMAGE", data.image);
        // Add the extracted data to the raffleData array
        raffleData.push({
          id: doc.id,
          prize: data.prize,
          prizeDescription: data.prizeDescription,
          image: data.image,
          pricePerTicket: data.pricePerTicket,
          numberOfBalls: data.numberOfBalls,
          ballSelectionNumber: data.ballSelectionNumber,
          active: data.active,
        });
      });
      return raffleData; // Return the array of raffle data
    } catch (error) {
      console.error("Error fetching raffle data:", error);
      return []; // Return an empty array in case of error
    }
  };

  function handleBack() {
    setSelectedPrize(null);
    setNewPrize(false);
  }
  console.log("Button clicked!", selectedPrize);
  return (
    <div
      style={{
        backgroundColor: "lightgrey",
        height: "100vh", // Set height to 100vh
        width: "100vw", // Set width to 100vw
        margin: 0,
        padding: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-end",
          paddingTop: "30px",
          paddingBottom: "15px",
          width: "90%",
          margin: "auto",
          paddingRight: "10px",
          paddingLeft: "10px",
        }}
      >
        {!selectedPrize && newPrize === false && (
          <button onClick={() => setNewPrize(true)}>Add New</button>
        )}
      </div>
      <div
        style={{
          display: "flexw",
          justifyContent: "center",
          margin: "auto",
          width: "90%",
        }}
      >
        {raffData && !selectedPrize && !newPrize && (
          <div
            style={{
              cursor: "pointer",
              borderBottom: "1px",
              borderBottomColor: "lightgrey",
              borderBottomStyle: "solid",
              padding: "10px",
              display: "flex",
              flexDirection: "row",
              backgroundColor: "grey",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-start",
                width: "25%",
                color: "white",
              }}
            >
              <text>Prize</text>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-start",
                width: "25%",
                color: "white",
              }}
            >
              <text>Status</text>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-start",
                width: "25%",
                color: "white",
              }}
            >
              <text>Inventory</text>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-start",
                width: "25%",
                color: "white",
              }}
            >
              <text>Category</text>
            </div>
          </div>
        )}
        {raffData &&
          !selectedPrize &&
          !newPrize &&
          raffData.map((r) => (
            <ClickableComponent key={r.id} onPress={() => handleClick(r.prize)}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    width: "25%",
                  }}
                >
                  <text>{r.prize}</text>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    width: "25%",
                  }}
                >
                  <text>{r.active ? `Active` : `Inactive`}</text>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    width: "25%",
                  }}
                >
                  <text>inventory</text>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    width: "25%",
                  }}
                >
                  <text>category</text>
                </div>
              </div>
            </ClickableComponent>
          ))}
      </div>
      {/* Render PrizePageContainer with the selected prize */}
      {selectedPrize && !newPrize && (
        <PrizePage
          selectedPrize={selectedPrize}
          isNewPrize={false}
          handleBack={handleBack}
        />
      )}
      {newPrize && (
        <PrizePage
          selectedPrize={null}
          isNewPrize={true}
          handleBack={handleBack}
        />
      )}
    </div>
  );
}

export default AllPrizes;
