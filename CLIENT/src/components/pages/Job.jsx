import "../../style/Job.css";
import Swal from 'sweetalert2';
import { useNavigate } from "react-router-dom";
import { useFetchData } from "../../hooks/fetchData.js";
import { useLogout } from "../../hooks/LogOut";
import { useCurrentUser } from "../../context.jsx";
import { FiUser } from "react-icons/fi";
import Update from "../common/Update.jsx";
import Delete from "../common/Delete.jsx";

function Job({ jobData, setIsChange }) {
  const navigate = useNavigate();
  const fetchData = useFetchData();
  const logOut = useLogout();
  const { currentUser, setCurrentUser } = useCurrentUser();
  const isOwner = currentUser?.username === jobData.username;

  const handleApply = () => {
    if (!currentUser) {
      Swal.fire({
        title: 'Not logged in',
        text: 'In order to register for a job, you must log in.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Go to login',
        cancelButtonText: 'Ignore',
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login');
        }
      });
      return;
    }
    fetchData({
      role: currentUser ? `/${currentUser.role}` : "/guest",
      method: "POST",
      type: "job_applications",
      body: { user_id: currentUser.id, job_id: jobData.id, email: currentUser.email },
      onSuccess: () => {
        setCurrentUser(prevUser => ({
          ...prevUser,
          initiatedAction: true
        }));
      },
      onError: (err) => {
        console.error(`Failed to fetch developers: ${err}`);
        Swal.fire({
          title: 'Action failed',
          text: typeof err === 'string' ? err : 'You might have already rated or registered.',
          icon: 'error',
        });
      },
      logOut,
    });
  };

  return (
    <div className="job-card">
      <div className="job-header">
        <div className="job-title-section">
          <p className="company-name">{jobData.company_name}</p>
          {isOwner && (
            <div className="edit-section">
              <Update
                className='update-job-btn'
                type="jobs"
                itemId={jobData.id}
                setIsChange={setIsChange}
                inputs={["title", "company_name", "details", "requirements", "experience", "languages"]}
                role={`/${currentUser.role}`}
                initialData={jobData}

              />
              <Delete
                className="delete-job-btn"
                type="jobs"
                itemId={jobData.id}
                setIsChange={setIsChange}
                role={currentUser ? `/${currentUser.role}` : null}
              />
            </div>
          )}
        </div>
      </div>

      <div className="job-content">
        <div className="job-requirements">
          <h4>Requirements</h4>
          <p>{jobData.requirements}</p>
        </div>

        <div className="job-details">
          <div className="experience-badge">
            <p className="detail-label">Experience:</p>
            <span className="detail-value">{jobData.experience} years</span>
          </div>
          <p className="detail-label">Languages:</p>
          <span>{jobData.languages}</span>
          <p>views:</p>
          <span>{jobData.views}</span>
        </div>

        <div className="job-actions">
          {currentUser && currentUser.username == jobData.username ?
            <button className="apply-btn" onClick={() => { navigate(`/${jobData.username}/jobs/${jobData.id}/apply`) }}>
              View Applicants
            </button> :
            (currentUser && currentUser.role == 'developer' &&
              <button className="apply-btn" disabled={jobData.is_seized} onClick={handleApply}>
                Apply Now
              </button>)}
          <button className="view-company-btn" onClick={() => navigate(`/${jobData.username}/profile`)}>
            <FiUser />View recruiter
          </button>
        </div>
      </div>
    </div>
  );
}

export default Job;
