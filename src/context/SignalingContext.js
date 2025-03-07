import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SignalingContext = createContext();

// Create socket with reconnection options
const socket = io('http://localhost:5001', {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

export const SignalingProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
      setConnectionError(null);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      setConnectionError('Failed to connect to server');
      console.error('Connection error:', error);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
    };
  }, []);

  const sendSignal = (type, targetId, data) => {
    if (isConnected) {
      socket.emit(type, targetId, data);
    }
  };

  return (
    <SignalingContext.Provider value={{ 
      socket, 
      isConnected, 
      connectionError,
      sendSignal 
    }}>
      {children}
    </SignalingContext.Provider>
  );
};

export const useSignaling = () => useContext(SignalingContext); 