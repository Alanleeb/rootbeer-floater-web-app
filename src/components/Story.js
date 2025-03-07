import React from 'react';

const Story = () => {
  return (
    <div className="story-container">
      <h1>Current Story</h1>
      <div className="story-content">
        <h2>Latest Updates</h2>
        <p>
          Follow along with our latest raffle events and winner stories. Every week 
          brings new opportunities and exciting moments!
        </p>
        <div className="story-highlights">
          <h3>Recent Winners</h3>
          <ul>
            <li>Grand Prize Winner - John D.</li>
            <li>Weekly Special - Sarah M.</li>
            <li>Monthly Draw - Michael R.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Story; 