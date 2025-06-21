import { useNavigate } from "react-router-dom";
import "../../style/Error.css";

function Error() {
  const navigate = useNavigate();

  return (
    <div className="error-container">
      <div className="error-content">
        <div className="error-icon">
          <span className="error-number">404</span>
        </div>

        <h1 className="error-title">Oops! Something went wrong</h1>

        <p className="error-message">
          The page you're looking for doesn't exist or an unexpected error
          occurred.
        </p>

        <div className="error-actions">
          <button onClick={() => navigate(-1)} className="back-btn">
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default Error;
