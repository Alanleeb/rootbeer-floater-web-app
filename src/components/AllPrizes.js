import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore"; // Import firestore functions
import { FIREBASE_DB, db } from "../firebase/firebase-config";

import ClickableComponent from "./ClickableComponent";
import PrizePage from "./PrizePage"; // Import the PrizePageContainer component
import { ref, onValue, get, set, off } from "firebase/database";

function AllPrizes() {
  const [raffData, setRaffleData] = useState();
  const [selectedPrize, setSelectedPrize] = useState(null); // State to store the selected prize
  const [newPrize, setNewPrize] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [options, setOptions] = useState();
  const totalPotentialOptions = ref(db, `totalPrizeOptions`);
  const winningPrizeArr = ref(db, `winningPrizeArr`);

  useEffect(() => {
    // Log reference to ensure it's correct
    console.log("Reference Path:", totalPotentialOptions.toString());

    // Set up the listener for the Realtime Database
    const unsubscribe = onValue(
      totalPotentialOptions,
      (snapshot) => {
        const newData = snapshot.val();
        console.log("NEW DATA:", newData); // Log the data retrieved from Firebase
        setOptions(newData || {}); // Handle case where snapshot.val() could be null
      },
      (error) => {
        // Log any errors from Firebase
        console.error("Firebase Data Error:", error);
      }
    );

    // Cleanup function to remove the listener when the component is unmounted
    return () => {
      unsubscribe(); // Correctly remove the listener
      console.log("Unsubscribed from Realtime Database");
    };
  }, []); // Dependency array to include reference

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
  // const handleToggleChange = () => {
  //   setIsChecked(!isChecked);
  // };

  const handleCheckboxClick = (id) => {
    const updatedSelectedIds = selectedIds.includes(id)
      ? selectedIds.filter((selectedId) => selectedId !== id)
      : [...selectedIds, id];
    setSelectedIds(updatedSelectedIds);
  };

  function handleBack() {
    setSelectedPrize(null);
    setNewPrize(false);
  }
  console.log("RAFF DATASS", raffData);
  console.log("Button clicked!", options);
  return (
    <div
      style={{
        backgroundColor: "lightgrey",
        height: "100vh",
        width: "100vw",
        margin: 0,
        alignItems: "center",
        paddingTop: 50
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
          raffData.map((r, index) => (
            <div
              key={r.id}
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
              <div>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(r.id)}
                  onChange={() => handleCheckboxClick(r.id)}
                />
                <label>Select</label>
              </div>
              <ClickableComponent onPress={() => handleClick(r.prize)}>
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
            </div>
          ))}
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
    </div>
  );
}

// Styles
const tableHeaderStyle = {
  padding: "12px 16px",
  textAlign: "left",
  fontWeight: "600",
  color: "#4b5563",
};

const tableCellStyle = {
  padding: "12px 16px",
  borderBottom: "1px solid #dee2e6",
};

export default AllPrizes;
