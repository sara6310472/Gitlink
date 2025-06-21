import { useState, useEffect } from "react";
import { useCurrentUser } from "../../context.jsx";
import { useFetchData } from "../../hooks/fetchData.js";
import { useLogout } from "../../hooks/LogOut.js";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Search from "../common/Search.jsx";
import Sort from "../common/Sort.jsx";
import "../../style/Admin.css";
import Modal from "../common/Modal.jsx";


function Admin() {
  const { currentUser } = useCurrentUser();
  const logOut = useLogout();
  const fetchData = useFetchData();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isChange, setIsChange] = useState(0);
  const [modalData, setModalData] = useState(null);

  useEffect(() => {
    fetchData({
      role: currentUser ? `/${currentUser.role}` : "/guest",
      type: "users",
      method: "GET",
      onSuccess: (data) => {
        setUsers(data);
        setFilteredUsers(data);
      },
      onError: (err) => console.error(`Failed to fetch users: ${err}`),
      logOut,
    });
  }, [currentUser, isChange]);

  const handleBlockUser = async (user) => {
    const result = await Swal.fire({
      title: user.status ? "Block this user?" : "Unblock this user?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: user.status ? "#d33" : "#3085d6",
      cancelButtonColor: "#aaa",
      confirmButtonText: user.status ? "Yes, block!" : "Yes, unblock!",
    });

    if (!result.isConfirmed) return;

    try {
      await fetchData({
        type: `users/status/${user.username}`,
        role: `/${currentUser && currentUser.role}`,
        method: "PUT",
        body: { status: user.status ? 0 : 1, email: user.email, id: user.id },
        onSuccess: () => {
          alert("User status updated successfully!");
          setIsChange(1);
        },
        onError: (error) => {
          alert(`Error updating status: ${error}`);
        },
      });
    } catch (error) {
      alert("Unexpected error occurred");
    }
  };

  const setUserAsAdminBtn = async (user) => {
    const result = await Swal.fire({
      title: "Make this user an Admin?",
      text: "This will grant administrative privileges to the user.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#aaa",
      confirmButtonText: "Yes, make admin!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await fetchData({
        type: `users/${user.username}`,
        role: `/${currentUser && currentUser.role}`,
        method: "PUT",
        body: {
          role_id: 3,
          // email: user.email,
          // id: user.id,
        },
        onSuccess: () => {
          alert("User has been promoted to admin successfully!");
          setIsChange(1);
        },
        onError: (error) => {
          alert(`Error updating role: ${error}`);
        },
      });
    } catch (error) {
      alert("Unexpected error occurred");
    }
  };


  return (
    <>
      {!currentUser || currentUser.role !== 'admin' ? (
        <>
          {modalData === null && setModalData({
            message: "Sorry, this page is only for management.",
            onConfirm: () => navigate('/home'),
            hideCancel: true,
            confirmText: "Go to Home"
          })}
        </>
      ) : (
        <div className="admin-page">
          <h1 className="admin-title">User Management Panel</h1>
          <div className="admin-controls">
            <Search
              data={users}
              setFilteredData={setFilteredUsers}
              searchFields={["username", "email", "phone"]}
              placeholder="Search by username, email or phone..."
            />
            <Sort
              setUserData={setFilteredUsers}
              originalData={users}
              currentConfig={[
                {
                  label: "Filter by Role:",
                  field: "role_id",
                  options: [
                    { value: "all", label: "All Roles" },
                    { value: "1", label: "Developer" },
                    { value: "2", label: "Recruiter" }
                  ]
                }
              ]}
            />
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  {['ID', 'Username', 'Email', 'Phone', 'Role', 'About', 'Image', 'Role', 'Active', 'Actions'].map((head) => (
                    <th key={head}>{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.phone}</td>
                    <td>{user.role}</td>
                    <td>
                      {user.about?.split(" ").slice(0, 5).join(" ")}
                      {user.about && user.about.split(" ").length > 10 ? " ..." : ""}
                    </td>
                    <td>
                      {user.profile_image ? (
                        <img src={`http://localhost:3001/uploads/${user.profile_image}`} alt="Profile" className="admin-avatar" />
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td>
                      <button onClick={() => setUserAsAdminBtn(user)}>Set as Admin</button>
                    </td>
                    <td>
                      <span className={user.status ? "text-active" : "text-blocked"}>
                        {user.status ? "Active" : "Blocked"}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleBlockUser(user)}
                        className={`admin-btn ${user.status ? "btn-block" : "btn-unblock"}`}
                      >
                        {user.status ? "Block" : "Unblock"}
                      </button>
                      <button
                        onClick={() => navigate(`/${user.username}/profile`)}
                        className="admin-btn btn-view"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalData && (
        <Modal onClose={() => setModalData(null)}>
          <div className="modal-body">
            <p>{modalData.message}</p>
            <div className="modal-buttons">
              <button onClick={() => {
                modalData.onConfirm();
                setModalData(null);
              }}>
                {modalData.confirmText || "Confirm"}
              </button>
              {!modalData.hideCancel && (
                <button onClick={() => setModalData(null)}>Cancel</button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </>
  );

}

export default Admin;