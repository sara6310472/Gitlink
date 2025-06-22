import Recruiter from "./Recruiter.jsx";
import { React, useState, useEffect } from "react";
import { useCurrentUser } from "../../context.jsx";
import { useFetchData } from "../../hooks/fetchData.js";
import { useLogout } from "../../hooks/LogOut.js";
import '../../style/Recruiters.css'
import Search from "../common/Search.jsx";
import Sort from "../common/Sort.jsx";

function Recruiters() {
  const { currentUser } = useCurrentUser();
  const fetchData = useFetchData();
  const logOut = useLogout();
  const [recruiters, setRecruiters] = useState([]);
  const [filteredRecruiters, setFilteredRecruiters] = useState(recruiters);
  const [isChange, setIsChange] = useState(0);

  useEffect(() => {
    setIsChange(0);
    fetchData({
      role: currentUser ? `/${currentUser.role}` : "/guest",
      type: "recruiters",
      params: { role: "recruiter" },
      method: "GET",
      onSuccess: (data) => {
        setRecruiters(data);
      },
      onError: (err) => console.error(`Failed to fetch programers: ${err}`),
      logOut,
    });
  }, [currentUser, isChange]);

  return (
    <div className="recruiters-container">
      <div className="recruiters-header">
        <h1>Recruiters community</h1>
        <div className="controllers-section">
          <Search
            data={recruiters}
            setFilteredData={setFilteredRecruiters}
            searchFields={["git_name", "email", "languages"]}
            placeholder="Search by GitHub name, email or programming languages..."
          />
          <Sort
            setUserData={setFilteredRecruiters}
            originalData={recruiters}
            currentConfig={[
              {
                label: "Filter by Status:",
                field: "is_active",
                options: [
                  { value: "all", label: "All Status" },
                  { value: "1", label: "Active" },
                  { value: "0", label: "Inactive" }
                ]
              }
            ]}
          />
        </div>
      </div>
      <div className="recruiters-grid">
        {filteredRecruiters.length > 0 ? (
          filteredRecruiters.map((recruiter) => (
            <Recruiter key={recruiter.id} recruiterData={recruiter} />
          ))
        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
}

export default Recruiters;
