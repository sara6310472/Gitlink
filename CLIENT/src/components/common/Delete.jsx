import { useState } from "react";
import { useFetchData } from "../../hooks/fetchData.js";
import { useLogout } from "../../hooks/LogOut.js";
import { FiTrash, FiLoader } from "react-icons/fi";
import Modal from "../common/Modal.jsx";
import '../../style/Delete.css';

function Delete({ type, itemId, setIsChange, role = null, confirmMessage = null }) {
  const logOut = useLogout();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const fetchData = useFetchData();

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (confirmMessage !== false) {
      setShowConfirm(true);
    } else {
      executeDelete();
    }
  };

  const executeDelete = async () => {
    setIsDeleting(true);
    setShowConfirm(false);

    try {
      await fetchData({
        type: `${type}/${itemId}`,
        method: "DELETE",
        role: role,
        onSuccess: (result) => {
          setIsChange(prev => prev + 1);
        },
        onError: (error) => {
          console.error(`Failed to delete ${type} with ID ${itemId}:`, error);

          if (error.status === 401) {
            alert("Authentication failed. Please log in again.");
            logOut();
          } else if (error.status === 403) {
            alert("You don't have permission to delete this item.");
          } else if (error.status === 404) {
            alert("Item not found. It may have already been deleted.");
            setIsChange(prev => prev + 1); // Refresh the list
          } else {
            alert("Failed to delete the item. Please try again.");
          }
        },
        logOut,
      });
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmCancel = () => {
    setShowConfirm(false);
  };

  const getConfirmationMessage = () => {
    if (confirmMessage) return confirmMessage;
    return `Are you sure you want to delete this ${type}? This action cannot be undone.`;
  };

  return (
    <>
      <button
        onClick={handleDeleteClick}
        className={`action-btn delete-btn ${isDeleting ? 'deleting' : ''}`}
        disabled={isDeleting}
        aria-label={`Delete ${type}`}
        title={`Delete ${type}`}
      >
        {isDeleting ? <FiLoader className="spinning" /> : <FiTrash />}
      </button>

      {showConfirm && (
        <Modal onClose={handleConfirmCancel}>
          <h3>Confirm Deletion</h3>
          <p>{getConfirmationMessage()}</p>
          <div className="confirm-buttons">
            <button
              onClick={executeDelete}
              className="confirm-delete-btn"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
            <button
              onClick={handleConfirmCancel}
              className="confirm-cancel-btn"
              disabled={isDeleting}
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

export default Delete;