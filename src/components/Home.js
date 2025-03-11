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
    const unsubscribeYoutube = onValue(youtubeRef, (snapshot) => {
      const data = snapshot.val();
      console.log('YouTube data:', data);
      if (data && data.videoId) {
        setYoutubeVideoId(data.videoId);
      }
    });

    return () => {
      unsubscribeYoutube();
    };
  }, []);

  return (
    <div className="home-container">
      <div className="video-section">
        <div className="video-wrapper">
          {youtubeVideoId ? (
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="no-video-overlay">
              <p>No video available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
