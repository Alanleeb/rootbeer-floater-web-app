import React, { useState } from 'react';
import AllPrizes from './AllPrizes';
import StreamingDashboard from './StreamingDashboard';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('prizes');

  return (
    <div className="admin-dashboard">
      <div className="admin-tabs">
        <button 
          className={`tab-button ${activeTab === 'prizes' ? 'active' : ''}`}
          onClick={() => setActiveTab('prizes')}
        >
          Prizes
        </button>
        <button 
          className={`tab-button ${activeTab === 'streaming' ? 'active' : ''}`}
          onClick={() => setActiveTab('streaming')}
        >
          Streaming
        </button>
      </div>
      
      <div className="tab-content">
        {activeTab === 'prizes' && <AllPrizes />}
        {activeTab === 'streaming' && <StreamingDashboard />}
      </div>
    </div>
  );
};

export default AdminDashboard; 