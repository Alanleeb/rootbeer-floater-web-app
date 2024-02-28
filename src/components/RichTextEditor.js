import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import Quill's CSS for styling

const RichTextEditor = ({ onChange, value }) => {
  //   const [value, setValue] = useState("");

  const handleChange = (content) => {
    onChange(content);
    // setValue(content);
  };

  return (
    <div>
      <ReactQuill
        theme="snow" // Specify the theme ('snow' for a light theme)
        value={value}
        onChange={handleChange}
      />
    </div>
  );
};

export default RichTextEditor;
