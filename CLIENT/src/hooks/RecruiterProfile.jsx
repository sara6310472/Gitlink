import Update from "../components/common/Update.jsx";
import Delete from "../components/common/Delete.jsx";
import '../style/RecruiterProfile.css';
import Add from "../components/common/Add.jsx";

function RecruiterProfile({
    userData,
    currentUser,
    isOwnProfile,
    existingDeliverables,
    setIsChange,
    navigate,
    userItemsType
}) {
    const renderJobManagement = () => {
        if (!isOwnProfile) return null;

        return (
            <>
                <h2>Jobs Management</h2>
                <Add
                    type="jobs"
                    setIsChange={setIsChange}
                    inputs={["username", "title", "company_name", "experience", "languages", "requirements", "details",]}
                    defaultValue={{ username: currentUser.username }}
                    name="Add Job"
                    buttonClassName="action-btn add-btn"
                    customTitle="Add New Job Position"
                    validationRules={{
                        title: { required: true, minLength: 3 },
                        experience: { required: true },
                        languages: { required: true },
                        requirements: { required: false },
                        details: { required: false }
                    }}
                />
            </>
        );
    };

    return (
        <>
            <div className="profile-section">
                {userData.company_name && (
                    <>
                        <h2>Company</h2>
                        <p className="profile-description">{userData.company_name}</p>
                    </>
                )}
            </div>

            <div className="profile-section">
                <h2>Existing {userItemsType}</h2>
                <ul>
                    {existingDeliverables ? (
                        existingDeliverables.map((item) => (
                            <li key={item.id}>
                                {item.title}
                                <button className="view-btn"
                                    onClick={() =>
                                        navigate(`/${item.username}/${userItemsType}/${item.id}`)
                                    }
                                >
                                    View
                                </button>
                                {isOwnProfile && (
                                    <>
                                        <Delete
                                            className="delete-btn"
                                            type={userItemsType}
                                            itemId={item.id}
                                            setIsChange={setIsChange}
                                            role={currentUser ? `/${currentUser.role}` : null}
                                        />
                                        <Update
                                            className="update-btn"
                                            type={userItemsType}
                                            itemId={item.id}
                                            setIsChange={setIsChange}
                                            inputs={["title", "details"]}
                                            role={currentUser ? `/${currentUser.role}` : null}
                                            initialData={userData}

                                        />
                                    </>
                                )}
                            </li>
                        ))
                    ) : (
                        <p>No {userItemsType} found</p>
                    )}
                </ul>

                {renderJobManagement()}
            </div>
        </>
    );
}

export default RecruiterProfile;