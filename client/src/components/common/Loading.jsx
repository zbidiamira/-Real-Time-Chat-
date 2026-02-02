/**
 * Loading Component
 * Full-page loading spinner
 */

import './Loading.css';

/**
 * Loading component
 * @param {Object} props - Component props
 * @param {string} props.message - Loading message
 * @param {boolean} props.fullScreen - Full screen loading
 */
const Loading = ({ message = 'Loading...', fullScreen = true }) => {
  return (
    <div className={`loading ${fullScreen ? 'loading-fullscreen' : ''}`}>
      <div className="loading-content">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        {message && <p className="loading-message">{message}</p>}
      </div>
    </div>
  );
};

export default Loading;
