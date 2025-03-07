// components/Home.js
import React from "react";
import { Form } from "react-router-dom";
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <div className="video-section">
        <div className="video-wrapper">
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/YOUR_VIDEO_ID" // Replace with your YouTube video ID
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default Home;
