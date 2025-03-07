import React, { useState } from 'react';
import AllPrizes from './AllPrizes';
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
        {activeTab === 'streaming' && (
          <div className="streaming-tab">
            <h2>Streaming Controls</h2>
            <p>Streaming features coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 