import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase/firebase-config";

const uploadImage = (file) => {
  return new Promise((resolve, reject) => {
    // Generate a unique filename (you can modify this logic as needed)
    const filename = `${file.name}_${Date.now()}`;

    // Create a reference to the storage location
    const storageRef = ref(storage, `images/${filename}`);

    // Upload the file to the storage location
    uploadBytes(storageRef, file)
      .then((snapshot) => {
        // Get the download URL of the uploaded file
        getDownloadURL(snapshot.ref)
          .then((downloadURL) => {
            resolve(downloadURL); // Resolve with the download URL
          })
          .catch((error) => {
            reject(error); // Reject if unable to get download URL
          });
      })
      .catch((error) => {
        reject(error); // Reject if upload fails
      });
  });
};

export default uploadImage;
