import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCurrentUser } from "../../context.jsx";
import { useFetchData } from "../../hooks/fetchData.js";
import DeveloperProfile from "../../hooks/DeveloperProfile.jsx";
import RecruiterProfile from "../../hooks/RecruiterProfile.jsx";
import "../../style/Profile.css";
import { FiUpload, FiEdit, FiLock } from "react-icons/fi";
import Modal from "../common/Modal.jsx";

function Profile() {
  const { username } = useParams();
  const { currentUser } = useCurrentUser();
  const [isChange, setIsChange] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userData, setUserData] = useState(null);
  const [existingDeliverables, setExistingDeliverables] = useState(null);
  const fetchData = useFetchData();
  const navigate = useNavigate();

  const [showCVUpload, setShowCVUpload] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [cvFile, setCvFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [useGitAvatar, setUseGitAvatar] = useState(false);
  const [message, setMessage] = useState('');
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const isOwnProfile = currentUser && username === currentUser.username;
  const userItemsType = userData?.role === "developer" ? "projects" : (userData?.role === 'recruiter') ? "jobs" : 'users';

  useEffect(() => {
    setIsChange(0);
    setLoading(true);
    fetchData({
      type: `users/${username}`,
      params: { "username": username },
      role: currentUser ? (currentUser.role_id == 1 ? '/developer' : '/recruiter') : "/guests",
      onSuccess: (data) => {
        setUserData(data);
        setLoading(false);
      },
      onError: (err) => {
        setError(`Failed to fetch user data: ${err}`);
        setLoading(false);
      },
    });
  }, [username, isChange]);

  useEffect(() => {
    if (!userData) return;
    const itemsType = userData.role === "developer" ? "projects" : "jobs";

    setIsChange(0);
    setLoading(true);
    fetchData({
      type: itemsType,
      params: { "username": username },
      role: currentUser ? (currentUser.role_id == 1 ? '/developer' : '/recruiter') : "/guests",
      onSuccess: (data) => {
        setExistingDeliverables(data);
        setLoading(false);
      },
      onError: (err) => {
        setError(`Failed to fetch ${itemsType} data: ${err}`);
        setLoading(false);
      },
    });
  }, [username, isChange, userData]);

  const handleCVUpload = async (e) => {
    e.preventDefault();
    if (!cvFile) {
      setMessage('Please select a CV file');
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('cv_file', cvFile);
    formData.append('user_id', userData.id);

    try {
      await fetchData({
        type: 'users/update-cv',
        role: currentUser ? (currentUser.role_id == 1 ? '/developer' : '/recruiter') : "/guests",
        method: 'PUT',
        body: formData,
        onSuccess: (result) => {
          setMessage('CV updated successfully!');
          setShowCVUpload(false);
          setCvFile(null);
          setIsChange(prev => prev + 1);
        },
        onError: (error) => {
          setMessage(`Error updating CV: ${error}`);
        }
      });
    } catch (error) {
      setMessage('Unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();

    if (useGitAvatar && userData.git_name) {
      formData.append('profile_image', `https://github.com/${userData.git_name}.png`);
      formData.append('use_git_avatar', 'true');
    } else if (imageFile) {
      formData.append('profile_image', imageFile);
    } else {
      setMessage('Please select an image or choose to use GitHub avatar');
      setLoading(false);
      return;
    }
    formData.append('user_id', userData.id);

    try {
      await fetchData({
        type: 'users/update-image',
        method: 'PUT',
        role: currentUser ? (currentUser.role_id == 1 ? '/developer' : '/recruiter') : "/guests",
        body: formData,
        onSuccess: (result) => {
          setMessage('Profile image updated successfully!');
          setShowImageUpload(false);
          setImageFile(null);
          setUseGitAvatar(false);
          setIsChange(prev => prev + 1);
        },
        onError: (error) => {
          setMessage(`Error updating image: ${error}`);
        }
      });
    } catch (error) {
      setMessage('Unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage('New passwords do not match');
      return;
    }
    if (passwords.newPassword.length < 6) {
      setMessage('New password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      await fetchData({
        type: 'users/change-password',
        method: 'PUT',
        role: currentUser ? (currentUser.role_id == 1 ? '/developer' : '/recruiter') : "guests",
        body: {
          user_id: userData.user_id,
          email: userData.email,
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword
        },
        onSuccess: (result) => {
          setMessage('Password changed successfully!');
          setShowPasswordChange(false);
          setPasswords({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
        },
        onError: (error) => {
          setMessage(`Error changing password: ${error}`);
        }
      });
    } catch (error) {
      setMessage('Unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Helpers
  const getImageUrl = () => {
    if (!userData?.profile_image) return;
    if (userData.profile_image.startsWith('https://github.com/')) {
      return userData.profile_image;
    }
    return `http://localhost:3001/uploads/${userData.profile_image}`;
  };

  const getCVUrl = () => {
    if (!userData?.cv_file) return null;
    return `http://localhost:3001/uploads/${userData.cv_file}`;
  };

  const handleViewCV = () => {
    const cvUrl = getCVUrl();
    if (cvUrl) {
      window.open(cvUrl, '_blank');
    }
  };

  const handleDownloadCV = async () => {
    try {
      const response = await fetch(`http://localhost:3001/cv/${userData.username}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      console.log('Content type:', contentType);

      const blob = await response.blob();
      console.log('Blob size:', blob.size);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${userData.username}-cv.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setMessage('CV downloaded successfully!');
    } catch (error) {
      console.error('Error downloading CV:', error);
      setMessage(`Error downloading CV: ${error.message}`);
    }
  };

  const renderProfileManagement = () => {
    if (!isOwnProfile) return null;

    return (
      <div className="profile-management">
        <h2>Profile Management</h2>

        {message && (
          <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        <div className="management-buttons">
          {/* CV Upload Button - only for developers */}
          {userData.role === 'developer' && (
            <button
              className="management-btn"
              onClick={() => setShowCVUpload(true)}
            >
              <FiUpload /> {userData.cv_file ? 'Update CV' : 'Upload CV'}
            </button>
          )}

          {/* Profile Image Update Button */}
          <button
            className="management-btn"
            onClick={() => setShowImageUpload(true)}
          >
            <FiEdit /> Update Profile Image
          </button>

          {/* Password Change Button */}
          <button
            className="management-btn"
            onClick={() => setShowPasswordChange(true)}
            disabled={loading}
          >
            <FiLock /> Change Password
          </button>
        </div>

        {/* CV Upload Modal */}
        {showCVUpload && (
          <Modal onClose={() => setShowCVUpload(false)}>
            <h3>Upload CV</h3>
            <form onSubmit={handleCVUpload}>
              <label className="custom-file-upload">
                Select CV (PDF only)
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setCvFile(e.target.files[0])}
                />
              </label>
              <div className="form-buttons">
                <button type="submit" disabled={loading}>
                  {loading ? "Uploading..." : "Upload CV"}
                </button>
                <button type="button" onClick={() => setShowCVUpload(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* Image Upload Modal */}
        {showImageUpload && (
          <Modal onClose={() => setShowImageUpload(false)}>
            <h3>Update Profile Image</h3>
            <form onSubmit={handleImageUpload}>
              <div className="form-group">
                {userData.role === 'developer' && userData.git_name && (
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={useGitAvatar}
                      onChange={(e) => setUseGitAvatar(e.target.checked)}
                    />
                    Use GitHub profile image
                  </label>
                )}
                {!useGitAvatar && (
                  <>
                    <label className="file-input-label">
                      <FiUpload className="upload-icon" />
                      <span>Select Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files[0])}
                      />
                    </label>
                    {imageFile && <p>Selected: {imageFile.name}</p>}
                  </>
                )}
              </div>
              <div className="form-buttons">
                <button type="submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Image'}
                </button>
                <button type="button" onClick={() => setShowImageUpload(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* Password Change Modal */}
        {showPasswordChange && (
          <Modal onClose={() => setShowPasswordChange(false)}>
            <h3>Change Password</h3>
            <form onSubmit={handlePasswordChange}>
              <div className="form-group">
                <input
                  type="password"
                  placeholder="Current Password"
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  required
                />
                <input
                  type="password"
                  placeholder="New Password"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  required
                />
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  required
                />
              </div>
              <div className="form-buttons">
                <button type="submit" disabled={loading}>
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
                <button type="button" onClick={() => setShowPasswordChange(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    );
  };

  if (loading) return <div className="profile-loading">Loading profile...</div>;
  if (error) return <div className="profile-error">{error}</div>;
  if (!userData) return <div className="profile-error">User not found</div>;

  const sharedProps = {
    userData,
    currentUser,
    isOwnProfile,
    existingDeliverables,
    setIsChange,
    navigate,
    userItemsType,
    getImageUrl,
    handleViewCV,
    handleDownloadCV
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-section">
          <img
            src={getImageUrl()}
            alt={`${userData.username}'s profile`}
            className="profile-image"
          />
          <button
            onClick={() =>
              navigate(userItemsType === "users" ? "/users" : `/${username}/${userItemsType}`)
            }
          >
            view all {userItemsType}
          </button>
        </div>

        <div className="profile-info">
          <h1 className="profile-name">{userData.username}</h1>
          <div className="profile-details">
            <div className="detail-item">
              {/* <span className="detail-label">Role:</span>
              <span className="detail-value">{userData.role}</span> */}
              <span className="detail-label">Email:</span>
              <span className="detail-value">{userData.email}</span>
              <span className="detail-label">Phone:</span>
              <span className="detail-value">{userData.phone}</span>
              <span className="detail-label">Rating:</span>
              <span className="detail-value">{userData.rating}/5 ⭐</span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <h2>About</h2>
          <p className="profile-description">
            {userData.about || "No description available"}
          </p>

          {renderProfileManagement()}

          {userData.role === "developer" && (
            <>
              <h2>Programming Languages</h2>
              <div className="languages-container">
                {userData.languages && userData.languages.length > 0 ? (
                  userData.languages
                    .split(",")
                    .map((skill) => skill.trim())
                    .filter((skill) => skill)
                    .map((skill, index) => (
                      <h3 key={index} className="skill-tag">
                        {skill}
                      </h3>
                    ))
                ) : (
                  <p>No programming languages specified</p>
                )}
              </div>
            </>
          )}
        </div>

        {userData.role === "developer" ? (
          <DeveloperProfile {...sharedProps} />
        ) : (
          userData.role === 'recruiter' &&
          <RecruiterProfile {...sharedProps} />
        )}
      </div>
    </div>
  );
}

export default Profile;
