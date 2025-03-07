import React from 'react';

const Suggestions = () => {
  return (
    <div className="suggestions-container">
      <h1>Suggestions</h1>
      <div className="suggestions-content">
        <p>
          We value your input! Help us improve Raffle Ball by sharing your ideas 
          and suggestions.
        </p>
        <div className="suggestion-form">
          <h2>Submit Your Suggestion</h2>
          <form>
            <div className="form-group">
              <label htmlFor="suggestion">Your Suggestion:</label>
              <textarea 
                id="suggestion"
                placeholder="Share your ideas here..."
                rows="4"
              />
            </div>
            <button type="submit" className="submit-button">
              Submit Suggestion
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Suggestions; 