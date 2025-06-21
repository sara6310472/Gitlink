import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Outlet } from "react-router-dom";
import Project from "./Project.jsx";
import "../../style/Projects.css";
import { useCurrentUser } from "../../context.jsx";
import { useFetchData } from "../../hooks/fetchData.js";
import { useLogout } from "../../hooks/LogOut.js";
import Search from "../common/Search.jsx";
import Sort from "../common/Sort.jsx";

function Projects() {
  const { username, id } = useParams();
  const logOut = useLogout();
  const fetchData = useFetchData();
  const { currentUser } = useCurrentUser();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState(projects);
  const [isChange, setIsChange] = useState(0);
  const navigate = useNavigate();
  const ownProjects = currentUser && currentUser.role == 'developer';

  useEffect(() => {
    setIsChange(0);
    fetchData({
      type: "projects",
      params: {
        ...(username && { username: username }),
        ...(id && { id: id }),
      },
      role: currentUser ? `/${currentUser.role}` : "/guest",
      method: "GET",
      onSuccess: (data) => {
        setProjects(data);
        setFilteredProjects(data);
      },
      onError: (err) => console.error(`Failed to fetch programers: ${err}`),
      logOut,
    });
  }, [currentUser, isChange]);

  return (
    <div className="projects-container">
      <h1>Projects community</h1>
      {!id && (
        <div className="controllers-section">
          <Search
            data={projects}
            setFilteredData={setFilteredProjects}
            searchFields={["git_name", "details", "name", "languages"]}
            placeholder="Search by project name, GitHub name, details, or programming languages..."
          />
          <Sort
            setUserData={setFilteredProjects}
            originalData={projects}
            currentConfig={[
              {
                label: "Filter by Rating:",
                field: "rating",
                options: [
                  { value: "all", label: "All Ratings" },
                  { value: "high", label: "High (4-5)" },
                  { value: "medium", label: "Medium (2-3)" },
                  { value: "low", label: "Low (0-1)" }
                ]
              },
              {
                label: "Filter by Forks:",
                field: "forks_count",
                options: [
                  { value: "all", label: "All forks" },
                  { value: "high", label: "High (50+)" },
                  { value: "medium", label: "Medium (10-49)" },
                  { value: "low", label: "Low (0-9)" }
                ]
              }
            ]}
          />
          {ownProjects && username == null && <button onClick={() => navigate(`/${currentUser.username}/projects`)}>My Project</button>}
          {ownProjects && username && <button onClick={() => navigate(`/projects`)}>All Project</button>}
        </div>
      )}

      <div className="projects-grid">
        {filteredProjects.length > 0 ? filteredProjects.map((project) => (
          <Project key={project.id} projectData={project} setIsChange={setIsChange} />
        )) : <h4>no projects found</h4>}
      </div>
      {/* <Outlet /> */}
    </div>
  );
}

export default Projects;
