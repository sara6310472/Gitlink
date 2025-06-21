import "../../style/Project.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCurrentUser } from "../../context.jsx";
import { useFetchData } from "../../hooks/fetchData.js";
import { FiGitBranch, FiStar, FiUser } from 'react-icons/fi';
import Swal from 'sweetalert2';
import Update from "../common/Update.jsx";
import Delete from "../common/Delete.jsx";

function Project({ projectData, setIsChange }) {
  const navigate = useNavigate();
  const { currentUser } = useCurrentUser();
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const fetchData = useFetchData();

  const isOwner = currentUser?.username === projectData.username;

  const handleRate = (star) => {
    if (!currentUser) {
      Swal.fire({
        icon: 'warning',
        title: 'Login required',
        text: 'You must be logged in to rate this project.',
        confirmButtonText: 'Login',
        showCancelButton: true,
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#221089',
        cancelButtonColor: '#aaa',
      }).then(result => {
        if (result.isConfirmed) {
          navigate('/login');
        }
      });
      return;
    }
    if (star < 1) {
      Swal.fire({
        icon: 'info',
        title: 'No Rating Selected',
        text: 'Please select a rating before submitting.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3085d6',
      });
      return;
    }
    fetchData({
      type: "projects/rate",
      role: currentUser ? `/${currentUser.role}` : "guests",
      method: "POST",
      body: {
        project_id: projectData.id,
        rating: star,
      },
      onSuccess: (res) => {
        setIsChange(1);
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: res.message,
          confirmButtonText: 'OK',
          confirmButtonColor: '#3085d6',
        });
        setSelectedRating(0);
      },
      onError: (err) => {
        console.error("Rating failed", err);
        Swal.fire({
          icon: 'error',
          title: 'Rating Error',
          text: err.message || String(err),
          confirmButtonText: 'OK',
          confirmButtonColor: '#d33'
        });
        setSelectedRating(0);
      },
    });
  };

  const getStarClass = (starIndex) => {
    const activeRating = hoveredRating || selectedRating;
    let classes = "star-rating-star";

    if (starIndex <= activeRating) {
      classes += " star-active";
    }

    if (isOwner) {
      classes += " star-disabled";
    } else {
      classes += " star-interactive";
    }

    return classes;
  };

  return (
    <div className="project-card">
      <div className="project-header">
        <h3 className="project-name">{projectData.name}</h3>
        <div className="project-stats">
          <div className="stat">
            <span className="stat-value">{projectData.rating}</span>
            <span className="stat-label"><FiStar /> Rating</span>
          </div>
          <div className="stat">
            <span className="stat-value">{projectData.forks_count}</span>
            <span className="stat-label">
              <FiGitBranch /> Forks
            </span>
          </div>
        </div>
      </div>

      <div>
        <p>
          link to GitHub →
          <a target="_blank" href={projectData.url}>{projectData.url}</a>
        </p>
      </div>

      <div className="project-data">
        <h4>Technologies:</h4>
        <div className="languages-list">
          {(projectData.languages ?? "")
            .split(",")
            .map((skill) => skill.trim())
            .filter((skill) => skill)
            .map((skill, index) => (
              <span key={index} className="skill-tag">
                {skill}
              </span>
            ))}
        </div>

        <h4>Description:</h4>
        <p>{projectData.details}</p>
      </div>

      <div className="project-actions">
        {isOwner && (
          <div className="edit-section">
            <Update
              type="projects"
              itemId={projectData.id}
              setIsChange={setIsChange}
              inputs={["name", "url", "languages", "details"]}
              role={`/${currentUser.role}`}
              initialData={projectData} 
            />
            <Delete
              className="delete_btn"
              type="projects"
              itemId={projectData.id}
              setIsChange={setIsChange}
              role={currentUser ? `/${currentUser.role}` : null}
            />
          </div>
        )}

        {!isOwner && (
          <div className="rating-section">
            <p>Rate this project:</p>
            <div
              className="star-rating-container"
              onMouseLeave={() => setHoveredRating(0)}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => {
                    handleRate(star)
                  }}
                  onMouseEnter={() => setHoveredRating(star)}
                  disabled={isOwner}
                  className={getStarClass(star)}
                  title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                >
                  ★
                </button>
              ))}
            </div>
            {selectedRating > 0 && (
              <div className="rating-display">
                Selected: {selectedRating}/5 stars
              </div>
            )}
          </div>
        )}

        <button
          className="view-profile-btn"
          onClick={() => navigate(`/${projectData.username}/profile`)}
        >
          <FiUser /> View Developer
        </button>
      </div>
    </div>
  );
}

export default Project;
