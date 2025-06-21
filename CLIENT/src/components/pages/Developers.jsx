import Developer from "./Developer.jsx";
import { useState, useEffect } from "react";
import { useCurrentUser } from "../../context.jsx";
import { useFetchData } from "../../hooks/fetchData.js";
import { useLogout } from "../../hooks/LogOut.js";
import "../../style/developers.css";
import Search from "../common/Search.jsx";
import Sort from "../common/Sort.jsx";

function Developers() {
  const { currentUser } = useCurrentUser();
  const logOut = useLogout();
  const fetchData = useFetchData();
  const [developers, setDevelopers] = useState([]);
  const [filteredDevelopers, setFilteredDevelopers] = useState(developers);
  const [isChange, setIsChange] = useState(0);

  useEffect(() => {
    setIsChange(0);
    fetchData({
      role: currentUser ? `/${currentUser.role}` : "/guest",
      type: "developers",
      method: "GET",
      onSuccess: (data) => {
        setDevelopers(data);
      },
      onError: (err) => console.error(`Failed to fetch programers: ${err}`),
      logOut,
    });
  }, [currentUser, isChange]);

  return (
    <div className="developers-container">
      <div className="developers-header">
        <h1>Developers community</h1>
        <div className="controllers-section">
          <Search
            data={developers}
            setFilteredData={setFilteredDevelopers}
            searchFields={["git_name", "email", "languages"]}
            placeholder="Search by GitHub name, email or programming languages..."
          />
          <Sort
            setUserData={setFilteredDevelopers}
            originalData={developers}
            currentConfig={[
              {
                label: "Filter by Experience:",
                field: "experience",
                options: [
                  { value: "all", label: "All Levels" },
                  { value: "junior", label: "Junior (0-2 years)" },
                  { value: "mid", label: "Mid (3-5 years)" },
                  { value: "senior", label: "Senior (6+ years)" }
                ]
              },
              {
                label: "Filter by Rating:",
                field: "rating",
                options: [
                  { value: "all", label: "All Ratings" },
                  { value: "high", label: "High (4-5)" },
                  { value: "medium", label: "Medium (2-3)" },
                  { value: "low", label: "Low (0-1)" }
                ]
              }
            ]}
          />
        </div>
      </div>
      <div className="developers-grid">
        {filteredDevelopers.length > 0 ? (
          filteredDevelopers.map((developer) => (
            <Developer key={developer.id} developerData={developer} />
          ))
        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
}

export default Developers;