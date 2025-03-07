import React, { createContext, useState, useContext } from 'react';

const StreamContext = createContext();

export const StreamProvider = ({ children }) => {
  const [streamData, setStreamData] = useState({
    isLive: false,
    streamUrl: '',
    streamTitle: '',
    viewerCount: 0,
    mediaStream: null,
    youtubeUrl: '',
    youtubeThumbnail: '',
    youtubeVideoId: ''
  });

  return (
    <StreamContext.Provider value={{ streamData, setStreamData }}>
      {children}
    </StreamContext.Provider>
  );
};

export const useStream = () => useContext(StreamContext); 