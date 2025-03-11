import React, { useState, useRef, useEffect } from 'react';
import { FaVideo, FaVideoSlash, FaMicrophone, FaMicrophoneSlash, 
  FaDesktop, FaCog, FaChartLine, FaUsers, FaCircle, FaYoutube, FaRecordVinyl } from 'react-icons/fa';
import { ref, set, onValue } from 'firebase/database';
import { db } from '../firebase/firebase-config';
import './StreamingDashboard.css';

const StreamingDashboard = () => {
  const [streamData, setStreamData] = useState({
    title: '',
    category: '',
    tags: [],
    isLive: false,
    viewers: 0,
    startTime: null
  });

  const [devices, setDevices] = useState({
    camera: false,
    microphone: false,
    screen: false
  });

  const [streamHealth, setStreamHealth] = useState({
    status: 'Excellent',
    bitrate: '2500 Kbps',
    fps: '30',
    resolution: '1080p'
  });

  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeVideoId, setYoutubeVideoId] = useState('');
  const [isUpdatingUrl, setIsUpdatingUrl] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [showRecordingModal, setShowRecordingModal] = useState(false);
  const [recordingName, setRecordingName] = useState('');

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordingRef = useRef(null);
  const recordedChunksRef = useRef([]);

  useEffect(() => {
    // Cleanup function
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (recordingRef.current && recordingRef.current.state === 'recording') {
        recordingRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    // Fetch current YouTube URL from Firebase
    const youtubeRef = ref(db, 'settings/youtubeVideo');
    onValue(youtubeRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setYoutubeUrl(data.url);
        setYoutubeVideoId(data.videoId);
      }
    });
  }, []);

  const startStream = async () => {
    if (!streamData.title.trim()) {
      alert('Please enter a stream title');
      return;
    }

    try {
      // Update stream status in Firebase
      await set(ref(db, 'streams/live'), {
        title: streamData.title,
        category: streamData.category,
        isLive: true,
        startTime: new Date().toISOString(),
        viewers: 0
      });

      // Start recording and streaming
      if (streamRef.current) {
        mediaRecorderRef.current = new MediaRecorder(streamRef.current);
        mediaRecorderRef.current.ondataavailable = handleDataAvailable;
        mediaRecorderRef.current.start(1000); // Collect data every second
      }

      setStreamData(prev => ({ 
        ...prev, 
        isLive: true,
        startTime: new Date(),
        viewers: 0
      }));

    } catch (err) {
      console.error('Error starting stream:', err);
      alert('Failed to start stream');
    }
  };

  const stopStream = async () => {
    try {
      // Stop recording if it's active
      if (isRecording) {
        if (recordingRef.current && recordingRef.current.state === 'recording') {
          recordingRef.current.stop();
          setShowRecordingModal(true);
        }
        setIsRecording(false);
      }

      // Stop media recorder
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }

      // Update Firebase
      await set(ref(db, 'streams/live'), {
        isLive: false,
        endTime: new Date().toISOString()
      });

      setStreamData(prev => ({ 
        ...prev, 
        isLive: false,
        startTime: null
      }));

    } catch (err) {
      console.error('Error stopping stream:', err);
      alert('Failed to stop stream');
    }
  };

  const handleDataAvailable = (event) => {
    if (event.data && event.data.size > 0) {
      // Here you would send the stream data to your streaming server
      // This is where you'd integrate with a streaming service
      console.log('Stream data available:', event.data);
    }
  };

  const toggleDevice = async (device) => {
    try {
      if (device === 'camera') {
        const constraints = {
          video: {
            width: 1280,
            height: 720,
            facingMode: 'user'
          }
        };

        if (!devices.camera) {
          // Get new video stream
          const videoStream = await navigator.mediaDevices.getUserMedia(constraints);
          
          if (!streamRef.current) {
            streamRef.current = new MediaStream();
          }

          // Remove any existing video tracks
          streamRef.current.getVideoTracks().forEach(track => {
            track.stop();
            streamRef.current.removeTrack(track);
          });

          // Add new video track
          videoStream.getVideoTracks().forEach(track => {
            streamRef.current.addTrack(track);
          });

          // Update video preview
          if (videoRef.current) {
            videoRef.current.srcObject = streamRef.current;
            await videoRef.current.play().catch(console.error);
          }
        } else {
          // Stop only video tracks
          streamRef.current?.getVideoTracks().forEach(track => {
            track.stop();
            streamRef.current.removeTrack(track);
          });
        }

        setDevices(prev => ({ ...prev, camera: !prev.camera }));

      } else if (device === 'microphone') {
        const constraints = { audio: true };

        if (!devices.microphone) {
          // Get new audio stream
          const audioStream = await navigator.mediaDevices.getUserMedia(constraints);
          
          if (!streamRef.current) {
            streamRef.current = new MediaStream();
          }

          // Remove any existing audio tracks
          streamRef.current.getAudioTracks().forEach(track => {
            track.stop();
            streamRef.current.removeTrack(track);
          });

          // Add new audio track
          audioStream.getAudioTracks().forEach(track => {
            streamRef.current.addTrack(track);
          });
        } else {
          // Stop only audio tracks
          streamRef.current?.getAudioTracks().forEach(track => {
            track.stop();
            streamRef.current.removeTrack(track);
          });
        }

        setDevices(prev => ({ ...prev, microphone: !prev.microphone }));

      } else if (device === 'screen') {
        if (!devices.screen) {
          // Stop any existing video tracks
          streamRef.current?.getVideoTracks().forEach(track => {
            track.stop();
            streamRef.current.removeTrack(track);
          });

          const screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: {
              cursor: "always"
            },
            audio: true
          });

          if (!streamRef.current) {
            streamRef.current = new MediaStream();
          }

          // Add screen tracks
          screenStream.getTracks().forEach(track => {
            streamRef.current.addTrack(track);
          });

          if (videoRef.current) {
            videoRef.current.srcObject = streamRef.current;
            await videoRef.current.play().catch(console.error);
          }

          setDevices(prev => ({ ...prev, screen: true, camera: false }));
        } else {
          // Stop screen share tracks
          streamRef.current?.getVideoTracks().forEach(track => {
            track.stop();
            streamRef.current.removeTrack(track);
          });

          setDevices(prev => ({ ...prev, screen: false }));
        }
      }

      // Update video preview if needed
      if (videoRef.current) {
        if (streamRef.current && (streamRef.current.getVideoTracks().length > 0 || streamRef.current.getAudioTracks().length > 0)) {
          videoRef.current.srcObject = streamRef.current;
        } else {
          videoRef.current.srcObject = null;
        }
      }

    } catch (err) {
      console.error(`Error toggling ${device}:`, err);
      alert(`Failed to access ${device}. Please check your permissions.`);
    }
  };

  const updateYoutubeUrl = async () => {
    if (!youtubeUrl.trim()) {
      alert('Please enter a YouTube URL');
      return;
    }

    try {
      setIsUpdatingUrl(true);
      const videoId = extractYoutubeVideoId(youtubeUrl);
      if (!videoId) {
        alert('Please enter a valid YouTube URL');
        return;
      }

      await set(ref(db, 'settings/youtubeVideo'), {
        url: youtubeUrl,
        videoId: videoId,
        updatedAt: new Date().toISOString()
      });

      setYoutubeVideoId(videoId);
      alert('YouTube URL updated successfully!');
    } catch (error) {
      console.error('Error updating YouTube URL:', error);
      alert('Failed to update YouTube URL');
    } finally {
      setIsUpdatingUrl(false);
    }
  };

  const extractYoutubeVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const renderYoutubeSection = () => (
    <div className="info-card youtube-section">
      <h3>
        <FaYoutube className="youtube-icon" />
        Homepage YouTube Video
      </h3>
      <div className="youtube-content-grid">
        <div className="youtube-input-container">
          <input
            type="text"
            placeholder="Enter YouTube video URL"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            className="stream-input"
          />
          <button 
            className="update-youtube-button"
            onClick={updateYoutubeUrl}
            disabled={isUpdatingUrl || !youtubeUrl.trim()}
          >
            {isUpdatingUrl ? 'Updating...' : 'Update Video'}
          </button>
          <p className="youtube-help">
            Paste the URL of the YouTube video you want to display on the homepage
          </p>
        </div>
        {youtubeVideoId && (
          <div className="youtube-preview">
            <img 
              src={`https://img.youtube.com/vi/${youtubeVideoId}/maxresdefault.jpg`}
              alt="Video thumbnail"
              className="youtube-thumbnail"
            />
            <div className="youtube-preview-overlay">
              <FaYoutube className="youtube-play-icon" />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const startRecording = () => {
    if (!streamRef.current) return;

    recordedChunksRef.current = [];
    recordingRef.current = new MediaRecorder(streamRef.current);
    
    recordingRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    recordingRef.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (recordingRef.current && recordingRef.current.state === 'recording') {
      recordingRef.current.stop();
      setShowRecordingModal(true);
    }
  };

  const handleKeepRecording = () => {
    setShowRecordingModal(false);
    startRecording(); // Start a new recording immediately
  };

  const handleSaveRecording = () => {
    if (!recordingName.trim()) {
      alert('Please enter a name for the recording');
      return;
    }

    const blob = new Blob(recordedChunksRef.current, {
      type: 'video/webm'
    });

    // Create a download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${recordingName.trim()}.webm`;
    a.click();

    // Clean up
    URL.revokeObjectURL(url);
    setShowRecordingModal(false);
    setRecordingName('');
    recordedChunksRef.current = [];
  };

  const handleCancelRecording = () => {
    setShowRecordingModal(false);
    setRecordingName('');
    recordedChunksRef.current = [];
    setIsRecording(false);
  };

  return (
    <div className="streaming-dashboard">
      <div className="dashboard-grid">
        <div className="preview-section">
          <div className="preview-header">
            <h2>Stream Preview</h2>
            <div className={`stream-status ${streamData.isLive ? 'live' : 'offline'}`}>
              {streamData.isLive ? 'LIVE' : 'OFFLINE'}
            </div>
          </div>
          
          <div className="preview-container">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {!devices.camera && !devices.screen && (
              <div className="no-video-overlay">
                <p>No video source</p>
              </div>
            )}
          </div>

          <div className="stream-controls">
            <div className="device-controls">
              <button 
                className={`control-button ${devices.camera ? 'active' : ''}`}
                onClick={() => toggleDevice('camera')}
              >
                {devices.camera ? <FaVideo /> : <FaVideoSlash />}
                <span>Camera</span>
              </button>
              
              <button 
                className={`control-button ${devices.microphone ? 'active' : ''}`}
                onClick={() => toggleDevice('microphone')}
              >
                {devices.microphone ? <FaMicrophone /> : <FaMicrophoneSlash />}
                <span>Mic</span>
              </button>
              
              <button 
                className={`control-button ${devices.screen ? 'active' : ''}`}
                onClick={() => toggleDevice('screen')}
              >
                <FaDesktop />
                <span>Screen</span>
              </button>
              <button 
                className={`control-button ${isRecording ? 'recording' : ''}`}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={!streamData.isLive}
              >
                <FaRecordVinyl />
                <span>{isRecording ? 'Stop Recording' : 'Record'}</span>
              </button>
            </div>

            <button 
              className={`stream-button ${streamData.isLive ? 'live' : ''}`}
              onClick={streamData.isLive ? stopStream : startStream}
              disabled={!devices.camera && !devices.screen}
            >
              <span>{streamData.isLive ? 'End Stream' : 'Start Stream'}</span>
            </button>
          </div>
        </div>

        <div className="stream-info-section">
          <div className="info-card">
            <h3>Stream Information</h3>
            <input
              type="text"
              placeholder="Stream Title"
              value={streamData.title}
              onChange={(e) => setStreamData(prev => ({ ...prev, title: e.target.value }))}
              className="stream-input"
              disabled={streamData.isLive}
            />
            <input
              type="text"
              placeholder="Category"
              value={streamData.category}
              onChange={(e) => setStreamData(prev => ({ ...prev, category: e.target.value }))}
              className="stream-input"
              disabled={streamData.isLive}
            />
            <input
              type="text"
              placeholder="Tags (comma separated)"
              value={streamData.tags.join(', ')}
              onChange={(e) => setStreamData(prev => ({ 
                ...prev, 
                tags: e.target.value.split(',').map(tag => tag.trim())
              }))}
              className="stream-input"
            />
          </div>

          <div className="info-card">
            <h3>Stream Health</h3>
            <div className={`health-indicator ${streamHealth.status.toLowerCase()}`}>
              {streamHealth.status}
            </div>
            <div className="health-stats">
              <div className="stat-item">
                <span>Bitrate</span>
                <span>{streamHealth.bitrate}</span>
              </div>
              <div className="stat-item">
                <span>FPS</span>
                <span>{streamHealth.fps}</span>
              </div>
              <div className="stat-item">
                <span>Resolution</span>
                <span>{streamHealth.resolution}</span>
              </div>
            </div>
          </div>

          {streamData.isLive && (
            <div className="info-card">
              <h3>Stream Stats</h3>
              <div className="stream-stats">
                <div className="stat-item">
                  <FaUsers />
                  <span>{streamData.viewers} viewers</span>
                </div>
                <div className="stat-item">
                  <FaChartLine />
                  <span>Duration: {formatDuration(streamData.startTime)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="youtube-section-container">
        {renderYoutubeSection()}
      </div>

      {showRecordingModal && (
        <div className="modal-overlay">
          <div className="recording-modal">
            <h3>Save Recording</h3>
            <input
              type="text"
              placeholder="Enter recording name"
              value={recordingName}
              onChange={(e) => setRecordingName(e.target.value)}
              className="recording-name-input"
            />
            <div className="modal-buttons">
              <button 
                className="modal-button keep"
                onClick={handleKeepRecording}
              >
                Keep Recording
              </button>
              <button 
                className="modal-button save"
                onClick={handleSaveRecording}
                disabled={!recordingName.trim()}
              >
                Save Recording
              </button>
              <button 
                className="modal-button cancel"
                onClick={handleCancelRecording}
              >
                Cancel Recording
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const formatDuration = (startTime) => {
  if (!startTime) return '00:00:00';
  const diff = new Date() - new Date(startTime);
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export default StreamingDashboard; 