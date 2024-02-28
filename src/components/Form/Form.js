import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore"; // Import firestore functions
import { FIREBASE_DB, storage, db } from "../../firebase/firebase-config";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { set, ref } from "firebase/database";
import "./Form.scss";
import RichTextEditor from "../RichTextEditor";

const MyForm = ({ defaultFormData, isNewPrize }) => {
  // State variables to store form data
  const {
    prize = "",
    prizeDescription = "",
    image = [],
    previewImages = [],
    pricePerTicket = "",
    numberOfBalls = 0,
    ballSelectionNumber = 3,
    active = false,
  } = defaultFormData || {};

  const [formData, setFormData] = useState({
    prize: prize,
    prizeDescription: prizeDescription,
    image: image,
    previewImages: previewImages, // Array to store preview URLs
    pricePerTicket: pricePerTicket,
    numberOfBalls: numberOfBalls,
    ballSelectionNumber: ballSelectionNumber,
    active: active,
  });
  const [raffData, setRaffleData] = useState();
  const [isChecked, setIsChecked] = useState(
    Array(formData.previewImages.length).fill(false)
  );
  const raffleModRef = ref(db, `userRaffleNumbers/${formData.prize}`);
  const totalPotentialOptions = ref(db, `totalPrizeOptions/${formData.prize}`);

  const handleCheckboxChange = (index) => {
    const updatedCheckedState = [...isChecked];
    updatedCheckedState[index] = !updatedCheckedState[index];
    setIsChecked(updatedCheckedState);
  };

  useEffect(() => {
    // Fetch raffle data only if it's not already fetched
    if (!raffData) {
      fetchRaffleData()
        .then((raffleData) => {
          console.log("Raffle data:", raffleData);
          setRaffleData(raffleData);
          // Do something with the fetched raffle data
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  }, [raffData]); // Make sure to include raffData in the dependency array

  // Fetch and display images when raffData and formData are available
  useEffect(() => {
    // Ensure both raffData and formData are available
    if (raffData && formData.prize) {
      // Find the index of the selected prize in raffData
      const indexOfPrize = raffData.findIndex(
        (obj) => obj.prize === formData.prize
      );

      // Make sure the prize is found
      if (indexOfPrize !== -1) {
        // Map over the image URLs and fetch each image
        const fetchImages = raffData[indexOfPrize].image.map(
          async (imageName) => {
            setFormData({
              ...formData,
              image: imageName,
            });
            try {
              const imageUrl = await fetchImageByName(imageName);
              console.log("URL", imageUrl);
              return imageUrl;
            } catch (error) {
              console.error("Error fetching image:", error);
              return null;
            }
          }
        );

        // Wait for all image fetch operations to complete
        Promise.all(fetchImages)
          .then((imageUrls) => {
            // Filter out null values (errors)
            const validImageUrls = imageUrls.filter((url) => url !== null);
            // Set the image URLs in the state
            // setPrevImages(validImageUrls);
            // Update the formData state with the fetched previewImages
            setFormData({
              ...formData,
              previewImages: validImageUrls,
            });
          })
          .catch((error) => {
            console.error("Error fetching images:", error);
          });
      } else {
        console.log("Prize not found in raffle data:", formData.prize);
      }
    }
  }, [raffData, formData.prize]); // Make sure to include raffData and formData.prize in the dependency array

  console.log("FORM DATA FR", formData);
  // Event handler to update form data
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Event handler to update richText form input
  const handleRichTextChange = (content) => {
    // setRichTextContent(content);
    setFormData({
      ...formData,
      prizeDescription: content,
    });
  };

  // Event handler to handle image selection
  const handleImageChange = (event) => {
    const selectedImages = Array.from(event.target.files);
    const selectedImageUrls = selectedImages.map((image) =>
      URL.createObjectURL(image)
    );
    setFormData({
      ...formData,
      image: [...formData.image, ...selectedImages],
      previewImages: [...formData.previewImages, ...selectedImageUrls],
    });
  };

  // Event handler to remove images based on checked checkboxes
  const handleRemoveCheckedImages = () => {
    const updatedImages = [...formData.image];
    const updatedPreviewImages = [...formData.previewImages];

    // Iterate over isChecked array in reverse order
    for (let i = isChecked.length - 1; i >= 0; i--) {
      if (isChecked[i]) {
        // Remove image and preview image at index if checked is true
        updatedImages.splice(i, 1);
        updatedPreviewImages.splice(i, 1);
      }
    }

    // Update the form data with the updated images
    setFormData({
      ...formData,
      image: updatedImages,
      previewImages: updatedPreviewImages,
    });

    // Reset isChecked array
    setIsChecked(Array(formData.previewImages.length).fill(false));
  };

  // Event handler to toggle the 'active' state
  const handleToggleChange = () => {
    setFormData({
      ...formData,
      active: !formData.active, // Toggle the value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const imageArr = [];
    formData.numberOfBalls = parseInt(formData.numberOfBalls);

    // Loops through the image files added and adds them to firebase storage
    for (let i = 0; i < formData.image.length; i++) {
      const imageRef = storageRef(
        storage,
        `/${formData.prize}/${formData.image[i].name}`
      );
      imageArr.push(formData.image[i].name);

      try {
        await uploadBytes(imageRef, formData.image[i]);
        console.log("Image uploaded successfully:", formData.image[i].name);
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }

    console.log("hoOPS", imageArr);
    // Sets all of the the prize data to a firebase collection
    try {
      const raffleDataCollection = collection(FIREBASE_DB, "raffleData");
      await addDoc(raffleDataCollection, {
        prize: formData.prize,
        prizeDescription: formData.prizeDescription,
        image: imageArr, // Initialize with an empty array
        pricePerTicket: formData.pricePerTicket,
        numberOfBalls: formData.numberOfBalls,
        ballSelectionNumber: formData.ballSelectionNumber,
        active: formData.active,
      });
    } catch (error) {
      console.error("Error adding document to raffleData collection:", error);
    }

    // ============================= SET INITAL STATE FOR CHOICES ====================================
    // This is my pride and joy. It builds out the object that holds the available options per ball based on the number of balls available and the
    // the number of balls you can choose, which for the forseeable future will be 3. additional logic will need to be added in the same way
    // if we would like to allow more
    let updatedDs = {};
    updatedDs[formData.prize] = Array.from(
      { length: formData.ballSelectionNumber },
      (_, index) => {
        // the first conditional will set the first state block which will be an object of all of the balls
        //    that will be availe and the number of times that they can be used the key being the ball number
        //    and the value being the "numberOfBall" multipled but each number decending to 2 and
        //    divided by "numberOfBalls" because thats how many times that it can possibly be used
        if (index === 0) {
          //=========================== FIRST NUMBER ====================================
          //calculates the number of times the first number of the combination can be used
          function handleNumberOfBalls() {
            let total = 1;
            for (let i = 1; i < formData.ballSelectionNumber; i++) {
              total =
                Math.pow(formData.numberOfBalls, formData.ballSelectionNumber) /
                formData.numberOfBalls;
            }
            return total;
          }
          const mainGroup = {};
          const mainGroupNum = handleNumberOfBalls();

          //setting the key pairs for each possible first number and the number of times that it can be used
          for (let i = 1; i < formData.numberOfBalls + 1; i++) {
            // console.log("COUNT", i);
            mainGroup[i] = mainGroupNum;
          }
          return mainGroup;
          // second number of the combination of numbers
        } else if (index === 1) {
          // ============================== SECOND NUMBER =======================================
          const subGroup1 = [];
          const subGroupOneNum = handleSubNumber1();
          // Calculates the number of times that the second number can be used according to which number is first.
          function handleSubNumber1() {
            let total1 = 1;
            let prevTotal1 = 1;
            for (let i = 1; i < formData.numberOfBalls - 1; i++) {
              total1 = total1 * i;
            }
            for (let i = 1; i < formData.numberOfBalls; i++) {
              prevTotal1 =
                Math.pow(formData.numberOfBalls, formData.ballSelectionNumber) /
                formData.numberOfBalls /
                formData.numberOfBalls;
            }
            return prevTotal1;
          }
          // loops through all of the balls and creates an object for each ball inside each object
          // there is the key of the number and the value of the number of times that it can be used
          for (let i = 1; i < formData.numberOfBalls + 1; i++) {
            const subGroup1__ = {};
            for (let j = 1; j < formData.numberOfBalls + 1; j++) {
              subGroup1__[j] = subGroupOneNum;
            }
            subGroup1.push(subGroup1__);
          }
          return subGroup1;
        } else if (index === 2) {
          // ============================== THIRD NUMBER ==============================================
          const subGroup2 = [];
          const subGroupTwoNum = handleSubNumber2();
          // Calculates how many available options each number has
          function handleSubNumber2() {
            let total = 1;
            let prevTotal = 1;
            for (let i = 1; i < formData.numberOfBalls - 1; i++) {
              total = total * i;
            }
            for (let i = 1; i < formData.numberOfBalls - 1; i++) {
              prevTotal = prevTotal * i;
            }
            return index + 1 === formData.ballSelectionNumber
              ? 1
              : prevTotal / total - 1;
          }
          for (let i = 1; i < formData.numberOfBalls + 1; i++) {
            const subsub = [];
            for (let j = 1; j < formData.numberOfBalls + 2; j++) {
              const subGroup2__ = {};
              if (j !== i) {
                for (let k = 1; k < formData.numberOfBalls + 1; k++) {
                  subGroup2__[k] = subGroupTwoNum;
                }
              }
              subsub.push(subGroup2__);
            }
            subGroup2.push(subsub.filter((obj) => Object.keys(obj).length > 0));
          }
          return subGroup2;
        }
      }
    );

    // gets data from the realtime database
    try {
      // Data doesn't exist or your logic allows overwriting, proceed with the write
      set(raffleModRef, updatedDs[formData.prize]);
      set(totalPotentialOptions, {
        original: Math.pow(
          formData.numberOfBalls,
          formData.ballSelectionNumber
        ),
        current: Math.pow(formData.numberOfBalls, formData.ballSelectionNumber),
      });
      return;
    } catch (error) {
      console.error(
        "Error interacting with Firebase Realtime Database:",
        error
      );
    }
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    // Prepare the array to store image URLs
    const imageArr = [];

    // Upload new images to storage and populate imageArr
    for (let i = 0; i < formData.image.length; i++) {
      const imageRef = storageRef(
        storage,
        `/${formData.prize}/${formData.image[i].name}`
      );
      imageArr.push(formData.image[i].name); // Push image name to imageArr

      try {
        await uploadBytes(imageRef, formData.image[i]);
        console.log("Image uploaded successfully:", formData.image[i].name);
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }

    // Update Firestore document
    try {
      // Create a reference to the document to be updated
      const raffleDataCollection = collection(FIREBASE_DB, "raffleData");
      const docRef = doc(raffleDataCollection, defaultFormData.id);
      console.log("OPPPLOOOP", imageArr);
      // Update the fields of the existing document
      await updateDoc(docRef, {
        prize: formData.prize,
        prizeDescription: formData.prizeDescription,
        image: [...imageArr, ...formData.image], // Combines newly added images and images from the database
        pricePerTicket: formData.pricePerTicket,
        numberOfBalls: formData.numberOfBalls,
        ballSelectionNumber: formData.ballSelectionNumber,
        active: formData.active,
      });

      console.log("Document updated successfully.");
    } catch (error) {
      console.error("Error updating document:", error);
    }

    // Reset form data if needed
    setFormData({
      prize: "",
      prizeDescription: "",
      richText: "",
      image: [], // Initialize with an empty array
      previewImages: [], // Array to store preview URLs
      pricePerTicket: "",
      numberOfBalls: 0,
      ballSelectionNumber: 3,
      active: false,
    });
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

  // Function to fetch an image from Firebase Storage by its name
  const fetchImageByName = async (imageName) => {
    try {
      console.log("HITTS USEEFFECT", prize);

      // Construct the reference to the image using its name and path
      const imageRef = storageRef(storage, `${prize}/${imageName}`); // Replace 'path/to/directory' with the actual path where your images are stored
      // Fetch the download URL for the image
      const downloadUrl = await getDownloadURL(imageRef);
      return downloadUrl; // Return the download URL of the image
    } catch (error) {
      console.error("Error fetching image from Firebase Storage:", error);
      return null; // Return null if there's an error
    }
  };

  const dragItem = React.useRef(null);
  const dragOverItem = React.useRef(null);

  // allows to click and drag and order the images as desired
  const handleSort = () => {
    // Create a copy of the previewImages array
    let _previewImages = [...formData.previewImages];

    // Save and remove the dragged item content
    const draggedItemContent = _previewImages.splice(dragItem.current, 1)[0];

    // Switch the position
    _previewImages.splice(dragOverItem.current, 0, draggedItemContent);

    // Reset variables
    dragItem.current = null;
    dragOverItem.current = null;

    // Update the previewImages array in the formData state
    setFormData({
      ...formData,
      previewImages: _previewImages,
    });
  };

  return (
    <>
      <form onSubmit={isNewPrize === true ? handleSubmit : handleUpdate}>
        <div className="prizeIdentification">
          <div style={{ flexDirection: "row" }}>
            <label htmlFor="prize" style={{ fontWeight: "bold" }}>
              Title
            </label>
            <br />
            <input
              style={{
                width: "95%",
                marginTop: 5,
                marginBottom: 5,
                padding: 10,
              }}
              type="text"
              id="prize"
              name="prize"
              value={formData.prize}
              onChange={handleInputChange}
              required
            />
          </div>
          <label htmlFor="prizeDescription" style={{ fontWeight: "bold" }}>
            Prize Description
          </label>
          <br />
          <div style={{ marginTop: 5 }}>
            <RichTextEditor
              onChange={handleRichTextChange}
              value={formData.prizeDescription}
            />
          </div>
        </div>
        <div className="prizeIdentification" style={{ marginTop: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <label htmlFor="prizeDescription" style={{ fontWeight: "bold" }}>
              Media
            </label>
            {isChecked.includes(true) && (
              <div
                type="button"
                style={{ cursor: "pointer" }}
                onClick={() => handleRemoveCheckedImages()}
              >
                {isChecked.filter((item) => item === true).length > 1 ? (
                  <text style={{ color: "red" }}>Delete Files</text>
                ) : (
                  <text style={{ color: "red" }}>Delete File</text>
                )}
              </div>
            )}
          </div>
          <div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
              }}
            >
              {formData.previewImages.map((imageUrl, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: "10px",
                    position: "relative", // Set position to relative for proper positioning of checkbox
                  }}
                  draggable
                  onDragStart={(e) => (dragItem.current = index)}
                  onDragEnter={(e) => (dragOverItem.current = index)}
                  onDragEnd={handleSort}
                >
                  <img
                    src={imageUrl}
                    alt={`Product preview ${index}`}
                    style={{
                      width: index === 0 ? "200px" : "100px",
                      height: index === 0 ? "200px" : "100px",
                      marginRight: "10px",
                      borderRadius: "8px",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: "5px",
                      left: "5px",
                    }}
                  >
                    <input
                      type="checkbox"
                      id={`checkbox-${index}`} // Unique identifier based on index
                      checked={isChecked[index]} // Bind isChecked state using index
                      onChange={() => handleCheckboxChange(index)} // Pass index to handleCheckboxChange function
                    />
                  </div>
                </div>
              ))}
              <div
                style={{
                  width: "100px",
                  height: "100px",
                  marginRight: "10px",
                  borderStyle: "dotted",
                  borderWidth: "1px",
                  borderRadius: "8px",
                }}
              >
                {/* <input
                  type="file"
                  id="productImage"
                  name="productImage"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                /> */}
                <label htmlFor="productImage" className="custom-file-upload">
                  Add
                </label>
                <input
                  type="file"
                  id="productImage"
                  name="productImage"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="prizeIdentification" style={{ marginTop: 10 }}>
          <div>
            <label htmlFor="pricePerTicket">Price per Ticket:</label>
            <input
              type="text"
              id="pricePerTicket"
              name="pricePerTicket"
              value={formData.pricePerTicket}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor="numberOfBalls">Number of Balls:</label>
            <input
              disabled={prize !== "" ? true : false}
              type="number"
              id="numberOfBalls"
              name="numberOfBalls"
              value={formData.numberOfBalls}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor="ballSelectionNumber">Ball Selection Number:</label>
            <input
              disabled // this will remain diabled until we add logic to accept more
              type="number"
              id="ballSelectionNumber"
              name="ballSelectionNumber"
              value={formData.ballSelectionNumber}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor="active">Active:</label>
            <input
              type="checkbox"
              id="active"
              name="active"
              checked={formData.active}
              onChange={handleToggleChange}
            />
          </div>
        </div>
        <div
          style={{
            width: "60%",
            margin: "auto",
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-end",
            marginTop: "15px",
          }}
        >
          {prize === "" ? (
            <button type="submit">Submit</button>
          ) : (
            <button type="submit">Update</button>
          )}
        </div>
      </form>
    </>
  );
};

export default MyForm;
