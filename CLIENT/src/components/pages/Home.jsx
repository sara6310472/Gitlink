import { Link } from "react-router-dom";
import { FaLaptopCode, FaUserTie, FaBriefcase, FaProjectDiagram } from "react-icons/fa";
import "../../style/Home.css";

function Home() {
  return (
    <div className="home-container">
      <main className="home-content">
        <div className="welcome-section">
          <div className="welcome-content">
            <h1 className="welcome-title">Welcome to GitLink</h1>
            <p className="welcome-subtitle">
              Connect Developers, showcase projects, and discover opportunities
            </p>
            <div className="welcome-features">
              <div className="feature-card">
                <Link to={"/developers"}>
                  <div className="feature-icon"><FaUserTie /></div>{" "}
                  <h3>Find</h3>
                  <h3>Developers</h3>
                  <p>Connect with talented developers worldwide</p>
                </Link>
              </div>
              <div className="feature-card">
                <Link to={"/projects"}>
                  <div className="feature-icon"><FaLaptopCode /></div>
                  <h3>Showcase</h3>
                  <h3>Projects</h3>
                  <p>Display your best work and get recognized</p>
                </Link>
              </div>
              <div className="feature-card">
                <Link to={"/jobs"}>
                  <div className="feature-icon"><FaBriefcase /></div>
                  <h3>Discover</h3>
                  <h3>Jobs</h3>
                  <p>Find your next career opportunity</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;
