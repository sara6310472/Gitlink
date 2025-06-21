import { useState, React } from "react";
import Update from "../components/common/Update.jsx";
import Delete from "../components/common/Delete.jsx";
import '../style/DeveloperProfile.css';
import Add from "../components/common/Add.jsx";
import Swal from 'sweetalert2';

function DeveloperProfile({
    userData,
    currentUser,
    isOwnProfile,
    existingDeliverables,
    setIsChange,
    navigate,
    userItemsType,
    handleViewCV,
    handleDownloadCV
}) {
    const [projectsToAdd, setProjectToAdd] = useState(null);

    async function getGithubRepoNames(gitName) {
        const url = `https://api.github.com/users/${gitName}/repos?per_page=100`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status}`);
            }
            const repos = await response.json();
            setProjectToAdd(repos);
        } catch (error) {
            console.error("Error fetching repositories:", error);
        }
    }

    const renderProjectManagement = () => {
        if (!isOwnProfile) return null;

        return (
            <>
                <h2>Projects Management</h2>
                <div className="project-actions">
                    <button
                        className="action-btn add-btn"
                        onClick={() => getGithubRepoNames(userData.git_name)}
                    >
                        Add Projects
                    </button>
                </div>

                {projectsToAdd ? (
                    <div className="projectsToAdd">
                        <div className="projectsName">
                            <h3>Projects can be added:</h3>
                            <ul>
                                {projectsToAdd.map((repo) => {
                                    return (
                                        <li key={repo.id}>
                                            {repo.name}
                                            <Add
                                                type="projects"
                                                setIsChange={setIsChange}
                                                inputs={["name", "languages", "details"]}
                                                name="Add Project"
                                                buttonClassName="action-btn add-btn"
                                                customTitle="Add New Project"
                                                defaultValue={{
                                                    git_name: userData.git_name,
                                                    username: userData.username,
                                                    name: repo.name,
                                                    forks_count: repo.forks_count,
                                                    url: repo.html_url,
                                                    languages: repo.language || "",
                                                    details: repo.description || ""
                                                }}
                                                validationRules={{
                                                    name: { required: true, minLength: 2 },
                                                    languages: { required: true },
                                                    details: { required: false }
                                                }}
                                                onBeforeSubmit={async (data) => {
                                                    const alreadyExists = existingDeliverables?.some(
                                                        (project) => project.name === data.name
                                                    );
                                                    if (alreadyExists) {
                                                        Swal.fire({
                                                            title: 'Project Already Exists',
                                                            text: 'A project with this name already exists.',
                                                            icon: 'warning'
                                                        });
                                                        return false;
                                                    }
                                                    return true;
                                                }}
                                            />
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                ) : <div>No projects found to add.</div>}
            </>
        );
    };

    return (
        <>
            <div className="profile-section">
                <h2>Experience</h2>
                <p className="profile-description">
                    {userData.experience} years of experience
                </p>

                {userData.git_name && (
                    <>
                        <h2>GitHub</h2>
                        <p className="profile-description">
                            <a
                                href={`https://github.com/${userData.git_name}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                @{userData.git_name}
                            </a>
                        </p>
                    </>
                )}

                {userData.cv_file && (
                    <div className="cv-section">
                        <h2>Resume / CV</h2>
                        <div className="cv-buttons">
                            <button onClick={handleViewCV} className="btn btn-primary">
                                View CV
                            </button>
                            <button onClick={handleDownloadCV} className="btn btn-secondary">
                                Download CV
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="profile-section">
                <h2>Existing {userItemsType}</h2>
                <ul>
                    {existingDeliverables ? (
                        existingDeliverables.map((item) => (
                            <li key={item.id}>
                                {item.name}
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
                                            className="delete_btn"
                                            type={userItemsType}
                                            itemId={item.id}
                                            setIsChange={setIsChange}
                                            role={currentUser ? `/${currentUser.role}` : null}
                                        />
                                        <Update
                                            type={userItemsType}
                                            itemId={item.id}
                                            setIsChange={setIsChange}
                                            inputs={["name", "details"]}
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

                {renderProjectManagement()}
            </div>
        </>
    );
}

export default DeveloperProfile;