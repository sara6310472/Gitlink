import "../../style/Recruiter.css";
import { useNavigate } from "react-router-dom";
import { FiUser, FiFolder, FiMail, FiPhone, FiBriefcase, FiFileText } from 'react-icons/fi';

function Recruiter({ recruiterData }) {
  const navigate = useNavigate();

  const getImageUrl = () => {
    if (!recruiterData?.profile_image) return;
    if (recruiterData.profile_image.startsWith('https://github.com/')) {
      return recruiterData.profile_image;
    }
    return `http://localhost:3001/uploads/${recruiterData.profile_image}`;
  };
  
  return (
    <div className="recruiter-card">
      <div className="recruiter-header">
        <div className="avatar">
          <img
            src={getImageUrl()}
            alt={`${recruiterData.username} avatar`}
            className="avatar-img"
          />
          <div
            className="status-indicator"
            style={{ backgroundColor: "#10b981" }}
          ></div>
        </div>

        <div className="recruiter-info">
          <h3 className="recruiter-name">{recruiterData.username}</h3>
          <div className="role-info">
            <span className="role-badge">{recruiterData.role}</span>
          </div>
        </div>
      </div>

      <div className="details-section">
        {recruiterData.company_name && (
          <div className="recruiter-detail-item">
            <FiBriefcase className="detail-icon" />
            <span className="detail-label">Company:</span>
            <span className="detail-value">{recruiterData.company_name}</span>
          </div>
        )}

        {recruiterData.email && (
          <div className="recruiter-detail-item">
            <FiMail className="detail-icon" />
            <span className="detail-label">Email:</span>
            <span className="detail-value">{recruiterData.email}</span>
          </div>
        )}

        {recruiterData.phone && (
          <div className="recruiter-detail-item">
            <FiPhone className="detail-icon" />
            <span className="detail-label">Phone:</span>
            <span className="detail-value">{recruiterData.phone}</span>
          </div>
        )}
      </div>

      <div className="recruiter-actions">
        <button
          className="btn-profile"
          onClick={() => navigate(`/${recruiterData.username}/profile`)}
        >
          <FiUser className="btn-icon" />
          View Profile
        </button>

        <button
          className="btn-jobs"
          onClick={() => navigate(`/${recruiterData.username}/jobs`)}
        >
          <FiFolder className="btn-icon" />
          View Jobs
        </button>

        {recruiterData.cv_file && (
          <button
            className="btn-cv"
            onClick={() => window.open(recruiterData.cv_file, '_blank')}
          >
            <FiFileText className="btn-icon" />
            View CV
          </button>
        )}
      </div>

      <div className="card-overlay"></div>
    </div>
  );
}

export default Recruiter;