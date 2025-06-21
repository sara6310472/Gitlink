import "../../style/Developer.css";
import { useNavigate } from "react-router-dom";
import { FiUser, FiStar, FiFolder } from 'react-icons/fi';

function Developer({ developerData }) {
  const navigate = useNavigate();

  const generateStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - Math.ceil(rating);

    return (
      <div className="stars">
        {"★".repeat(fullStars)}
        {hasHalfStar && "☆"}
        {"☆".repeat(emptyStars)}
      </div>
    );
  };

  const getImageUrl = () => {
    if (!developerData?.profile_image) return;
    if (developerData.profile_image.startsWith('https://github.com/')) {
      return developerData.profile_image;
    }
    return `http://localhost:3001/uploads/${developerData.profile_image}`;
  };

  const getExperienceLevel = (years) => {
    if (years <= 2) return { level: "Junior", color: "#66cfef" };
    if (years <= 5) return { level: "Mid Level", color: "#4e9bb2" };
    return { level: "Senior", color: "#221089" };
  };

  const experienceInfo = getExperienceLevel(developerData.experience);

  return (
    <div className="developer-card">
      <div className="developer-header">
        <div className="avatar">
          <img
            src={getImageUrl()}
            alt={`${developerData.username} avatar`}
            className="avatar-img"
          />
        </div>

        <div className="developer-info">
          <h3 className="developer-name">{developerData.name}</h3>
          <p className="git-name">@{developerData.git_name}</p>

          <div
            className="experience-badge"
            style={{ border: `1px solid ${experienceInfo.color}` }}          >
            <span>{experienceInfo.level}</span>
            <span>{developerData.experience} years</span>
          </div>
          <div className="rating-stars">
            {generateStars(developerData.rating)}
          </div>
        </div>
      </div>

      <div className="skills-section">
        <div className="skills-list">
          {(developerData.languages ?? "")
            .split(",")
            .map((skill) => skill.trim())
            .filter((skill) => skill)
            .map((skill, index) => (
              <span key={index} className="skill-tag">
                {skill}
              </span>
            ))}
        </div>
      </div>

      <div className="developer-actions">
        <button
          className="btn-profile"
          onClick={() => navigate(`/${developerData.username}/profile`)}
        >
          <FiUser className="btn-icon" /> view profile
        </button>

        <button
          className="btn-projects"
          onClick={() => navigate(`/${developerData.username}/projects`)}
        >
          <FiFolder className="btn-icon" /> view projects
        </button>
      </div>

      <div className="card-overlay"></div>
    </div>
  );
}

export default Developer;