import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCurrentUser } from "../../context.jsx";
import { useLogout } from "../../hooks/LogOut";
import { Messages } from "../pages/Messages";
import { FiLogOut } from 'react-icons/fi';
import { MdMessage } from "react-icons/md";
import "../../style/NavBar.css";

function Navigation() {
  const { currentUser } = useCurrentUser();
  const logOut = useLogout();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getImageUrl = () => {
    if (!currentUser?.profile_image) return null;
    if (currentUser.profile_image.startsWith('https://github.com/')) {
      return currentUser.profile_image;
    }
    return `http://localhost:3001/uploads/${currentUser.profile_image}`;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        {currentUser && (
          <div className="user-control">
            <Link to={`${currentUser.username}/profile`} className="profile-link">
              <img 
                src={getImageUrl()}
                alt={`${currentUser.username} avatar`}
                className="profile-img" 
              />
              <span className="user-greeting">Hello, {currentUser.username}</span>
            </Link>
            <Messages />
          </div>
        )}
        
        <div className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <Link to={"/home"} className={`nav-link ${location.pathname.includes("home") ? "active" : ""}`} onClick={closeMobileMenu}>
            Home
          </Link>
          <Link to={"/developers"} className={`nav-link ${location.pathname.includes("developers") ? "active" : ""}`} onClick={closeMobileMenu}>
            Developers
          </Link>
          <Link to={"/projects"} className={`nav-link ${location.pathname.includes("projects") ? "active" : ""}`} onClick={closeMobileMenu}>
            Projects
          </Link>
          <Link to={"/Recruiters"} className={`nav-link ${location.pathname.includes("Recruiters") ? "active" : ""}`} onClick={closeMobileMenu}>
            Recruiters
          </Link>
          <Link to={"/Jobs"} className={`nav-link ${location.pathname.includes("Jobs") ? "active" : ""}`} onClick={closeMobileMenu}>
            Jobs
          </Link>
          {!currentUser && (
            <>
              <Link to="/login" className={`nav-link ${location.pathname.includes("login") ? "active" : ""}`} onClick={closeMobileMenu}>
                Login
              </Link>
              <Link to="/register" className={`nav-link ${location.pathname.includes("register") ? "active" : ""}`} onClick={closeMobileMenu}>
                Register
              </Link>
            </>
          )}
        </div>
        
        <div className="nav-brand">
          <Link to="/home" className="brand-link">
            GitLink
          </Link>
          {currentUser && (
            <button onClick={logOut} className="logout-btn">
              <FiLogOut />
            </button>
          )}
          <button 
            className={`mobile-menu-toggle ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;