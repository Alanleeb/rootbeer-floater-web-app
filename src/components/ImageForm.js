import { useState, useEffect } from "react";
import { v4 } from "uuid";
import { ref, uploadBytes, getDownloadURL, listAll } from "firebase/storage";
import { storage } from "../firebase/firebase-config";

function ImageForm() {
  const [imageUpload, setImageUpload] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);

  const imagesListRef = ref(storage, "images/");

  const uploadFile = () => {
    if (imageUpload == null) return;
    const imageRef = ref(storage, `images/${imageUpload.name + v4()}`);
    const proxyUrl =
      "http://localhost:3000/firebase-storage?url=" +
      encodeURIComponent(imageRef.toString());
    uploadBytes(proxyUrl, imageUpload).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((url) => {
        setImageUrls((prev) => [...prev, url]);
      });
    });
  };

  useEffect(() => {
    listAll(imagesListRef).then((response) => {
      response.items.forEach((item) => {
        // Use the proxy URL here
        const proxyUrl =
          "http://localhost:3000/firebase-storage?url=" +
          encodeURIComponent(item.toString());
        getDownloadURL(proxyUrl).then((url) => {
          setImageUrls((prev) => [...prev, url]);
        });
      });
    });
  }, [imagesListRef]);

  return (
    <div
      className="ImageForm"
      style={{
        display: "flex",
        flexDirection: "row",
        borderWidth: "2px",
        borderStyle: "solid",
        borderBlock: "red",
        backgroundColor: "red",
      }}
    >
      <input
        type="file"
        onChange={(event) => {
          setImageUpload(event.target.files[0]);
        }}
      />
      <button onClick={uploadFile}> Upload Image</button>
      {imageUrls.map((url, index) => {
        return <img alt={index} src={url} />;
      })}
    </div>
  );
}

export default ImageForm;
