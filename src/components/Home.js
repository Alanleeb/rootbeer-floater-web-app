// components/Home.js
import React, { useState, useEffect } from "react";
import { onValue, ref } from 'firebase/database';
import { db } from '../firebase/firebase-config';
import './Home.css';

const Home = () => {
  const [youtubeVideoId, setYoutubeVideoId] = useState('');

  useEffect(() => {
    // Fetch YouTube video ID from Firebase
    const youtubeRef = ref(db, 'settings/youtubeVideo');
    onValue(youtubeRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.videoId) {
        setYoutubeVideoId(data.videoId);
      }
    });
  }, []);

  return (
    <div className="home-container">
      {youtubeVideoId && (
        <div className="video-section">
          <div className="video-wrapper">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${youtubeVideoId}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
      {/* ... rest of your home content ... */}
    </div>
  );
};

export default Home;
