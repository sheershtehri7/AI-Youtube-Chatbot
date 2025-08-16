import React, { createContext, useContext, useState } from 'react';

const VideoContext = createContext();

export const useVideo = () => {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error('useVideo must be used within a VideoProvider');
  }
  return context;
};

export const VideoProvider = ({ children }) => {
  const [videoData, setVideoData] = useState({
    id: null,
    url: '',
    title: '',
    thumbnail: '',
    duration: '',
    isProcessed: false,
    isProcessing: false,
    error: null
  });

  const setVideo = (data) => {
    setVideoData(prev => ({ ...prev, ...data }));
  };

  const clearVideo = () => {
    setVideoData({
      id: null,
      url: '',
      title: '',
      thumbnail: '',
      duration: '',
      isProcessed: false,
      isProcessing: false,
      error: null
    });
  };

  const value = {
    videoData,
    setVideo,
    clearVideo
  };

  return (
    <VideoContext.Provider value={value}>
      {children}
    </VideoContext.Provider>
  );
};
